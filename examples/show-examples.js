const cac = require('../')

const cli = cac()

cli.command('*', {
  desc: 'hi',
  examples: ['hello world']
})

cli.command('hoo', {
  desc: 'hoo',
  examples: ['this is an example', 'yet another']
})

cli.parse()
