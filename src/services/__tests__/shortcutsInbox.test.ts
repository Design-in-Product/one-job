// R-INTENT ingest (RED zone: creates cards, touches the store).
// The intent's Swift half can't be unit-tested here; what CAN be is the
// entire web half: parsing (hostile inputs included), draining through
// the real LocalTaskStore, invariant interaction, and the
// keep-queued-on-failure posture.

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the native platform + Preferences with an in-memory map.
const prefs = new Map<string, string>();
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true },
}));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async ({ key }: { key: string }) => ({ value: prefs.get(key) ?? null })),
    set: vi.fn(async ({ key, value }: { key: string; value: string }) => void prefs.set(key, value)),
    remove: vi.fn(async ({ key }: { key: string }) => void prefs.delete(key)),
  },
}));

import { parseQueue, drainShortcutsInbox, PENDING_KEY } from '../shortcutsInbox';
import { getTaskStore, resetTaskStoreForTests } from '../taskStore';

describe('parseQueue (hostile input is the normal case)', () => {
  it('parses a well-formed queue', () => {
    const q = parseQueue(JSON.stringify([
      { title: 'From Reminders', description: 'via Teresa', subtasks: ['a', 'b'], receivedAt: '2026-09-12T10:00:00Z' },
    ]));
    expect(q).toEqual([
      { title: 'From Reminders', description: 'via Teresa', subtasks: ['a', 'b'], receivedAt: '2026-09-12T10:00:00Z' },
    ]);
  });

  it('returns [] for null, garbage, non-arrays, and drops titleless entries', () => {
    expect(parseQueue(null)).toEqual([]);
    expect(parseQueue('not json {{{')).toEqual([]);
    expect(parseQueue('{"title":"an object, not an array"}')).toEqual([]);
    expect(parseQueue(JSON.stringify([{ description: 'no title' }, { title: '   ' }, 42, null]))).toEqual([]);
  });

  it('trims titles and filters empty subtasks rather than failing the entry', () => {
    const q = parseQueue(JSON.stringify([{ title: '  padded  ', subtasks: ['ok', '', '  ', 7] }]));
    expect(q[0].title).toBe('padded');
    expect(q[0].subtasks).toEqual(['ok']);
  });
});

describe('drainShortcutsInbox (through the real LocalTaskStore)', () => {
  beforeEach(() => {
    localStorage.clear();
    prefs.clear();
    resetTaskStoreForTests();
  });

  it('lands queued cards as real cards with interiors, then clears the queue', async () => {
    prefs.set(PENDING_KEY, JSON.stringify([
      { title: 'Book the venue', description: 'from Reminders', subtasks: ['Call two places', 'Compare prices'] },
      { title: 'Simple card' },
    ]));
    const landed = await drainShortcutsInbox();
    expect(landed).toBe(2);
    expect(prefs.has(PENDING_KEY)).toBe(false);

    const tasks = await getTaskStore().getAllTasks();
    const venue = tasks.find(t => t.title === 'Book the venue')!;
    expect(venue.description).toBe('from Reminders');
    expect(venue.decks?.[0]?.cards?.map(c => c.title)).toEqual(
      expect.arrayContaining(['Call two places', 'Compare prices']),
    );
    expect(tasks.find(t => t.title === 'Simple card')).toBeTruthy();
  });

  it('is idempotent: a second drain of an empty queue creates nothing', async () => {
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'Once only' }]));
    await drainShortcutsInbox();
    const again = await drainShortcutsInbox();
    expect(again).toBe(0);
    const tasks = await getTaskStore().getAllTasks();
    expect(tasks.filter(t => t.title === 'Once only')).toHaveLength(1);
  });

  it('clears a garbage payload instead of re-parsing it forever', async () => {
    prefs.set(PENDING_KEY, 'corrupted {{{');
    const landed = await drainShortcutsInbox();
    expect(landed).toBe(0);
    expect(prefs.has(PENDING_KEY)).toBe(false);
  });

  it('never lets the queue bypass the store title invariant', async () => {
    // parseQueue already drops these, but belt-and-suspenders: the store
    // throwing must keep the batch alive for the cards that CAN land.
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'Good card' }, { title: 'Also good' }]));
    const landed = await drainShortcutsInbox();
    expect(landed).toBe(2);
  });
});

describe('placement: externally-dealt cards never usurp the top (ruled 2026-09-12)', () => {
  beforeEach(() => {
    localStorage.clear();
    prefs.clear();
    resetTaskStoreForTests();
  });

  it('lands BEHIND the current top card, in arrival order', async () => {
    const store = getTaskStore();
    await store.createTask('My current job');   // top
    await store.createTask('Older card');       // created later = new top
    // "Older card" is now top (top-insertion for user-created cards).
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'Arrived first' }, { title: 'Arrived second' }]));
    await drainShortcutsInbox();
    const titles = (await store.getAllTasks()).filter(t => !t.completed).map(t => t.title);
    expect(titles).toEqual(['Older card', 'Arrived first', 'Arrived second', 'My current job']);
  });

  it('an empty deck has no focus to protect — the card is simply the deck', async () => {
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'Only card' }]));
    await drainShortcutsInbox();
    const titles = (await getTaskStore().getAllTasks()).filter(t => !t.completed).map(t => t.title);
    expect(titles).toEqual(['Only card']);
  });

  it('user-created cards still take the top (the ruling is about EXTERNAL arrivals only)', async () => {
    const store = getTaskStore();
    await store.createTask('First');
    await store.createTask('I chose to add this');
    const titles = (await store.getAllTasks()).filter(t => !t.completed).map(t => t.title);
    expect(titles[0]).toBe('I chose to add this');
  });
});
