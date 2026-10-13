import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Na GitHub Pages běží web v podsložce /kubesuvmed-advent/.
// Při vlastní doméně (např. advent.kubesuvmed.cz) nastavte BASE_PATH=/ .
export default defineConfig({
  base: process.env.BASE_PATH ?? '/kubesuvmed-advent/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 900 },
});
