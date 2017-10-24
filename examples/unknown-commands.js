require('babel-register')
const cac = require('../src').default

const cli = cac()

cli.command('*', {
  desc: 'default command'
}, input => {
  const isKnownCommand = input[0] && cli.commands
    .filter(command => {
      return command.command.names.includes(input[0])
    }).length === 1

  if (!isKnownCommand) {
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
