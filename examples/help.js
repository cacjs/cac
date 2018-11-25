require('ts-node/register')
const cli = require('../src/index').default()

cli.option('--type [type]', 'Choose a project type', {
  default: 'node'
})
cli.option('--name <name>', 'Provide your name')

cli.command('lint [...files]', 'Lint files')
.action((files, options) => {
  console.log(files, options)
})

// Display help message when `-h` or `--help` appears
cli.help()
// Display version number when `-h` or `--help` appears
cli.version('0.0.0')

cli.parse()
