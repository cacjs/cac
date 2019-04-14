export default {
  input: 'lib/index.js',
  output: {
    format: 'cjs',
    file: 'dist/index.js'
  },
  plugins: [
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-commonjs')()
  ]
}
