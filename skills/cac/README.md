# CAC Skill

An agent skill that helps AI coding agents understand and use [CAC](https://github.com/cacjs/cac), the lightweight CLI framework.

## Installation

```bash
npx skills add cacjs/cac --skill cac
```

## What's Included

The CAC skill provides knowledge about:

- **Command Modeling** - Global parsing, subcommands, and default commands
- **Argument Syntax** - Required, optional, and variadic positional args
- **Option Parsing** - Boolean flags, automatic negation, repeated options, arrays, and dot-nested options
- **CLI UX** - Help, version output, usage text, and command examples
- **Execution Flow** - Automatic execution, manual command running, and centralized error handling
- **Scenario References** - Source-aligned examples for common CAC patterns

## Usage

Once installed, agents can use the CAC skill when:

- Building or reviewing CAC-based CLIs
- Defining commands, options, and arguments
- Working with boolean flags or repeated options
- Handling default commands, nested options, or variadic args
- Explaining CAC parsing behavior

### Example Prompts

```text
Build a CAC CLI with a build command and repeated --include options
```

```text
Explain how --open and --no-open work in CAC
```

```text
Add a default command with variadic file arguments using CAC
```

```text
Help me handle CAC command errors in one place
```

## Documentation

- [CAC README](https://github.com/cacjs/cac#readme)
- [GitHub Repository](https://github.com/cacjs/cac)

## License

MIT
