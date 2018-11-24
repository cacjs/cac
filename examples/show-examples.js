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

cli.command('send', {
  desc: 'Send a message',
  examples: ['-t "hi there" -w user@example.com']
}).option('text', {
  alias: 't',
  desc: 'Message body',
  required: true // <-- Works with required flag!
}).option('who', {
  alias: 'w',
  desc: 'Recipient email address',
  required: true // <-- Works with required flag!
})

cli.parse()
