export default () => cli => {
  cli.on('parsed', command => {
    if (command && command.command.examples) {
      cli.extraHelp({
        title: 'EXAMPLES',
        body: command.command.examples.join('\n')
      })
    }
  })
}
