// src/domain/migrate.ts
// Storage schema migrations (build sequence #7). Pure functions — no
// storage access here; the store decides when to persist the result.
//
// v1: a bare array of tasks, nesting only via Substack {name, tasks}
//     (one level deep, children are not full cards).
// v2: { schemaVersion: 2, cards: [...] } where nesting is
//     InteriorDeck { id, name, cards } and children are FULL cards —
//     recursion-capable, names preserved (Vision Item 17: old substack
//     names become interior deck names).
// v3: { schemaVersion: 3, decks: [...] } — the ROOT becomes a deck
//     (R2.1 stage 1, 2026-07-29). The root was the one place shaped
//     differently ("the interior of no card"); v3 removes the
//     exception. A v2 document's cards become root deck "deck-1"
//     (Xian's naming call), cards byte-identical. Multiple root decks
//     are carried by the model from day one; the UI and the pro wall
//     decide how many are usable.
//
// Rules: never throw, never invent data, pass unknown future versions
// through untouched (a downgrade must not eat an upgrade's data).

import { Task, InteriorDeck } from '@/types/task';

export const CURRENT_SCHEMA_VERSION = 3;

/** Newer-data-meets-older-code: distinct from corruption so the store can
    REFUSE TO BOOT rather than quarantine + roll back an older snapshot
    over newer data (which would convert refusal into silent loss). */
export class FutureDataError extends Error {}

export interface StorageDocument {
  schemaVersion: number;
  decks: InteriorDeck[];
}

/** The v2 envelope shape, accepted on the way in forever. */
interface V2Document {
  schemaVersion: number;
  cards: Task[];
}

/** Wrap a flat card list as the sole root deck ("deck-1"). */
const wrapAsRoot = (cards: Task[]): StorageDocument => ({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  decks: [{
    id: `root-${Math.random().toString(36).slice(2)}`,
    name: 'deck-1',
    createdAt: new Date().toISOString() as unknown as InteriorDeck['createdAt'],
    cards,
  }],
});

interface V1Substack {
  id?: string;
  name?: string;
  createdAt?: string | Date;
  tasks?: unknown[];
}

const migrateV1Card = (raw: Record<string, unknown>): Task => {
  const { substacks, ...rest } = raw;
  const card = rest as unknown as Task;

  // Already v2-shaped (e.g. cards from a v2 backup being imported):
  // preserve existing decks, normalizing children recursively.
  if (Array.isArray(card.decks)) {
    card.decks = card.decks.map((d): InteriorDeck => ({
      ...d,
      name: d.name ?? null,
      cards: (Array.isArray(d.cards) ? d.cards : []).map(c =>
        migrateV1Card(c as unknown as Record<string, unknown>)
      ),
    }));
    return card;
  }

  const v1Substacks = Array.isArray(substacks) ? (substacks as V1Substack[]) : [];
  card.decks = v1Substacks.map((s): InteriorDeck => ({
    id: String(s.id ?? `deck-${Math.random().toString(36).slice(2)}`),
    name: s.name ?? null,
    createdAt: (s.createdAt ?? new Date().toISOString()) as unknown as InteriorDeck['createdAt'],
    cards: (Array.isArray(s.tasks) ? s.tasks : []).map(t =>
      migrateV1Card(t as Record<string, unknown>)
    ),
  }));
  return card;
};

/**
 * Bring any stored/imported document to the current schema.
 * Accepts: v1 bare arrays, v2 envelopes, future versions (untouched),
 * and garbage (yields an empty document rather than throwing).
 */
export function migrateDocument(raw: unknown): StorageDocument {
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    // v3+ envelope — current or future, pass through untouched
    const v3 = raw as Partial<StorageDocument>;
    if (typeof v3.schemaVersion === 'number' && v3.schemaVersion >= 3 && Array.isArray(v3.decks)) {
      return v3 as StorageDocument;
    }
    // v2 envelope — its cards become root deck "deck-1"
    const v2 = raw as Partial<V2Document>;
    if (typeof v2.schemaVersion === 'number' && Array.isArray(v2.cards)) {
      return wrapAsRoot(v2.cards);
    }
    // A versioned envelope whose container we can't read is NEWER DATA
    // MEETING OLDER CODE (the 2026-08-04 near-wipe: rc.8 read a v3 doc,
    // returned empty, and only load-time no-write behavior stood between
    // a display glitch and real loss). REFUSE loudly — an "empty" result
    // invites the UI to run normally and eventually save nothing over
    // everything. The store catches this and quarantines nothing: the
    // stored document is untouched and a newer build reads it fine.
    if (typeof (raw as { schemaVersion?: unknown }).schemaVersion === 'number') {
      throw new FutureDataError(
        'This data was written by a NEWER version of One Job than this ' +
        'build understands. Refusing to read it as empty. Update the app ' +
        '(close all tabs / relaunch) — your data is intact in storage.'
      );
    }
    return wrapAsRoot([]);
  }

  // v1 bare array — through the v2 card shape, then wrapped
  if (Array.isArray(raw)) {
    return wrapAsRoot(
      raw
        .filter((t): t is Record<string, unknown> => t !== null && typeof t === 'object')
        .map(migrateV1Card)
    );
  }

  return wrapAsRoot([]);
}
