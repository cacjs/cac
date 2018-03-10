require('babel-register')
const cac = require('../../../src').default
const pkg = require('./_mock-pkg')

const cli = cac({ pkg })

cli.command('sub', 'sub command', () => {})

cli.parse()
