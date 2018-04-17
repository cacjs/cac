import path from 'path'
import EventEmitter from 'events'
import chalk from 'chalk'
import minimost from 'minimost'
import readPkg from 'read-pkg-up'
import Command, {
  IOption as CommandOption,
  Handler as CommandHandler
} from './Command'
import Options from './Options'
import Help from './Help'
import examplesPlugin from './plugins/command-examples'
import optionChoicesPlugin from './plugins/option-choices'
import requiredOptionPlugin from './plugins/required-option'
import { textTable, isExplictCommand } from './utils'

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename]
let parentDir: string
if (module.parent) {
  parentDir = path.dirname(module.parent.filename)
} else {
  parentDir = process.cwd()
}

export interface IOptions {
  bin?: string
  pkg?: {
    [k: string]: any
  }
  defaultOpts?: boolean | {
    help?: boolean,
    version?: boolean
  }
}

export interface IExtraHelp {
  title: string,
  body: string
}

export type Plugin = (ctx: Cac) => any

export interface ParseOpt {
  run?: boolean
  showHelp?(
    command: Command | null,
    input: string[],
    flags: { [k: string]: any }
  ): boolean
}

export type Flags = {
  [k: string]: any
}

declare interface Cac {
  on(event: 'parsed', listener: (command: Command | null, input: string[], flags: Flags) => void): this
  on(event: 'executed', listener: (command: Command | null, input: string[], flags: Flags) => void): this
  on(event: 'error', listener: (err: Error) => void): this
}

class Cac extends EventEmitter {
  bin: string
  pkg: {
    [k: string]: any
  }
  extraHelps: (IExtraHelp | string)[]
  helpOpt: boolean
  versionOpt: boolean
  commands: Command[]
  options: Options
  option: Options['add']
  started: boolean
  firstArg: string | null
  matchedCommand: Command | null

  constructor({ bin, pkg, defaultOpts }: IOptions = {}) {
    super()
    defaultOpts = defaultOpts || true
    this.bin = bin || path.basename(process.argv[1])
    this.commands = []
    this.options = new Options()
    this.option = this.options.add.bind(this.options)
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
      pkg || readPkg.sync({ cwd: parentDir, normalize: false }).pkg
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

  command(
    name: string,
    opt: CommandOption | string,
    handler: CommandHandler
  ) {
    const command = new Command(name, opt, handler)
    this.commands.push(command)
    return command
  }

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

  isCommandsEmpty() {
    return this.commands.length === 0
  }

  /**
   * Find command by command name, alias or addtionalMatch
   */
  findCommand(name: string) {
    for (const command of this.commands) {
      const { names, match } = command.command
      if (names.includes(name)) {
        return { command, sliceFirstArg: Boolean(name && name !== '*') }
      }
      if (match && match(name)) {
        return { command, sliceFirstArg: false }
      }
    }
    return null
  }

  getCommand(
    name: string | null
  ): { command: Command | null; sliceFirstArg: boolean } {
    return (
      (name ? this.findCommand(name) : this.findCommand('*')) || {
        command: null,
        sliceFirstArg: false
      }
    )
  }

  get argv() {
    return this.parse(null, { run: false })
  }

  showHelp() {
    if (!this.started) {
      throw new Error(
        '[cac] You have to call .parse() before running .showHelp()'
      )
    }

    // Do not display `<command>` in help if it's a sub command
    const displayCommands = !// This matches a sub command
    (this.matchedCommand && isExplictCommand(this.firstArg))
    const help = new Help(this, this.matchedCommand, {
      displayCommands
    })

    help.output()
    return this
  }

  showVersion() {
    console.log(this.pkg.version)
  }

  extraHelp(help: string | IExtraHelp) {
    this.extraHelps.push(help)
    return this
  }

  parse(argv?: string[] | null, opt: ParseOpt = {}) {
    const { run = true, showHelp } = opt
    this.started = true
    argv = argv || process.argv.slice(2)
    this.firstArg = argv[0] || ''
    // Ensure that first arg is not a flag
    this.firstArg = this.firstArg.startsWith('-') ? null : this.firstArg
    const { command, sliceFirstArg } = this.getCommand(this.firstArg)
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
        if (res && res.catch) {
          res = res.catch((err: Error) => this.handleError(err))
        }
        this.emit('executed', command, input, flags)
        return res
      } catch (err) {
        this.handleError(err)
      }
    }
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
