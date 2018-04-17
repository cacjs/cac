const cac = require('../')

const cli = cac()

cli.command('*', 'default command', (input, flags) => {
  console.log(flags)
})
.option('hi', {
  alias: 'hey',
  desc: 'say hi',
  type: 'string',
  default: 'wow'
})

cli.command('init', {
  desc: 'Init a project'
})
.option('force', {
  alias: 'f',
  desc: 'hello there!'
})

cli.parse()
