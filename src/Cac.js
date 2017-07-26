import path from 'path'
import chalk from 'chalk'
import minimost from 'minimost'
import readPkg from 'read-pkg-up'
import Command from './Command'
import Options from './Options'
import Help from './Help'
import { textTable, isExplictCommand } from './utils'

export default class Cac {
  constructor({ bin, pkg } = {}) {
    this.bin = bin || path.basename(process.argv[1])
    this.commands = []
    this.options = new Options()
    this.pkg = Object.assign(
      {},
      pkg || readPkg.sync({ cwd: path.join(__dirname, '..') }).pkg
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

  parse(argv = process.argv.slice(2)) {
    const firstArg = argv[0]
    const { command, sliceFirstArg } = this.getCommand(firstArg)

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

    if (flags.help) {
      const displayCommands = !isExplictCommand(firstArg)
      const help = new Help(this, command, {
        displayCommands
      })
      help.output()
    } else if (command && command.handler) {
      input = sliceFirstArg ? input.slice(1) : input

      const winston = require('winston')

      const logger = new winston.Logger({
        level: flags.verbose ? 'debug' : flags.quiet ? 'warn' : 'info'
      })

      command.handler(input, flags, logger)
    }
  }
}
