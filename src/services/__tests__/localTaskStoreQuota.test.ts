// RED ZONE: what a save does when storage is full.
//
// 2026-11-25 brief (Klatch: map what callers do with a failure before
// designing the detector). Every UI handler catches a store rejection and
// shows an error toast. So the hazard was not a silent caller; it was a
// rejection that LIED. saveTasks wrote the main document, then meta, then
// the daily snapshot, then the native mirror. A full store usually fails
// on the snapshot (a NEW key each day, and old ones were pruned only AFTER
// the write), by which point the card was already saved. The user saw
// "Add failed" for a saved card (a retry makes a duplicate), and the iOS
// native mirror was skipped.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../nativeStorageBridge', () => ({
  mirrorToNativeStorage: vi.fn(),
  hydrateFromNativeStorage: vi.fn(async () => {}),
}));

import { LocalTaskStore } from '../localTaskStore';
import { mirrorToNativeStorage } from '../nativeStorageBridge';

const KEY = 'quotaTasks';
const SNAP = `${KEY}.snapshot.`;
const quota = () => new DOMException('The quota has been exceeded.', 'QuotaExceededError');
const snapshotKeys = () => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith(SNAP)) keys.push(k);
  }
  return keys.sort();
};

let realSetItem: Storage['setItem'];
beforeEach(() => {
  localStorage.clear();
  vi.mocked(mirrorToNativeStorage).mockClear();
  realSetItem = localStorage.setItem.bind(localStorage);
});
afterEach(() => vi.restoreAllMocks());

/** Make setItem throw QuotaExceededError when `full(key)` says so. */
const fillStorage = (full: (key: string) => boolean) =>
  vi.spyOn(localStorage, 'setItem').mockImplementation((k: string, v: string) => {
    if (full(k)) throw quota();
    realSetItem(k, v);
  });

describe('a full store', () => {
  it('does not report a saved card as failed when only the snapshot cannot be written', async () => {
    fillStorage(k => k.startsWith(SNAP));
    await expect(new LocalTaskStore(KEY).createTask('Kept')).resolves.toMatchObject({ title: 'Kept' });
    vi.restoreAllMocks();
    expect((await new LocalTaskStore(KEY).getAllTasks()).map(t => t.title)).toEqual(['Kept']);
  });

  it('still writes the native mirror when the snapshot cannot be written', async () => {
    fillStorage(k => k.startsWith(SNAP));
    await new LocalTaskStore(KEY).createTask('Mirrored');
    const mirrored = vi.mocked(mirrorToNativeStorage).mock.calls.filter(([k]) => k === KEY);
    expect(mirrored.length).toBeGreaterThan(0);
    expect(mirrored.at(-1)![1]).toContain('Mirrored');
  });

  it('prunes old snapshots BEFORE writing today\'s, so a store with room for seven keeps seven', async () => {
    for (let d = 1; d <= 7; d++) realSetItem(`${SNAP}2026-06-0${d}`, '[]');
    // Room for exactly seven snapshots: an eighth new key does not fit.
    fillStorage(k => k.startsWith(SNAP) && localStorage.getItem(k) === null && snapshotKeys().length >= 7);
    await new LocalTaskStore(KEY).createTask('Today');
    const snaps = snapshotKeys();
    expect(snaps).toHaveLength(7);
    expect(snaps.some(k => !k.includes('2026-06-'))).toBe(true); // today's got in
    expect(snaps).not.toContain(`${SNAP}2026-06-01`);             // the oldest made room
  });

  it('still rejects when the card itself cannot be saved (success reports observed outcomes only)', async () => {
    const store = new LocalTaskStore(KEY);
    await store.getAllTasks();
    fillStorage(k => k === KEY);
    await expect(store.createTask('Lost')).rejects.toThrow(/quota/i);
  });
});
