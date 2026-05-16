# Variadic Arguments

Use a variadic positional argument when a command should accept a trailing list of values.

```ts
import { cac } from 'cac'
const cli = cac()

cli
  .command('build <entry> [...otherFiles]', 'Build your app')
  .option('--foo', 'Foo option')
  .action((entry, otherFiles, options) => {
    console.info(entry)
    console.info(otherFiles)
    console.info(options)
  })

cli.help()
cli.parse()
```

- Only the final positional argument may be variadic.
- Variadic args arrive as an array in the action callback.
