import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('build <entry> [...otherFiles]', 'Build your app')
  .option('--foo', 'Foo option')
  .action((entry, otherFiles, options) => {
    console.info(entry)
    console.info(otherFiles)
    console.info(options)
  })

cli.help()

cli.parse()
