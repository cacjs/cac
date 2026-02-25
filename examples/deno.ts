import { cac } from 'jsr:@cac/cac@7.0.0-beta.1'

const cli = cac('my-program')
const parsed = cli.parse()

console.info(JSON.stringify(parsed, null, 2))
