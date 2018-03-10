import path from 'path'
import test from 'ava'
import execa from 'execa'

test('help message when no command', async t => {
  const file = 'help-message-when-no-command'
  const { stdout } = await execa('node', [
    path.join(__dirname, 'fixtures', file),
    '--help'
  ])
  t.true(stdout.includes(`${file} <command> [options]`))
})

test('help message for sub command', async t => {
  const file = 'help-message-for-sub-command'
  const { stdout } = await execa('node', [
    path.join(__dirname, 'fixtures', file),
    'sub',
    '--help'
  ])
  t.true(stdout.includes(`${file} sub [options]`))
})

test('help message for wildcard command', async t => {
  const file = 'help-message-for-wildcard-command'
  const { stdout } = await execa('node', [
    path.join(__dirname, 'fixtures', file),
    '--help'
  ])
  t.true(stdout.includes(`${file} <command> [options]`))
})
