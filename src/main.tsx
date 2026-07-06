import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { hydrateFromNativeStorage } from './services/nativeStorageBridge'
import { startPwaUpdateChecks } from './pwaUpdateCheck'

startPwaUpdateChecks();

// On native (Capacitor) builds, restore tasks from durable app storage
// before first render; on the web this resolves immediately.
hydrateFromNativeStorage().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
