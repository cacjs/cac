import path from 'path'
import execa from 'execa'
import cac from '..'

jest.setTimeout(30000)

function example(file: string) {
  return path.relative(
    process.cwd(),
    path.join(__dirname, '../../examples', file)
  )
}

function snapshotOutput({
  title,
  file,
  args,
}: {
  title: string
  file: string
  args?: string[]
}) {
  test(title, async () => {
    const { stdout } = await execa('node', [example(file), ...(args || [])])
    expect(stdout).toMatchSnapshot(title)
  })
}

async function getOutput(file: string, args: string[] = []) {
  const { stdout } = await execa('node', [example(file), ...(args || [])])
  return stdout
}

snapshotOutput({
  title: 'basic-usage',
  file: 'basic-usage.js',
  args: ['foo', 'bar', '--type', 'ok', 'command'],
})

snapshotOutput({
  title: 'variadic-arguments',
  file: 'variadic-arguments.js',
  args: ['--foo', 'build', 'a', 'b', 'c', 'd'],
})

snapshotOutput({
  title: 'ignore-default-value',
  file: 'ignore-default-value.js',
  args: ['build'],
})

test('negated option', () => {
  const cli = cac()

  cli.option('--foo [foo]', 'Set foo').option('--no-foo', 'Disable foo')

  cli.option('--bar [bar]', 'Set bar').option('--no-bar', 'Disable bar')

  const { options } = cli.parse(['node', 'bin', '--foo', 'foo', '--bar'])
  expect(options).toEqual({
    '--': [],
    foo: 'foo',
    bar: true,
  })
})

test('double dashes', () => {
  const cli = cac()

  const { args, options } = cli.parse([
    'node',
    'bin',
    'foo',
    'bar',
    '--',
    'npm',
    'test',
  ])

  expect(args).toEqual(['foo', 'bar'])
  expect(options['--']).toEqual(['npm', 'test'])
})

test('default value for negated option', () => {
  const cli = cac()

  cli.option('--no-clear-screen', 'no clear screen')
  cli.option('--no-a-b, --no-c-d', 'desc')

  const { options } = cli.parse(`node bin`.split(' '))

  expect(options).toEqual({ '--': [], clearScreen: true, aB: true, cD: true })
})

test('negated option validation', () => {
  const cli = cac()

  cli.option('--config <config>', 'config file')
  cli.option('--no-config', 'no config file')

  const { options } = cli.parse(`node bin --no-config`.split(' '))

  cli.globalCommand.checkOptionValue()
  expect(options.config).toBe(false)
})

test('array types without transformFunction', () => {
  const cli = cac()

  cli
    .option(
      '--externals <external>',
      'Add externals(can be used for multiple times',
      {
        type: [],
      }
    )
    .option('--scale [level]', 'Scaling level')

  const { options: options1 } = cli.parse(
    `node bin --externals.env.prod production --scale`.split(' ')
  )
  expect(options1.externals).toEqual([{ env: { prod: 'production' } }])
  expect(options1.scale).toEqual(true)

  const { options: options2 } = cli.parse(
    `node bin --externals foo --externals bar`.split(' ')
  )
  expect(options2.externals).toEqual(['foo', 'bar'])

  const { options: options3 } = cli.parse(
    `node bin --externals.env foo --externals.env bar`.split(' ')
  )
  expect(options3.externals).toEqual([{ env: ['foo', 'bar'] }])
})

test('array types with transformFunction', () => {
  const cli = cac()

  cli
    .command('build [entry]', 'Build your app')
    .option('--config <configFlie>', 'Use config file for building', {
      type: [String],
    })
    .option('--scale [level]', 'Scaling level')

  const { options } = cli.parse(
    `node bin build app.js --config config.js --scale`.split(' ')
  )
  expect(options.config).toEqual(['config.js'])
  expect(options.scale).toEqual(true)
})

test('throw on unknown options', () => {
  const cli = cac()

  cli
    .command('build [entry]', 'Build your app')
    .option('--foo-bar', 'foo bar')
    .option('--aB', 'ab')
    .action(() => {})

  expect(() => {
    cli.parse(`node bin build app.js --fooBar --a-b --xx`.split(' '))
  }).toThrowError('Unknown option `--xx`')
})

describe('--version in help message', () => {
  test('sub command', async () => {
    const output = await getOutput('help.js', ['lint', '--help'])
    expect(output).not.toContain(`--version`)
  })

  test('default command', async () => {
    const output = await getOutput('help.js', ['--help'])
    expect(output).toContain(`--version`)
  })
})

describe('space-separated subcommands', () => {
  test('basic subcommand matching', () => {
    const cli = cac()
    let matched = ''

    cli.command('mcp login', 'Login to MCP').action(() => {
      matched = 'mcp login'
    })

    cli.parse(['node', 'bin', 'mcp', 'login'], { run: true })
    expect(matched).toBe('mcp login')
    expect(cli.matchedCommandName).toBe('mcp login')
  })

  test('subcommand with positional args', () => {
    const cli = cac()
    let receivedId = ''

    cli.command('mcp getNodeXml <id>', 'Get XML for a node').action((id) => {
      receivedId = id
    })

    cli.parse(['node', 'bin', 'mcp', 'getNodeXml', '123'], { run: true })
    expect(receivedId).toBe('123')
    expect(cli.matchedCommandName).toBe('mcp getNodeXml')
  })

  test('subcommand with options', () => {
    const cli = cac()
    let result: any = {}

    cli
      .command('mcp export <id>', 'Export something')
      .option('--format <format>', 'Output format')
      .action((id, options) => {
        result = { id, format: options.format }
      })

    cli.parse(['node', 'bin', 'mcp', 'export', 'abc', '--format', 'json'], {
      run: true,
    })
    expect(result).toEqual({ id: 'abc', format: 'json' })
  })

  test('greedy matching - longer commands match first', () => {
    const cli = cac()
    let matched = ''

    // Register shorter command first
    cli.command('mcp', 'MCP base command').action(() => {
      matched = 'mcp'
    })

    // Register longer command second
    cli.command('mcp login', 'Login to MCP').action(() => {
      matched = 'mcp login'
    })

    cli.parse(['node', 'bin', 'mcp', 'login'], { run: true })
    expect(matched).toBe('mcp login')
  })

  test('three-level subcommand', () => {
    const cli = cac()
    let matched = ''

    cli.command('git remote add', 'Add a remote').action(() => {
      matched = 'git remote add'
    })

    cli.parse(['node', 'bin', 'git', 'remote', 'add'], { run: true })
    expect(matched).toBe('git remote add')
    expect(cli.matchedCommandName).toBe('git remote add')
  })

  test('subcommand with alias for first part', () => {
    const cli = cac()
    let matched = ''

    cli
      .command('mcp login', 'Login to MCP')
      .alias('m')
      .action(() => {
        matched = 'mcp login via alias'
      })

    cli.parse(['node', 'bin', 'm', 'login'], { run: true })
    expect(matched).toBe('mcp login via alias')
  })

  test('single-word commands still work (backward compatibility)', () => {
    const cli = cac()
    let matched = ''

    cli.command('build', 'Build the project').action(() => {
      matched = 'build'
    })

    cli.parse(['node', 'bin', 'build'], { run: true })
    expect(matched).toBe('build')
    expect(cli.matchedCommandName).toBe('build')
  })

  test('subcommand does not match when args are insufficient', () => {
    const cli = cac()
    let matched = ''

    cli.command('mcp login', 'Login to MCP').action(() => {
      matched = 'mcp login'
    })

    cli.command('mcp', 'MCP base').action(() => {
      matched = 'mcp base'
    })

    cli.parse(['node', 'bin', 'mcp'], { run: true })
    expect(matched).toBe('mcp base')
  })
})
