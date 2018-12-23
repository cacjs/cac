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

test('negated optional validation', () => {
  const cli = cac()

  cli.option('--config <config>', 'config file')
  cli.option('--no-config', 'no config file')

  const { options } = cli.parse(`node bin --no-config`.split(' '))

  cli.globalCommand.checkOptionValue()
  expect(options.config).toBe(false)
})
