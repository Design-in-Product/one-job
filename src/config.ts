// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export type StorageMode = 'demo' | 'local' | 'remote';

const params = new URLSearchParams(window.location.search);

/**
 * One Job is local-first: tasks live on the device by default.
 *
 * - 'demo':   seeded, sandboxed local store — demo.html, ?demo, or VITE_DEMO_MODE
 * - 'remote': FastAPI backend — only when VITE_API_URL is baked into the build
 *             (or ?remote during development, e.g. http://localhost:8080/?remote)
 * - 'local':  everything else (the default)
 */
export const storageMode: StorageMode =
  params.has('demo') ||
  window.location.pathname.endsWith('/demo.html') ||
  import.meta.env.VITE_DEMO_MODE === 'true'
    ? 'demo'
    : import.meta.env.VITE_API_URL || params.has('remote')
      ? 'remote'
      : 'local';

export const isDemoMode = storageMode === 'demo';
