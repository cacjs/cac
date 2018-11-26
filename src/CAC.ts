import { EventEmitter } from 'events'
import path from 'path'
import mri, { Options as MriOpts } from 'mri'
import Command, {
  GlobalCommand,
  CommandConfig,
  HelpCallback,
  CommandExample
} from './Command'
import { OptionConfig } from './Option'
import { getMriOptions, camelcase, setDotProp } from './utils'

interface ParsedArgv {
  args: ReadonlyArray<string>
  options: {
    [k: string]: any
  }
}

interface MriResult extends ParsedArgv {
  rawOptions: {
    [k: string]: any
  }
}

class CAC extends EventEmitter {
  bin: string
  commands: Command[]
  globalCommand: GlobalCommand
  matchedCommand: Command
  /**
   * Raw CLI arguments
   */
  rawArgs: string[]
  /**
   * Parsed CLI arguments
   */
  args: MriResult['args']
  /**
   * Parsed CLI options, camelCased
   */
  options: MriResult['options']
  /**
   * Raw CLI options, i.e. not camelcased
   */
  rawOptions: MriResult['rawOptions']

  constructor() {
    super()
    this.commands = []
    this.globalCommand = new GlobalCommand(this)
    this.globalCommand.usage('<command> [options]')
  }

  /**
   * Add a global usage text.
   *
   * This is not used by sub-commands.
   */
  usage(text: string) {
    this.globalCommand.usage(text)
    return this
  }

  /**
   * Add a sub-command
   */
  command(rawName: string, description: string, config?: CommandConfig) {
    const command = new Command(rawName, description, config, this)
    command.globalCommand = this.globalCommand
    this.commands.push(command)
    return command
  }

  /**
   * Add a global CLI option.
   *
   * Which is also applied to sub-commands.
   */
  option(rawName: string, description: string, config?: OptionConfig) {
    this.globalCommand.option(rawName, description, config)
    return this
  }

  /**
   * Show help message when `-h, --help` flags appear.
   *
   */
  help(callback?: HelpCallback) {
    this.globalCommand.option('-h, --help', 'Display this message')
    this.globalCommand.helpCallback = callback
    return this
  }

  /**
   * Show version number when `-v, --version` flags appear.
   *
   */
  version(version: string, customFlags = '-v, --version') {
    this.globalCommand.version(version, customFlags)
    return this
  }

  /**
   * Add a global example.
   *
   * This example added here will not be used by sub-commands.
   */
  example(example: CommandExample) {
    this.globalCommand.example(example)
    return this
  }

  /**
   * Output the global help message
   *
   * This will also call `process.exit(0)` to quit the process.
   */
  outputHelp() {
    this.globalCommand.outputHelp()
  }

  /**
   * Output the version number.
   *
   * This will also call `process.exit(0)` to quit the process.
   */
  outputVersion() {
    this.globalCommand.outputVersion()
  }

  setParsedInfo(
    { args, options, rawOptions }: MriResult,
    matchedCommand?: Command
  ) {
    this.args = args
    this.options = options
    this.rawOptions = rawOptions
    if (matchedCommand) {
      this.matchedCommand = matchedCommand
    }
    return this
  }

  /**
   * Parse argv and run command action if found.
   */
  parse(argv = process.argv): ParsedArgv {
    this.rawArgs = argv
    this.bin = argv[1] ? path.basename(argv[1]) : 'cli'

    let shouldParse = true

    // Search sub-commands
    for (const command of this.commands) {
      const mriOptions = getMriOptions(this.globalCommand, command)
      const mriResult = this.mri(argv.slice(2), mriOptions)

      const commandName = mriResult.args[0]
      if (command.isMatched(commandName)) {
        shouldParse = false
        const parsedInfo = {
          ...mriResult,
          args: mriResult.args.slice(1)
        }
        this.setParsedInfo(parsedInfo, command)
        this.emit(`command:${commandName}`, command)
      }
    }

    if (shouldParse) {
      // Search the default command
      for (const command of this.commands) {
        if (command.name === '') {
          shouldParse = false
          const mriOptions = getMriOptions(this.globalCommand, command)
          const mriResult = this.mri(argv.slice(2), mriOptions)
          this.setParsedInfo(mriResult, command)
          this.emit(`command:!`, command)
        }
      }
    }

    if (shouldParse) {
      const globalMriOptions = getMriOptions(this.globalCommand)
      const mriResult = this.mri(argv.slice(2), globalMriOptions)
      this.setParsedInfo(mriResult)
    }

    if (this.options.help && this.globalCommand.hasOption('help')) {
      this.outputHelp()
    }

    if (
      this.options.version &&
      this.globalCommand.hasOption('version') &&
      this.globalCommand.versionNumber
    ) {
      this.outputVersion()
    }

    const parsedArgv = { args: this.args, options: this.options }

    if (this.matchedCommand) {
      this.runCommandAction(this.matchedCommand, parsedArgv)
    } else {
      this.emit('command:*')
    }

    return parsedArgv
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
      rawOptions: parsed
    }
  }

  private runCommandAction(command: Command, { args, options }: ParsedArgv) {
    if (!command.commandAction) return

    command.checkUnknownOptions()

    command.checkRequiredOptions()

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

export default CAC
