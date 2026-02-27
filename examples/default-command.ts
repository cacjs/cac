import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('', 'Do something')
  .alias('something')
  .action(() => {
    console.info('Did something!')
  })

cli.parse()
