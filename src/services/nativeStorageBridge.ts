// src/services/nativeStorageBridge.ts
// Durability bridge for native (Capacitor) builds. WebView localStorage can
// be evicted by the OS; Capacitor Preferences is real app data. Strategy:
// localStorage stays the synchronous source of truth for the app, every
// save is mirrored to Preferences, and on cold start we restore from
// Preferences if localStorage came up empty. All no-ops on the web.

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const MIRRORED_KEYS = ['oneJobTasks', 'oneJobDemoTasks'];

/** Restore mirrored keys before the app renders (native only). */
export async function hydrateFromNativeStorage(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  for (const key of MIRRORED_KEYS) {
    try {
      if (localStorage.getItem(key) === null) {
        const { value } = await Preferences.get({ key });
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      }
    } catch (err) {
      console.error(`Failed to hydrate "${key}" from native storage:`, err);
    }
  }
}

/** Mirror a localStorage write into native storage (fire-and-forget). */
export function mirrorToNativeStorage(key: string, value: string): void {
  if (!Capacitor.isNativePlatform()) return;
  void Preferences.set({ key, value }).catch(err =>
    console.error(`Failed to mirror "${key}" to native storage:`, err)
  );
}
