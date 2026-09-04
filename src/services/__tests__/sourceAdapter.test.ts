// R3.1: the SourceAdapter seam, proven by a demo adapter before any real
// service (import first, then sync — Item 11; every source lands
// read-only before earning write access).
import { describe, it, expect } from 'vitest';
import { LocalTaskStore } from '../localTaskStore';
import { DemoSourceAdapter, importFromSource } from '../sourceAdapter';

const KEY = 'sourcetest';

describe('SourceAdapter seam (R3.1)', () => {
  it('imports into a root deck named for the service, cards wearing provenance', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    await store.createTask('my own card');
    const adapter = new DemoSourceAdapter();
    const result = await importFromSource(store, adapter);
    expect(result.imported).toBeGreaterThan(0);

    const decks = await store.getDecks();
    const sourceDeck = decks.find(d => d.name === 'demo');
    expect(sourceDeck).toBeDefined();
    const card = sourceDeck!.cards[0];
    expect(card.source).toBe('demo');
    expect(card.externalId).toBeTruthy();
    // the user's own deck untouched
    expect(decks[0].cards.map(c => c.title)).toEqual(['my own card']);
  });

  it('is idempotent by provenance: re-import skips cards already present', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    const adapter = new DemoSourceAdapter();
    const first = await importFromSource(store, adapter);
    const second = await importFromSource(store, adapter);
    expect(second.imported).toBe(0);
    expect(second.skipped).toBe(first.imported);
    const sourceDeck = (await store.getDecks()).find(d => d.name === 'demo')!;
    expect(sourceDeck.cards).toHaveLength(first.imported);
  });

  it('new upstream cards join the existing source deck on later imports', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    const adapter = new DemoSourceAdapter();
    await importFromSource(store, adapter);
    adapter.addUpstream({ externalId: 'ext-new', title: 'late arrival', completed: false });
    const again = await importFromSource(store, adapter);
    expect(again.imported).toBe(1);
    const sourceDeck = (await store.getDecks()).find(d => d.name === 'demo')!;
    expect(sourceDeck.cards.some(c => c.externalId === 'ext-new')).toBe(true);
    expect((await store.getDecks()).filter(d => d.name === 'demo')).toHaveLength(1);
  });

  it('imported ids are LOCAL (regenerated) — provenance is the only upstream identity', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    const adapter = new DemoSourceAdapter();
    await importFromSource(store, adapter);
    const sourceDeck = (await store.getDecks()).find(d => d.name === 'demo')!;
    for (const c of sourceDeck.cards) {
      expect(c.id).not.toBe(c.externalId); // the shadow-import lesson, upheld
    }
  });
});

// 2026-09-04, from the cross-pollination brief: "hoisting a lookup out of
// a loop silently breaks dedup if the loop creates what it's looking up."
// Our `known` set is built from deck.cards BEFORE the loop and was never
// updated as the loop pushed new cards — so two entries sharing an
// externalId inside ONE feed both passed the check. Realistic trigger:
// paginated fetches overlap when upstream data changes mid-fetch, which
// is exactly how the GitHub adapter reads issues across all repos.
describe('within-batch dedupe (the snapshot-stale trap)', () => {
  class DuplicateFeedAdapter {
    service = 'dupes';
    async fetchCards() {
      return [
        { externalId: 'ext-1', title: 'Appears twice in one feed', completed: false },
        { externalId: 'ext-2', title: 'Ordinary', completed: false },
        { externalId: 'ext-1', title: 'Appears twice in one feed', completed: false },
      ];
    }
  }

  it('imports a repeated externalId only once within a single feed', async () => {
    localStorage.clear();
    const store = new LocalTaskStore('dupetest');
    const result = await importFromSource(store, new DuplicateFeedAdapter() as never);

    const deck = (await store.getDecks()).find(d => d.name === 'dupes')!;
    const ids = deck.cards.map(c => c.externalId);
    expect(ids).toEqual(['ext-1', 'ext-2']);
    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(1);
  });

  it('stays idempotent across a re-import of the same duplicate-bearing feed', async () => {
    localStorage.clear();
    const store = new LocalTaskStore('dupetest2');
    const adapter = new DuplicateFeedAdapter() as never;
    await importFromSource(store, adapter);
    const second = await importFromSource(store, adapter);
    expect(second.imported).toBe(0);
    const deck = (await store.getDecks()).find(d => d.name === 'dupes')!;
    expect(deck.cards).toHaveLength(2);
  });
});
