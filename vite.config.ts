import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/app/' : '/',
  build: {
    outDir: 'app',
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React DOM in separate chunk
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // Framer Motion for animations
          'framer-motion': ['framer-motion'],
          // Date utilities
          'date-fns': ['date-fns'],
          // Icons
          'lucide-react': ['lucide-react'],
          // UI components
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-label',
          ],
        },
      },
    },
    // Increase chunk size warning limit to 600KB (from default 500KB)
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
