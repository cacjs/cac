# CAC [![NPM version](https://img.shields.io/npm/v/cac.svg)](https://npmjs.com/package/cac) [![NPM downloads](https://img.shields.io/npm/dm/cac.svg)](https://npmjs.com/package/cac) [![Build Status](https://img.shields.io/circleci/project/egoist/cac/master.svg)](https://circleci.com/gh/egoist/cac) [![Coveralls branch](https://img.shields.io/coveralls/egoist/cac/master.svg)](https://github.com/egoist/cac)

**C**ommand **A**nd **C**onquer, the queen living in your command line.

<img src="http://i.giphy.com/v3FeH4swox9mg.gif" width="400"/>

## Features

- [x] Simplified [commander.js](https://github.com/tj/commander.js)
- [x] Camelcased keys, eg `--disable-input` => `disableInput`
- [x] Automatically read `package.json`, parse package meta
- [x] Automatically print related data when `--version` and `--help`
- [x] Change `process.title` for you 
- [x] Support [co](https://github.com/tj/co) flow
- [x] Well tested

## Install

```bash
$ npm install --save cac
```

## Usage

Start your first CLI app in `example.js`:

```js
const cac = require('cac')
const fs = require('fs-promise')

const cli = cac(`
  Usage:
    node example.js create <filename> -m [content]
    
  Commands:
    c, create           Create a file with specific content
    
  Options:
    -m, --message       File content
    -h, --help          Print help (You are here!)
`, {
  alias: {
    m: message,
    h: help
  }
})

cli.command('c, create', function* () {
  const fileName = this.input[1]
  const content = this.flags.message
  yield fs.createFile(fileName, 'hello')
  console.log('Done!')
})

cli.command('*', function () {
  console.log('Everything else')
}}

// use .parse() to bootstrap the CLI
cli.parse()
```

All set! Just run:

```bash
$ node example.js create lol.txt -m "just lol 😂"
```

## API

### cac([help], [options])

#### help

Type: `string` `array`

The help info.

#### options

The [minimist](https://github.com/substack/minimist) options.

## License

MIT © [EGOIST](https://github.com/egoist)
