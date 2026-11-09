import { realpathSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Resolve the project root through any symlinks/junctions/virtualised folders
// so Vite's file-serving checks match the resolved module paths.
const root = realpathSync.native(dirname(fileURLToPath(import.meta.url)));

/**
 * Two build targets:
 *  - default (`npm run build`): regular SPA for any static host, served from "/".
 *    Vite serves index.html for unknown paths in dev and preview, so direct
 *    navigation to client-side routes (e.g. /planets/mars) works.
 *  - artifact (`npm run build:artifact`): self-contained bundle for hosting as
 *    a claude.ai Artifact — relative asset paths, hash-based routing (see
 *    main.jsx) and the Latin font subsets embedded in the CSS.
 */
export default defineConfig(({ mode }) => {
  const artifact = mode === 'artifact';
  return {
    root,
    base: artifact ? './' : '/',
    plugins: [react()],
    worker: {
      format: 'es',
    },
    build: {
      outDir: artifact ? 'dist-artifact' : 'dist',
      target: 'es2020',
      chunkSizeWarningLimit: 1400,
      assetsInlineLimit: artifact
        ? (file) => (/-latin-wght-normal\.woff2$/.test(file) ? true : undefined)
        : 4096,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
            r3f: ['@react-three/fiber', '@react-three/drei'],
            vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          },
        },
      },
    },
  };
});
