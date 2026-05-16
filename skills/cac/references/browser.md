# Browser

Use this pattern when running CAC outside Node's normal `process.argv` flow, such as in a browser demo or test harness.

```ts
import cac from 'cac'

const cli = cac('browser-cli').help().version('0.0.0')
const parsed = cli.parse(['node', 'cli', '--help'])
console.info(parsed)
```

- Pass an explicit argv array when runtime process args are unavailable.
- Browser usage still supports regular help/version behavior.
