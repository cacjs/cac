import path from 'path'
import globby from 'globby'
import fs from 'fs-extra'
import { transformAsync, PluginObj, types as Types } from '@babel/core'
import tsSyntax from '@babel/plugin-syntax-typescript'

function node2deno(options: { types: typeof Types }): PluginObj {
  const t = options.types
  return {
    name: 'node2deno',

    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source
        if (source.value.startsWith('.')) {
          if (source.value.endsWith('/node')) {
            source.value = source.value.replace('node', 'deno')
          }
          source.value += '.ts'
        } else if (source.value === 'events') {
          source.value = `https://deno.land/std@0.114.0/node/events.ts`
        } else if (source.value === 'mri') {
          source.value = `https://cdn.skypack.dev/mri`
        }
      },
    },
  }
}

async function main() {
  const files = await globby(['**/*.ts', '!**/__test__/**'], { cwd: 'src' })
  await Promise.all(
    files.map(async (file) => {
      if (file === 'node.ts') return
      const content = await fs.readFile(path.join('src', file), 'utf8')
      const transformed = await transformAsync(content, {
        plugins: [tsSyntax, node2deno],
      })
      await fs.outputFile(path.join('deno', file), transformed.code, 'utf8')
    })
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
