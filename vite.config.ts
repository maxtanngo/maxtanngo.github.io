import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        videoEditor: 'tools/video-editor/index.html',
        hookCard: 'tools/hook-card/index.html',
        scriptRadar: 'tools/script-radar/index.html',
        downloads: 'downloads/index.html',
        guides: 'guides/index.html',
        about: 'about/index.html',
      },
    },
  },
});
