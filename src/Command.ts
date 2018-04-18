import Options, { IOptionsInput } from './Options'
import { orderNames, invariant } from './utils'

export interface ICommandOptions {
  desc: string
  alias?: string | string[]
  examples?: string[]
  [k: string]: any
}

export interface ICommand extends ICommandOptions {
  name: string
  desc: string
  names: string[]
}

export type CommandHandler = (input: string[], flags: {[k: string]: any}) => any | Promise<any>

export default class Command {
  command: ICommand
  options: Options
  handler?: CommandHandler

  constructor(name: string, opt: ICommandOptions | string, handler?: CommandHandler) {
    invariant(typeof name === 'string', 'Expect command name to be a string')

    let names = [name]
    if (typeof opt === 'string') {
      opt = { desc: opt }
    } else if (typeof opt === 'object') {
      names = names.concat(opt.alias || [])
    }

    invariant(typeof opt.desc === 'string', 'Expect command description to be a string')

    const command = {
      ...opt,
      name,
      names: orderNames(names)
    }

    this.command = command
    this.options = new Options()
    this.handler = handler
  }

  option(name: string, opt: string | IOptionsInput) {
    this.options.add(name, opt)

    return this
  }
}
