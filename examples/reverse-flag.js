const cac = require('..')

const cli = cac()

// Reverse flag is treated in the same way as normal flag
// but instead of `--clear`, it's shown as `--no-clear` in auto-generated help
cli.option('no-clear', {
  desc: 'Do not clear this'
})

console.log(cli.parse())

