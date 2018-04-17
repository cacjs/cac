const cac = require('../')

const cli = cac()

/**
 * ./match run index.js
 * ./match index.js
 */
cli.command('run', 'run command', {
  match(name) {
    return name && name.endsWith('.js')
  }
}, input => {
  console.log(input[0])
})

cli.command('*', 'default', input => {
  console.log('default', input)
})

cli.parse()
