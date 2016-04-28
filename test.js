import test from 'ava'
import cac from './'

test('camelcased keys', t => {
  const cli = cac()
  cli.parse(['--hide-progress'])
  t.true(cli.argv.flags.hideProgress)
})

test('output help', t => {
  const cli = cac(`wow`)
  cli.parse(['--help'])
  process.stdout.on('data', data => {
    t.true(data.indexOf('wow') !== -1)
  })
})
