import path from 'path'
import EventEmitter from 'events'
import chalk from 'chalk'
import minimost from 'minimost'
import readPkg from 'read-pkg-up'
import Command from './Command'
import Options from './Options'
import Help from './Help'
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

    this.pkg = Object.assign(
      {},
      pkg || readPkg.sync({ cwd: parentDir, normalize: false }).pkg
    )

    this.option('version', {
      alias: 'v',
      type: Boolean,
      desc: 'Display version'
    })
      .option('help', {
        alias: 'h',
        type: Boolean,
        desc: `Display help (You're already here)`
      })
      .option('quiet', {
        type: Boolean,
        desc: 'Quiet mode - only display warn and error messages'
      })
      .option('verbose', {
        alias: 'V',
        type: Boolean,
        desc: 'Verbose mode - will always output debug messages'
      })
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

  findCommandByNameOrAlias(name) {
    return this.commands.filter(({ command }) => {
      return command.names.indexOf(name) > -1
    })[0]
  }

  getCommand(name) {
    // No command name, use default command
    if (!isExplictCommand(name)) {
      return {
        command: this.findCommandByNameOrAlias('*'),
        sliceFirstArg: false
      }
    }

    const command = this.findCommandByNameOrAlias(name)

    // Found sub command
    if (command) {
      return {
        command,
        sliceFirstArg: true
      }
    }

    // Fallback to default command
    return {
      command: this.findCommandByNameOrAlias('*'),
      sliceFirstArg: false
    }
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

  parse(argv, { run = true } = {}) {
    this.started = true
    argv = argv || process.argv.slice(2)
    this.firstArg = argv[0]
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

    if (!run) {
      return { input, flags }
    }

    if (flags.help) {
      this.showHelp()
    } else if (flags.version) {
      this.showVersion()
    } else if (command && command.handler) {
      const winston = require('winston')

      const logger = new winston.Logger({
        level: flags.verbose ? 'debug' : flags.quiet ? 'warn' : 'info',
        transports: [
          new winston.transports.Console({
            handleExceptions: true
          })
        ]
      })

      try {
        const res = command.handler(input, flags, logger)
        if (res && res.catch) {
          res.catch(err => this.handleError(err, logger))
        }
      } catch (err) {
        this.handleError(err, logger)
      }
    }
  }

  handleError(err, logger) {
    process.exitCode = process.exitCode || 1
    if (EventEmitter.listenerCount(this, 'error') === 0) {
      logger.error(err)
    } else {
      this.emit('error', err, logger)
    }
  }
}
