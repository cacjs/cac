import chalk from 'chalk'
import redent from 'redent'

export default class Help {
  constructor(root, command, opts = {}) {
    this.root = root
    this.command = command
    this.opts = opts
  }

  getHelp() {
    let help = '\n'

    help += chalk.cyan(this.root.bin)

    if (this.root.pkg.version) {
      help += ` ${this.root.pkg.version}`
    }

    help += '\n\n'

    if (this.root.pkg.description) {
      help += `${chalk.dim.italic(this.root.pkg.description)}\n\n`
    }

    const commandText = this.command
      ? chalk.magenta(
          this.opts.displayCommands
            ? '<command> '
            : `${this.command.command.name} `
        )
      : ''
    help += `${chalk.bold('USAGE')}\n\n`
    help += redent(
      `${chalk.dim.italic(this.root.bin)} ${commandText}${chalk.yellow(
        '[options]'
      )}`,
      2
    )
    help += '\n\n'

    if (this.opts.displayCommands && !this.root.isCommandsEmpty()) {
      help += formatSection({
        title: 'COMMANDS',
        body: this.root.commandsToString()
      })
    }

    if (this.command && !this.command.options.isEmpty()) {
      help += formatSection({
        title: 'COMMAND OPTIONS',
        body: this.command.options.toString()
      })
    }

    if (!this.root.options.isEmpty()) {
      help += formatSection({
        title: 'GLOBAL OPTIONS',
        body: this.root.options.toString()
      })
    }

    for (const h of this.root.extraHelps) {
      help += formatSection(h)
    }

    return redent(help, 2)
  }

  output() {
    process.stdout.write(this.getHelp())
    return this
  }
}

function formatSection(sec) {
  if (typeof sec === 'string') {
    return sec
  }

  const { title, body } = sec
  return `${title ? `${chalk.bold(title)}\n\n` : ''}${redent(
    body.trim(),
    2
  )}\n\n`
}
