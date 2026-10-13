// Detaching an integration (xian, 2026-10-13): "an offer to delete the
// attached deck -or- to leave it detached as an ordinary deck (no
// ability to re-attach implied)".
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalTaskStore } from '../localTaskStore';
import { DemoSourceAdapter, importFromSource } from '../sourceAdapter';

// Named apart from its key, as a Todoist list is.
class Named extends DemoSourceAdapter { readonly deckName = 'My list'; }

const KEY = 'detachtest';
const setup = async () => {
  localStorage.clear();
  const store = new LocalTaskStore(KEY);
  await store.createTask('my own card');
  const { deckId } = await importFromSource(store, new Named());
  return { store, deckId };
};

describe('unbindDeckSource: leave it as an ordinary deck', () => {
  it('clears the binding and keeps every card', async () => {
    const { store, deckId } = await setup();
    await store.unbindDeckSource(deckId);
    const deck = (await new LocalTaskStore(KEY).getDecks()).find(d => d.id === deckId)!;
    expect(deck.source).toBeUndefined();
    expect(deck.cards).toHaveLength(3);
  });

  it('is not re-attached by a later import: that makes a new deck', async () => {
    const { store, deckId } = await setup();
    await store.unbindDeckSource(deckId);
    const again = await importFromSource(store, new Named());
    expect(again.deckId).not.toBe(deckId);
    expect((await store.getDecks()).find(d => d.id === deckId)!.cards).toHaveLength(3);
  });
});

describe('deleteSourceDeck: delete the attached deck', () => {
  it('removes the deck and its cards, and nothing else', async () => {
    const { store, deckId } = await setup();
    const removed = await store.deleteSourceDeck(deckId);
    expect(removed).toBe(3);
    const decks = await new LocalTaskStore(KEY).getDecks();
    expect(decks.some(d => d.id === deckId)).toBe(false);
    expect(decks.flatMap(d => d.cards).map(c => c.title)).toEqual(['my own card']);
  });

  it("refuses a deck that is not attached to a service: the user's own decks keep the empty-only rule", async () => {
    const { store } = await setup();
    const own = (await store.getDecks())[0];
    await expect(store.deleteSourceDeck(own.id)).rejects.toThrow(/not attached/);
    expect((await store.getDecks())[0].cards).toHaveLength(1);
  });

  it('moves you to another deck if you were on the one removed', async () => {
    const { store, deckId } = await setup();
    await store.switchDeck(deckId);
    await store.deleteSourceDeck(deckId);
    expect(store.activeDeckId()).not.toBe(deckId);
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['my own card']);
  });

  it('can be undone in the same session', async () => {
    const { store, deckId } = await setup();
    await store.deleteSourceDeck(deckId);
    expect(await store.undoLast()).toBe(true);
    expect((await store.getDecks()).find(d => d.id === deckId)!.cards).toHaveLength(3);
  });

  it('refuses to remove the last deck', async () => {
    localStorage.clear();
    const store = new LocalTaskStore(KEY);
    const only = (await store.getDecks())[0];
    await store.bindDeckSource(only.id, 'demo');
    await expect(store.deleteSourceDeck(only.id)).rejects.toThrow(/last deck/);
  });
});
