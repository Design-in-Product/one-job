import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.onejob.deck',
  appName: 'One Job',
  // Built by `npm run build:native` (vite --mode capacitor): relative asset
  // base, hash routing, no service worker — the WebView loads local files.
  webDir: 'dist-native',
  ios: {
    contentInset: 'never'
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
