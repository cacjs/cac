import path from 'path'
import test from 'ava'
import execa from 'execa'

test('help message when no command', async t => {
  const { stdout } = await execa('node', [
    path.join(__dirname, 'fixtures/help-message/no-command.js'),
    '--help'
  ])
  t.snapshot(stdout)
})

test('help message for sub command', async t => {
  const { stdout } = await execa('node', [
    path.join(__dirname, 'fixtures/help-message/sub-command.js'),
    'sub',
    '--help'
  ])
  t.snapshot(stdout)
})

test('help message for wildcard command', async t => {
  const { stdout } = await execa('node', [
    path.join(__dirname, 'fixtures/help-message/wildcard-command.js'),
    '--help'
  ])
  t.snapshot(stdout)
})
