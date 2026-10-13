// xian, 2026-10-13 (items 46 and 47): a deck is removed only when
// empty, with a "move all cards" step to empty it; and a whole deck
// can move into a card, so decks don't pile up.
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalTaskStore } from '../localTaskStore';

const KEY = 'deckremovaltest';
const openTitles = (cards: { title: string; completed: boolean; sortOrder?: number }[]) =>
  cards.map((c, i) => ({ c, i })).filter(x => !x.c.completed)
    .sort((a, b) => (a.c.sortOrder ?? 0) - (b.c.sortOrder ?? 0) || a.i - b.i).map(x => x.c.title);

/** Home: h1 (top), h2.  Work: w1 (top), w2, plus w-done (completed). */
const setup = async () => {
  localStorage.clear();
  const store = new LocalTaskStore(KEY);
  const home = (await store.getDecks())[0];
  await store.createTask('h2'); await store.createTask('h1');
  const work = await store.createDeck('Work');
  await store.switchDeck(work.id);
  const done = await store.createTask('w-done'); await store.completeTask(done.id);
  await store.createTask('w2'); await store.createTask('w1');
  return { store, home, work };
};
const deck = async (store: LocalTaskStore, id: string) => (await store.getDecks()).find(d => d.id === id);

beforeEach(() => localStorage.clear());

describe('moveAllCardsToDeck', () => {
  it('moves every card, done ones too, and leaves the deck empty but present', async () => {
    const { store, home, work } = await setup();
    expect(await store.moveAllCardsToDeck(work.id, home.id)).toBe(3);
    expect((await deck(store, work.id))!.cards).toEqual([]);
    const h = (await deck(store, home.id))!;
    expect(h.cards).toHaveLength(5);
    expect(h.cards.find(c => c.title === 'w-done')!.completed).toBe(true);
  });

  it('lands them on top, in the order they had', async () => {
    const { store, home, work } = await setup();
    await store.moveAllCardsToDeck(work.id, home.id);
    expect(openTitles((await deck(store, home.id))!.cards)).toEqual(['w1', 'w2', 'h1', 'h2']);
  });

  it('is saved, and undone in one step', async () => {
    const { store, home, work } = await setup();
    await store.moveAllCardsToDeck(work.id, home.id);
    expect((await new LocalTaskStore(KEY).getDecks()).find(d => d.id === home.id)!.cards).toHaveLength(5);
    await store.undoLast();
    expect((await deck(store, work.id))!.cards).toHaveLength(3);
    expect((await deck(store, home.id))!.cards).toHaveLength(2);
  });

  it('refuses the same deck, and an unknown one', async () => {
    const { store, work } = await setup();
    await expect(store.moveAllCardsToDeck(work.id, work.id)).rejects.toThrow();
    await expect(store.moveAllCardsToDeck(work.id, 'nope')).rejects.toThrow();
    expect((await deck(store, work.id))!.cards).toHaveLength(3);
  });

  it('then the empty deck can be deleted; a deck with cards still cannot', async () => {
    const { store, home, work } = await setup();
    await expect(store.deleteDeck(work.id)).rejects.toThrow(/still holds cards/);
    await store.moveAllCardsToDeck(work.id, home.id);
    await store.deleteDeck(work.id);
    expect(await deck(store, work.id)).toBeUndefined();
    expect((await deck(store, home.id))!.cards).toHaveLength(5);
  });
});

describe('moveDeckIntoCard', () => {
  it('into an existing card: the deck becomes a deck inside it, name and cards kept', async () => {
    const { store, home, work } = await setup();
    const h1 = (await deck(store, home.id))!.cards.find(c => c.title === 'h1')!;
    const card = await store.moveDeckIntoCard(work.id, { cardId: h1.id });
    expect(card.id).toBe(h1.id);
    expect(await deck(store, work.id)).toBeUndefined();
    const inside = (await deck(store, home.id))!.cards.find(c => c.id === h1.id)!.decks!;
    expect(inside).toHaveLength(1);
    expect(inside[0].name).toBe('Work');
    // interior decks are ordered by position: top first, done cards kept
    expect(inside[0].cards.map(c => c.title)).toEqual(['w1', 'w2', 'w-done']);
  });

  it('into a card that already holds a deck: added beside it, not merged', async () => {
    const { store, home, work } = await setup();
    await store.switchDeck(home.id);
    const h1 = (await store.getAllTasks()).find(c => c.title === 'h1')!;
    const own = await store.createSubstack(h1.id, null);
    await store.addSubstackTask(own.id, 'already inside');
    await store.moveDeckIntoCard(work.id, { cardId: h1.id });
    const inside = (await deck(store, home.id))!.cards.find(c => c.id === h1.id)!.decks!;
    expect(inside.map(d => [d.name, d.cards.length])).toEqual([[null, 1], ['Work', 3]]);
  });

  it('into a new card: a card named for the deck, on top of the chosen deck', async () => {
    const { store, home, work } = await setup();
    const card = await store.moveDeckIntoCard(work.id, { newCardInDeckId: home.id });
    expect(card.title).toBe('Work');
    const h = (await deck(store, home.id))!;
    expect(openTitles(h.cards)).toEqual(['Work', 'h1', 'h2']);
    expect(h.cards.find(c => c.id === card.id)!.decks![0].cards).toHaveLength(3);
    expect(await deck(store, work.id)).toBeUndefined();
  });

  it('no card is lost: the count is the same before and after', async () => {
    const { store, home, work } = await setup();
    const count = (cards: { decks?: { cards: unknown[] }[] }[]): number =>
      cards.reduce((n, c) => n + 1 + (c.decks ?? []).reduce((m, d) => m + count(d.cards as never), 0), 0);
    const before = (await store.getDecks()).reduce((n, d) => n + count(d.cards), 0);
    await store.moveDeckIntoCard(work.id, { newCardInDeckId: home.id });
    const after = (await store.getDecks()).reduce((n, d) => n + count(d.cards), 0);
    expect(after).toBe(before + 1); // the one new card that holds the deck
  });

  it('moves you off the deck if you were on it, and is undone in one step', async () => {
    const { store, home, work } = await setup(); // active: Work
    await store.moveDeckIntoCard(work.id, { newCardInDeckId: home.id });
    expect(store.activeDeckId()).toBe(home.id);
    await store.undoLast();
    expect((await deck(store, work.id))!.cards).toHaveLength(3);
    expect((await deck(store, home.id))!.cards).toHaveLength(2);
  });

  it('refuses a card inside the deck being moved, the same deck, and a done card', async () => {
    const { store, home, work } = await setup();
    const w1 = (await deck(store, work.id))!.cards.find(c => c.title === 'w1')!;
    await expect(store.moveDeckIntoCard(work.id, { cardId: w1.id })).rejects.toThrow(/inside the deck/);
    await expect(store.moveDeckIntoCard(work.id, { newCardInDeckId: work.id })).rejects.toThrow();
    await store.switchDeck(home.id);
    const h1 = (await store.getAllTasks()).find(c => c.title === 'h1')!;
    await store.completeTask(h1.id);
    await expect(store.moveDeckIntoCard(work.id, { cardId: h1.id })).rejects.toThrow(/finished/);
    expect((await deck(store, work.id))!.cards).toHaveLength(3);
  });

  it('refuses a deck attached to a service: detach it first', async () => {
    const { store, home, work } = await setup();
    await store.bindDeckSource(work.id, 'todoist:project:p1');
    await expect(store.moveDeckIntoCard(work.id, { newCardInDeckId: home.id })).rejects.toThrow(/[Dd]etach/);
  });
});
