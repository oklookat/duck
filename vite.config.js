import { defineConfig } from 'vite'
import path from 'path'


export default defineConfig({
  resolve: {
    // include .d.ts
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.d.ts']
  },
  build: {
    lib: {
      name: 'duck',
      entry: path.resolve(__dirname, './src/index.ts'),
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: []
    }
  }
})