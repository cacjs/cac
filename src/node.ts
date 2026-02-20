export const processArgs: string[] = process.argv

let runtimeName: string
if (typeof Deno !== 'undefined' && typeof Deno.version?.deno === 'string') {
  runtimeName = 'deno'
} else if (typeof Bun !== 'undefined' && typeof Bun.version === 'string') {
  runtimeName = 'bun'
} else {
  runtimeName = 'node'
}
export const platformInfo: string = `${process.platform}-${process.arch} ${runtimeName}-${process.version}`
