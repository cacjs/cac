require('ts-node/register')
const cli = require('../src/index').cac()

cli
  .command('build', 'desc')
  .option('--env <env>', 'Set envs')
  .option('--foo-bar <value>', 'Set foo bar')
  .example('--env.API_SECRET xxx')
  .action((options) => {
    console.log(options)
  })

cli.help()

cli.parse()
