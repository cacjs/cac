# cac [![NPM version](https://img.shields.io/npm/v/cac.svg)](https://npmjs.com/package/cac) [![NPM downloads](https://img.shields.io/npm/dm/cac.svg)](https://npmjs.com/package/cac) [![Build Status](https://img.shields.io/circleci/project/egoist/cac/master.svg)](https://circleci.com/gh/egoist/cac)

**C**ommand **A**nd **C**onquer, the queen living in your command line.

<img src="http://i.giphy.com/v3FeH4swox9mg.gif" width="400"/>

## Install

```bash
$ npm install --save cac
```

## Usage

```js
const cac = require('cac')

// initialize your cli program
const cli = cac()

// add your very first command
cli.command('hi', 'Say hi!', (input) => {
  console.log(`hi ${input[1] || 'boy'}!`)
})

// parse arguments and bootstrap
cli.parse()
```

<img src="http://ww4.sinaimg.cn/large/a15b4afegw1f79ix3vc2uj20p00akjsj.jpg" width="400" />

### Default commands and options

- Options: `--help` `-h` `--version` `-v`
- Commands: `help`

<img src="http://ww4.sinaimg.cn/large/a15b4afegw1f79k0eifspj20ug0g0mz3.jpg" width="400" />
 
## API

## .option(options, description, defaultValue)

- **options**: `string`, it could be `option` or `option, alias` or `alias, option`, the order does not matter. eg: `.option('install, i')`
- **description**: `string`, option description, will be used to output cli usage
- **defaultValue**: `any`, give a default value to this option

## .command(commands, description, fn)

- **commands**: `string`, it could be `command` or `command, alias` or `alias, command`, the order does not matter. eg: `.command('clone, c')`
- **description**: `string`, command description, will be used to output cli usage
- **fn**: `function`, command function, will be triggered when this command matches user's input

## .parse(argv)

- **argv**: `array`, default is `process.argv.slice(2)`

## .onError(handleError)

- **handleError**: `function`, triggered when your program throws an error or was rejected by a Promise call.

## License

MIT © [egoist](https://github.com/egoist)
