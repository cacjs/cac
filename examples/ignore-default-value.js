require('ts-node/register')
const cli = require('../src/index').cac()

cli
  .command('build', 'Build project', {
    ignoreOptionDefaultValue: true,
  })
  .option('--type [type]', 'Choose a project type', {
    default: 'node',
  })

const parsed = cli.parse()

console.log(JSON.stringify(parsed, null, 2))
