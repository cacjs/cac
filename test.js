import test from 'ava'
import cac from './'

test('camelcased keys', t => {
  const cli = cac()
  cli.parse(['--hide-progress'])
  t.true(cli.argv.flags.hideProgress)
})

test('output version', t => {
  const cli = cac(`wow`)
  cli.parse(['--version'])
  process.stdout.on('data', data => {
    t.true(data.indexOf('.') !== -1)
  })
})

test('output help', t => {
  const cli = cac(`wow`)
  cli.parse(['--help'])
  process.stdout.on('data', data => {
    t.true(data.indexOf('wow') !== -1)
  })
})

test('help is array', t => {
  const cli = cac(['wow'])
  cli.parse(['--help'])
  process.stdout.on('data', data => {
    t.true(data.indexOf('wow') !== -1)
  })
})

test('command', t => {
  const cli = cac()
  cli.command('r, rm, remove', function () {
    console.log('remove')
  })
  cli.parse(['remove'])
  process.stdout.on('data', data => {
    t.true(data.indexOf('remove') !== -1)
  })
})

test('hanle error', t => {
  const cli = cac()
  cli.command('foo', function* () {
    throw new Error('lah')
  })
  cli.onError = function () {
    t.pass()
  }
  cli.parse(['foo'])
})
