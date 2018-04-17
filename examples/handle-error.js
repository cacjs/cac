require('babel-register')
const cac = require('../src').default

const cli = cac()

cli.command('*', 'default command', () => {
  throw new Error('damn')
})

cli.command('p', 'p command', () => {
  return Promise.reject(new Error('promise rejected'))
})

cli.parse()
