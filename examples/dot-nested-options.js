require('ts-node/register')
const cli = require('../src/index').default()

cli
  .command('build', 'desc')
  .option('--env <env>', 'Set envs')
  .example('--env.API_SECRET xxx')
  .action(options => {
    console.log(options)
  })

cli.help()

cli.parse()
