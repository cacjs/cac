# Default Command Inverted

Use this form when the command should have a normal visible name but also act as the default command.

```ts
import { cac } from 'cac'
const cli = cac()

cli
  .command('something', 'Do something')
  .alias('!')
  .action(() => {
    console.info('Did something!')
  })

cli.parse()
```

- `alias('!')` marks a named command as the default command.
- This keeps `something` callable while also handling empty invocation.
