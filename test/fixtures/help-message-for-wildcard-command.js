require('babel-register')
const cac = require('../../src').default

const cli = cac()

cli.command('*', 'wildcard command', () => {})

cli.parse()
