'use strict'
const cac = require('../')

const cli = cac()

cli.command('r, rm, remove', function () {
  console.log('removed!')
})

cli.command('*', function () {
  // all commands other than `r, rm, remove` lead you here!
  // even there's no command!
  console.log('everything else!')
})

cli.parse()
