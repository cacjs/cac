import Option, { OptionConfig } from './Option'
import { removeBrackets, findAllBrackets, findLongest, padRight } from './utils'

interface CommandArg {
  required: boolean
  value: string
  variadic: boolean
}

interface HelpConfig {
  bin: string
  subCommands?: Command[]
  versionNumber?: string
  globalOptions?: Option[]
}

interface HelpSection {
  title?: string
  body: string
}

interface CommandConfig {
  allowUnknownOptions?: boolean
}

type HelpCallback = (sections: HelpSection[]) => void

type CommandExample = ((bin: string) => string) | string

export default class Command {
  options: Option[]
  aliasNames: string[]
  /* Parsed command name */
  name: string
  args: CommandArg[]
  commandAction?: (...args: any[]) => any
  usageText?: string
  versionNumber?: string
  examples: CommandExample[]
  config: CommandConfig
  helpCallback?: HelpCallback

  constructor(public rawName: string, public description: string) {
    this.options = []
    this.aliasNames = []
    this.name = removeBrackets(rawName)
    this.args = findAllBrackets(rawName)
    this.examples = []
    this.config = {}
  }

  usage(text: string) {
    this.usageText = text
    return this
  }

  allowUnknownOptions() {
    this.config.allowUnknownOptions = true
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

  /**
   * Check if an option is registered in this command
   * @param name Option name
   */
  hasOption(name: string) {
    return this.options.find(option => {
      return option.names.includes(name)
    })
  }

  outputHelp(config: HelpConfig) {
    const version = this.versionNumber || config.versionNumber

    const sections: HelpSection[] = [
      {
        body: `${config.bin}${version ? ` v${version}` : ''}`
      }
    ]

    sections.push({
      title: 'Usage',
      body: `  $ ${config.bin} ${this.usageText || this.rawName}`
    })

    if (config.subCommands && config.subCommands.length > 0) {
      const longestCommandName = findLongest(
        config.subCommands.map(command => command.rawName)
      )
      sections.push({
        title: 'Commands',
        body: config.subCommands
          .map(command => {
            return `  ${padRight(
              command.rawName,
              longestCommandName.length
            )}  ${command.description}`
          })
          .join('\n')
      })
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: config.subCommands
          .map(command => `  $ ${config.bin} ${command.name} --help`)
          .join('\n')
      })
    }

    const options = [...this.options, ...(config.globalOptions || [])]
    if (options.length > 0) {
      const longestOptionName = findLongest(
        options.map(option => option.rawName)
      )
      sections.push({
        title: 'Options',
        body: options
          .map(option => {
            return `  ${padRight(option.rawName, longestOptionName.length)}  ${
              option.description
            } ${
              option.config.default === undefined
                ? ''
                : `(default: ${option.config.default})`
            }`
          })
          .join('\n')
      })
    }

    if (this.examples.length > 0) {
      sections.push({
        title: 'Examples',
        body: this.examples
          .map(example => {
            if (typeof example === 'function') {
              return example(config.bin)
            }
            return example
          })
          .join('\n')
      })
    }

    if (this.helpCallback) {
      this.helpCallback(sections)
    }

    console.log(
      sections
        .map(section => {
          return section.title
            ? `${section.title}:\n${section.body}`
            : section.body
        })
        .join('\n\n')
    )
  }

  outputVersion(bin: string) {
    if (this.versionNumber) {
      console.log(
        `${bin}/${this.versionNumber} ${process.platform}-${
          process.arch
        } node-${process.version}`
      )
    }
    return this
  }

  checkUnknownOptions(options: { [k: string]: any }, globalCommand: Command) {
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (
          name !== '--' &&
          !this.hasOption(name) &&
          !globalCommand.hasOption(name)
        ) {
          console.error(
            `error: Unknown option \`${
              name.length > 1 ? `--${name}` : `-${name}`
            }\``
          )
          process.exitCode = 1
          return true
        }
      }
    }
    return false
  }
}

export { HelpCallback, CommandExample }
