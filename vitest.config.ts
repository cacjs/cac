import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 30_000,
    exclude: [...defaultExclude, 'tests/deno.test.mts'],
  },
})
