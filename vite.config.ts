import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // ← главный плагин

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Включаем Buffer, process и global
      globals: {
        Buffer: true,
        process: true,
        global: true,
      },
      // Для Node.js модулей в браузере
      protocolImports: true,
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer', // ← правильный импорт
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },

  define: {
    global: 'globalThis',
    'process.env': JSON.stringify(process.env || {}), // ← лучше так
  },

  optimizeDeps: {
    include: [
      'buffer',
      'process',
      '@tonconnect/ui-react',
      '@ton/ton',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
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
        },
      },
    },
  },
})