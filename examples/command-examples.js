require('ts-node/register')
const cli = require('../src/index').cac()

cli
  .command('build', 'Build project')
  .example('cli build foo.js')
  .example((name) => {
    return `${name} build foo.js`
  })
  .option('--type [type]', 'Choose a project type')

const parsed = cli.parse()

console.log(JSON.stringify(parsed, null, 2))
