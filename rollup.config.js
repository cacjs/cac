import nodeResolvePlugin from '@rollup/plugin-node-resolve'
import esbuildPlugin from 'rollup-plugin-esbuild'
import dtsPlugin from 'rollup-plugin-dts'

function createConfig({ dts, esm } = {}) {
  let file = 'dist/index.js'
  if (dts) {
    file = file.replace('.js', '.d.ts')
  }
  if (esm) {
    file = file.replace('.js', '.mjs')
  }
  return {
    input: 'src/index.ts',
    output: {
      format: dts || esm ? 'esm' : 'cjs',
      file,
      exports: 'named',
    },
    plugins: [
      nodeResolvePlugin({
        mainFields: dts ? ['types', 'typings'] : ['module', 'main'],
        extensions: dts ? ['.d.ts', '.ts'] : ['.js', '.json', '.mjs'],
        customResolveOptions: {
          moduleDirectories: dts
            ? ['node_modules/@types', 'node_modules']
            : ['node_modules'],
        },
      }),
      !dts && require('@rollup/plugin-commonjs')(),
      !dts &&
        esbuildPlugin({
          target: 'es2017',
        }),
      dts && dtsPlugin(),
    ].filter(Boolean),
  }
}

export default [
  createConfig(),
  createConfig({ dts: true }),
  createConfig({ esm: true }),
]
