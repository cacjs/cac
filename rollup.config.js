function convertDenoURLs(isDeno) {
  if (!isDeno) {
    return
  }

  return {
    resolveId(name) {
      if (name === 'events') {
        return name
      }
      return null
    },
    load(id) {
      if (id === 'events') {
        return [
          'export { default } from "https://deno.land/std/node/events.ts"',
          'export * from "https://deno.land/std/node/events.ts"'
        ].join('\n')
      }
      return null
    }
  }
}

function createConfig(target) {
  const deno = target === 'deno'
  return {
    input: 'lib/index.js',
    output: {
      format: deno ? 'esm' : 'cjs',
      file: deno ? 'mod.js' : 'dist/index.js',
      exports: 'named'
    },
    plugins: [
      require('rollup-plugin-node-resolve')({
        preferBuiltins: !deno
      }),
      require('rollup-plugin-commonjs')({
        namedExports: {
          path: ['basename']
        }
      }),
      convertDenoURLs(deno)
    ]
  }
}

export default [createConfig('node'), createConfig('deno')]
