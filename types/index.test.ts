import cac from 'cac'

const cli = cac()

cli.command('name', 'hi', input => {
  return new Promise(() => {})
})
.option('name', {
  desc: 'as'
})

cli.use(ctx => {
  ctx.on('parsed', (command) => {
    if (typeof command === 'undefined') return
    command.options.options.lastIndexOf
  })
})

cli.parse(null, {run: false})
