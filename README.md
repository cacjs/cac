<img width="945" alt="2017-07-26 9 27 05" src="https://user-images.githubusercontent.com/8784712/28623641-373450f4-7249-11e7-854d-1b076dab274d.png">


[![NPM version](https://img.shields.io/npm/v/cac.svg?style=flat)](https://npmjs.com/package/cac) [![NPM downloads](https://img.shields.io/npm/dm/cac.svg?style=flat)](https://npmjs.com/package/cac) [![CircleCI](https://circleci.com/gh/cacjs/cac/tree/master.svg?style=shield)](https://circleci.com/gh/cacjs/cac/tree/master)  [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate) [![chat](https://img.shields.io/badge/chat-on%20discord-7289DA.svg?style=flat)](https://chat.egoist.moe)

## Introduction

**C**ommand **A**nd **C**onquer, the queen living in your command line, is a minimalistic but pluggable CLI framework.

## Install

```bash
yarn add cac
```

## Table of contents

<!-- toc -->

- [Usage](#usage)
- [Friends](#friends)
- [Documentation](#documentation)
  * [cli.option(name, [option])](#clioptionname-option)
  * [cli.command(name, [option], [handler])](#clicommandname-option-handler)
    + [command](#command)
      - [command.option(name, [option])](#commandoptionname-option)
  * [cli.parse([argv], [option])](#cliparseargv-option)
  * [cli.showHelp()](#clishowhelp)
  * [cli.use(plugin)](#cliuseplugin)
  * [cli.bin](#clibin)
  * [cli.argv](#cliargv)
  * [cli.extraHelp(help)](#cliextrahelphelp)
    + [help](#help)
  * [Events](#events)
    + [error](#error)
    + [parsed](#parsed)
    + [executed](#executed)
- [FAQ](#faq)
  * [Why not `commander.js` `yargs` `caporal.js` or `meow` ?](#why-not-commanderjs-yargs-caporaljs-or-meow-)
  * [How is the name written and pronounced?](#how-is-the-name-written-and-pronounced)
- [Contributing](#contributing)
- [Author](#author)

<!-- tocstop -->

## Usage

Use `./examples/simple.js` as example:

```js
const cac = require('cac')

const cli = cac()

// Add a default command
const defaultCommand = cli.command('*', {
  desc: 'The default command'
}, (input, flags) => {
  if (flags.age) {
    console.log(`${input[0]} is ${flags.age} years old`)
  }
})

defaultCommand.option('age', {
  desc: 'tell me the age'
})

// Add a sub command
cli.command('bob', {
  desc: 'Command for bob'
}, () => {
  console.log('This is a command dedicated to bob!')
})

// Bootstrap the CLI app
cli.parse()
```

Then run it:

<img width="303" alt="2017-07-26 2 29 46" src="https://i.loli.net/2017/07/26/5978a1a7c72f5.png">

And the **Help Documentation** is ready out of the box:

<img width="600" alt="2017-07-26 4 29 36" src="https://ooo.0o0.ooo/2017/07/26/5978a121886c4.png">

## Friends

Projects that use **CAC**:

- [SAO](https://github.com/egoist/sao): ⚔️ Futuristic scaffolding tool.
- [Poi](https://github.com/egoist/poi): ⚡️ Delightful web development.
- [bili](https://github.com/egoist/bili): 🥂 Schweizer Armeemesser for bundling JavaScript libraries.
- [lass](https://github.com/lassjs/lass): 💁🏻 Scaffold a modern package boilerplate for Node.js.
- Feel free to add yours here...

## Documentation

### cli.option(name, [option])

Register an option globally, i.e. for all commands

- name: `string` option name
- option: `object` `string`
  - desc: `string` description
  - alias: `string` `Array<string>` option name alias
  - type: `string` option type, valid values: `boolean` `string`
  - default: `any` option default value
  - required: `boolean` mark option as required
  - choices: `Array<any>` limit valid values for the option

### cli.command(name, [option], [handler])

- name: `string`
- option: `object` `string` (`string` is used as `desc`)
  - desc: `string` description
  - alias: `string` `Array<string>` command name alias
  - examples: `Array<string>` command examples
  - match: `(name: string) => boolean` A custom command matcher
- handler: `function` command handler
  - input: `Array<string>` cli arguments
  - flags: `object` cli flags

```js
const command = cli.command('init', 'init a new project', (input, flags) => {
  const folderName = input[0]
  console.log(`init project in folder ${folderName}`)
})
```

`cli.command` returns a [command](#command) instance.

#### command

##### command.option(name, [option])

Same as [cli.option](#clioptionname-option) but it adds options for specified command.

### cli.parse([argv], [option])

- argv: `Array<string>` Defaults to `process.argv.slice(2)`
- option
  - run: `boolean` Defaults to `true` Run command after parsed argv.

### cli.showHelp()

Display cli helps, must be called after `cli.parse()`

### cli.use(plugin)

- plugin: `Plugin` `Array<Plugin>`

Apply a plugin to cli instance:

```js
cli.use(plugin(options))

function plugin(options) {
  return cli => {
    // do something...
  }
}
```

### cli.bin

Type: `string`

The filename of executed file.

e.g. It's `cli.js` when you run `node ./cli.js`.

### cli.argv

A getter which simply returns `cli.parse(null, { run: false })`

### cli.extraHelp(help)

Add extra help messages to the bottom of help.

#### help

Type: `string` `object`

The `help` could be a `string` or in `{ title, body }` format.

### Events

#### error

Error handler for errors in your command handler:

```js
cli.on('error', err => {
  console.error('command failed:', err)
  process.exit(1)
})
```

#### parsed

Emit after CAC parsed cli arguments:

```js
cli.on('parsed', (command, input, flags) => {
  // command might be undefined
})
```

#### executed

Emit after CAC executed commands or outputed help / version number:

```js
cli.on('executed', (command, input, flags) => {
  // command might be undefined
})
```

## FAQ

### Why not `commander.js` `yargs` `caporal.js` or `meow` ?

`CAC` is simpler and less opinionated comparing to `commander.js` `yargs` `caporal.js`.

Commander.js does not support [chaining option](https://github.com/tj/commander.js/issues/606) which is a feature I like a lot. It's not really actively maintained at the time of writing either.

Yargs has a powerful API, but it's so massive that my brain trembles. Meow is simple and elegant but I have to manully construct the *help* message, which will be annoying. And I want it to support *sub-command* too.

And none of them are pluggable.

**So why creating a new thing instead of pull request?**

I would ask me myself why there's `preact` instead of PR to `react`, and why `yarn` instead of PR to `npm`? It's obvious.

**CAC** is kind of like a combination of the simplicity of Meow and the powerful features of the rest. And our *help* log is inspired by Caporal.js, I guess it might be the most elegant one out there?

<img alt="preview" src="https://i.loli.net/2017/07/26/59789ed2112f6.png" width="500">

### How is the name written and pronounced?

CAC, not Cac or cac, pronounced `C-A-C`.

And this project is dedicated to our lovely C.C. sama. Maybe CAC stands for C&C as well :P

<img src="http://i.giphy.com/v3FeH4swox9mg.gif" width="400"/>

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**cac** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/cacjs/cac/contributors)).

> [egoist.moe](https://egoist.moe) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
