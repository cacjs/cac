import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('something', 'Do something')
  .alias('!')
  .action(() => {
    console.info('Did something!')
  })

cli.parse()
