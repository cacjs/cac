# Default Command

Use this form when the CLI's primary behavior should run with no explicit command name.

```ts
import { cac } from 'cac'
const cli = cac()

cli
  .command('', 'Do something')
  .alias('something')
  .action(() => {
    console.info('Did something!')
  })

cli.parse()
```

- An empty command name makes the command default.
- Add a normal alias when the same behavior should also be invokable by name.
