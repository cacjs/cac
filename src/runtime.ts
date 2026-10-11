// eslint-disable-next-line import/no-mutable-exports
export let runtimeInfo: string

if (typeof process !== 'undefined') {
  let runtimeName: string
  // @ts-expect-error missing Deno type definitions
  if (typeof Deno !== 'undefined' && typeof Deno.version?.deno === 'string') {
    runtimeName = 'deno'
  } else if (typeof Bun !== 'undefined' && typeof Bun.version === 'string') {
    runtimeName = 'bun'
  } else {
    runtimeName = 'node'
  }
  runtimeInfo = `${process.platform}-${process.arch} ${runtimeName}-${process.version}`
} else if (typeof navigator === 'undefined') {
  runtimeInfo = `unknown`
} else {
  runtimeInfo = `${navigator.platform} ${navigator.userAgent}`
}

/**
 * `process.argv` at call time. It must not be captured when this module is
 * imported: a runner may load cac before it rewrites `process.argv` for the
 * script it is about to run.
 */
export function getRuntimeProcessArgs(): string[] | undefined {
  return typeof process === 'undefined' ? undefined : process.argv
}
