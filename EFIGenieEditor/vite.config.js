import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  server: { open: true },
  plugins: [
    viteCompression(),
  ],
});
