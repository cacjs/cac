# Getting Started

To create a simple CLI program without sub commands:

📝 __cli.js__:

```js
const cac = require('cac')

const cli = cac()

const { flags } = cli.parse()

if (flags.name) {
  console.log('The name is', flags.name)
}
```

```bash
$ node cli.js --name egoist
> The name is egoist
```

And if you run `node cli.js --help`, you will see a beautiful documentation for your CLI program like below:

![help preview](https://i.loli.net/2018/04/18/5ad6d4ac30e52.png)

## Flags

You may notice that the there's no doc for `--name` flag in the `GLOBAL OPTIONS` section, that's because you didn't add it:

```js{5}
const cac = require('cac')

const cli = cac()

cli.option('name', 'Tell me your name')

const { flags } = cli.parse()

if (flags.name) {
  console.log('The name is', flags.name)
}
```

Now here you go:

![help option](https://i.loli.net/2018/04/18/5ad6d553a1bff.png)

