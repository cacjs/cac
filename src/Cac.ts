import path from 'path'
import { EventEmitter } from 'events'
import chalk from 'chalk'
import minimost from 'minimost'
import JoyCon from 'joycon'
import Command, { ICommandOptions, CommandHandler } from './Command'
import Options, { IOptionsInput } from './Options'
import Help from './Help'
import examplesPlugin from './plugins/command-examples'
import optionChoicesPlugin from './plugins/option-choices'
import requiredOptionPlugin from './plugins/required-option'
import { textTable } from './utils'

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename]
let parentDir: string
if (module.parent && module.parent.filename) {
  parentDir = path.dirname(module.parent.filename)
} else {
  parentDir = process.cwd()
}

export interface ICacOptions {
  bin?: string
  pkg?: {
    [k: string]: any
  }
  defaultOpts?:
    | boolean
    | {
        help?: boolean
        version?: boolean
      }
}

export interface IExtraHelp {
  title: string
  body: string
}

export type Plugin = (ctx: Cac) => any

export interface ParseOpts {
  run?: boolean
  showHelp?: (
    command: Command | null,
    input: string[],
    flags: { [k: string]: any }
  ) => boolean
}

export type Flags = {
  [k: string]: any
}

declare interface Cac {
  on(
    event: 'parsed',
    listener: (command: Command | null, input: string[], flags: Flags) => void
  ): this
  on(
    event: 'executed',
    listener: (command: Command | null, input: string[], flags: Flags) => void
  ): this
  on(event: 'error', listener: (err: Error) => void): this
}

class Cac extends EventEmitter {
  /**
   * The  name of executed file
   *
   * For `node cli.js` it defaults to `cli.js`
   */
  bin: string
  /**
   * The data of the closest package.json
   */
  pkg: {
    [k: string]: any
  }
  /**
   * Extra help Messages
   */
  extraHelps: (IExtraHelp | string)[]
  /**
   * Add default `help` option
   */
  helpOpt: boolean
  /**
   * Add default `version` option
   */
  versionOpt: boolean
  commands: Command[]
  options: Options
  /**
   * The CLI has parsed once
   */
  started: boolean
  commandName: string
  matchedCommand: Command | null

  constructor({ bin, pkg, defaultOpts }: ICacOptions = {}) {
    super()
    defaultOpts = defaultOpts || true
    this.bin = bin || (process.argv[1] ? path.basename(process.argv[1]) : 'cli')
    this.commands = []
    this.options = new Options()
    this.extraHelps = []

    if (typeof defaultOpts === 'boolean') {
      this.helpOpt = defaultOpts
      this.versionOpt = defaultOpts
    } else if (typeof defaultOpts === 'object') {
      this.helpOpt = defaultOpts.help !== false
      this.versionOpt = defaultOpts.version !== false
    }

    this.pkg = Object.assign(
      {},
      pkg || new JoyCon({ files: ['package.json'], cwd: parentDir }).loadSync().data
    )

    if (this.versionOpt) {
      this.option('version', {
        desc: 'Display version',
        alias: 'v',
        type: 'boolean'
      })
    }
    if (this.helpOpt) {
      this.option('help', {
        desc: `Display help (You're already here)`,
        alias: 'h',
        type: 'boolean'
      })
    }

    this.use(examplesPlugin())
    this.use(optionChoicesPlugin())
    this.use(requiredOptionPlugin())
  }

  /**
   * Use a plugin or an array of plugins
   */
  use(plugin: Plugin | Plugin[]) {
    if (Array.isArray(plugin)) {
      plugin.forEach(p => this.use(p))
    } else if (typeof plugin === 'function') {
      plugin(this)
    } else {
      throw new TypeError('plugin has to be a function or an array of it.')
    }
    return this
  }

  /**
   * Add a global option
   */
  option(name: string, opt: IOptionsInput | string) {
    this.options.add(name, opt)
    return this
  }

  /**
   * Add a sub command
   */
  command(
    name: string,
    opt: ICommandOptions | string,
    handler?: CommandHandler
  ) {
    const command = new Command(name, opt, handler)
    this.commands.push(command)
    return command
  }

  /**
   * Commands to string
   *
   * Used to display help
   */
  commandsToString() {
    return textTable(
      this.commands.map(({ command }) => {
        return [
          command.names.map(v => chalk.magenta(v)).join(', '),
          chalk.dim(command.desc)
        ]
      })
    )
  }

  /**
   * Check if there's any command
   */
  isCommandsEmpty() {
    return this.commands.length === 0
  }

  /**
   * Find command by command name, alias or addtionalMatch
   */
  findCommand(name: string): { sliceFirstArg: boolean, command: Command | null } {
    // Try to find command by command name
    for (const command of this.commands) {
      const { names, match } = command.command
      if (names.includes(name)) {
        return { command, sliceFirstArg: Boolean(name && name !== '*') }
      }
      if (match && match(name)) {
        return { command, sliceFirstArg: false }
      }
    }
    return {
      command: name === '*' ? null : this.findCommand('*').command,
      sliceFirstArg: false
    }
  }

  get argv() {
    return this.parse(null, { run: false })
  }

  showHelp() {
    process.stdout.write(this.getHelp())
    return this
  }

  getHelp() {
    if (!this.started) {
      throw new Error(
        '[cac] You have to call .parse() first!'
      )
    }

    // Do not display `<command>` in help if it's a sub command
    // This matches a sub command
    const displayCommands = this.commandName === '*'
    const help = new Help(this, this.matchedCommand, {
      displayCommands
    })

    return help.getHelp()
  }

  /**
   * Show version in console
   */
  showVersion() {
    console.log(this.pkg.version)
  }

  /**
   * Add an extra help message
   */
  extraHelp(help: string | IExtraHelp) {
    this.extraHelps.push(help)
    return this
  }

  /**
   * Parse CLI argument and run commands
   * @param argv Default to `process.argv.slice(2)`
   * @param opts
   */
  parse(
    argv?: string[] | null,
    opts: ParseOpts = {}
  ): { input: string[]; flags: Flags } {
    const { run = true, showHelp } = opts
    this.started = true
    argv = argv || process.argv.slice(2)
    // Ensure that command name is not a flag
    if (argv[0] && !argv[0].startsWith('-')) {
      this.commandName = argv[0]
    } else {
      this.commandName = '*'
    }

    const { command, sliceFirstArg } = this.findCommand(this.commandName)
    this.matchedCommand = command

    let { input, flags } = minimost(argv, {
      boolean: [
        ...this.options.getOptionNamesByType('boolean'),
        ...(command ? command.options.getOptionNamesByType('boolean') : [])
      ],
      string: [
        ...this.options.getOptionNamesByType('string'),
        ...(command ? command.options.getOptionNamesByType('string') : [])
      ],
      default: {
        ...this.options.getDefaultsMapping(),
        ...(command ? command.options.getDefaultsMapping() : [])
      },
      alias: {
        ...this.options.getAliasMap(),
        ...(command ? command.options.getAliasMap() : {})
      }
    })

    input = sliceFirstArg ? input.slice(1) : input

    this.emit('parsed', command, input, flags)

    if (!run) {
      return { input, flags }
    }

    const shouldShowHelp =
      showHelp || (() => Boolean(this.helpOpt && flags.help))

    if (shouldShowHelp(command, input, flags)) {
      this.showHelp()
    } else if (this.versionOpt && flags.version) {
      this.showVersion()
    } else if (command && command.handler) {
      try {
        let res = command.handler(input, flags)
        if (res && res.then) {
          res.then(() => {
            this.emit('executed', command, input, flags);
          }).catch((err: Error) => this.handleError(err))
        } else {
          this.emit('executed', command, input, flags)
        }
      } catch (err) {
        this.handleError(err)
      }
    }

    return { input, flags }
  }

  handleError(err: Error) {
    if (this.listenerCount('error') === 0) {
      console.error(err.stack)
      process.exitCode = process.exitCode || 1
    } else {
      this.emit('error', err)
    }
  }
}

export default Cac
