# Dot-Nested Options

Use dot-nested options when users need to provide structured values from the CLI.

```ts
import { cac } from 'cac'
const cli = cac()

cli
  .command('build', 'desc')
  .option('--env <env>', 'Set envs')
  .option('--foo-bar <value>', 'Set foo bar')
  .example('--env.API_SECRET xxx')
  .action((options) => {
    console.info(options)
  })

cli.help()
cli.parse()
```

- `--env.API_SECRET xxx` becomes `options.env.API_SECRET`.
- Only the first segment is camel-cased, so `--foo-bar` becomes `fooBar` while nested keys stay unchanged.
