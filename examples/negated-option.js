require('ts-node/register')
const cli = require('../src/index').cac()

cli.option('--no-clear-screen', 'Do not clear screen')

const parsed = cli.parse()

console.log(JSON.stringify(parsed, null, 2))
