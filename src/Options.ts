import chalk from 'chalk'
import { orderNames, textTable, prefixOption } from './utils'

export interface IOptionInput {
  name?: string
  desc?: string
  alias?: string | string[]
  default?: any
  type?: string
  names?: string[]
}

export interface IOption {
  name: string
  desc?: string
  alias?: string | string[]
  default?: any
  type?: string
  names: string[]
}

export type IOptions = IOption[]

export default class Options {
  options: IOptions

  constructor() {
    this.options = []
  }

  add(name: string, opt: string | IOptionInput) {
    opt = opt || {}

    let option: IOption
    if (typeof opt === 'string') {
      option = {
        name,
        desc: opt
      }
    } else {
      if (!opt || !opt.desc) {
        throw new Error('Expect option to have a description!')
      }

      option = {
        name,
        ...opt
      }
    }

    option.names = orderNames([option.name].concat(option.alias || []))
    this.options.push(option)
    return this
  }

  getDefaultsMapping() {
    return this.options
      .filter(option => {
        return typeof option.default !== 'undefined'
      })
      .reduce((res, next) => {
        res[next.name] = next.default
        return res
      }, {})
  }

  getOptionsByType(type) {
    return this.options.filter(option => type === option.type)
  }

  getOptionNamesByType(type) {
    return this.getOptionsByType(type).map(option => option.name)
  }

  getAliasMap() {
    return this.options.reduce((res, next) => {
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
