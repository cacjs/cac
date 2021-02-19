import path from 'path'
import execa from 'execa'
import cac from '..'

function fixture(file: string) {
  return path.relative(
    process.cwd(),
    path.join(__dirname, '../../examples', file)
  )
}

function snapshotOutput({
  title,
  file,
  args
}: {
  title: string
  file: string
  args?: string[]
}) {
  test(title, async () => {
    const { stdout } = await execa('node', [fixture(file), ...(args || [])])
    expect(stdout).toMatchSnapshot(title)
  })
}

snapshotOutput({
  title: 'basic-usage',
  file: 'basic-usage.js',
  args: ['foo', 'bar', '--type', 'ok', 'command']
})

snapshotOutput({
  title: 'help',
  file: 'help.js',
  args: ['--help']
})

snapshotOutput({
  title: 'variadic-arguments',
  file: 'variadic-arguments.js',
  args: ['--foo', 'build', 'a', 'b', 'c', 'd']
})

snapshotOutput({
  title: 'ignore-default-value',
  file: 'ignore-default-value.js',
  args: ['build']
})

test('negated option', () => {
  const cli = cac()

  cli.option('--foo [foo]', 'Set foo').option('--no-foo', 'Disable foo')

  cli.option('--bar [bar]', 'Set bar').option('--no-bar', 'Disable bar')

  const { options } = cli.parse(['node', 'bin', '--foo', 'foo', '--bar'])
  expect(options).toEqual({
    '--': [],
    foo: 'foo',
    bar: true
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
    'test'
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

test('negated option help output', () => {
  const cli = cac()

  cli.option('--config <config>', 'Use custom config file')
  cli.option('--no-config', 'Skip')

  const saved = console.log
  let output = ''
  try {
    console.log = (msg, more) => {
      if (more) throw new Error('Unexpected multi-arg call to console.log')
      output += msg
    }
    cli.outputHelp()
    expect(output).toBe(
      `

Usage:
  $  <command> [options]

Options:
  --[no-]config <config>   Skip/Use custom config file `
    )
  } finally {
    console.log = saved
  }
})

test('array types without transformFunction', () => {
  const cli = cac()

  cli
    .option(
      '--externals <external>',
      'Add externals(can be used for multiple times',
      {
        type: []
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
      type: [String]
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
