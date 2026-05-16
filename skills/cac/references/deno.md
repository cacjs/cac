# Deno

Use the JSR import path when building a CAC CLI for Deno.

```ts
import { cac } from 'jsr:@cac/cac@7.0.0-beta.1'

const cli = cac('my-program')
const parsed = cli.parse()
console.info(JSON.stringify(parsed, null, 2))
```

- The command model is the same as in Node.
- Keep the versioned JSR specifier aligned with the package version you intend to target.
