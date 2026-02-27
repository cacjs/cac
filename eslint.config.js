import { sxzz } from '@sxzz/eslint-config'

export default sxzz().append({
  rules: {
    'unicorn/no-array-sort': 'off',
    'node/prefer-global/process': 'off',
  },
})
