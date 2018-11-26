import { EventEmitter } from 'events'
import path from 'path'
import minimost, { Opts as MinimostOpts } from 'minimost'
import Command, { HelpCallback, CommandExample } from './Command'
import { OptionConfig } from './Option'
import { getMinimostOptions } from './utils'

interface ParsedArgv {
  args: string[]
  options: {
    [k: string]: any
  }
}

const NAME_OF_GLOBAL_COMMAND = 'this-does-not-matter'

class CAC extends EventEmitter {
  bin: string
  commands: Command[]
  globalCommand: Command
  matchedCommand: Command
  /**
   * Raw CLI arguments
   */
  rawArgs: string[]
  /**
   * Parsed CLI arguments
   */
  args: string[]
  /**
   * Parsed CLI options
   */
  options: { [k: string]: any }

  constructor() {
    super()
    this.commands = []
    this.globalCommand = new Command(
      NAME_OF_GLOBAL_COMMAND,
      'The global command'
    )
    this.globalCommand.usage('<command> [options]')
  }

  usage(text: string) {
    this.globalCommand.usage(text)
    return this
  }

  command(rawName: string, description: string) {
    const command = new Command(rawName, description)
    this.commands.push(command)
    return command
  }

  option(rawName: string, description: string, config?: OptionConfig) {
    this.globalCommand.option(rawName, description, config)
    return this
  }

  help(callback?: HelpCallback) {
    this.globalCommand.option('-h, --help', 'Display this message')
    this.globalCommand.helpCallback = callback
    return this
  }

  version(version: string, customFlags = '-v, --version') {
    this.globalCommand.version(version, customFlags)
    return this
  }

  /**
   * Add a global example
   * @param example
   */
  example(example: CommandExample) {
    this.globalCommand.example(example)
    return this
  }

  outputHelp(subCommand?: boolean) {
    if (subCommand && this.matchedCommand) {
      this.matchedCommand.outputHelp({
        bin: this.bin,
        subCommands:
          this.matchedCommand.name === '' ? this.commands : undefined,
        versionNumber: this.globalCommand.versionNumber,
        globalOptions: this.globalCommand.options
      })
    } else {
      this.globalCommand.outputHelp({
        bin: this.bin,
        subCommands: this.commands
      })
    }
    return this
  }

  outputVersion() {
    this.globalCommand.outputVersion(this.bin)
    return this
  }

  parse(argv = process.argv): ParsedArgv {
    this.rawArgs = argv
    this.bin = argv[1] ? path.basename(argv[1]) : 'cli'

    for (const command of this.commands) {
      const minimostOptions = getMinimostOptions([
        ...this.globalCommand.options,
        ...command.options
      ])
      const parsed = this.minimost(argv.slice(2), minimostOptions)
      if (command.isMatched(parsed.args[0])) {
        this.matchedCommand = command
        this.args = parsed.args
        this.options = parsed.options
        this.emit(`command:${parsed.args[0]}`, command)
        this.runCommandAction(command, this.globalCommand, parsed)
        return parsed
      }
    }

    // Try the default command
    for (const command of this.commands) {
      if (command.name === '') {
        const minimostOptions = getMinimostOptions([
          ...this.globalCommand.options,
          ...command.options
        ])
        const parsed = this.minimost(argv.slice(2), minimostOptions)
        this.args = parsed.args
        this.options = parsed.options
        this.matchedCommand = command
        this.emit(`command:!`, command)
        this.runCommandAction(command, this.globalCommand, parsed)
        return parsed
      }
    }

    const globalMinimostOptions = getMinimostOptions(this.globalCommand.options)
    const parsed = this.minimost(argv.slice(2), globalMinimostOptions)
    this.args = parsed.args
    this.options = parsed.options

    if (parsed.options.help && this.globalCommand.hasOption('help')) {
      this.outputHelp()
      return parsed
    }

    if (
      parsed.options.version &&
      this.globalCommand.hasOption('version') &&
      this.globalCommand.versionNumber
    ) {
      this.outputVersion()
      return parsed
    }

    this.emit('command:*')

    return parsed
  }

  minimost(argv: string[], minimostOptions: MinimostOpts) {
    const { input: args, flags: options } = minimost(argv, minimostOptions)

    return {
      args,
      options
    }
  }

  runCommandAction(
    command: Command,
    globalCommand: Command,
    { args, options }: ParsedArgv
  ) {
    if (options.help && globalCommand.hasOption('help')) {
      return this.outputHelp(true)
    }

    if (options.version && globalCommand.hasOption('version')) {
      return this.outputVersion()
    }

    if (!command.commandAction) return

    if (command.checkUnknownOptions(options, globalCommand)) return

    // The first one is command name
    if (!command.isDefaultCommand) {
      args = args.slice(1)
    }

    const minimalArgsCount = command.args.filter(arg => arg.required).length

    if (args.length < minimalArgsCount) {
      console.error(
        `error: missing required args for command "${command.rawName}"`
      )
      process.exitCode = 1
      return
    }

    const actionArgs: any[] = []
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index))
      } else {
        actionArgs.push(args[index])
      }
    })
    actionArgs.push(options)
    return command.commandAction.apply(this, actionArgs)
  }
}

const cac = () => new CAC()

export = cac
