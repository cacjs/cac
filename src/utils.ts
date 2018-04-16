import table, { TabelData } from 'text-table'
import stringWidth from 'string-width'
import CacError from './CacError'

export function orderNames(names: string[]) {
  return names.sort((a, b) => {
    return a.length > b.length ? 1 : -1
  })
}

export function textTable(data: TabelData) {
  return table(data, {
    stringLength: stringWidth
  })
}

export function prefixOption(option: string) {
  return option.length === 1 ? `-${option}` : `--${option}`
}

export function isExplictCommand(name: string) {
  return name && !name.startsWith('-')
}

export function invariant(exp: any, message: string) {
  if (!exp) {
    throw new CacError(message)
  }
}
