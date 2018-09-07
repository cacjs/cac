const cac = require('../')

const cli = cac()

// Add a default command
cli.command('*', {
  desc: 'The default command'
}, (input, flags) => {
  if (flags.age) {
    console.log(`${input[0]} is ${flags.age} years old`)
  }
}).option('age', {
  desc: 'tell me the age'
})

// Add a sub command
cli.command('bob', {
  desc: 'Command for Bob'
}, (input, flags) => {
  console.log(`This is a command dedicated to Bob${flags.junior ? ' Jr' : ''}!`)
}).option('junior', {
  desc: 'Is this command for Bob Jr',
  type: 'boolean',
  default: false
})

cli.parse()
