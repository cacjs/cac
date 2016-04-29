'use strict'
const sleep = require('then-sleep')
const cac = require('./')

const cli = cac(`
  Usage:
    ....

  Options:
    --help
`, {
  alias: {
    foo: 'version'
  }
})

cli.command('init', function () {
  console.log(this)
})

cli.command('run, r', function* () {
  console.log('running...')
  yield sleep(2000)
  console.log('bye')
})

cli.command('*', function () {
  console.log('everything else')
})

cli.parse()
