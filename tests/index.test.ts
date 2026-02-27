import path from 'node:path'
import process from 'node:process'
import { x } from 'tinyexec'
import { describe, expect, test } from 'vitest'
import cac from '../src/index.ts'

function example(file: string) {
  return path.relative(
    process.cwd(),
    path.join(import.meta.dirname, '../examples', file),
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
    const { stdout } = await x('node', [example(file), ...(args || [])])
    expect(stdout).toMatchSnapshot(title)
  })
}

async function getOutput(file: string, args: string[] = []) {
  const { stdout } = await x('node', [example(file), ...(args || [])])
  return stdout
}

snapshotOutput({
  title: 'basic-usage',
  file: 'basic-usage.ts',
  args: ['foo', 'bar', '--type', 'ok', 'command'],
})

snapshotOutput({
  title: 'variadic-arguments',
  file: 'variadic-arguments.ts',
  args: ['--foo', 'build', 'a', 'b', 'c', 'd'],
})

snapshotOutput({
  title: 'ignore-default-value',
  file: 'ignore-default-value.ts',
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
      },
    )
    .option('--scale [level]', 'Scaling level')

  const { options: options1 } = cli.parse(
    `node bin --externals.env.prod production --scale`.split(' '),
  )
  expect(options1.externals).toEqual([{ env: { prod: 'production' } }])
  expect(options1.scale).toEqual(true)

  const { options: options2 } = cli.parse(
    `node bin --externals foo --externals bar`.split(' '),
  )
  expect(options2.externals).toEqual(['foo', 'bar'])

  const { options: options3 } = cli.parse(
    `node bin --externals.env foo --externals.env bar`.split(' '),
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
    `node bin build app.js --config config.js --scale`.split(' '),
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

test('throw on unused args', () => {
  const cli = cac()

  cli.command('build [entry]', 'Build your app').action(() => {})

  expect(() => {
    cli.parse(`node bin build app.js foo bar`.split(' '))
  }).toThrowError('Unused args: `foo`, `bar`')
})

describe('--version in help message', () => {
  test('sub command', async () => {
    const output = await getOutput('help.ts', ['lint', '--help'])
    expect(output).not.toContain(`--version`)
  })

  test('default command', async () => {
    const output = await getOutput('help.ts', ['--help'])
    expect(output).toContain(`--version`)
  })
})

describe("default commands", () => {
  test("simple: empty call", async () => {
    const output = await getOutput('default-command.js', [])
    expect(output).toContain("Did something!")
  })

  test("simple: name alias call", async () => {
    const output = await getOutput('default-command.js', ["something"])
    expect(output).toContain("Did something!")
  })

  // See https://github.com/cacjs/cac/issues/151
  test("inverted: empty call", async () => {
    const output = await getOutput('default-command-inverted.js', [])
    expect(output).toContain("Did something!")
  })
  
  test("inverted: name alias call", async () => {
    const output = await getOutput('default-command-inverted.js', ["something"])
    expect(output).toContain("Did something!")
  })
})
