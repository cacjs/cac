import { EventEmitter } from 'events'
import path from 'path'
import mri, { Options as MriOpts } from 'mri'
import Command, { CommandConfig, HelpCallback, CommandExample } from './Command'
import { OptionConfig } from './Option'
import { getMriOptions, camelcase, setDotProp } from './utils'

interface ParsedArgv {
  args: ReadonlyArray<string>
  options: {
    [k: string]: any
  }
}

interface MriResult extends ParsedArgv {
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
  args: ReadonlyArray<string>
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

  command(rawName: string, description: string, config?: CommandConfig) {
    const command = new Command(rawName, description, config)
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
      const mriOptions = getMriOptions(this.globalCommand, command)
      const { args, options, originalOptions } = this.mri(
        argv.slice(2),
        mriOptions
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
        const mriOptions = getMriOptions(this.globalCommand, command)
        const { args, options, originalOptions } = this.mri(
          argv.slice(2),
          mriOptions
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

    const globalMriOptions = getMriOptions(this.globalCommand)
    const { args, options } = this.mri(argv.slice(2), globalMriOptions)
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

  private mri(argv: string[], mriOptions: MriOpts): MriResult {
    let argsAfterDoubleDashes: string[] = []
    const doubleDashesIndex = argv.indexOf('--')
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(0, doubleDashesIndex)
      argv = argv.slice(doubleDashesIndex + 1)
    }
    const parsed = mri(argv, mriOptions)

    const args = parsed._
    delete parsed._

    const options: { [k: string]: any } = {
      '--': argsAfterDoubleDashes
    }
    for (const key of Object.keys(parsed)) {
      const keys = key.split('.').map((v, i) => {
        return i === 0 ? camelcase(v) : v
      })
      setDotProp(options, keys, parsed[key])
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
    { args, options, originalOptions }: MriResult
  ) {
    if (options.help && globalCommand.hasOption('help')) {
      return this.outputHelp(true)
    }

    if (options.version && globalCommand.hasOption('version')) {
      return this.outputVersion()
    }

    if (!command.commandAction) return

    command.checkUnknownOptions(originalOptions, globalCommand)

    command.checkRequiredOptions(originalOptions, globalCommand)

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
