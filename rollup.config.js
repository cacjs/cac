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
      })
    ]
  }
}

export default [createConfig('node'), createConfig('deno')]
