# Command Examples

Use command examples when help output should show concrete invocations.

```ts
import { cac } from 'cac'
const cli = cac()

cli
  .command('build', 'Build project')
  .example('cli build foo.js')
  .example((name) => `${name} build foo.js`)
  .option('--type [type]', 'Choose a project type')

const parsed = cli.parse()
console.info(JSON.stringify(parsed, null, 2))
```

- `.example(...)` accepts either a string or a function receiving the CLI name.
- Command examples appear in that command's help output.
