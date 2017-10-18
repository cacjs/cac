import chalk from 'chalk'
import redent from 'redent'

export default class Help {
  constructor(root, command, opts = {}) {
    this.root = root
    this.command = command
    this.opts = opts
  }

  output() {
    let help = '\n'

    help += chalk.cyan(this.root.bin)

    if (this.root.pkg.version) {
      help += ` ${this.root.pkg.version}`
    }

    help += '\n\n'

    if (this.root.pkg.description) {
      help += `${chalk.dim.italic(this.root.pkg.description)}\n\n`
    }

    const commandText = chalk.magenta(
      this.opts.displayCommands ? '<command> ' : `${this.command.command.name} `
    )
    help += `${chalk.bold('USAGE')}\n\n`
    help += redent(
      `${chalk.dim.italic(this.root.bin)} ${commandText}${chalk.yellow(
        '[options]'
      )}`,
      2
    )
    help += '\n\n'

    if (this.opts.displayCommands && !this.root.isCommandsEmpty()) {
      help += `${chalk.bold('COMMANDS')}\n\n`

      help += redent(this.root.commandsToString(), 2)
      help += '\n\n'
    }

    if (this.command && !this.command.options.isEmpty()) {
      help += `${chalk.bold('COMMAND OPTIONS')}\n\n`

      help += redent(this.command.options.toString(), 2)
      help += '\n\n'
    }

    if (!this.root.options.isEmpty()) {
      help += `${chalk.bold('GLOBAL OPTIONS')}\n\n`

      help += redent(this.root.options.toString(), 2)
      help += '\n'
    }

    console.log(redent(help, 2))
  }
}
