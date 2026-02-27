import type { Option } from './option.ts'

export const removeBrackets = (v: string): string =>
  v.replace(/[<[].+/, '').trim()

export const findAllBrackets = (
  v: string,
): {
  required: boolean
  value: string
  variadic: boolean
}[] => {
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
      variadic,
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

interface MriOptions {
  alias: {
    [k: string]: string[]
  }
  boolean: string[]
}

export const getMriOptions = (options: Option[]): MriOptions => {
  const result: MriOptions = { alias: {}, boolean: [] }

  for (const [index, option] of options.entries()) {
    // We do not set default values in mri options
    // Since its type (typeof) will be used to cast parsed arguments.
    // Which mean `--foo foo` will be parsed as `{foo: true}` if we have `{default:{foo: true}}`

    // Set alias
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1)
    }
    // Set boolean
    if (option.isBoolean) {
      if (option.negated) {
        // For negated option
        // We only set it to `boolean` type when there's no string-type option with the same name
        const hasStringTypeOption = options.some((o, i) => {
          return (
            i !== index &&
            o.names.some((name) => option.names.includes(name)) &&
            typeof o.required === 'boolean'
          )
        })
        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0])
        }
      } else {
        result.boolean.push(option.names[0])
      }
    }
  }

  return result
}

export const findLongest = (arr: string[]): string => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1
  })[0]
}

export const padRight = (str: string, length: number): string => {
  return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`
}

export const camelcase = (input: string): string => {
  return input.replaceAll(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase()
  })
}

export function setDotProp(
  obj: Record<string, any>,
  keys: string[],
  val: any,
): void {
  let current = obj

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const isLastKey = i === keys.length - 1

    if (isLastKey) {
      current[key] = val
      return
    }

    if (current[key] == null) {
      const nextKey = keys[i + 1]
      const nextKeyIsArrayIndex = +nextKey > -1
      current[key] = nextKeyIsArrayIndex ? [] : {}
    }

    current = current[key]
  }
}

export function setByType(
  obj: { [k: string]: any },
  transforms: { [k: string]: any },
): void {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key]

    if (transform.shouldTransform) {
      obj[key] = [obj[key]].flat()

      if (typeof transform.transformFunction === 'function') {
        obj[key] = obj[key].map(transform.transformFunction)
      }
    }
  }
}

export const getFileName = (input: string): string => {
  const m = /([^\\/]+)$/.exec(input)
  return m ? m[1] : ''
}

export const camelcaseOptionName = (name: string): string => {
  // Camelcase the option name
  // Don't camelcase anything after the dot `.`
  return name
    .split('.')
    .map((v, i) => {
      return i === 0 ? camelcase(v) : v
    })
    .join('.')
}

export class CACError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CACError'
    if (typeof Error.captureStackTrace !== 'function') {
      this.stack = new Error(message).stack
    }
  }
}
