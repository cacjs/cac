import Cac from '../Cac'

export default () => (cli: Cac) => {
  cli.on('parsed', (command, _, flags) => {
    if (!command) return

    // The presence of help trumps required option processing
    if (flags.help) return

    const missingRequiredOptions = command.options.options.filter(option => {
      const isRequired = option.required
      const isMissing = typeof flags[option.name] === 'undefined'
      return isMissing && isRequired
    })
    if (missingRequiredOptions.length > 0) {
      console.log(
        `Missing options: ${missingRequiredOptions
          .map(option => option.name)
          .join(', ')}`
      )
      process.exit(1) // eslint-disable-line unicorn/no-process-exit
    }
  })
}
