import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  define: {
    __DUCK_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    // include .d.ts
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.d.ts']
  },
  build: {
    lib: {
      name: 'duck',
      formats: ["es"],
      entry: path.resolve(__dirname, './src/index.ts'),
      fileName: (format) => `index.${format}.js`
    },
    // rollupOptions: {
    //   external: []
    // }
  }
})