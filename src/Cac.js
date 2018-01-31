import path from 'path'
import EventEmitter from 'events'
import chalk from 'chalk'
import minimost from 'minimost'
import readPkg from 'read-pkg-up'
import Command from './Command'
import Options from './Options'
import Help from './Help'
import examplesPlugin from './plugins/command-examples'
import optionChoicesPlugin from './plugins/option-choices'
import requiredOptionPlugin from './plugins/required-option'
import { textTable, isExplictCommand } from './utils'

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename]
const parentDir = path.dirname(module.parent.filename)

export default class Cac extends EventEmitter {
  constructor({ bin, pkg } = {}) {
    super()
    this.bin = bin || path.basename(process.argv[1])
    this.commands = []
    this.options = new Options()
    this.extraHelps = []

    this.pkg = Object.assign(
      {},
      pkg || readPkg.sync({ cwd: parentDir, normalize: false }).pkg
    )

    this.option('version', {
      alias: 'v',
      type: 'boolean',
      desc: 'Display version'
    }).option('help', {
      alias: 'h',
      type: 'boolean',
      desc: `Display help (You're already here)`
    })

    this.use(examplesPlugin())
    this.use(optionChoicesPlugin())
    this.use(requiredOptionPlugin())
  }

  use(plugin) {
    if (Array.isArray(plugin)) {
      plugin.forEach(p => this.use(p))
    } else if (typeof plugin === 'function') {
      plugin(this)
    } else {
      throw new TypeError('plugin has to be a function or an array of it.')
    }
    return this
  }

  option(...args) {
    this.options.add(...args)
    return this
  }

  command(...args) {
    const command = new Command(...args)
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
  findCommand(name) {
    for (const command of this.commands) {
      const { names, match } = command.command
      if (names.includes(name)) {
        return { command, sliceFirstArg: name && name !== '*' }
      }
      if (match && match(name)) {
        return { command, sliceFirstArg: false }
      }
    }
    return null
  }

  getCommand(name) {
    return this.findCommand(name) || this.findCommand('*') || {}
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

    const displayCommands = !isExplictCommand(this.firstArg)
    const help = new Help(this, this.matchedCommand, {
      displayCommands
    })

    help.output()
    return this
  }

  showVersion() {
    console.log(this.pkg.version)
  }

  extraHelp(help) {
    this.extraHelps.push(help)
    return this
  }

  parse(argv, { run = true, showHelp } = {}) {
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

    const shouldShowHelp = showHelp || ((command, input, flags) => flags.help)

    if (shouldShowHelp(command, input, flags)) {
      this.showHelp()
    } else if (flags.version) {
      this.showVersion()
    } else if (command && command.handler) {
      try {
        let res = command.handler(input, flags)
        if (res && res.catch) {
          res = res.catch(err => this.handleError(err))
        }
        this.emit('executed', command, input, flags)
        return res
      } catch (err) {
        this.handleError(err)
      }
    }
  }

  handleError(err) {
    if (EventEmitter.listenerCount(this, 'error') === 0) {
      console.error(err.stack)
      process.exitCode = process.exitCode || 1
    } else {
      this.emit('error', err)
    }
  }
}
