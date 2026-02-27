import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('rm <dir>', 'Remove a dir')
  .option('-r, --recursive', 'Remove recursively')
  .action((dir, options) => {
    console.info(`remove ${dir}${options.recursive ? ' recursively' : ''}`)
  })

cli.help()

cli.parse()
