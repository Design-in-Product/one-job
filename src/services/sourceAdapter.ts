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
  /** Cards that belong inside this one (a task's sub-tasks). They land
      in the card's interior deck. */
  subcards?: ExternalCard[];
}

export interface SourceAdapter {
  /** Service slug: the deck's binding key, and the provenance stamp. */
  readonly service: string;
  /** What to call the deck when it is first created. Defaults to the
      slug. The user may rename the deck; the binding is by `service`. */
  readonly deckName?: string;
  /** Read-only pull of the service's current cards. */
  fetchCards(): Promise<ExternalCard[]>;
  /** Of these ids, which are CLOSED upstream? Asked only about cards
      that have left the open list, so a task that was moved or deleted
      is not mistaken for a finished one. Optional: without it a sync
      completes nothing. Still a read. */
  fetchClosed?(externalIds: string[]): Promise<string[]>;
  /** Write-back (R3.4, earned: xian approved it 2026-10-28 after the
      one-way week). Close or reopen one task upstream. A task that is
      gone upstream is not an error. Optional: an adapter without them
      stays one way. */
  closeUpstream?(externalId: string): Promise<void>;
  reopenUpstream?(externalId: string): Promise<void>;
}

/** What both sides last agreed each card's state was, by externalId.
    Write-back acts only on a card that changed HERE since then, so a
    task reopened in the service is never closed again, and a card done
    before the two sides agreed on it is never written. Device-local:
    the caller keeps it beside the link. */
export type AgreedState = Record<string, 'open' | 'closed'>;

export interface ImportResult {
  imported: number;
  skipped: number;
  deckId: string;
}

/** An external card as a local one: a fresh LOCAL id (never the
    upstream id), provenance stamped, sub-cards in an interior deck. */
function toCard(e: ExternalCard, service: string): Task {
  const now = new Date();
  return {
    id: uuidv4(),
    // External data can be anything; the store's title invariant would
    // reject an empty one and kill the whole batch. Fall back to a
    // name that keeps the entry traceable to its source instead.
    title: e.title?.trim() || `(untitled ${service} item ${e.externalId})`,
    description: e.description,
    completed: e.completed,
    createdAt: e.createdAt ?? now,
    completedAt: e.completed ? now : undefined,
    source: service,
    externalId: e.externalId,
    ...(e.subcards?.length
      ? { decks: [{ id: uuidv4(), name: null, cards: e.subcards.map(c => toCard(c, service)), createdAt: now }] }
      : {}),
  };
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

  // Bind by KEY, not by label. Deck names are user-renameable and not
  // unique, so name-matching could (a) lose the deck after a rename and
  // re-import everything as duplicates into a fresh one, or (b) bind to
  // a user's own deck that happens to share the name and append foreign
  // cards into it. Both silent. (Klatch round 205 via the 2026-09-14
  // brief: "the plan should pin the id it chose, not the label.")
  const decks = await store.getDecks();
  let deck: InteriorDeck | undefined = decks.find(d => d.source === adapter.service);
  if (!deck) {
    // One-time adoption for decks created before the key existed: a
    // name match is accepted ONLY if the deck actually holds this
    // service's cards (or is empty), which a coincidentally-named user
    // deck will not.
    const legacy = decks.find(
      d =>
        d.name === adapter.service &&
        d.source === undefined &&
        (d.cards.length === 0 || d.cards.some(c => c.source === adapter.service)),
    );
    if (legacy) deck = legacy;
  }
  if (!deck) deck = await store.createDeck(adapter.deckName ?? adapter.service);
  // Persist the binding through the store rather than mutating the
  // returned object: an in-memory stamp would survive only if something
  // else happened to save, and an import with zero new cards saves
  // nothing. (Idempotent — a no-op when already bound.)
  if (deck.source !== adapter.service) {
    if (!store.bindDeckSource) {
      throw new Error('This store cannot bind source decks');
    }
    await store.bindDeckSource(deck.id, adapter.service);
    deck.source = adapter.service;
  }

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
    fresh.push(toCard(e, adapter.service));
  }
  if (fresh.length > 0) {
    if (!store.addCardsToDeck) {
      throw new Error('This store cannot receive source imports');
    }
    await store.addCardsToDeck(deck.id, fresh);
  }
  return { imported: fresh.length, skipped, deckId: deck.id };
}

export interface SyncResult {
  added: number;
  completed: number;
  /** Closed upstream but left open here: unfinished cards inside. */
  held: number;
  reordered: boolean;
  deckId: string;
  /** Write-back counts; zero when the caller passed no agreement. */
  closedUpstream: number;
  reopenedUpstream: number;
  writeFailed: number;
  /** The agreement after this sync, for the caller to keep. Present
      only when the caller passed one. */
  agreed?: AgreedState;
}

/**
 * Bring a connected deck up to date with its source. xian's rulings,
 * 2026-10-12: a new task lands on top; a task closed upstream goes to
 * Done, "and vice versa on sync"; the order follows the service only
 * when the user chose that ('source').
 *
 * Everything is read first, so a failed read changes nothing on either
 * side. Then write-back, only when the caller passes `agreed` and the
 * adapter can write: a card done here since the last agreement closes
 * its task, one undone here reopens it. A failed write is counted and
 * left for the next sync. Then the local changes, in ONE save. A list
 * not yet connected is imported.
 */
export async function syncFromSource(
  store: TaskStore,
  adapter: SourceAdapter,
  opts: { order: 'onejob' | 'source'; agreed?: AgreedState },
): Promise<SyncResult> {
  if (!store.getDecks) throw new Error('This store has no root decks — source sync needs them');
  const noWrites = { closedUpstream: 0, reopenedUpstream: 0, writeFailed: 0 };
  const deck = (await store.getDecks()).find(d => d.source === adapter.service);
  if (!deck) {
    const first = await importFromSource(store, adapter);
    const agreed = opts.agreed && agreedNow(await store.getDecks(), adapter.service);
    return { added: first.imported, completed: 0, held: 0, reordered: false, deckId: first.deckId, ...noWrites, ...(agreed ? { agreed } : {}) };
  }
  if (!store.syncSourceDeck) throw new Error('This store cannot sync source decks');

  const external = await adapter.fetchCards();
  const mine = deck.cards.filter(c => c.source === adapter.service && c.externalId);
  const localId = new Map(mine.map(c => [c.externalId!, c.id]));

  const add: Task[] = [];
  for (const e of external) {
    if (localId.has(e.externalId)) continue;
    const card = toCard(e, adapter.service);
    localId.set(e.externalId, card.id); // grow as we go: one feed can repeat an id
    add.push(card);
  }

  // Open here, absent from the open list upstream: ask, don't assume.
  const stillOpen = new Set(external.map(e => e.externalId));
  const missing = mine.filter(c => !c.completed && !stillOpen.has(c.externalId!)).map(c => c.externalId!);
  const closed = new Set(
    (missing.length > 0 && adapter.fetchClosed ? await adapter.fetchClosed(missing) : [])
      .filter(id => missing.includes(id)),
  );

  // Write-back. Agreed open, done here, still open there: close it.
  // Agreed closed, open here, closed there: the user undid it here, so
  // reopen it (and do NOT complete it here below).
  const writes = { ...noWrites };
  const agreed: AgreedState | undefined = opts.agreed && { ...opts.agreed };
  const reopened = new Set<string>();
  if (agreed && (adapter.closeUpstream || adapter.reopenUpstream)) {
    for (const c of mine) {
      const id = c.externalId!;
      const write =
        c.completed && stillOpen.has(id) && agreed[id] === 'open' ? adapter.closeUpstream
        : !c.completed && closed.has(id) && agreed[id] === 'closed' ? adapter.reopenUpstream
        : undefined;
      if (!write) continue;
      try {
        await write.call(adapter, id);
        if (c.completed) { writes.closedUpstream++; agreed[id] = 'closed'; }
        else { writes.reopenedUpstream++; agreed[id] = 'open'; reopened.add(id); }
      } catch (err) {
        writes.writeFailed++;
        console.error(`sourceSync: could not write "${c.title}" back to ${adapter.service}:`, (err as Error).message);
      }
    }
  }

  const outcome = await store.syncSourceDeck(deck.id, {
    add,
    completeIds: [...closed].filter(id => !reopened.has(id) && agreed?.[id] !== 'closed').map(id => localId.get(id)!),
    ...(opts.order === 'source' ? { order: external.map(e => localId.get(e.externalId)!) } : {}),
  });

  if (agreed) {
    // Record what the two sides now agree on. A card where they still
    // differ keeps its old entry: a failed write, a held card, or a
    // task reopened there after One Job closed it (left alone). A card
    // never agreed on takes its state here, so it is never written.
    const after = (await store.getDecks()).find(d => d.id === deck.id)!;
    const seen = new Set<string>();
    for (const c of after.cards) {
      if (c.source !== adapter.service || !c.externalId) continue;
      const id = c.externalId;
      seen.add(id);
      const there = stillOpen.has(id) || reopened.has(id) ? 'open' : 'closed';
      const here = c.completed ? 'closed' : 'open';
      if (here === there) agreed[id] = here;
      else if (!(id in agreed) && here === 'closed') agreed[id] = 'closed';
    }
    for (const id of Object.keys(agreed)) if (!seen.has(id)) delete agreed[id];
  }
  return { ...outcome, deckId: deck.id, ...writes, ...(agreed ? { agreed } : {}) };
}

/** A freshly imported deck: every card's state is what both sides have. */
function agreedNow(decks: InteriorDeck[], service: string): AgreedState {
  const deck = decks.find(d => d.source === service);
  const out: AgreedState = {};
  for (const c of deck?.cards ?? []) {
    if (c.source === service && c.externalId) out[c.externalId] = c.completed ? 'closed' : 'open';
  }
  return out;
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
