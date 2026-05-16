# Negated Option

Use an explicitly negated option when the negative form itself should be declared and documented.

```ts
import { cac } from 'cac'
const cli = cac()

cli.option('--no-clear-screen', 'Do not clear screen')

const parsed = cli.parse()
console.info(JSON.stringify(parsed, null, 2))
```

- Explicit `--no-clear-screen` gives `clearScreen` a default value of `true` when no explicit default is provided.
- A bare boolean like `--open` already accepts `--no-open` automatically; declare the negated form only when its help/default semantics matter.
