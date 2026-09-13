import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { hydrateFromNativeStorage } from './services/nativeStorageBridge'
import { startShortcutsInbox } from './services/shortcutsInbox'
import { startPwaUpdateChecks } from './pwaUpdateCheck'

startPwaUpdateChecks();

// On native (Capacitor) builds, restore tasks from durable app storage
// before first render; on the web this resolves immediately.
hydrateFromNativeStorage().finally(() => {
  // After hydration so intent-born cards land on the restored deck,
  // never a pre-hydration empty one (native only; no-op on web).
  startShortcutsInbox();
  createRoot(document.getElementById("root")!).render(<App />);
  // Tell the boot watchdog (inline in index.html) that the bundle
  // executed and React mounted — this line running IS the proof the
  // white-screen failure didn't happen. See the watchdog script for
  // why it can't live in this file: in the failure state, this file
  // is exactly what never loaded.
  (window as unknown as { __oneJobBooted?: () => void }).__oneJobBooted?.();
});
