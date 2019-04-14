declare let window: any
declare let Deno: any

const deno = typeof window !== 'undefined' && window.Deno

export const exit = (code: number) => {
  return deno ? Deno.exit(code) : process.exit(code)
}

export const processArgs = deno ? ['deno'].concat(Deno.args) : process.argv

export const platformInfo = deno
  ? `${Deno.platform.os}-${Deno.platform.arch} deno-${Deno.version.deno}`
  : `${process.platform}-${process.arch} node-${process.version}`
