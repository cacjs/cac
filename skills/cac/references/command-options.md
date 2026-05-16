# Command Options

Use command-scoped options when a flag only belongs to one command.

```ts
import { cac } from 'cac'
const cli = cac()

cli
  .command('rm <dir>', 'Remove a dir')
  .option('-r, --recursive', 'Remove recursively')
  .action((dir, options) => {
    console.info(`remove ${dir}${options.recursive ? ' recursively' : ''}`)
  })

cli.help()
cli.parse()
```

- Positional args are passed before the final `options` argument.
- Command options are validated only when that command is used.
