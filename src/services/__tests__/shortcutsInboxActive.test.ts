// xian, 2026-10-06 (build 40): a Siri card added while One Job is OPEN
// never appeared until a quit-and-restart. Siri presents OVER the app, so
// the page never becomes hidden and `visibilitychange` never fires; the
// app only goes inactive → active. The inbox must drain on app-became-
// active too (Capacitor App plugin `appStateChange`), not only on boot and
// visibility.

import { describe, it, expect, beforeEach, vi } from 'vitest';

const prefs = new Map<string, string>();
const appListeners: Array<(s: { isActive: boolean }) => void> = [];

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async ({ key }: { key: string }) => ({ value: prefs.get(key) ?? null })),
    set: vi.fn(async ({ key, value }: { key: string; value: string }) => void prefs.set(key, value)),
    remove: vi.fn(async ({ key }: { key: string }) => void prefs.delete(key)),
  },
}));
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(async (event: string, cb: (s: { isActive: boolean }) => void) => {
      if (event === 'appStateChange') appListeners.push(cb);
      return { remove: vi.fn() };
    }),
  },
}));

import { startShortcutsInbox, PENDING_KEY } from '../shortcutsInbox';
import { getTaskStore, resetTaskStoreForTests } from '../taskStore';

const settle = () => new Promise(r => setTimeout(r, 0));

describe('the inbox drains when the app becomes active (Siri over an open app)', () => {
  beforeEach(async () => {
    localStorage.clear();
    prefs.clear();
    appListeners.length = 0;
    resetTaskStoreForTests();
  });

  it('lands a card queued while the app was open, on inactive → active', async () => {
    startShortcutsInbox();
    await settle();
    expect(appListeners).toHaveLength(1);

    // Siri queues a card while the app stays visible underneath.
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'Dust for spiders' }]));
    appListeners[0]({ isActive: false });
    appListeners[0]({ isActive: true });
    await settle(); await settle();

    expect((await getTaskStore().getAllTasks()).map(t => t.title)).toContain('Dust for spiders');
  });

  it('does not drain on going inactive', async () => {
    startShortcutsInbox();
    await settle();
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'Not yet' }]));
    appListeners[0]({ isActive: false });
    await settle(); await settle();
    expect(prefs.has(PENDING_KEY)).toBe(true);
  });
});
