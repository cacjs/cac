<img width="945" alt="2017-07-26 9 27 05" src="https://user-images.githubusercontent.com/8784712/28623641-373450f4-7249-11e7-854d-1b076dab274d.png">


[![NPM version](https://img.shields.io/npm/v/cac.svg?style=flat)](https://npmjs.com/package/cac) [![NPM downloads](https://img.shields.io/npm/dm/cac.svg?style=flat)](https://npmjs.com/package/cac) [![CircleCI](https://circleci.com/gh/egoist/cac/tree/master.svg?style=shield)](https://circleci.com/gh/egoist/cac/tree/master)  [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

**C**ommand **A**nd **C**onquer, the queen living in your command line.

## Install

```bash
yarn add cac
```

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

<img width="403" alt="2017-07-26 2 29 46" src="https://user-images.githubusercontent.com/8784712/28607539-f016218c-720e-11e7-8552-af88c183ad7f.png">

And the **Help Documentation** is ready out of the box:

<img width="854" alt="2017-07-26 4 29 36" src="https://user-images.githubusercontent.com/8784712/28611814-a8da742e-721f-11e7-8b52-17bda78809fe.png">

### No-command app

In many cases your app is small and doesn't even need a *command*:

```js
const cli = require('cac')()
// Use default command symbol '*'
cli.command('*', option, runMyApp)
cli.parse()
```

Instead of using a default command, you can skip adding and running command by:

```js
const cli = require('cac')()
// cli.argv is a getter
// bascially it's the return value of cli.parse(null, { run: false })
const { input, flags } = cli.argv

runMyApp(input, flags)
```

## Friends

Projects that use **CAC**:

- [SAO](https://github.com/egoist/sao): ⚔️ Futuristic scaffolding tool.
- [Poi](https://github.com/egoist/poi): ⚡️ Delightful web development.
- [bili](https://github.com/egoist/bili): 🥂 Schweizer Armeemesser for bundling JavaScript libraries.
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

### cli.command(name, [option], [handler])

- name: `string`
- option: `object` `string` (`string` is used as `desc`)
  - desc: `string` description
  - alias: `string` `Array<string>` command name alias
- handler: `function` command handler
  - input: `Array<string>` cli arguments
  - flags: `object` cli flags

```js
const command = cli.command('init', 'init a new project', (input, flags, logger) => {
  const folderName = input[0]
  console.log(`init project in folder ${folderName}`)
})
```

`cli.command` returns a [command](#command) instance.

#### command

##### command.option(name, [option])

Same as [cli.option](#clioptionname-option) but it adds options for specified command.

#### logger

The third argument of command `handler` is a `logger` object which is a [winston](https://github.com/winstonjs/winston) instance.

It's set to different level in different cases:

- when `--verbose`: it's set to `debug`
- when `--quiet`: it's set to `warn`
- by default it's `info`

### cli.parse([argv], [option])

- argv: `Array<string>` Defaults to `process.argv.slice(2)`
- option
  - run: `boolean` Defaults to `true` Run command after parsed argv.

### cli.showHelp()

Display cli helps, must be called after `cli.parse()`

### cli.argv

A getter which simply returns `cli.parse(null, { run: false })`

### Events

### error

Error handler for errors in your command handler:

```js
cli.on('error', (err, logger) => {
  logger.error('command failed:', err)
})
```

## FAQ

### How is the name written and pronounced?

CAC, not Cac or cac, [Pronounced `/kɑk/`](https://www.howtopronounce.com/cac/).

And this project is dedicated to our lovely C.C. sama.

<img src="http://i.giphy.com/v3FeH4swox9mg.gif" width="400"/>

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**cac** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/cac/contributors)).

> [egoist.moe](https://egoist.moe) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
