import { nodeLib } from 'tsdown-preset-sxzz'

export default nodeLib(
  {
    inlineDeps: ['mri'],
  },
  {
    inputOptions: {
      resolve: {
        alias: {
          mri: 'mri/lib/index.mjs',
        },
      },
    },
  },
)
