/* eslint-disable import/no-mutable-exports */
export let runtimeProcessArgs: string[] | undefined
export let runtimeInfo: string

if (typeof process !== 'undefined') {
  let runtimeName: string
  if (typeof Deno !== 'undefined' && typeof Deno.version?.deno === 'string') {
    runtimeName = 'deno'
  } else if (typeof Bun !== 'undefined' && typeof Bun.version === 'string') {
    runtimeName = 'bun'
  } else {
    runtimeName = 'node'
  }
  runtimeInfo = `${process.platform}-${process.arch} ${runtimeName}-${process.version}`
  runtimeProcessArgs = process.argv
} else if (typeof navigator === 'undefined') {
  runtimeInfo = `unknown`
} else {
  runtimeInfo = `${navigator.platform} ${navigator.userAgent}`
}
