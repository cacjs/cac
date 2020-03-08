declare let window: any
declare let Deno: any

const deno = typeof window !== 'undefined' && window.Deno
const denoScriptPath =
  deno && typeof window !== 'undefined' && window.location.pathname

// Adds deno executable and script path to processArgs as "compatibility" layer for node
// See https://github.com/cacjs/cac/issues/69
export const processArgs = deno
  ? ['deno', denoScriptPath].concat(Deno.args)
  : process.argv

export const platformInfo = deno
  ? `${Deno.build.os}-${Deno.build.arch} deno-${Deno.version.deno}`
  : `${process.platform}-${process.arch} node-${process.version}`
