# Ignore Default Value

Use `ignoreOptionDefaultValue` when help should show defaults but parsed output should not be prefilled.

```ts
import { cac } from 'cac'
const cli = cac()

cli
  .command('build', 'Build project', {
    ignoreOptionDefaultValue: true,
  })
  .option('--type [type]', 'Choose a project type', {
    default: 'node',
  })

const parsed = cli.parse()
console.info(JSON.stringify(parsed, null, 2))
```

- This is useful when downstream logic needs to distinguish omitted values from defaults.
