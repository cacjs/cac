declare let window: any
declare let Deno: any

const deno = typeof window !== 'undefined' && window.Deno

export const processArgs = deno ? ['deno'].concat(Deno.args) : process.argv

export const platformInfo = deno
  ? `${Deno.build.os}-${Deno.build.arch} deno-${Deno.version.deno}`
  : `${process.platform}-${process.arch} node-${process.version}`
