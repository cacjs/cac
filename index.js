'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var minimist = _interopDefault(require('minimist'));
var table = _interopDefault(require('text-table'));
var indent = _interopDefault(require('indent-string'));
var chalk = _interopDefault(require('chalk'));
var camelcase = _interopDefault(require('camelcase-keys'));
var readPkg = _interopDefault(require('read-pkg-up'));

delete require.cache[__filename]
var parentDir = path.dirname(module.parent.filename)

var prefixedOption = function (option, aliasOptions) {
  var options = [option]
  if (aliasOptions[option]) {
    options.push(aliasOptions[option])
  }
  return options
    .map(function (name) { return name.length > 1 ? ("--" + name) : ("-" + name); })
    .join(', ')
}

var showDefaultValue = function (value) {
  return (typeof value === 'undefined') ?
    '' :
    chalk.grey(("[default: " + value + "]"))
}

var parseNames = function (names) {
  if (names === '*') {
    return {name: '*'}
  }
  var splitNames = names
    .match(/([\w\.\-]+)\s*,?\s*([\w\.\-]*)/)
    .slice(1, 3)
  if (splitNames.length === 1) {
    return {
      name: splitNames[0]
    }
  }
  splitNames = splitNames.sort(function (a, b) { return b.length - a.length; })
  return {
    name: splitNames[0],
    alias: splitNames[1]
  }
}

var parseArgv = function (argv, options) {
  var result = {}
  var args = minimist(argv, options)
  var input = args._
  delete args._
  result.input = input
  result.flags = camelcase(args, {
    excludeKeys: ['--']
  })
  return result
}

var defaultOptions = {
  help: {
    description: 'Output usage information'
  },
  version: {
    description: 'Output version number'
  }
}

var CAC = function CAC() {
  var this$1 = this;

  if (!(this instanceof CAC)) {
    return new CAC()
  }
  this.commands = {}
  this.aliasCommands = {}
  this.defaultValues = {}
  this.options = defaultOptions
  this.aliasOptions = {}
  this.handleError = function (err) {
    throw err
  }
  this.pkg = readPkg.sync({
    cwd: parentDir
  }).pkg
  this.cliUsage = (chalk.yellow(this.pkg.name)) + " " + (chalk.grey('[options] [commands]'))
  this.examples = []

  this
    .addAliasOption('version', 'v')
    .addAliasOption('help', 'h')

  this
    .command('help', 'Display help', function () { return this$1.showHelp(); })
};

CAC.prototype.onError = function onError (fn) {
  this.handleError = fn
  return this
};

CAC.prototype.addAliasOption = function addAliasOption (long, short) {
  this.aliasOptions[long] = short
  return this
};

CAC.prototype.aliasCommand = function aliasCommand (long, short) {
  this.aliasCommands[long] = short
  if (long && short) {
    this.commands[short] = this.commands[long]
  }
};

CAC.prototype.option = function option (names, description, defaultValue) {
  var ref = parseNames(names);
    var name = ref.name;
    var alias = ref.alias;
  this.options[name] = {
    description: description,
    defaultValue: defaultValue
  }
  if (typeof defaultValue !== 'undefined') {
    this.defaultValues[name] = defaultValue
  }

  if (alias) {
    this.addAliasOption(name, alias)
  }

  return this
};

CAC.prototype.showHelp = function showHelp () {
    var this$1 = this;

  var optionsTable = table(Object.keys(this.options).map(function (option) { return [
    chalk.yellow(prefixedOption(option, this$1.aliasOptions)),
    chalk.grey(this$1.options[option].description),
    showDefaultValue(this$1.options[option].defaultValue)
  ]; }))

  var commandsTable = table(Object.keys(this.aliasCommands).map(function (command) {
    var alias = this$1.aliasCommands[command]
    return [
      chalk.yellow(("" + command + (alias ? (", " + alias) : ''))),
      chalk.grey(this$1.commands[command].description)
    ]
  }))

  var examples = this.examples.length > 0 ?
    ("\nExamples:\n\n" + (indent(this.examples.join('\n'), 2)) + "\n") :
    ''

  var help = (this.pkg.description ? ("\n" + (this.pkg.description) + "\n") : '') + "\nUsage: " + (this.cliUsage) + "\n" + examples + "\nCommands:\n\n" + (indent(commandsTable, 2)) + "\n\nOptions:\n\n" + (indent(optionsTable, 2)) + "\n"

  console.log(indent(help, 2))
  process.exit(0)
};

CAC.prototype.command = function command (names, description, fn) {
  var ref = parseNames(names);
    var name = ref.name;
    var alias = ref.alias;
  this.commands[name] = {
    description: description,
    fn: fn
  }
  this.aliasCommand(name, alias)

  return this
};

CAC.prototype.runCommand = function runCommand (command) {
  var commandFn = command && command.fn
  if (typeof commandFn === 'function') {
    var result
    try {
      result = commandFn(this.argv.input, this.argv.flags)
    } catch (err) {
      this.handleError(err)
    }
    if (result && result.then) {
      result.catch(this.handleError)
    }
  }

  return this
};

CAC.prototype.showVersion = function showVersion () {
  console.log(this.pkg.version)
  process.exit(0)
};

CAC.prototype.usage = function usage (text) {
  this.cliUsage = text
  return this
};

CAC.prototype.example = function example (text) {
  this.examples.push(text)
  return this
};

CAC.prototype.string = function string (value) {
  this.string = value
  return this
};

CAC.prototype.boolean = function boolean (value) {
  this.boolean = value
  return this
};

CAC.prototype.parse = function parse (argv) {
  argv = argv || process.argv.slice(2)
  this.argv = parseArgv(argv, {
    alias: this.aliasOptions,
    default: this.defaultValues,
    string: this.string,
    boolean: this.boolean
  })
  if (this.argv.flags.help) {
    this.showHelp()
  }
  if (this.argv.flags.version) {
    this.showVersion()
  }

  var command = this.commands[this.argv.input[0]]
  if (this.commands['*'] && !command) {
    command = this.commands['*']
  }
  this.runCommand(command)

  return this
};

module.exports = CAC;