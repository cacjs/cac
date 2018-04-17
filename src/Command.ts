import Options from './Options'
import { orderNames, invariant } from './utils'

export interface IOption {
  alias?: string[]
  examples?: string[]
  [k: string]: any
}

export interface ICommand extends IOption {
  name: string
  desc: string
  alias: string[]
  names: string[]
}

export type Handler = (input: string[], flags: {[k: string]: any}) => any | Promise<any>

export default class Command {
  command: ICommand
  options: Options
  handler?: Handler
  option: Options['add']

  constructor(name: string, desc: string, opt?: IOption, handler?: Handler) {
    invariant(typeof name === 'string', 'Expect command name to be a string.')
    invariant(typeof desc === 'string', 'Expect command to have a description.')

    const alias = opt && opt.alias || []
    const command = {
      ...opt,
      name,
      desc,
      alias,
      names: orderNames([name].concat(alias))
    }


    this.command = command
    this.options = new Options()
    this.handler = handler

    this.option = this.options.add.bind(this.options)
  }
}
