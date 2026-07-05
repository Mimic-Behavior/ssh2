import { builtinModules } from 'node:module'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            fileName: 'index',
            formats: ['es'],
        },
        rolldownOptions: {
            external: ['cpu-features', ...builtinModules, ...builtinModules.map((module) => `node:${module}`)],
        },
    },
    plugins: [dts({ include: ['src'] })],
})
