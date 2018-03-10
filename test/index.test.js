import path from 'path'
import test from 'ava'
import execa from 'execa'

function fixture(file) {
  return path.relative(process.cwd(), path.join(__dirname, 'fixtures', file))
}

test('help message when no command', async t => {
  const { stdout } = await execa('node', [
    fixture('help-message/no-command.js'),
    '--help'
  ])
  t.snapshot(stdout)
})

test('help message for sub command', async t => {
  const { stdout } = await execa('node', [
    fixture('help-message/sub-command.js'),
    'sub',
    '--help'
  ])
  t.snapshot(stdout)
})

test('help message for wildcard command', async t => {
  const { stdout } = await execa('node', [
    fixture('help-message/wildcard-command.js'),
    '--help'
  ])
  t.snapshot(stdout)
})
