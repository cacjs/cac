require('ts-node/register')
const cli = require('../src/index').cac()

cli.option('--type [type]', 'Choose a project type')

const parsed = cli.parse()

console.log(JSON.stringify(parsed, null, 2))
