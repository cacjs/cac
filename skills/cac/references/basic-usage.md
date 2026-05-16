# Basic Usage

Use this pattern when the CLI only needs to parse free-form positional args plus global options.

```ts
import { cac } from 'cac'
const cli = cac()

cli.option('--type [type]', 'Choose a project type')

const parsed = cli.parse()
console.info(JSON.stringify(parsed, null, 2))
```

- Use `cli.option(...)` for global options.
- `cli.parse()` returns `{ args, options }` even when no command is defined.
