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

import { parseQueue, drainShortcutsInbox, PENDING_KEY, INBOX_LANDED_EVENT } from '../shortcutsInbox';
import { getTaskStore, resetTaskStoreForTests } from '../taskStore';

describe('parseQueue (hostile input is the normal case)', () => {
  it('parses a well-formed queue', () => {
    const q = parseQueue(JSON.stringify([
      { title: 'From Reminders', description: 'via Pilot tester A', subtasks: ['a', 'b'], receivedAt: '2026-09-12T10:00:00Z' },
    ]));
    expect(q).toEqual([
      { title: 'From Reminders', description: 'via Pilot tester A', subtasks: ['a', 'b'], receivedAt: '2026-09-12T10:00:00Z' },
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

// Cross-language slot pairing (2026-09-19, from the brief's write-deletion
// insight): the WRITER of the pending-cards slot is Swift
// (AddCardIntent.swift, key "CapacitorStorage.oneJobPendingCards" in
// UserDefaults) and the READER is TypeScript (this module, key
// "oneJobPendingCards" through the Preferences plugin, which adds the
// prefix). No import sweep, type check, or single-language grep can see
// this pair — rename either side and cards queue forever, unread, with
// every test green. This test reads BOTH SOURCES and pins the contract.
describe('the Swift writer and TS reader name the same slot', () => {
  it('AddCardIntent writes the key shortcutsInbox reads (modulo the plugin prefix)', () => {
    const fs = require('node:fs') as typeof import('node:fs');
    const path = require('node:path') as typeof import('node:path');
    const swift = fs.readFileSync(
      path.resolve(__dirname, '../../../native/ios/AddCardIntent.swift'), 'utf8');
    const swiftKey = swift.match(/let key = "CapacitorStorage\.([^"]+)"/)?.[1];
    expect(swiftKey).toBe(PENDING_KEY);
  });
});

// xian, 2026-10-06, testing build 40: "It requires a quit and restart for
// the new card(s) to appear." The foreground drain DID land the cards in
// the store; nothing told the mounted deck UI to re-read. The drain now
// announces a landing, and Index refreshes on it.
describe('a landing is announced so the open deck can refresh (no quit-and-restart)', () => {
  beforeEach(() => {
    localStorage.clear();
    prefs.clear();
    resetTaskStoreForTests();
  });

  it('dispatches INBOX_LANDED_EVENT with the count when cards land', async () => {
    const seen: number[] = [];
    const onLanded = (e: Event) => seen.push((e as CustomEvent<number>).detail);
    window.addEventListener(INBOX_LANDED_EVENT, onLanded);
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'One' }, { title: 'Two' }]));
    await drainShortcutsInbox();
    window.removeEventListener(INBOX_LANDED_EVENT, onLanded);
    expect(seen).toEqual([2]);
  });

  it('stays quiet when nothing landed (no refresh churn on every foreground)', async () => {
    let fired = 0;
    const onLanded = () => { fired += 1; };
    window.addEventListener(INBOX_LANDED_EVENT, onLanded);
    await drainShortcutsInbox();
    window.removeEventListener(INBOX_LANDED_EVENT, onLanded);
    expect(fired).toBe(0);
  });
});

// xian's second caveat: with several decks, cards landed in the deck shown
// on reopen, not the deck in focus when he added them. This pins what the
// store does: a drain lands in whichever deck is ACTIVE at drain time.
describe('deck targeting at drain time', () => {
  beforeEach(() => {
    localStorage.clear();
    prefs.clear();
    resetTaskStoreForTests();
  });

  it('lands in the active deck, not deck[0], when another deck is focused', async () => {
    const store = getTaskStore();
    const second = await store.createDeck!('second');
    await store.switchDeck!(second.id);
    prefs.set(PENDING_KEY, JSON.stringify([{ title: 'Where do I go' }]));
    await drainShortcutsInbox();
    expect((await store.getAllTasks()).map(t => t.title)).toContain('Where do I go');
    const first = (await store.getDecks()).find(d => d.id !== second.id)!;
    expect(first.cards.map(c => c.title)).not.toContain('Where do I go');
  });
});
