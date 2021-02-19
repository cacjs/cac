import CAC from './CAC'
import Option, { OptionConfig } from './Option'
import {
  removeBrackets,
  findAllBrackets,
  findLongest,
  padRight,
  CACError,
} from './utils'
import { platformInfo } from './node'

interface CommandArg {
  required: boolean
  value: string
  variadic: boolean
}

interface HelpSection {
  title?: string
  body: string
}

interface CommandConfig {
  allowUnknownOptions?: boolean
  ignoreOptionDefaultValue?: boolean
}

type HelpCallback = (sections: HelpSection[]) => void | HelpSection[]

type CommandExample = ((bin: string) => string) | string

class Command {
  options: Option[]
  aliasNames: string[]
  /* Parsed command name */
  name: string
  args: CommandArg[]
  commandAction?: (...args: any[]) => any
  usageText?: string
  versionNumber?: string
  examples: CommandExample[]
  helpCallback?: HelpCallback
  globalCommand?: GlobalCommand

  constructor(
    public rawName: string,
    public description: string,
    public config: CommandConfig = {},
    public cli: CAC
  ) {
    this.options = []
    this.aliasNames = []
    this.name = removeBrackets(rawName)
    this.args = findAllBrackets(rawName)
    this.examples = []
  }

  usage(text: string) {
    this.usageText = text
    return this
  }

  allowUnknownOptions() {
    this.config.allowUnknownOptions = true
    return this
  }

  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true
    return this
  }

  version(version: string, customFlags = '-v, --version') {
    this.versionNumber = version
    this.option(customFlags, 'Display version number')
    return this
  }

  example(example: CommandExample) {
    this.examples.push(example)
    return this
  }

  /**
   * Add a option for this command
   * @param rawName Raw option name(s)
   * @param description Option description
   * @param config Option config
   */
  option(rawName: string, description: string, config?: OptionConfig) {
    const option = new Option(rawName, description, config)
    this.options.push(option)
    return this
  }

  alias(name: string) {
    this.aliasNames.push(name)
    return this
  }

  action(callback: (...args: any[]) => any) {
    this.commandAction = callback
    return this
  }

  /**
   * Check if a command name is matched by this command
   * @param name Command name
   */
  isMatched(name: string) {
    return this.name === name || this.aliasNames.includes(name)
  }

  get isDefaultCommand() {
    return this.name === '' || this.aliasNames.includes('!')
  }

  get isGlobalCommand(): boolean {
    return this instanceof GlobalCommand
  }

  /**
   * Check if an option is registered in this command
   * @param name Option name
   */
  hasOption(name: string) {
    name = name.split('.')[0]
    return this.options.find((option) => {
      return option.names.includes(name)
    })
  }

  outputHelp() {
    const { name, commands } = this.cli
    const {
      versionNumber,
      options: globalOptions,
      helpCallback,
    } = this.cli.globalCommand

    let sections: HelpSection[] = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ''}`,
      },
    ]

    sections.push({
      title: 'Usage',
      body: `  $ ${name} ${this.usageText || this.rawName}`,
    })

    const showCommands =
      (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0

    if (showCommands) {
      const longestCommandName = findLongest(
        commands.map((command) => command.rawName)
      )
      sections.push({
        title: 'Commands',
        body: commands
          .map((command) => {
            return `  ${padRight(
              command.rawName,
              longestCommandName.length
            )}  ${command.description}`
          })
          .join('\n'),
      })
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands
          .map(
            (command) =>
              `  $ ${name}${
                command.name === '' ? '' : ` ${command.name}`
              } --help`
          )
          .join('\n'),
      })
    }

    const options = this.isGlobalCommand
      ? globalOptions
      : [...this.options, ...(globalOptions || [])]
    if (options.length > 0) {
      const negatedOpts: { [key: string]: Option } = {}
      // O(n2), let's hope there aren't a zillion options
      for (const o1 of options) {
        if (!o1.negated) continue
        for (const o2 of options) {
          if (o1.name == o2.name) negatedOpts[o2.name] = o1
        }
      }
      const longest = options
        .map((o) => {
          if (o.negated) return 0
          const l = o.rawName.length
          // '5' is the length of '[no-]'. As to the 1, I have no clue...
          return negatedOpts[o.name] ? l + 5 + 1 : l
        })
        .reduce((acc, l) => Math.max(acc, l), 0)
      sections.push({
        title: 'Options',
        body: options
          .map((option) => {
            if (option.negated) return
            let desc = option.description
            let name = option.rawName
            if (negatedOpts[option.name]) {
              const ndesc = negatedOpts[option.name].description
              if (ndesc) desc = `${ndesc}/${desc}`
              name = name.replace(/^(--?)/, '$1[no-]')
            }

            return `  ${padRight(name, longest)}  ${desc} ${
              option.config.default === undefined
                ? ''
                : `(default: ${option.config.default})`
            }`
          })
          .filter(Boolean).join('\n'),
      })
    }

    if (this.examples.length > 0) {
      sections.push({
        title: 'Examples',
        body: this.examples
          .map((example) => {
            if (typeof example === 'function') {
              return example(name)
            }
            return example
          })
          .join('\n'),
      })
    }

    if (helpCallback) {
      sections = helpCallback(sections) || sections
    }

    console.log(
      sections
        .map((section) => {
          return section.title
            ? `${section.title}:\n${section.body}`
            : section.body
        })
        .join('\n\n')
    )
  }

  outputVersion() {
    const { name } = this.cli
    const { versionNumber } = this.cli.globalCommand
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`)
    }
  }

  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length

    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(
        `missing required args for command \`${this.rawName}\``
      )
    }
  }

  /**
   * Check if the parsed options contain any unknown options
   *
   * Exit and output error when true
   */
  checkUnknownOptions() {
    const { options, globalCommand } = this.cli

    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (
          name !== '--' &&
          !this.hasOption(name) &&
          !globalCommand.hasOption(name)
        ) {
          throw new CACError(
            `Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``
          )
        }
      }
    }
  }

  /**
   * Check if the required string-type options exist
   */
  checkOptionValue() {
    const { options: parsedOptions, globalCommand } = this.cli
    const options = [...globalCommand.options, ...this.options]
    for (const option of options) {
      const value = parsedOptions[option.name.split('.')[0]]
      // Check required option value
      if (option.required) {
        const hasNegated = options.some(
          (o) => o.negated && o.names.includes(option.name)
        )
        if (value === true || (value === false && !hasNegated)) {
          throw new CACError(`option \`${option.rawName}\` value is missing`)
        }
      }
    }
  }
}

class GlobalCommand extends Command {
  constructor(cli: CAC) {
    super('@@global@@', '', {}, cli)
  }
}

export type { HelpCallback, CommandExample, CommandConfig }

export { GlobalCommand }

export default Command
