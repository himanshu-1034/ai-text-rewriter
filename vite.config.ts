import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, "src/content-script.ts"),
      },
      output: {
        // Ensure all assets are properly referenced
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: (chunk) =>
          chunk.name === "contentScript"
            ? "content-script.js"
            : "assets/[name]-[hash].js",
      },
    },
    // Ensure assets are bundled properly
    assetsInlineLimit: 0, // Don't inline assets, keep them as files
    // Optimize for Chrome extension
    chunkSizeWarningLimit: 1000,
    // Reduce code splitting for faster loading
    cssCodeSplit: false,
  },
  // Copy public folder assets
  publicDir: 'public',
})
