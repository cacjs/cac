import { cac } from '../src/index.ts'
const cli = cac()

cli.option('--no-clear-screen', 'Do not clear screen')

const parsed = cli.parse()

console.info(JSON.stringify(parsed, null, 2))
