const cac = require('..')

const cli  = cac()

cli.command('*', input => {
  console.log(input)
})
cli.command('init', 'Init a project')
cli.command('nope', 'should not exists')

cli.parse()
