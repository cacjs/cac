import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('build', 'desc')
  .option('--env <env>', 'Set envs')
  .option('--foo-bar <value>', 'Set foo bar')
  .example('--env.API_SECRET xxx')
  .action((options) => {
    console.info(options)
  })

cli.help()

cli.parse()
