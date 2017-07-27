require('babel-register')
const cac = require('../src').default

const cli = cac()

const knownCommands = new Set(['hi'])

cli.command('*', {
  desc: 'default command'
}, input => {
  if (input[0] && !knownCommands.has(input[0])) {
    console.error(`${input[0]} is not a known command`)
    process.exit(1)
  }
})

cli.command('hi', {
  desc: 'hi command'
}, () => {
  console.log('this is a known command called hi!')
})

cli.parse()
