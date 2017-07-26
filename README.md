# cac

[![NPM version](https://img.shields.io/npm/v/cac.svg?style=flat)](https://npmjs.com/package/cac) [![NPM downloads](https://img.shields.io/npm/dm/cac.svg?style=flat)](https://npmjs.com/package/cac) [![CircleCI](https://circleci.com/gh/egoist/cac/tree/master.svg?style=shield)](https://circleci.com/gh/egoist/cac/tree/master)  [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

**C**ommand **A**nd **C**onquer, the queen living in your command line.

<img src="http://i.giphy.com/v3FeH4swox9mg.gif" width="400"/>

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

<img width="847" alt="2017-07-26 4 26 41" src="https://user-images.githubusercontent.com/8784712/28611705-418e79e6-721f-11e7-9091-90a7a9570023.png">


## Documentations

### cli.option(name, [option])

Register an option globally, i.e. for all commands

- name: `string` option name
- option: `object` `string`
  - desc: `string` description
  - alias: `string` `Array<string>` option name alias
  - type: `string` option type, valid values: `boolean` `number`
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

Same as [cli.option](clioptionnameoption) but it adds options for specified command.

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
