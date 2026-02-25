import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('build', 'Build project')
  .example('cli build foo.js')
  .example((name) => {
    return `${name} build foo.js`
  })
  .option('--type [type]', 'Choose a project type')

const parsed = cli.parse()

console.info(JSON.stringify(parsed, null, 2))
