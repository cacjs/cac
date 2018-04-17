import Cac from '../Cac'
import { IOptions } from '../Options'

interface FailedOptions extends IOptions {
  choices: any[] // TODO: maybe not any
}

export default () => (cli: Cac) => {
  cli.on('parsed', (command, _, flags) => {
    if (!command) return

    const failedOptions = command.options.options.filter((option): option is FailedOptions => {
      const shouldCheck =
        option.choices && typeof flags[option.name] !== 'undefined'
      const isOneOfChices =
        option.choices &&
        option.choices.filter((choice: any) => {
          return choice === flags[option.name]
        }).length > 0
      return Boolean(shouldCheck && !isOneOfChices)
    })

    if (failedOptions.length > 0) {
      for (const option of failedOptions) {
        console.log(
          `The value of flag "${option.name}" should be one of: ${option.choices.map(
            (choice: any) => `"${choice}"`
          )}`
        )
      }
      process.exit(1) // eslint-disable-line unicorn/no-process-exit
    }
  })
}
