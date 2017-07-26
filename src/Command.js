import Options from './Options'
import { orderNames, invariant } from './utils'

export default class Command {
  constructor(name, option, handler) {
    option = option || {}
    if (typeof option === 'string') {
      option = { desc: option }
    }

    invariant(typeof name === 'string', 'Expect command name to be a string.')
    invariant(option.desc, 'Expect command to have a description.')

    const command = {
      name,
      alias: option.alias || [],
      desc: option.desc
    }

    command.names = orderNames([command.name].concat(command.alias))

    this.command = command
    this.options = new Options()
    this.handler = handler
  }

  option(...args) {
    this.options.add(...args)
    return this
  }
}
