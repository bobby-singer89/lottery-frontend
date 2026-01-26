import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer/',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
  define: {
    'global': 'globalThis',
    'process.env': '{}',
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@ton') || id.includes('tonconnect')) {
              return 'ton-vendor';
            }
            if (id.includes('framer-motion') || id.includes('recharts') || id.includes('lucide')) {
              return 'ui-vendor';
            }
            if (id.includes('buffer')) {
              return 'polyfills';
            }
          }
        }
      }
    }
  }
})