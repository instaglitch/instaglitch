import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: '',
  resolve:
    mode === 'production'
      ? {
          // Enables MobX production build
          mainFields: ['jsnext:main', 'module', 'main'],
        }
      : undefined,
  build: {
    outDir: './build',
  },
  plugins: [react()],
}));
