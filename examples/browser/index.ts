import cac from 'cac'

const cli = cac('browser-cli').help().version('0.0.0')
const parsed = cli.parse(['node', 'cli', '--help'])
console.info(parsed)
