'use strict'
const cac = require('../')

const cli = cac()

cli.command('r, rm, remove', function () {
  console.log('removed!')
})

cli.parse()
