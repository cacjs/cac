import chalk from 'chalk'

export default class Help {
  constructor(root, command, opts = {}) {
    this.root = root
    this.command = command
    this.opts = opts
  }

  output() {
    let help = '\n'

    help += `${chalk.cyan(this.root.bin)} ${chalk.dim(this.root.pkg.version)}\n\n`

    const commandText = chalk.magenta(this.opts.displayCommands ? '<command> ' : `${this.command.command.name} `)
    help += `${chalk.bold('USAGE')}\n\n`
    help += `${chalk.dim.italic(this.root.bin)} ${commandText}${chalk.yellow('[options]')}`
    help += '\n\n'

    if (this.opts.displayCommands && !this.root.isCommandsEmpty()) {
      help += `${chalk.bold('COMMANDS')}\n\n`

      help += this.root.commandsToString()
      help += '\n\n'
    }

    if (this.command && !this.command.options.isEmpty()) {
      help += `${chalk.bold('COMMAND OPTIONS')}\n\n`

      help += this.command.options.toString()
      help += '\n\n'
    }

    if (!this.root.options.isEmpty()) {
      help += `${chalk.bold('GLOBAL OPTIONS')}\n\n`

      help += this.root.options.toString()
      help += '\n'
    }

    console.log(help)
  }
}
