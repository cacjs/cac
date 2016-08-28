'use strict'
const cac = require('../')

const cli = cac()
cli
  .command('*', 'This is a wildcard command', () => {
    console.log('whatever')
  })
  .parse()
