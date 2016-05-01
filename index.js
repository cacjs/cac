'use strict'
const Path = require('path')
const co = require('co')
const isGeneratorFunction = require('is-generator-function')
const minimist = require('minimist')
const camelcaseKeys = require('camelcase-keys')
const readPkgUp = require('read-pkg-up')
const assign = require('deep-assign')

const parentDir = Path.dirname(module.parent.filename)

function formatArgv(argv) {
  const input = argv._
  delete argv._
  return {
    input,
    flags: camelcaseKeys(argv, {exclude: ['--']})
  }
}

function printWrap(pkg, text) {
  const header = pkg.description
    ? `\n  ${pkg.description}\n`
    : ''
  console.log(header + text)
}

const Cac = function (help, options) {
  if (!(this instanceof Cac)) {
    return new Cac(help, options)
  }
  this.commands = {
    help() {
      this.showHelp()
    },
    version() {
      console.log(this.pkg.version)
    }
  }
  this.rawCommands = ['help', 'version']
  this.help = help || ''
  this.options = options || {}
  this.pkg = readPkgUp.sync({
    cwd: parentDir,
    normalize: false
  }).pkg
}

const _ = Cac.prototype

_.command = function (name, fn) {
  name.split(',').forEach(val => {
    val = val.trim()
    this.commands[val] = fn
    this.rawCommands.push(val)
  })
}

_.parse = function (argv) {
  argv = argv || process.argv.slice(2)

  const options = assign({}, {
    alias: {
      v: 'version',
      h: 'help'
    }
  }, this.options)

  this.argv = formatArgv(minimist(argv, options))
  this.bootstrap()
}

_.bootstrap = function () {
  const title = this.pkg.bin
    ? Object.keys(this.pkg.bin)[0]
    : this.pkg.name
  process.title = title

  if (this.argv.flags.help) {
    this.showHelp()
    return
  }

  if (this.argv.flags.version && this.pkg.version) {
    console.log(this.pkg.version)
    return
  }

  const command = this.argv.input[0]
  if (this.rawCommands.indexOf(command) === -1) {
    this.runCommand(this.commands['*'])
  } else {
    this.runCommand(this.commands[command])
  }
}

_.runCommand = function (commandFn) {
  if (commandFn) {
    const context = {
      input: this.argv.input,
      flags: this.argv.flags,
      showHelp: this.showHelp.bind(this),
      rawCommands: this.rawCommands
    }
    if (isGeneratorFunction(commandFn)) {
      co(commandFn.bind(context)).catch(this.onError.bind(context))
    } else {
      commandFn.call(context)
    }
  }
}

_.showHelp = function () {
  if (this.help) {
    if (Array.isArray(this.help)) {
      printWrap.call(this.pkg, this.help.join('\n'))
    } else {
      printWrap(this.pkg, this.help)
    }
  }
}

_.onError = function (e) {
  console.log(e.stack || e.message || e.name)
}

module.exports = Cac
