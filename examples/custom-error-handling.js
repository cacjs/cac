'use strict'
const cac = require('../')

const cli = cac()

cli.command('r, rm, remove', function* () {
  throw new Error('aie!')
})

cli.onError = function () {
  console.log(`error occurs during running command "${this.input[0]}"`)
}

cli.parse()
