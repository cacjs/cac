require('babel-register')
const cac = require('../../src').default

const cli = cac()

cli.command('sub', 'sub command', () => {})

cli.parse()
