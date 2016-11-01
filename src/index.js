import path from 'path'
import minimist from 'minimist'
import table from 'text-table'
import indent from 'indent-string'
import chalk from 'chalk'
import camelcase from 'camelcase-keys'
import readPkg from 'read-pkg-up'
import suffix from 'suffix'

delete require.cache[__filename]
const parentFile = module.parent.filename
const parentDir = path.dirname(parentFile)

const prefixedOption = (option, aliasOptions) => {
  const options = [option]
  if (aliasOptions[option]) {
    options.push(aliasOptions[option])
  }
  return options
    .map(name => name.length > 1 ? `--${name}` : `-${name}`)
    .join(', ')
}

const showDefaultValue = value => {
  return (typeof value === 'undefined') ?
    '' :
    chalk.grey(`[default: ${value}]`)
}

const parseNames = names => {
  if (names === '*') {
    return {name: '*'}
  }
  let splitNames = names
    .match(/([\w\.\-]+)\s*,?\s*([\w\.\-]*)/)
    .slice(1, 3)
  if (splitNames.length === 1) {
    return {
      name: splitNames[0]
    }
  }
  splitNames = splitNames.sort((a, b) => b.length - a.length)
  return {
    name: splitNames[0],
    alias: splitNames[1]
  }
}

const parseArgv = (argv, options) => {
  const result = {}
  const args = minimist(argv, options)
  const input = args._
  delete args._
  result.input = input
  result.flags = camelcase(args, {
    excludeKeys: ['--']
  })
  return result
}

const defaultOptions = {
  help: {
    name: 'help',
    alias: 'h',
    description: 'Output usage information'
  },
  version: {
    name: 'version',
    alias: 'v',
    description: 'Output version number'
  }
}

class CAC {
  constructor() {
    if (!(this instanceof CAC)) {
      return new CAC()
    }
    this.commands = {}
    this.aliasCommands = {}
    this.defaultValues = {}
    this.options = defaultOptions
    this.aliasOptions = {}
    this.handleError = err => {
      throw err
    }
    this.pkg = readPkg.sync({
      cwd: parentDir
    }).pkg
    this.cliUsage = `${chalk.yellow(this.pkg.name)} ${chalk.grey('[options] [commands]')}`
    this.examples = []

    this
      .addAliasOption('version', 'v')
      .addAliasOption('help', 'h')

    this
      .command('help', 'Display help', () => this.showHelp())
  }

  onError(fn) {
    this.handleError = fn
    return this
  }

  addAliasOption(long, short) {
    this.aliasOptions[long] = short
    return this
  }

  aliasCommand(long, short) {
    this.aliasCommands[long] = short
    if (long && short) {
      this.commands[short] = this.commands[long]
    }
  }

  option(names, description, defaultValue) {
    const {name, alias} = parseNames(names)
    this.options[name] = {
      name,
      alias,
      description,
      defaultValue
    }
    if (typeof defaultValue !== 'undefined') {
      this.defaultValues[name] = defaultValue
    }

    if (alias) {
      this.addAliasOption(name, alias)
    }

    return this
  }

  showHelp() {
    const optionsTable = table(Object.keys(this.options).map(option => [
      chalk.yellow(prefixedOption(option, this.aliasOptions)),
      chalk.grey(this.options[option].description),
      showDefaultValue(this.options[option].defaultValue)
    ]))

    const commandsTable = table(Object.keys(this.aliasCommands).map(command => {
      const alias = this.aliasCommands[command]
      return [
        chalk.yellow(`${command}${alias ? `, ${alias}` : ''}`),
        chalk.grey(this.commands[command].description)
      ]
    }))

    const examples = this.examples.length > 0 ?
      `\nExamples:\n\n${indent(this.examples.join('\n'), 2)}\n` :
      ''

    let help = `${this.pkg.description ? `\n${this.pkg.description}\n` : ''}
Usage: ${this.cliUsage}
${examples}
Commands:

${indent(commandsTable, 2)}

Options:

${indent(optionsTable, 2)}
`

    console.log(indent(help, 2))
    process.exit(0)
  }

  command(...args) {
    // first arg is always the command
    const names = args[0]
    // second arg can be description or command function
    let description = ''
    let commandFn
    if (typeof args[1] === 'string') {
      description = args[1]
      commandFn = args[2]
    } else if (typeof args[1] === 'function') {
      commandFn = args[1]
    }

    // read name and alias from the command
    // eg: i, init => name: ini, alias: i
    const {name, alias} = parseNames(names)

    this.commands[name] = {
      name,
      alias,
      description,
      fn: commandFn
    }
    this.aliasCommand(name, alias)

    return this
  }

  runCommand(command) {
    if (!command) return

    let commandFn = command && command.fn

    if (!commandFn) {
      // when commandFn is undefined
      // load it from the directory of executable file
      const commandName = command.name === '*' ? 'default' : command.name
      const binName = suffix(path.basename(parentFile), `-${commandName}`)
      const subCommand = path.join(parentDir, binName)
      try {
        commandFn = require(subCommand)
      } catch (err) {
        console.error('\n  %s(1) does not exist, try --help\n', binName)
        throw err
      }
    }

    let result
    try {
      const input = command.name === '*' ? this.argv.input : this.argv.input.slice(1)
      result = commandFn(input, this.argv.flags)
    } catch (err) {
      this.handleError(err)
    }
    if (result && result.then) {
      result.catch(this.handleError)
    }

    return this
  }

  showVersion() {
    console.log(this.pkg.version)
    process.exit(0)
  }

  usage(text) {
    this.cliUsage = text
    return this
  }

  example(text) {
    this.examples.push(text)
    return this
  }

  string(value) {
    this.string = value
    return this
  }

  boolean(value) {
    this.booleanOptions = value
    return this
  }

  parse(argv) {
    argv = argv || process.argv.slice(2)
    this.argv = parseArgv(argv, {
      alias: this.aliasOptions,
      default: this.defaultValues,
      string: this.string,
      boolean: this.booleanOptions
    })
    if (this.argv.flags.help) {
      this.showHelp()
    }
    if (this.argv.flags.version) {
      this.showVersion()
    }

    let command = this.commands[this.argv.input[0]]
    if (this.commands['*'] && !command) {
      command = this.commands['*']
    }
    this.runCommand(command)

    return this
  }
}

export default CAC
