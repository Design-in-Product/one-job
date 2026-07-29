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
