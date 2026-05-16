# Help and Version

Use this pattern for a user-facing CLI with global options, commands, default commands, help, and version output.

```ts
import { cac } from 'cac'

const cli = cac()

cli.option('--type [type]', 'Choose a project type', {
  default: 'node',
})
cli.option('--name <name>', 'Provide your name')

cli.command('lint [...files]', 'Lint files').action((files, options) => {
  console.info(files, options)
})

cli.command('[...files]', 'Run files').action((files, options) => {
  console.info('run', files, options)
})

cli.help()
cli.version('0.0.0')
cli.parse()
```

- `help()` registers `-h, --help`.
- `version()` registers `-v, --version` by default.
- Default commands still appear in global help.
