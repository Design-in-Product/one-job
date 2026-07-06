// src/pwaUpdateCheck.ts
// iOS home-screen PWAs only check for service-worker updates at launch,
// and quick quit/reopen cycles never give the download time to finish —
// users can sit on a stale version for days (observed 2026-07-04).
// Remedy: explicitly re-check whenever the app returns to the foreground
// (plus an hourly heartbeat while open). The plugin-generated registration
// (autoUpdate) handles activation + reload once a new worker is found.
// No-ops anywhere without a service worker (native builds, dev).

export function startPwaUpdateChecks(): void {
  if (!('serviceWorker' in navigator)) return;

  const check = () => {
    navigator.serviceWorker
      .getRegistration()
      .then(reg => reg?.update())
      .catch(() => {
        /* offline or unregistered — try again next foreground */
      });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
  setInterval(check, 60 * 60 * 1000);
}
