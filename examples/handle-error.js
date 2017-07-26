require('babel-register')
const cac = require('../src').default

const cli = cac()

cli.command('*', {
  desc: 'default command'
}, () => {
  throw new Error('damn')
})

cli.command('p', {
  desc: 'p command'
}, () => {
  return Promise.reject(new Error('promise rejected'))
})

cli.parse()
