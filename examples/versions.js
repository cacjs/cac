require('ts-node/register')
const cli = require('../src/index').cac()

cli
  .command('build [...files]', 'build files')
  .option('--type [type]', 'build type', { default: 'node' })
  .option('--target [target]', 'build target')
  .action((files, options, type) => {
    console.log(files, options)
  })
  .version('1.0.0')

cli
  .command('set [...files]', 'build files')
  .option('--type [type]', 'build type', { default: 'node' })
  .option('--target [target]', 'build target')
  .action((files, options, type) => {
    console.log(files, options)
  })
  .version('1.0.1')

cli.version('1.0.2')
cli.help()
cli.parse()
