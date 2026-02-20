import { lib } from 'tsdown-preset-sxzz'

export default lib(
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
