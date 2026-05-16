---
name: cac
description: Build and maintain command-line interfaces with CAC. Use when a task involves the `cac` package, authoring or reviewing CLI apps, defining commands/options/arguments, generating help or version output, handling parse errors, or explaining CAC-specific behavior such as default commands, boolean negation, variadic args, dot-nested options, and `--` passthrough.
---

# CAC

Use CAC to build small, expressive CLIs with a compact command grammar:

```ts
import { cac } from 'cac'

const cli = cac('my-cli')

cli
  .command('build <entry> [...files]', 'Build project files')
  .option('--minify', 'Minify output')
  .action((entry, files, options) => {
    console.info({ entry, files, options })
  })

cli.help()
cli.version('1.0.0')
cli.parse()
```

Install with `pnpm add cac`.

## Build CLIs This Way

1. Choose the command shape first.
   - Use global parsing only for tiny CLIs.
   - Use `cli.command(...)` for verb-based CLIs.
   - Use a default command when the main behavior should run without an explicit verb.
2. Model positional arguments before options.
   - `<arg>` is required.
   - `[arg]` is optional.
   - `...` is variadic and may only appear on the final positional argument.
3. Attach options at the narrowest useful scope.
   - Use `cli.option(...)` for flags shared by multiple commands.
   - Use `command.option(...)` for command-specific flags.
4. Add `help()` and `version()` for user-facing tools.
5. Use plain `cli.parse()` for simple flows; use `cli.parse(argv, { run: false })` plus `await cli.runMatchedCommand()` when you need centralized or async error handling.

## Syntax and Parsing

| Need | CAC form | Result |
| --- | --- | --- |
| Required arg | `build <entry>` | action receives `entry` |
| Optional arg | `build [entry]` | action receives `undefined` when omitted |
| Variadic arg | `build <entry> [...rest]` | final action arg is an array |
| Boolean flag | `--open` | accepts both `--open` and `--no-open` automatically |
| Optional option value | `--scale [level]` | value or `true` |
| Required option value | `--out <dir>` | missing value throws |
| Global option | `cli.option('--cwd <dir>', ...)` | available to all commands |
| Command option | `command.option('--watch', ...)` | scoped to one command |
| Repeated option | `--include a --include b` | becomes `['a', 'b']` |
| Dot-nested option | `--env.API_SECRET xxx` | becomes `options.env.API_SECRET` |
| Passthrough args | `-- pnpm test` | stored in `options['--']` |

Kebab-case option names are read in camelCase:

```ts
cli.option('--clear-screen', 'Clear screen')
// read options.clearScreen
```

Only the first segment is camel-cased, so `--env.API_SECRET` becomes `options.env.API_SECRET`.

Bare booleans already accept negation:

```ts
cli.option('--open', 'Open browser')
// --open    -> { open: true }
// --no-open -> { open: false }
```

Declare an explicit negated option only when the negated form should appear in help, should default to `true`, or must pair with a required-value option:

```ts
cli
  .option('--no-config', 'Disable config file')
  .option('--config <path>', 'Use a custom config file')
```

For array-valued options, prefer repeated flags:

```bash
--include a --include b --include c
```

CAC parses that as:

```ts
{ include: ['a', 'b', 'c'] }
```

Do not model array input as `--include a,b,c` and split the string manually unless the CLI intentionally documents comma-separated syntax. If consumers should always receive an array, use `type: []` so even one `--include a` becomes `['a']`.

## Scenario References

Use the reference that matches the user's task:

| Scenario | Reference |
| --- | --- |
| Parse args plus global options | [basic-usage](references/basic-usage.md) |
| Parse explicit argv outside normal Node flow | [browser](references/browser.md) |
| Add examples to command help | [command-examples](references/command-examples.md) |
| Add command-scoped options | [command-options](references/command-options.md) |
| Define an empty-name default command | [default-command](references/default-command.md) |
| Make a named command also act as default | [default-command-inverted](references/default-command-inverted.md) |
| Use CAC from Deno | [deno](references/deno.md) |
| Parse nested option keys | [dot-nested-options](references/dot-nested-options.md) |
| Combine help, version, global options, and a default command | [help](references/help.md) |
| Show defaults in help without filling parsed output | [ignore-default-value](references/ignore-default-value.md) |
| Declare an explicit negated option | [negated-option](references/negated-option.md) |
| Combine multiple subcommands in one CLI | [sub-command](references/sub-command.md) |
| Accept trailing positional lists | [variadic-arguments](references/variadic-arguments.md) |

## Centralized Error Handling

```ts
try {
  cli.parse(process.argv, { run: false })
  await cli.runMatchedCommand()
} catch (error) {
  console.error(error)
  process.exit(1)
}
```

## Important Behaviors

- When a matched command has an action, CAC validates unknown options, missing option values, missing required args, and unused extra args.
- Use `allowUnknownOptions()` only when forwarding another tool's flags.
- Use `ignoreOptionDefaultValue()` when help should show defaults but parsed output should stay sparse.
- Variadic positional args arrive as arrays.
- `options['--']` is reserved for everything after a double dash.
- `command.alias(name)` accepts plain aliases; use `alias('!')` to mark a named command as the default command.
- Listen to `command:<name>`, `command:!`, and `command:*` when you need matched/default/unknown-command hooks.

## API Surface

### CLI

```ts
cac(name?)
cli.command(name, description?, config?)
cli.option(name, description, config?)
cli.help(callback?)
cli.version(version, customFlags?)
cli.usage(text)
cli.example(example)
cli.parse(argv?, { run }?)
cli.runMatchedCommand()
cli.outputHelp()
cli.outputVersion()
```

`cli.parse()` returns `{ args, options }` and also sets:

```ts
cli.rawArgs
cli.args
cli.options
cli.matchedCommand
cli.matchedCommandName
```

### Command

```ts
command.option(name, description, config?)
command.action(callback)
command.alias(name)
command.allowUnknownOptions()
command.ignoreOptionDefaultValue()
command.example(example)
command.usage(text)
```

Option config supports:

```ts
{
  default?: any
  type?: any[]
}
```

Use `type: []` to force array output and `type: [String]` to transform each value.
