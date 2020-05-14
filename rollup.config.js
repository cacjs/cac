import nodeResolvePlugin from '@rollup/plugin-node-resolve'
import esbuildPlugin from 'rollup-plugin-esbuild'
import dtsPlugin from 'rollup-plugin-dts'

function createConfig(target, dts) {
  const deno = target === 'deno'
  let file = deno ? 'mod.js' : 'dist/index.js'
  if (dts) {
    file = file.replace('.js', '.d.ts')
  }
  return {
    input: 'src/index.ts',
    output: {
      format: deno || dts ? 'esm' : 'cjs',
      file,
      exports: 'named'
    },
    plugins: [
      nodeResolvePlugin({
        preferBuiltins: !deno,
        mainFields: dts ? ['types', 'typings'] : ['module', 'main'],
        extensions: dts ? ['.d.ts', '.ts'] : ['.js', '.json', '.mjs'],
        customResolveOptions: {
          moduleDirectory: dts
            ? ['node_modules/@types', 'node_modules']
            : 'node_modules'
        }
      }),
      !dts &&
        require('@rollup/plugin-commonjs')({
          namedExports: {
            path: ['basename'],
            events: ['EventEmitter']
          }
        }),
      !dts &&
        esbuildPlugin({
          target: 'es2017'
        }),
      dts && dtsPlugin(),
      deno && {
        renderChunk(code) {
          // Remove triple slashes reference since Deno doesn't support that
          return code.replace(/^\/\/\/(.+)/, '')
        }
      }
    ].filter(Boolean)
  }
}

export default [
  createConfig('node'),
  createConfig('deno'),
  createConfig('node', true),
  createConfig('deno', true)
]
