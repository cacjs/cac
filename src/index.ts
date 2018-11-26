import { EventEmitter } from 'events'
import path from 'path'
import minimist, { Opts as MinimistOpts } from 'minimist'
import Command, { HelpCallback, CommandExample } from './Command'
import { OptionConfig } from './Option'
import { getMinimistOptions, camelcase } from './utils'

interface ParsedArgv {
  args: string[]
  options: {
    [k: string]: any
  }
}

interface MinimistResult extends ParsedArgv {
  args: string[]
  options: {
    [k: string]: any
  }
  originalOptions: {
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
   * Parsed CLI options, camelCased
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

    // Search sub-commands
    for (const command of this.commands) {
      const minimistOptions = getMinimistOptions([
        ...this.globalCommand.options,
        ...command.options
      ])
      const { args, options, originalOptions } = this.minimist(
        argv.slice(2),
        minimistOptions
      )
      const commandName = args[0]
      if (command.isMatched(commandName)) {
        this.matchedCommand = command
        this.args = args.slice(1)
        this.options = options
        this.emit(`command:${commandName}`, command)
        this.runCommandAction(command, this.globalCommand, {
          args: this.args,
          options,
          originalOptions
        })
        return { args: this.args, options }
      }
    }

    // Search the default command
    for (const command of this.commands) {
      if (command.name === '') {
        const minimistOptions = getMinimistOptions([
          ...this.globalCommand.options,
          ...command.options
        ])
        const { args, options, originalOptions } = this.minimist(
          argv.slice(2),
          minimistOptions
        )
        this.matchedCommand = command
        this.args = args
        this.options = options
        this.emit(`command:!`, command)
        this.runCommandAction(command, this.globalCommand, {
          args,
          options,
          originalOptions
        })
        return { args, options }
      }
    }

    const globalMinimistOptions = getMinimistOptions(this.globalCommand.options)
    const { args, options } = this.minimist(
      argv.slice(2),
      globalMinimistOptions
    )
    this.args = args
    this.options = options

    if (options.help && this.globalCommand.hasOption('help')) {
      this.outputHelp()
    }

    if (
      options.version &&
      this.globalCommand.hasOption('version') &&
      this.globalCommand.versionNumber
    ) {
      this.outputVersion()
    }

    this.emit('command:*')

    return { args, options }
  }

  private minimist(
    argv: string[],
    minimistOptions: MinimistOpts
  ): MinimistResult {
    const parsed = minimist(
      argv,
      Object.assign(
        {
          '--': true
        },
        minimistOptions
      )
    )

    const args = parsed._
    delete parsed._

    const options: { [k: string]: any } = {}
    for (const key of Object.keys(parsed)) {
      options[camelcase(key)] = parsed[key]
    }

    return {
      args,
      options,
      originalOptions: parsed
    }
  }

  private runCommandAction(
    command: Command,
    globalCommand: Command,
    { args, options, originalOptions }: MinimistResult
  ) {
    if (options.help && globalCommand.hasOption('help')) {
      return this.outputHelp(true)
    }

    if (options.version && globalCommand.hasOption('version')) {
      return this.outputVersion()
    }

    if (!command.commandAction) return

    command.checkUnknownOptions(originalOptions, globalCommand)

    const minimalArgsCount = command.args.filter(arg => arg.required).length

    if (args.length < minimalArgsCount) {
      console.error(
        `error: missing required args for command \`${command.rawName}\``
      )
      process.exit(1)
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
