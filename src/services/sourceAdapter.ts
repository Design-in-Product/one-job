// src/services/sourceAdapter.ts
// R3.1: the seam every external service comes through (Item 11 — import
// first, then sync; a source lands READ-ONLY before earning write
// access). An agent is just another source (R4.1 collapses into this).
//
// Provenance is the only upstream identity: imported cards get fresh
// LOCAL ids (the 2026-07-26 shadow-import lesson — a copy must be its
// own cards) and carry {source, externalId} for dedupe and, later, the
// R3.3 mapping store. Imports land in a ROOT DECK named for the service
// — R2.1 made the landing zone the roadmap promised ("imported cards
// land in a source deck on the canvas") a real place.
//
// Tier: R3 is pro plumbing (PRICING 07-07 + 07-29). This module is
// mechanism; the wall is applied where a UI invokes it.

import { Task, InteriorDeck } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import type { TaskStore } from './taskStore';

/** A card as an external service describes it — the adapter's contract. */
export interface ExternalCard {
  externalId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt?: Date;
}

export interface SourceAdapter {
  /** Service slug: names the source deck and stamps provenance. */
  readonly service: string;
  /** Read-only pull of the service's current cards. */
  fetchCards(): Promise<ExternalCard[]>;
  // Write access (close/complete upstream) arrives in R3.4, earned —
  // deliberately absent from the read-only contract.
}

export interface ImportResult {
  imported: number;
  skipped: number;
  deckId: string;
}

/**
 * Pull a source's cards into its root deck: create the deck on first
 * import, dedupe by provenance on every later one. Idempotent — running
 * it twice imports nothing new. (Per-conflict merge UX is R3.6; skipping
 * known provenance is the honest simple version until then.)
 */
export async function importFromSource(
  store: TaskStore,
  adapter: SourceAdapter
): Promise<ImportResult> {
  if (!store.getDecks || !store.createDeck) {
    throw new Error('This store has no root decks — source import needs them');
  }
  const external = await adapter.fetchCards();

  let deck: InteriorDeck | undefined =
    (await store.getDecks()).find(d => d.name === adapter.service);
  if (!deck) deck = await store.createDeck(adapter.service);

  // Seeded from what's already stored, then GROWN as the loop imports.
  // 2026-09-04: it used to be a pre-loop snapshot only, so two entries
  // sharing an externalId inside ONE feed both passed the check and both
  // imported — the exact duplicate this dedupe exists to prevent, with no
  // error and correct-looking output. Realistic trigger: paginated fetches
  // overlapping when upstream data changes mid-fetch, which is how the
  // GitHub adapter reads issues across every repo. The set must see what
  // the loop itself creates; do not hoist this back to a snapshot.
  const known = new Set(
    deck.cards.filter(c => c.source === adapter.service).map(c => c.externalId)
  );

  const fresh: Task[] = [];
  let skipped = 0;
  for (const e of external) {
    if (known.has(e.externalId)) {
      skipped++;
      continue;
    }
    known.add(e.externalId); // grow as we go — see the note on `known`
    fresh.push({
      id: uuidv4(), // LOCAL identity — never the upstream id
      title: e.title,
      description: e.description,
      completed: e.completed,
      createdAt: e.createdAt ?? new Date(),
      completedAt: e.completed ? new Date() : undefined,
      source: adapter.service,
      externalId: e.externalId,
    });
  }
  if (fresh.length > 0) {
    if (!store.addCardsToDeck) {
      throw new Error('This store cannot receive source imports');
    }
    await store.addCardsToDeck(deck.id, fresh);
  }
  return { imported: fresh.length, skipped, deckId: deck.id };
}

/** The seam's proof: a fake service with local, controllable upstream. */
export class DemoSourceAdapter implements SourceAdapter {
  readonly service = 'demo';
  private upstream: ExternalCard[] = [
    { externalId: 'ext-1', title: 'Imported: review the plan', completed: false },
    { externalId: 'ext-2', title: 'Imported: reply to the thread', completed: false },
    { externalId: 'ext-3', title: 'Imported: already finished upstream', completed: true },
  ];

  addUpstream(card: ExternalCard) {
    this.upstream.push(card);
  }

  async fetchCards(): Promise<ExternalCard[]> {
    return [...this.upstream];
  }
}
