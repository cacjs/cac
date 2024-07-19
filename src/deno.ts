// Ignore the TypeScript errors
// Since this file will only be used in Deno runtime

export const processArgs = [...['deno', 'cli'], ...Deno.args]

export const platformInfo = `${Deno.build.os}-${Deno.build.arch} deno-${Deno.version.deno}`
