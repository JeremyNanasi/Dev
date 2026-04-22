import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'home.html'),
        index: resolve(__dirname, 'index.html'),
        settings: resolve(__dirname, 'settings.html'),
        winner: resolve(__dirname, 'winner.html'),
      },
    },
  },
});
