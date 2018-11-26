import path from 'path'
import execa from 'execa'

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
