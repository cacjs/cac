export default () => cli => {
  cli.on('parsed', (command, input, flags) => {
    if (!command) return

    const failedOptions = command.options.options.filter(option => {
      const shouldCheck =
        option.choices && typeof flags[option.name] !== 'undefined'
      const isOneOfChices =
        option.choices &&
        option.choices.filter(choice => {
          return choice === flags[option.name]
        }).length > 0
      return shouldCheck && !isOneOfChices
    })

    if (failedOptions.length > 0) {
      for (const option of failedOptions) {
        console.log(
          `The value of flag "${option.name}" should be one of: ${option.choices.map(
            choice => `"${choice}"`
          )}`
        )
      }
      process.exit(1) // eslint-disable-line unicorn/no-process-exit
    }
  })
}
