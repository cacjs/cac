import { cac } from './mod.ts'

const cli = cac('my-program')

cli.command('[any]', '').action(() => console.log('any'))

cli.help()
cli.version('0.0.0')

cli.parse()
