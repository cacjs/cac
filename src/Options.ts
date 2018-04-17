import chalk from 'chalk'
import { orderNames, textTable, prefixOption } from './utils'

export interface IOptionInput {
  alias?: string | string[]
  default?: any
  type?: string
  choices?: string[]
  required?: boolean
  [k: string]: any
}

export interface IOption extends IOptionInput {
  name: string
  desc: string
  names: string[]
}

export type IOptions = IOption[]

export default class Options {
  options: IOptions

  constructor() {
    this.options = []
  }

  add(name: string, desc: string, opt: IOptionInput) {
    const option = {
      name,
      desc,
      ...opt,
      names: orderNames([name].concat(opt.alias || []))
    }
    this.options.push(option)
    return this
  }

  getDefaultsMapping() {
    return this.options
      .filter(option => {
        return typeof option.default !== 'undefined'
      })
      .reduce((res: {[k:string]: any}, next) => {
        res[next.name] = next.default
        return res
      }, {})
  }

  getOptionsByType(type: string) {
    return this.options.filter(option => type === option.type)
  }

  getOptionNamesByType(type: string) {
    return this.getOptionsByType(type).map(option => option.name)
  }

  getAliasMap() {
    return this.options.reduce((res: {[k: string]: any}, next) => {
      res[next.name] = next.alias
      return res
    }, {})
  }

  isEmpty() {
    return this.options.length === 0
  }

  toString() {
    return textTable(
      this.options.map(option => {
        const extra = []
        if (typeof option.default !== 'undefined') {
          extra.push(`Default: ${JSON.stringify(option.default)}`)
        }
        if (typeof option.type === 'string') {
          extra.push(`Type: ${option.type}`)
        }
        return [
          option.names.map(v => chalk.yellow(prefixOption(v))).join(', '),
          chalk.dim(option.desc),
          extra.map(v => chalk.dim(`[${v}]`)).join(' ')
        ]
      })
    )
  }
}
