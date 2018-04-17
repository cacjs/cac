import path from 'path'
import execa from 'execa'

function fixture(file) {
  return path.relative(process.cwd(), path.join(__dirname, 'fixtures', file))
}

test('help message when no command', async () => {
  const { stdout, cmd } = await execa('node', [
    fixture('help-message/no-command.js'),
    '--help'
  ])
  expect(stdout).toMatchSnapshot(cmd)
})

test('help message for sub command', async () => {
  const { stdout, cmd } = await execa('node', [
    fixture('help-message/sub-command.js'),
    'sub',
    '--help'
  ])
  expect(stdout).toMatchSnapshot(cmd)
})

test('help message for wildcard command', async () => {
  const { stdout, cmd } = await execa('node', [
    fixture('help-message/wildcard-command.js'),
    '--help'
  ])
  expect(stdout).toMatchSnapshot(cmd)
})
