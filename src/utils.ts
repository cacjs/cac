import Command from './Command'

export const removeBrackets = (v: string) => v.replace(/[<[].+/, '').trim()

export const findAllBrackets = (v: string) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g

  const res = []

  const parse = (match: string[]) => {
    let variadic = false
    let value = match[1]
    if (value.startsWith('...')) {
      value = value.slice(3)
      variadic = true
    }
    return {
      required: match[0].startsWith('<'),
      value,
      variadic
    }
  }

  let angledMatch
  while ((angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v))) {
    res.push(parse(angledMatch))
  }

  let squareMatch
  while ((squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v))) {
    res.push(parse(squareMatch))
  }

  return res
}

export const getMinimistOptions = (
  globalCommand: Command,
  subCommand?: Command
) => {
  const options = [
    ...globalCommand.options,
    ...(subCommand ? subCommand.options : [])
  ]
  const ignoreDefault =
    subCommand && subCommand.config.ignoreOptionDefaultValue
      ? subCommand.config.ignoreOptionDefaultValue
      : globalCommand.config.ignoreOptionDefaultValue
  return {
    default: ignoreDefault
      ? {}
      : options.reduce((res: { [k: string]: any }, option) => {
          if (option.config.default !== undefined) {
            // Only need to set the default value of the first name
            // Since minimist will automatically do the rest for alias names
            res[option.names[0]] = option.config.default
          }
          return res
        }, {}),
    boolean: options
      .filter(option => option.isBoolean)
      .reduce((res: string[], option) => {
        return res.concat(option.names)
      }, []),
    alias: options.reduce((res: { [k: string]: string[] }, option) => {
      if (option.names.length > 1) {
        res[option.names[0]] = option.names.slice(1)
      }
      return res
    }, {})
  }
}

export const findLongest = (arr: string[]) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1
  })[0]
}

export const padRight = (str: string, length: number) => {
  return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`
}

export const camelcase = (input: string) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase()
  })
}
