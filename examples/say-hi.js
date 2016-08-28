'use strict'
const cac = require('../')
// initialize your cli program
const cli = cac()

// add your very first command
cli.command('hi', 'Say hi!', (input) => {
  console.log(`hi ${input[1] || 'boy'}!`)
})

// parse arguments and bootstrap
cli.parse()
