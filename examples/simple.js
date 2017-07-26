require('babel-register')
const cac = require('../src').default

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
  desc: 'Command for bob'
}, () => {
  console.log('This is a command dedicated to bob!')
})

cli.parse()
