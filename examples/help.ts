import { cac } from '../src/index.ts'

const cli = cac()

cli.option('--type [type]', 'Choose a project type', {
  default: 'node',
})
cli.option('--name <name>', 'Provide your name')

cli.command('lint [...files]', 'Lint files').action((files, options) => {
  console.info(files, options)
})

cli.command('[...files]', 'Run files').action((files, options) => {
  console.info('run', files, options)
})

// Display help message when `-h` or `--help` appears
cli.help()
// Display version number when `-v` or `--version` appears
cli.version('0.0.0')

cli.parse()
