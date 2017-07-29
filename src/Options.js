import chalk from 'chalk'
import { parseType, orderNames, textTable, prefixOption } from './utils'

export default class Options {
  constructor() {
    this.options = []
  }

  add(name, opt) {
    opt = opt || {}
    if (typeof opt === 'string') {
      opt = { desc: opt }
    }
    const option = {
      ...opt,
      name,
      alias: opt.alias || [],
      desc: opt.desc,
      default: opt.default,
      type: parseType(opt.type)
    }
    option.names = orderNames([option.name].concat(option.alias))
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
