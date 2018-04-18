# Add Command

For larger CLI programs you may need git-style sub commands to split functionalities into different files.

```bash
git log
git commit
```

These are two sub commands each of which has its own functionality.

Now let's use CAC to add a sub command `hello` to a CLI program:

📝 __cli.js__:

```js
const cac = require('cac')

const cli = cac()

cli.command('hello', 'Say hello', () => {
  console.log('hello!')
})

cli.parse()
```

Then run it:

![preview](https://i.loli.net/2018/04/18/5ad6d7a5e0ebe.png)

## Command Options

Calling `cli.option(name, opts)` will add a global option, to add option to certain command you do:

```js{9-12}
const cac = require('cac')

const cli = cac()

cli
  .command('hello', 'Say hello', (input, flags) => {
    console.log('hello', flags.name)
  })
  .option('name', {
    desc: 'Your name',
    required: true
  })

cli.parse()
```

Then run it:

![preview](https://i.loli.net/2018/04/18/5ad6da97b52a4.png)

`cli.command()` will return a command instance which has a method `.option()` to allow you add command options.
