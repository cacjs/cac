import { cac } from '../src/index.ts'
const cli = cac()

cli
  .command('build', 'Build project', {
    ignoreOptionDefaultValue: true,
  })
  .option('--type [type]', 'Choose a project type', {
    default: 'node',
  })

const parsed = cli.parse()

console.info(JSON.stringify(parsed, null, 2))
