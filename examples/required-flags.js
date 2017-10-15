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
  desc: 'bar is a flag for command b'
})

cli.use(requiredFlags())

function requiredFlags() {
  return cli => {
    cli.on('parsed', (command, input, flags) => {
      if (!command) return

      const missingRequiredOptions = command.options.options
        .filter(option => {
          const isRequired = option.required
          const isMissing = typeof flags[option.name] === 'undefined'
          return isMissing && isRequired
        })
      if (missingRequiredOptions.length > 0) {
        console.log(`Missing flags: ${missingRequiredOptions.map(option => option.name).join(', ')}`)
        process.exit(1)
      }
    })
  }
}

cli.parse()

// Preview
// https://ooo.0o0.ooo/2017/10/15/59e354e9e06bc.png
