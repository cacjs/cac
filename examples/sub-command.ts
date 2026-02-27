import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('deploy [path]', 'Deploy to AWS')
  .option('--token <token>', 'Your access token')
  .example('deploy ./dist')

cli
  .command('bar <a> <b> [...rest]', 'The bar command')
  .option('--bad', 'It is bad')
  .action((a, b, rest) => {
    console.info(a, b, rest)
  })

cli
  .command('cook <...food>', 'Cook some good')
  .option('--bar', 'Bar is a boolean option')
  .action((food, options) => {
    console.info(food, options)
  })

cli
  .command('[...files]', 'Build given files')
  .option('--no-minify', 'Do not minify the output')
  .option('--source-map', 'Enable source maps')
  .action((args, flags) => {
    console.info(args, flags)
  })

cli.version('0.0.0')
cli.help()

cli.parse()
