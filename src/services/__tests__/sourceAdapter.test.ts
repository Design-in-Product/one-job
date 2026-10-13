// R3.1: the SourceAdapter seam, proven by a demo adapter before any real
// service (import first, then sync — Item 11; every source lands
// read-only before earning write access).
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalTaskStore } from '../localTaskStore';
import { DemoSourceAdapter, importFromSource, syncFromSource, type SourceAdapter, type ExternalCard } from '../sourceAdapter';

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

// Cross-pollination 2026-09-14 (Klatch round 205): "a plan that records a
// LABEL but re-resolves the KEY can silently bind the wrong record —
// pin the id the plan chose." Our version: importFromSource bound its
// destination deck by NAME (`d.name === adapter.service`), and deck
// names are user-renameable and non-unique. Two live consequences,
// both silent:
//   1. Rename the "github" deck → the next import can't find it, makes
//      a NEW one, seeds dedupe from that empty deck, and re-imports
//      every previously-imported card as a duplicate.
//   2. Name any deck "github" → the import binds to whichever sorts
//      first, appending foreign cards into the user's own deck.
// Fix: bind by a stamped key (deck.source), adopting legacy
// name-matched decks once so this heals in place.
describe('source binding is by KEY, not by label (renameable names are not identity)', () => {
  let store: LocalTaskStore;
  beforeEach(() => {
    localStorage.clear();
    store = new LocalTaskStore('test-source-binding');
  });

  const adapter = (cards: { externalId: string; title: string; completed?: boolean }[]) => ({
    service: 'github',
    fetchCards: async () => cards.map(c => ({ ...c, completed: c.completed ?? false })),
  });

  it('survives the user renaming the source deck — no duplicate re-import', async () => {
    const first = await importFromSource(store, adapter([
      { externalId: 'gh-1', title: 'Issue one' },
      { externalId: 'gh-2', title: 'Issue two' },
    ]));
    expect(first.imported).toBe(2);

    const decks = await store.getDecks();
    const ghDeck = decks.find(d => d.name === 'github')!;
    await store.renameDeck(ghDeck.id, 'Work stuff');

    const second = await importFromSource(store, adapter([
      { externalId: 'gh-1', title: 'Issue one' },
      { externalId: 'gh-2', title: 'Issue two' },
      { externalId: 'gh-3', title: 'Issue three' },
    ]));
    expect(second.imported).toBe(1);               // only the new one
    expect((await store.getDecks()).filter(d => d.name === 'github')).toHaveLength(0);
    const renamed = (await store.getDecks()).find(d => d.id === ghDeck.id)!;
    expect(renamed.cards).toHaveLength(3);          // all three in the SAME deck
  });

  it('never hijacks a user deck that merely shares the name', async () => {
    // user makes their own deck called "github" BEFORE any import
    const mine = await store.createDeck('github');
    await store.switchDeck(mine.id);
    await store.createTask('My own card');

    await importFromSource(store, adapter([{ externalId: 'gh-1', title: 'Imported issue' }]));

    const after = await store.getDecks();
    const userDeck = after.find(d => d.id === mine.id)!;
    expect(userDeck.cards.map(c => c.title)).toEqual(['My own card']); // untouched
    const sourceDeck = after.find(d => d.id !== mine.id && d.cards.some(c => c.source === 'github'));
    expect(sourceDeck).toBeTruthy();
  });
});

// The binding must survive a backup round-trip — a key that doesn't
// persist through export/import would silently revert to the
// name-matching behavior it replaced, on exactly the machine a user
// restores onto.
describe('source binding survives export → import', () => {
  it('restores with the deck still bound to its service', async () => {
    const store = new LocalTaskStore('test-binding-roundtrip');
    localStorage.clear();
    const fresh = new LocalTaskStore('test-binding-roundtrip');
    await importFromSource(fresh, {
      service: 'github',
      fetchCards: async () => [{ externalId: 'gh-1', title: 'Issue', completed: false }],
    });
    const decks = await fresh.getDecks();
    const backup = { decks: JSON.parse(JSON.stringify(decks)) };

    const target = new LocalTaskStore('test-binding-roundtrip-2');
    await target.importTasks(backup);
    const bound = (await target.getDecks()).find(d => d.source === 'github');
    expect(bound).toBeTruthy();
    expect(bound!.cards).toHaveLength(1);
    void store;
  });
});

// 2026-10-12, for Todoist: a deck is named after the list it mirrors
// while staying bound by the list's id, and sub-tasks land inside
// their card.
describe('SourceAdapter seam: deck name and sub-cards', () => {
  const adapterWith = (cards: import('../sourceAdapter').ExternalCard[]) => ({
    service: 'todoist:section:s1',
    deckName: 'My list',
    fetchCards: async () => cards,
  });

  it('names the deck from deckName and binds it by the service key', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    await importFromSource(store, adapterWith([{ externalId: 'a', title: 'A', completed: false }]));
    const deck = (await store.getDecks()).find(d => d.source === 'todoist:section:s1');
    expect(deck?.name).toBe('My list');
  });

  it('finds the same deck again after the user renames it', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    const first = await importFromSource(store, adapterWith([{ externalId: 'a', title: 'A', completed: false }]));
    await store.renameDeck!(first.deckId, 'Renamed by me');
    const second = await importFromSource(store, adapterWith([
      { externalId: 'a', title: 'A', completed: false },
      { externalId: 'b', title: 'B', completed: false },
    ]));
    expect(second.deckId).toBe(first.deckId);
    expect(second).toMatchObject({ imported: 1, skipped: 1 });
  });

  it('puts sub-cards in the card\'s interior deck, wearing provenance', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    await importFromSource(store, adapterWith([{
      externalId: 'p', title: 'Parent', completed: false,
      subcards: [
        { externalId: 'c1', title: 'Child one', completed: false },
        { externalId: 'c2', title: 'Child two', completed: false },
      ],
    }]));
    const deck = (await store.getDecks()).find(d => d.source === 'todoist:section:s1')!;
    const parent = deck.cards.find(c => c.externalId === 'p')!;
    expect(parent.decks).toHaveLength(1);
    expect(parent.decks![0].cards.map(c => c.title)).toEqual(['Child one', 'Child two']);
    expect(parent.decks![0].cards[0]).toMatchObject({ source: 'todoist:section:s1', externalId: 'c1' });
    expect(parent.decks![0].cards[0].id).not.toBe('c1');
  });
});

// Slice 3 (2026-10-13): sync after the first import. xian's rulings of
// 10-12: a new task lands on top; a task closed upstream goes to Done;
// the order follows the service only if the user chose that. One way:
// nothing here writes upstream.
describe('syncFromSource', () => {
  class Upstream implements SourceAdapter {
    readonly service = 'svc:list:1';
    readonly deckName = 'My list';
    open: ExternalCard[] = [];
    closed = new Set<string>();
    asked: string[][] = [];
    async fetchCards() { return [...this.open]; }
    async fetchClosed(ids: string[]) { this.asked.push(ids); return ids.filter(i => this.closed.has(i)); }
  }
  const ext = (id: string): ExternalCard => ({ externalId: id, title: id, completed: false });
  const setup = async (ids: string[]) => {
    localStorage.clear();
    const store = new LocalTaskStore('synctest');
    const up = new Upstream();
    up.open = ids.map(ext);
    await importFromSource(store, up);
    return { store, up };
  };
  const deckOf = async (store: LocalTaskStore) => (await store.getDecks()).find(d => d.source === 'svc:list:1')!;
  const openTitles = async (store: LocalTaskStore) =>
    [...(await deckOf(store)).cards].filter(c => !c.completed)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(c => c.title);

  it('first sync of an unconnected list is the import', async () => {
    localStorage.clear();
    const store = new LocalTaskStore('synctest');
    const up = new Upstream(); up.open = [ext('a'), ext('b')];
    const r = await syncFromSource(store, up, { order: 'onejob' });
    expect(r).toMatchObject({ added: 2, completed: 0 });
    expect(await openTitles(store)).toEqual(['a', 'b']);
  });

  it('a new task lands on top; the rest keep their order', async () => {
    const { store, up } = await setup(['a', 'b']);
    up.open = [ext('a'), ext('b'), ext('c')];
    const r = await syncFromSource(store, up, { order: 'onejob' });
    expect(r).toMatchObject({ added: 1, completed: 0, reordered: false });
    expect(await openTitles(store)).toEqual(['c', 'a', 'b']);
  });

  it('a task closed upstream goes to Done here and is not removed', async () => {
    const { store, up } = await setup(['a', 'b']);
    up.open = [ext('b')]; up.closed.add('a');
    const r = await syncFromSource(store, up, { order: 'onejob' });
    expect(r.completed).toBe(1);
    const deck = await deckOf(store);
    expect(deck.cards).toHaveLength(2);
    expect(deck.cards.find(c => c.title === 'a')!.completed).toBe(true);
  });

  it('a task that is merely gone from the list (moved or deleted) is left alone', async () => {
    const { store, up } = await setup(['a', 'b']);
    up.open = [ext('b')]; // 'a' is missing but NOT closed
    const r = await syncFromSource(store, up, { order: 'onejob' });
    expect(up.asked).toEqual([['a']]);
    expect(r.completed).toBe(0);
    expect(await openTitles(store)).toEqual(['a', 'b']);
  });

  it('an adapter that cannot say what closed completes nothing', async () => {
    const { store, up } = await setup(['a', 'b']);
    up.open = [];
    (up as { fetchClosed?: unknown }).fetchClosed = undefined;
    const r = await syncFromSource(store, up, { order: 'onejob' });
    expect(r.completed).toBe(0);
    expect(await openTitles(store)).toEqual(['a', 'b']);
  });

  it("keeps the user's own order by default", async () => {
    const { store, up } = await setup(['a', 'b', 'c']);
    const deck = await deckOf(store);
    await store.switchDeck(deck.id);
    await store.deferTask(deck.cards.find(c => c.title === 'a')!.id); // Later: a to the bottom
    await syncFromSource(store, up, { order: 'onejob' });
    expect(await openTitles(store)).toEqual(['b', 'c', 'a']);
  });

  it("follows the service's order when the user chose that", async () => {
    const { store, up } = await setup(['a', 'b', 'c']);
    const deck = await deckOf(store);
    await store.switchDeck(deck.id);
    await store.deferTask(deck.cards.find(c => c.title === 'a')!.id);
    const r = await syncFromSource(store, up, { order: 'source' });
    expect(r.reordered).toBe(true);
    expect(await openTitles(store)).toEqual(['a', 'b', 'c']);
  });

  it('survives a reload: the result is saved', async () => {
    const { store, up } = await setup(['a']);
    up.open = [ext('a'), ext('b')];
    await syncFromSource(store, up, { order: 'onejob' });
    expect(await openTitles(new LocalTaskStore('synctest'))).toEqual(['b', 'a']);
  });

  it('a failed fetch changes nothing', async () => {
    const { store, up } = await setup(['a', 'b']);
    up.fetchCards = async () => { throw new Error('Todoist refused the request: 401'); };
    await expect(syncFromSource(store, up, { order: 'source' })).rejects.toThrow('401');
    expect(await openTitles(store)).toEqual(['a', 'b']);
  });
});
