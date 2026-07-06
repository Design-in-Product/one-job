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
//
// Rules: never throw, never invent data, pass unknown future versions
// through untouched (a downgrade must not eat an upgrade's data).

import { Task, InteriorDeck } from '@/types/task';

export const CURRENT_SCHEMA_VERSION = 2;

export interface StorageDocument {
  schemaVersion: number;
  cards: Task[];
}

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
  // v2+ envelope
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    const doc = raw as Partial<StorageDocument>;
    if (typeof doc.schemaVersion === 'number' && Array.isArray(doc.cards)) {
      return doc as StorageDocument; // current or future — pass through
    }
    return { schemaVersion: CURRENT_SCHEMA_VERSION, cards: [] };
  }

  // v1 bare array
  if (Array.isArray(raw)) {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      cards: raw
        .filter((t): t is Record<string, unknown> => t !== null && typeof t === 'object')
        .map(migrateV1Card),
    };
  }

  return { schemaVersion: CURRENT_SCHEMA_VERSION, cards: [] };
}
