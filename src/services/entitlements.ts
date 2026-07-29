// src/services/entitlements.ts
// The pro wall's device side (Xian's doctrine, 2026-07-29): entitlement
// is PER-DEVICE, never a build default. The build ships free-tier for
// everyone and never special-cases a person; a device carries its own
// grant. Crisp boundary: code asks hasPro(), nothing else.
//
// Pre-business era: the only grant mechanism is the explicit URL param
// (?pro=comp to grant this device, ?pro=off to revoke) — how Xian's comp
// account works until real payment infrastructure replaces this file's
// write path. The READ path (hasPro) is the permanent seam.
//
// Data is never hostage to the wall: a free device that receives
// multi-deck data (a pro user's backup) keeps every deck readable and
// switchable. The wall gates CREATION of plurality, not access to data.

const ENTITLEMENT_KEY = 'oneJobEntitlement';

// Grant/revoke via URL param, evaluated once at module load.
try {
  const pro = new URLSearchParams(window.location.search).get('pro');
  if (pro === 'comp') localStorage.setItem(ENTITLEMENT_KEY, 'pro');
  if (pro === 'off') localStorage.removeItem(ENTITLEMENT_KEY);
} catch {
  /* no window/storage (tests, SSR) — grants simply don't apply */
}

export const hasPro = (): boolean => {
  try {
    return localStorage.getItem(ENTITLEMENT_KEY) === 'pro';
  } catch {
    return false;
  }
};
