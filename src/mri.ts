// Forked from mri v1.2.0 (https://github.com/lukeed/mri), trimmed to the
// options cac uses and hardened against prototype pollution.
// mri is MIT licensed, see its notice in the LICENSE file.

export interface MriOptions {
  alias: Record<string, string[]>
  boolean: string[]
}

export interface MriResult {
  _: string[]
  [k: string]: any
}

function isNumeric(val: string): boolean {
  return Number.isFinite(+val)
}

function toVal(
  out: MriResult,
  key: string,
  val: string | boolean,
  booleans: string[],
): void {
  let next: string | number | boolean
  if (typeof val === 'boolean') {
    next = val
  } else if (booleans.includes(key)) {
    if (val === 'false') {
      next = false
    } else if (val === 'true') {
      next = true
    } else {
      // A boolean flag does not take a value, so it goes back to the args
      out._.push((isNumeric(val) ? +val : val) as string)
      next = !!val
    }
  } else {
    next = isNumeric(val) ? +val : val
  }

  // `out` has no prototype, so `old` is never an inherited member
  const old = out[key]
  out[key] =
    old == null ? next : Array.isArray(old) ? old.concat(next) : [old, next]
}

export function mri(args: string[], opts: MriOptions): MriResult {
  // A prototype-less result keeps flags like `--__proto__` or `--toString`
  // as plain own keys, instead of reading or replacing inherited members
  const out: MriResult = Object.create(null)
  out._ = []

  const aliases: Record<string, string[]> = Object.create(null)
  Object.assign(aliases, opts.alias)
  for (const name of Object.keys(aliases)) {
    // Read from `aliases` rather than `opts.alias`: an earlier entry may
    // already have replaced this one, as upstream mri does
    const list = aliases[name]
    for (const [i, alias] of list.entries()) {
      aliases[alias] = [...list.slice(0, i), ...list.slice(i + 1), name]
    }
  }

  const booleans = [...opts.boolean]
  for (const name of opts.boolean) {
    const list = aliases[name]
    if (list) booleans.push(...list)
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--') {
      out._ = out._.concat(args.slice(i + 1))
      break
    }

    let dashes = 0
    while (arg[dashes] === '-') dashes++

    if (dashes === 0) {
      out._.push(arg)
      continue
    }

    if (arg.slice(dashes, dashes + 3) === 'no-') {
      out[arg.slice(dashes + 3)] = false
      continue
    }

    let eq = dashes + 1
    while (eq < arg.length && arg[eq] !== '=') eq++

    const name = arg.slice(dashes, eq)
    const val: string | boolean =
      arg.slice(eq + 1) ||
      i + 1 === args.length ||
      String(args[i + 1]).startsWith('-') ||
      args[++i]

    // `--foo` is one flag, while `-abc` is three short flags
    // where only the last one takes the value
    const names = dashes === 2 ? [name] : name.split('')
    for (const [idx, flag] of names.entries()) {
      toVal(out, flag, idx + 1 < names.length || val, booleans)
    }
  }

  for (const key of Object.keys(out)) {
    const list = aliases[key]
    if (!list) continue
    for (const alias of list) out[alias] = out[key]
  }

  return out
}
