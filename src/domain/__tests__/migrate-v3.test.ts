// v2 → v3 fixture corpus (R2.1 stage 1, 2026-07-29). RED ZONE: this
// migration touches Xian's live deck, so the corpus runs against real
// document shapes — including the flat-cards shape his actual backups
// have — before any store code changed.
//
// v3: { schemaVersion: 3, decks: InteriorDeck[] } — the root stops being
// the one place shaped differently ("the interior of no card"). A v2
// document's cards become root deck "deck-1" (Xian's naming call,
// 2026-07-29), cards byte-identical.

import { describe, it, expect } from 'vitest';
import { migrateDocument, CURRENT_SCHEMA_VERSION } from '../migrate';

// The shape a real backup / live deck has today (v2, nested interior).
const V2_REAL = {
  schemaVersion: 2,
  cards: [
    {
      id: 'a', title: 'Ship the release', completed: false,
      createdAt: '2026-07-01T10:00:00.000Z', sortOrder: 0,
      decks: [{
        id: 'd1', name: 'Steps', createdAt: '2026-07-01T10:00:00.000Z',
        cards: [
          { id: 'a1', title: 'Write changelog', completed: true,
            createdAt: '2026-07-01T10:00:00.000Z', completedAt: '2026-07-02T10:00:00.000Z',
            decks: [{ id: 'd2', name: null, createdAt: '2026-07-01T10:00:00.000Z',
              cards: [{ id: 'a1x', title: 'deep card', completed: false,
                        createdAt: '2026-07-01T10:00:00.000Z' }] }] },
        ],
      }],
    },
    { id: 'b', title: 'Water plants', completed: true,
      createdAt: '2026-07-01T09:00:00.000Z', completedAt: '2026-07-20T10:00:00.000Z',
      archivedAt: '2026-07-25T10:00:00.000Z' },
  ],
};

describe('v2 → v3: the root becomes a deck', () => {
  it('is version 3 now', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(3);
  });

  it('wraps a v2 document into root deck "deck-1" with cards untouched', () => {
    const doc = migrateDocument(structuredClone(V2_REAL));
    expect(doc.schemaVersion).toBe(3);
    expect(doc.decks).toHaveLength(1);
    expect(doc.decks[0].name).toBe('first deck');
    expect(doc.decks[0].id).toBeTruthy();
    // cards byte-identical — nothing invented, nothing dropped
    expect(doc.decks[0].cards).toEqual(V2_REAL.cards);
  });

  it('reaches v3 from v1 in one call (bare array through the chain)', () => {
    const v1 = [
      { id: 'x', title: 'old task', completed: false,
        createdAt: '2025-08-01T10:00:00.000Z',
        substacks: [{ id: 's1', name: 'Old sub', tasks: [
          { id: 'x1', title: 'old subtask', completed: false, createdAt: '2025-08-01T10:00:00.000Z' },
        ] }] },
    ];
    const doc = migrateDocument(v1);
    expect(doc.schemaVersion).toBe(3);
    expect(doc.decks[0].name).toBe('first deck');
    const card = doc.decks[0].cards[0];
    expect(card.decks![0].name).toBe('Old sub');
    expect(card.decks![0].cards[0].title).toBe('old subtask');
  });

  it('is idempotent: a v3 document passes through unchanged', () => {
    const v3 = migrateDocument(structuredClone(V2_REAL));
    expect(migrateDocument(structuredClone(v3))).toEqual(v3);
  });

  it('tolerates unknown future versions by passing them through untouched', () => {
    const future = { schemaVersion: 99, decks: [], somethingNew: true };
    expect(migrateDocument(future)).toBe(future);
  });

  it('treats garbage as empty (never throws, never invents cards)', () => {
    for (const junk of [null, undefined, 42, { not: 'a deck' }]) {
      const doc = migrateDocument(junk);
      expect(doc.schemaVersion).toBe(3);
      expect(doc.decks.flatMap(d => d.cards)).toEqual([]);
    }
  });
});

describe('FUTURE data meets OLDER code (the 2026-08-04 near-wipe class)', () => {
  // A stale cached build reading newer storage must REFUSE loudly, never
  // return an empty deck: "empty" invites the UI to run normally and
  // eventually save nothing over everything. Xian's device met exactly
  // this — rc.8 code x v3 data — and only the no-write-on-load behavior
  // stood between a display glitch and real loss.
  it('throws on a future schemaVersion with an unknown container shape', async () => {
    const v4ish = { schemaVersion: 4, tables: [{ decks: [] }] }; // no `decks` array at top
    expect(() => migrateDocument(v4ish)).toThrow(/newer|future/i);
  });

  it('still passes through a future version whose decks shape it CAN read', () => {
    const future = { schemaVersion: 9, decks: [], somethingNew: true };
    expect(migrateDocument(future)).toBe(future);
  });

  it('a versioned envelope with NEITHER cards nor decks is refused, not emptied', () => {
    // the exact rc.8-reads-v3 silhouette, generalized
    const alien = { schemaVersion: 7, payload: 'opaque' };
    expect(() => migrateDocument(alien)).toThrow(/newer|future/i);
  });
});
