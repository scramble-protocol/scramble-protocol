import path from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint2';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'process', 'crypto', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
      },
    }),
    react(),
    eslint({
      lintOnStart: true,
      cache: false,
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      undici: '',
    },
    dedupe: [
      'react',
      'react-dom',
      '@noble/hashes',
      '@noble/curves',
      '@scure/base',
    ],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          opnet: [
            'opnet',
            '@btc-vision/bitcoin',
            '@btc-vision/transaction',
          ],
        },
      },
    },
  },
});
