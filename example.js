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
  throw new Error('aieeeee')
})

cli.command('run, r', function* () {
  console.log('running...')
  yield sleep(2000)
  throw new Error('aie!')
})

cli.command('*', function () {
  console.log('everything else')
})

cli.parse()
