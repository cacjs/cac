import path from 'path'
import execa from 'execa'
import stripAnsi from 'strip-ansi'

function fixture(file: string) {
  return path.relative(process.cwd(), path.join(__dirname, 'fixtures', file))
}

function snapshotOutput({
  title,
  file,
  args
}: {
  title: string,
  file: string,
  args?: string[]
}) {
  test(title, async () => {
    const { stdout, cmd } = await execa('node', [
      fixture(file),
      ...(args || [])
    ])
    expect(stripAnsi(stdout)).toMatchSnapshot(cmd)
  })
}

snapshotOutput({
  title: 'help message when no command',
  file: 'help-message/no-command.js',
  args: ['--help']
})

snapshotOutput({
  title: 'help message for sub command',
  file: 'help-message/sub-command.js',
  args: [
    'sub',
    '--help'
  ]
})

snapshotOutput({
  title: 'help message for wildcard command',
  file: 'help-message/wildcard-command.js',
  args: ['--help']
})
