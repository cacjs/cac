const cac = require('../../../../')
const pkg = require('./_mock-pkg')

const cli = cac({ pkg })

cli.command('sub', 'sub command', () => {})

cli.parse()
