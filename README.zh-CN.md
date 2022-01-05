<img width="945" alt="2017-07-26 9 27 05" src="https://user-images.githubusercontent.com/8784712/28623641-373450f4-7249-11e7-854d-1b076dab274d.png">

[![NPM version](https://img.shields.io/npm/v/cac.svg?style=flat)](https://npmjs.com/package/cac) [![NPM downloads](https://img.shields.io/npm/dm/cac.svg?style=flat)](https://npmjs.com/package/cac) [![CircleCI](https://circleci.com/gh/cacjs/cac/tree/master.svg?style=shield)](https://circleci.com/gh/cacjs/cac/tree/master) [![Codecov](https://badgen.net/codecov/c/github/cacjs/cac/master)](https://codecov.io/gh/cacjs/cac) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate) [![chat](https://img.shields.io/badge/chat-on%20discord-7289DA.svg?style=flat)](https://chat.egoist.moe) [![install size](https://badgen.net/packagephobia/install/cac)](https://packagephobia.now.sh/result?p=cac)

## 介绍

CAC 是一个 JavaScript 库，用于构建 CLI 应用。

## 特征

- **超轻量级**：无依赖，只有一个文件。
- **易于学习**：你需要学习 4 个 API，即可构建简单的 CLI，包括：`cli.option`、`cli.version`、`cli.help`、`cli.parse`。
- **且如此强大**：启用默认命令、类似 git 子命令、验证必填参数和选项、可变参数、点嵌套选项、自动生成帮助消息等功能。
- **开发人员友好**：使用 TypeScript 开发。

## 目录

<!-- toc -->

- [介绍](#介绍)
- [特征](#特征)
- [目录](#目录)
- [安装](#安装)
- [用法](#用法)
  - [快速上手 - 简单解析](#快速上手---简单解析)
  - [显示帮助消息和版本号](#显示帮助消息和版本号)
  - [命令的特定选项](#命令的特定选项)
  - [选项名称中的破折号](#选项名称中的破折号)
  - [括号](#括号)
  - [无效选项](#无效选项)
  - [可变参数](#可变参数)
  - [点嵌套选项](#点嵌套选项)
  - [默认命令](#默认命令)
  - [提供一个数组作为选项值](#提供一个数组作为选项值)
  - [错误处理](#错误处理)
  - [使用 TypeScript](#使用-typescript)
  - [使用 Deno](#使用-deno)
- [使用 CAC 的项目](#使用-cac-的项目)
- [参考](#参考)
  - [CLI 实例](#cli-实例)
    - [cac(name?)](#cacname)
    - [cli.command(name, description, config?)](#clicommandname-description-config)
    - [cli.option(name, description, config?)](#clioptionname-description-config)
    - [cli.parse(argv?)](#cliparseargv)
    - [cli.version(version, customFlags?)](#cliversionversion-customflags)
    - [cli.help(callback?)](#clihelpcallback)
    - [cli.outputHelp()](#clioutputhelp)
    - [cli.usage(text)](#cliusagetext)
  - [Command 实例](#command-实例)
    - [command.option()](#commandoption)
    - [command.action(callback)](#commandactioncallback)
    - [command.alias(name)](#commandaliasname)
    - [command.allowUnknownOptions()](#commandallowunknownoptions)
    - [command.example(example)](#commandexampleexample)
    - [command.usage(text)](#commandusagetext)
  - [事件](#事件)
- [FAQ](#faq)
  - [这个名字是如何书写和发音的？](#这个名字是如何书写和发音的)
  - [为什么不使用 Commander.js?](#为什么不使用-commanderjs)
- [项目统计](#项目统计)
- [贡献](#贡献)
- [作者](#作者)

<!-- tocstop -->

## 安装

```bash
yarn add cac
```

## 用法

### 快速上手 - 简单解析

使用 CAC 作为简单的参数解析器：

```js
// examples/basic-usage.js
const cli = require('cac')()

cli.option('--type <type>', 'Choose a project type', {
  default: 'node',
})

const parsed = cli.parse()

console.log(JSON.stringify(parsed, null, 2))
```

<img width="500" alt="2018-11-26 12 28 03" src="https://user-images.githubusercontent.com/8784712/48981576-2a871000-f112-11e8-8151-80f61e9b9908.png">

### 显示帮助消息和版本号

```js
// examples/help.js
const cli = require('cac')()

cli.option('--type [type]', 'Choose a project type', {
  default: 'node',
})
cli.option('--name <name>', 'Provide your name')

cli.command('lint [...files]', 'Lint files').action((files, options) => {
  console.log(files, options)
})

// 当使用 `-h` 或 `--help` 参数时显示帮助信息
cli.help()
// 当使用 `-v` 或 `--version` 参数时显示版本号，也可以用于显示帮助信息
cli.version('0.0.0')

cli.parse()
```

<img width="500" alt="2018-11-25 8 21 14" src="https://user-images.githubusercontent.com/8784712/48979012-acb20d00-f0ef-11e8-9cc6-8ffca00ab78a.png">

### 命令的特定选项

您可以将选特定项附加到命令中。

```js
const cli = require('cac')()

cli
  .command('rm <dir>', 'Remove a dir')
  .option('-r, --recursive', 'Remove recursively')
  .action((dir, options) => {
    console.log('remove ' + dir + (options.recursive ? ' recursively' : ''))
  })

cli.help()

cli.parse()
```

上面配置的选项，会在使用命令时生效。任何位置选项都将视为错误进行提示。但是，如果是基础命令没有定义其行为，则不会验证该选项，如果您真的想使用未知选项，可以使用 [`command.allowUnknownOptions`](#commandallowunknownoptions)。

<img alt="command options" width="500" src="https://user-images.githubusercontent.com/8784712/49065552-49dc8500-f259-11e8-9c7b-a7c32d70920e.png">

### 选项名称中的破折号

使用 kebab-case 命名的选项，在使用时需要改为 camelCase 方式：

```js
cli
  .command('dev', 'Start dev server')
  .option('--clear-screen', 'Clear screen')
  .action((options) => {
    console.log(options.clearScreen)
  })
```

事实上 `--clear-screen` 和 `--clearScreen` 都映射成 `options.clearScreen`。

### 括号

在**命令名称**中使用**括号**时，**尖括号表示必选参数**，而**方括号表示可选参数**。

在**选项名称**中使用**括号**时，**尖括号表示必须传入一个字符串/数字值**，而**方括号表示该值也可以是true**。


```js
const cli = require('cac')()

cli
  .command('deploy <folder>', 'Deploy a folder to AWS')
  .option('--scale [level]', 'Scaling level')
  .action((folder, options) => {
    // ...
  })

cli
  .command('build [project]', 'Build a project')
  .option('--out <dir>', 'Output directory')
  .action((folder, options) => {
    // ...
  })

cli.parse()
```

### 无效选项

如果需要配置选项为 false，您需要手动指定一个无效选项：

```js
cli
  .command('build [project]', 'Build a project')
  .option('--no-config', 'Disable config file')
  .option('--config <path>', 'Use a custom config file')
```
这将让 CAC 将默认值设置 `config` 为 true，您可以使用 `--no-config` 标志将其设置为 `false`。

### 可变参数

命令的最后一个参数可以是可变参数，并且只能是最后一个参数。要使参数可变，您必须添加 `...` 到参数名称的开头，就像 JavaScript 中的 rest 运算符一样。下面是一个例子：

```js
const cli = require('cac')()

cli
  .command('build <entry> [...otherFiles]', 'Build your app')
  .option('--foo', 'Foo option')
  .action((entry, otherFiles, options) => {
    console.log(entry)
    console.log(otherFiles)
    console.log(options)
  })

cli.help()

cli.parse()
```

<img width="500" alt="2018-11-25 8 25 30" src="https://user-images.githubusercontent.com/8784712/48979056-47125080-f0f0-11e8-9d8f-3219e0beb0ed.png">

### 点嵌套选项

点嵌套选项将合并为一个选项。

```js
const cli = require('cac')()

cli
  .command('build', 'desc')
  .option('--env <env>', 'Set envs')
  .example('--env.API_SECRET xxx')
  .action((options) => {
    console.log(options)
  })

cli.help()

cli.parse()
```

<img width="500" alt="2018-11-25 9 37 53" src="https://user-images.githubusercontent.com/8784712/48979771-6ada9400-f0fa-11e8-8192-e541b2cfd9da.png">

### 默认命令

注册一个将在没有其他命令匹配时使用的命令。

```js
const cli = require('cac')()

cli
  // 简单地省略命令名，只使用括号
  .command('[...files]', 'Build files')
  .option('--minimize', 'Minimize output')
  .action((files, options) => {
    console.log(files)
    console.log(options.minimize)
  })

cli.parse()
```

### 提供一个数组作为选项值

```bash
node cli.js --include project-a
# 解析结果：
# { include: 'project-a' }

node cli.js --include project-a --include project-b
# 解析结果：
# { include: ['project-a', 'project-b'] }
```

### 错误处理

全局处理命令错误：

```js
try {
  cli.parse(process.argv, { run: false })
  // 当你的命令操作返回一个 Promise，你只需要添加 await
  await cli.runMatchedCommand()
} catch (error) {
  // 在这里处理错误.. 
  // 例如
  // console.error(error.stack)
  // process.exit(1)
}
```

### 使用 TypeScript

首先，您需要 `@types/node` 在项目中作为开发依赖项安装：

```bash
yarn add @types/node --dev
```

然后一切都开箱即用：

```js
const { cac } = require('cac')
// OR ES modules
import { cac } from 'cac'
```

### 使用 Deno

```ts
import { cac } from 'https://unpkg.com/cac/mod.ts'

const cli = cac('my-program')
```

## 使用 CAC 的项目

这些项目使用了 **CAC**:

- [VuePress](https://github.com/vuejs/vuepress): :memo: Minimalistic Vue-powered static site generator.
- [SAO](https://github.com/egoist/sao): ⚔️ Futuristic scaffolding tool.
- [DocPad](https://github.com/docpad/docpad): 🏹 Powerful Static Site Generator.
- [Poi](https://github.com/egoist/poi): ⚡️ Delightful web development.
- [bili](https://github.com/egoist/bili): 🥂 Schweizer Armeemesser for bundling JavaScript libraries.
- [Lad](https://github.com/ladjs/lad): 👦 Lad scaffolds a Koa webapp and API framework for Node.js.
- [Lass](https://github.com/lassjs/lass): 💁🏻 Scaffold a modern package boilerplate for Node.js.
- [Foy](https://github.com/zaaack/foy): 🏗 A lightweight and modern task runner and build tool for general purpose.
- [Vuese](https://github.com/vuese/vuese): 🤗 One-stop solution for vue component documentation.
- [NUT](https://github.com/nut-project/nut): 🌰 A framework born for microfrontends
- Feel free to add yours here...

## 参考

💁 如果您想要更深入的 API 参考， 请查看源代码中 [生成文档](https://cac-api-doc.egoist.sh/classes/_cac_.cac.html) 。

下面简单介绍：

### CLI 实例

通过调用 `cac` 函数创建 CLI 实例：

```js
const cac = require('cac')
const cli = cac()
```

#### cac(name?)

创建一个 CLI 实例，可设置可选的 `name` 属性来指定 CLI 名称，这将用于在帮助和版本消息中显示的 CLI 名称。当未设置时，默认使用 `argv[1]`。

#### cli.command(name, description, config?)

- 类型: `(name: string, description: string) => Command`

创建命令实例。

其第三个参数 `config` 为可选参数，值为：

- `config.allowUnknownOptions`: `boolean` 在此命令中允许未知选项。
- `config.ignoreOptionDefaultValue`: `boolean` 不要在解析的选项中使用选项的默认值，只在帮助消息中显示它们。

#### cli.option(name, description, config?)

- 类型: `(name: string, description: string, config?: OptionConfig) => CLI`

添加全局选项。

其第三个参数 `config` 为可选参数，值为：

- `config.default`: 选项的默认值。
- `config.type`: `any[]`，当设置为 `[]` 时，选项值返回一个数组类型。还可以使用如 `[String]` 之类的转换函数，将使用 `String` 调用选项值。

#### cli.parse(argv?)

- 类型: `(argv = process.argv) => ParsedArgv`

```ts
interface ParsedArgv {
  args: string[]
  options: {
    [k: string]: any
  }
}
```

当这个方法被调用时，`cli.rawArgs`、`cli.args`、`cli.options`、`cli.matchedCommand` 也将可用。

#### cli.version(version, customFlags?)

- 类型: `(version: string, customFlags = '-v, --version') => CLI`

出现标志 `-v, --version` 时输出版本号。

#### cli.help(callback?)

- 类型: `(callback?: HelpCallback) => CLI`

出现标志 `-h, --help` 时输出帮助消息。

可选参数 `callback` 允许在显示之前对帮助文本进行后处理：

```ts
type HelpCallback = (sections: HelpSection[]) => void

interface HelpSection {
  title?: string
  body: string
}
```

#### cli.outputHelp()

- 类型: `() => CLI`

输出帮助信息。

#### cli.usage(text)

- 类型: `(text: string) => CLI`

添加全局使用说明，并且这不会被子命令使用。

### Command 实例

通过调用 `cli.command` 方法创建 Command 实例：

```js
const command = cli.command('build [...files]', 'Build given files')
```

#### command.option()

和 `cli.option` 基本相同，但 `command.option()` 将该选项添加到特定命令中。

#### command.action(callback)

- 类型: `(callback: ActionCallback) => Command`

当命令匹配用户输入时，使用回调函数作为命令操作。

```ts
type ActionCallback = (
  // Parsed CLI args
  // The last arg will be an array if it's a variadic argument
  ...args: string | string[] | number | number[]
  // Parsed CLI options
  options: Options
) => any

interface Options {
  [k: string]: any
}
```

#### command.alias(name)

- 类型: `(name: string) => Command`

为该命令添加别名，此处 `name` 不能包含括号。

#### command.allowUnknownOptions()

- 类型: `() => Command`

在此命令中允许未知选项，默认情况下，当使用未知选项时，CAC 将记录错误。

#### command.example(example)

- 类型: `(example: CommandExample) => Command`

在帮助消息末尾显示一个使用示例。

```ts
type CommandExample = ((name: string) => string) | string
```

#### command.usage(text)

- 类型: `(text: string) => Command`

为此命令添加使用说明。

### 事件

监听命令：

```js
// 监听 `foo` 命令
cli.on('command:foo', () => {
  // 执行特定业务
})

// 监听默认命令
cli.on('command:!', () => {
  // 执行特定业务
})

// 监听未知命令
cli.on('command:*', () => {
  console.error('Invalid command: %s', cli.args.join(' '))
  process.exit(1)
})
```

## FAQ

### 这个名字是如何书写和发音的？

CAC 或 cac，发音为 `C-A-C` 。

这个项目是献给我们可爱的 CC sama 的。 也许 CAC 也代表 C&C :P

<img src="http://i.giphy.com/v3FeH4swox9mg.gif" width="400"/>

### 为什么不使用 Commander.js?

Basically I made CAC to fulfill my own needs for building CLI apps like [Poi](https://poi.js.org), [SAO](https://sao.vercel.app) and all my CLI apps. It's small, simple but powerful :P

CAC 与 Commander.js 非常相似，而后者不支持**点嵌套选项**，即类似 `--env.API_SECRET foo` . 此外，您也不能在 Commander.js 中使用**未知选项**。

*也许更多...*

基本上，我开发 CAC 是为了满足我自己构建 CLI 应用程序（如 [Poi](https://poi.js.org) 、 [SAO](https://sao.vercel.app) 和我所有的 CLI 应用程序）的需求。

它小巧、简单但功能强大：P

## [](https://github.com/cacjs/cac#project-stats)项目统计

![Alt](https://repobeats.axiom.co/api/embed/58caf6203631bcdb9bbe22f0728a0af1683dc0bb.svg 'Repobeats analytics image')

## 贡献

1. Fork 项目!
2. 创建您的功能分支：`git checkout -b my-new-feature`
3. 提交您的更改：`git commit -am 'Add some feature'`
4. 推送到分支： `git push origin my-new-feature`
5. 提交拉取请求 :D

## 作者

**CAC** © [EGOIST](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/cacjs/cac/contributors)).

> [Website](https://egoist.sh) · GitHub [@egoist](https://github.com/egoist) · Twitter [@\_egoistlily](https://twitter.com/_egoistlily)
