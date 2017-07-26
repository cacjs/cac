import table from 'text-table'
import stringWidth from 'string-width'

export function parseType(type) {
  if (typeof type === 'string' || type instanceof String) {
    return type
  }

  if (type === Boolean) {
    return 'boolean'
  }
}

export function orderNames(names) {
  return names.sort((a, b) => {
    return a.length > b.length
  })
}

export function textTable(data) {
  return table(data, {
    stringLength: stringWidth
  })
}

export function prefixOption(option) {
  return option.length === 1 ? `-${option}` : `--${option}`
}

export function isExplictCommand(name) {
  return name && !name.startsWith('-')
}
