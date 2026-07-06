/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { version } from "./package.json";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // 'capacitor' mode builds the native (app store) bundle: relative asset
  // paths for the WebView's local files, separate output dir, no service
  // worker (assets are already on-device).
  base: mode === 'production' ? '/app/' : mode === 'capacitor' ? './' : '/',
  build: {
    outDir: mode === 'capacitor' ? 'dist-native' : 'app',
  },
  server: {
    // Bind all interfaces (IPv4 + IPv6). The previous "::" was IPv6-only,
    // which made the dev server unreachable from browsers hitting 127.0.0.1.
    host: true,
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode !== 'capacitor' &&
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "One Job",
        short_name: "One Job",
        description: "See one task. Do one task. Feel accomplished.",
        // One continuous surface: chrome and splash match the app's
        // gray-50 background so the app never sits inside a colored frame
        theme_color: "#f9fafb",
        background_color: "#f9fafb",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png}"],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  test: {
    environment: "jsdom",
  },
}));
