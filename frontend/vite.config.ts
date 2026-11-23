import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Production optimizations
  build: {
    outDir: '../public',
    emptyOutDir: false,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${Date.now()}-[hash].js`,
        chunkFileNames: `assets/[name]-${Date.now()}-[hash].js`,
        assetFileNames: `assets/[name]-${Date.now()}-[hash].[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          routing: ['react-router-dom'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          forms: ['react-hook-form', '@hookform/resolvers', 'yup'],
          http: ['axios'],
          utils: ['dayjs']
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  // Development server
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://nurverse.id',
        changeOrigin: true,
        secure: true
      }
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@store': '/src/store',
      '@utils': '/src/utils',
      '@types': '/src/types',
    }
  }
})
