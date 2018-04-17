import chalk from 'chalk'
import { orderNames, textTable, prefixOption } from './utils'

export interface IOptionsInput {
  desc: string
  alias?: string | string[]
  default?: any
  type?: string
  choices?: any[]
  required?: boolean
  [k: string]: any
}

export interface IOptions extends IOptionsInput {
  name: string
  names: string[]
}

export default class Options {
  options: IOptions[]

  constructor() {
    this.options = []
  }

  add(name: string, opt: IOptionsInput | string) {
    let names = [name]
    if (typeof opt === 'string') {
      opt = { desc: opt }
    } else if (typeof opt === 'object') {
      names = names.concat(opt.alias || [])
    }

    const option = {
      ...opt,
      name,
      names: orderNames(names)
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
