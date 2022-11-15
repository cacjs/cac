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

describe('cli version and sub-command version', () => {
  test('global command version', async () => {
    const output = await getOutput('versions.js', ['-v'])
    expect(output).toContain('1.0.2')
  })

  test('sub command version', async () => {
    const output1 = await getOutput('versions.js', ['build', '-v'])
    expect(output1).toContain('1.0.0')

    const output2 = await getOutput('versions.js', ['set', '-v'])
    expect(output2).toContain('1.0.1')

    //help message
    const output_help = await getOutput('versions.js', ['set', '--help'])
    expect(output_help).toContain('--version')
  })

  test('without sub-command version', async () => {
    const default_command_output = await getOutput('help.js', ['-v'])
    expect(default_command_output).toContain('0.0.0')

    const sub_command_output = await getOutput('help.js', ['lint', '-v'])
    expect(sub_command_output).toEqual(default_command_output) // fall back to default

    //help message
    const sub_command_help = await getOutput('help.js', ['lint', '-h'])
    expect(sub_command_help).not.toContain('--version')
  })
})
