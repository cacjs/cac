import { cac } from './mod.js'

const cli = cac()

cli.command('[any]', '').action(() => console.log('any'))

cli.help()

cli.parse()
