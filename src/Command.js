import chalk from 'chalk'
import Options from './Options'
import { parseType, orderNames } from './utils'

export default class Command {
  constructor(name, option, handler) {
    option = option || {}
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
