// Ignore the TypeScript errors
// Since this file will only be used in Deno runtime

const _ARGS = ['deno', 'cli']
export const processArgs = [..._ARGS, ...Deno.args]

export const platformInfo = `${Deno.build.os}-${Deno.build.arch} deno-${Deno.version.deno}`
