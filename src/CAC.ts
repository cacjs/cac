import EventEmitter from 'events'
import mri from 'mri'
import Command, {
  GlobalCommand,
  CommandConfig,
  HelpCallback,
  CommandExample
} from './Command'
import { OptionConfig } from './Option'
import {
  getMriOptions,
  camelcase,
  setDotProp,
  setByType,
  getFileName
} from './utils'
import { processArgs } from './node'

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
  /** The program name to display in help and version message */
  name: string
  commands: Command[]
  globalCommand: GlobalCommand
  matchedCommand?: Command
  matchedCommandName?: string
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

  private showHelpOnExit: boolean
  private showVersionOnExit: boolean

  /**
   * @param name The program name to display in help and version message
   */
  constructor(name = '') {
    super()
    this.name = name
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
  command(rawName: string, description?: string, config?: CommandConfig) {
    const command = new Command(rawName, description || '', config, this)
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
    this.showHelpOnExit = true
    return this
  }

  /**
   * Show version number when `-v, --version` flags appear.
   *
   */
  version(version: string, customFlags = '-v, --version') {
    this.globalCommand.version(version, customFlags)
    this.showVersionOnExit = true
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
   * Output the corresponding help message
   * When a sub-command is matched, output the help message for the command
   * Otherwise output the global one.
   *
   * This will also call `process.exit(0)` to quit the process.
   */
  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp()
    } else {
      this.globalCommand.outputHelp()
    }
  }

  /**
   * Output the version number.
   *
   * This will also call `process.exit(0)` to quit the process.
   */
  outputVersion() {
    this.globalCommand.outputVersion()
  }

  private setParsedInfo(
    { args, options, rawOptions }: MriResult,
    matchedCommand?: Command,
    matchedCommandName?: string
  ) {
    this.args = args
    this.options = options
    this.rawOptions = rawOptions
    if (matchedCommand) {
      this.matchedCommand = matchedCommand
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName
    }
    return this
  }

  /**
   * Parse argv
   */
  parse(
    argv = processArgs,
    {
      /** Whether to run the action for matched command */
      run = true
    } = {}
  ): ParsedArgv {
    this.rawArgs = argv
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : 'cli'
    }

    let shouldParse = true

    // Search sub-commands
    for (const command of this.commands) {
      const mriResult = this.mri(argv.slice(2), command)

      const commandName = mriResult.args[0]
      if (command.isMatched(commandName)) {
        shouldParse = false
        const parsedInfo = {
          ...mriResult,
          args: mriResult.args.slice(1)
        }
        this.setParsedInfo(parsedInfo, command, commandName)
        this.emit(`command:${commandName}`, command)
      }
    }

    if (shouldParse) {
      // Search the default command
      for (const command of this.commands) {
        if (command.name === '') {
          shouldParse = false
          const mriResult = this.mri(argv.slice(2), command)
          this.setParsedInfo(mriResult, command)
          this.emit(`command:!`, command)
        }
      }
    }

    if (shouldParse) {
      const mriResult = this.mri(argv.slice(2))
      this.setParsedInfo(mriResult)
    }

    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp()
    }

    if (this.options.version && this.showVersionOnExit) {
      this.outputVersion()
    }

    const parsedArgv = { args: this.args, options: this.options }

    if (run) {
      this.runMatchedCommand()
    }

    if (!this.matchedCommand && this.args[0]) {
      this.emit('command:*')
    }

    return parsedArgv
  }

  private mri(
    argv: string[],
    /** Matched command */ command?: Command
  ): MriResult {
    // All added options
    const cliOptions = [
      ...this.globalCommand.options,
      ...(command ? command.options : [])
    ]
    const mriOptions = getMriOptions(cliOptions)

    // Extract everything after `--` since mri doesn't support it
    let argsAfterDoubleDashes: string[] = []
    const doubleDashesIndex = argv.indexOf('--')
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1)
      argv = argv.slice(0, doubleDashesIndex)
    }

    const parsed = mri(argv, mriOptions)

    const args = parsed._
    delete parsed._

    const options: { [k: string]: any } = {
      '--': argsAfterDoubleDashes
    }

    // Set option default value
    const ignoreDefault =
      command && command.config.ignoreOptionDefaultValue
        ? command.config.ignoreOptionDefaultValue
        : this.globalCommand.config.ignoreOptionDefaultValue

    let transforms = Object.create(null)

    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== undefined) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default
        }
      }

      // If options type is defined
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === undefined) {
          transforms[cliOption.name] = Object.create(null)

          transforms[cliOption.name]['shouldTransform'] = true
          transforms[cliOption.name]['transformFunction'] =
            cliOption.config.type[0]
        }
      }
    }

    // Camelcase option names and set dot nested option values
    for (const key of Object.keys(parsed)) {
      const keys = key.split('.').map((v, i) => {
        return i === 0 ? camelcase(v) : v
      })
      setDotProp(options, keys, parsed[key])
      setByType(options, transforms)
    }

    return {
      args,
      options,
      rawOptions: parsed
    }
  }

  runMatchedCommand() {
    const { args, options, matchedCommand: command } = this

    if (!command || !command.commandAction) return

    command.checkUnknownOptions()

    command.checkOptionValue()

    command.checkRequiredArgs()

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
