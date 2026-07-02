import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { hydrateFromNativeStorage } from './services/nativeStorageBridge'

// On native (Capacitor) builds, restore tasks from durable app storage
// before first render; on the web this resolves immediately.
hydrateFromNativeStorage().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
