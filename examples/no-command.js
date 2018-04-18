const cac = require('..')

const cli = cac()

const { flags } = cli.parse()

if (flags.name) {
  console.log('The name is', flags.name)
}
