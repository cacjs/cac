require('babel-register')
const cac = require('../src').default

const cli = cac()

cli.command('a', {
  desc: 'command a'
}).option('foo', {
  required: true, // <-- Make it a required flag!
  desc: 'foo is a flag for command a'
})

cli.command('b', {
  desc: 'command b'
}).option('bar', {
  required: true, // <-- Make it a required flag!
  desc: 'bar is a flag for command b'
}).option('baz', {
  required: true, // <-- Make it a required flag!
  desc: 'baz is a flag for command b'
}).option('zoo', {
  desc: 'zoo is a flag for command b'
})

cli.parse()

// Preview
// https://ooo.0o0.ooo/2017/10/15/59e354e9e06bc.png
