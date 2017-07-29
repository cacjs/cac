require('babel-register')
const cac = require('../src').default

const cli = cac()

cli.command('a', {
  desc: 'command a',
  requiredFlags: ['foo']
})

cli.command('b', {
  desc: 'command b',
  requiredFlags: ['bar']
})

cli.use(requiredFlags())

function requiredFlags() {
  return cli => {
    cli.on('parsed', (command, input, flags) => {
      if (!command) return

      const requiredFlags = command.command.requiredFlags || []
      const matched = []
      requiredFlags.forEach(flag => {
        if (!(flag in flags)) matched.push(flag)
      })
      if (matched.length > 0) {
        console.error(`missing flags: ${matched.join(', ')}`)
        process.exit(1)
      }
    })
  }
}

cli.parse()
