// What a sync may do to a deck (xian's rulings, 2026-10-12): a new
// task lands on top; a task closed upstream goes to Done; the order
// follows the service only if the user chose that. Nothing is ever
// removed.
import { describe, it, expect } from 'vitest';
import { applySourceSync } from '../sourceSync';
import { sortTasks } from '../tasks';
import type { Task } from '@/types/task';

const card = (id: string, over: Partial<Task> = {}): Task => ({
  id, title: id, completed: false, createdAt: new Date(0), ...over,
});
const order = (cards: Task[]) => sortTasks([...cards]).filter(c => !c.completed).map(c => c.id);

describe('applySourceSync', () => {
  it('puts new cards on top, in the order given, above everything', () => {
    const cards = [card('a', { sortOrder: -3 }), card('b', { sortOrder: 2 })];
    const r = applySourceSync(cards, { add: [card('n1'), card('n2')], completeIds: [] });
    expect(order(cards)).toEqual(['n1', 'n2', 'a', 'b']);
    expect(r).toMatchObject({ added: 2, completed: 0, held: 0 });
  });

  it("keeps One Job's order when no order is given, even with ties", () => {
    const cards = [card('a'), card('b'), card('c')]; // an import: no sortOrder at all
    applySourceSync(cards, { add: [], completeIds: [] });
    expect(order(cards)).toEqual(['a', 'b', 'c']);
  });

  it('marks a card Done and removes nothing', () => {
    const cards = [card('a'), card('b')];
    const r = applySourceSync(cards, { add: [], completeIds: ['a'] });
    expect(cards).toHaveLength(2);
    expect(cards.find(c => c.id === 'a')).toMatchObject({ completed: true, status: 'done' });
    expect(cards.find(c => c.id === 'a')!.completedAt).toBeInstanceOf(Date);
    expect(order(cards)).toEqual(['b']);
    expect(r.completed).toBe(1);
  });

  it('does not touch a card that is already Done, or an id it does not know', () => {
    const when = new Date(5);
    const cards = [card('a', { completed: true, completedAt: when })];
    const r = applySourceSync(cards, { add: [], completeIds: ['a', 'ghost'] });
    expect(cards[0].completedAt).toBe(when);
    expect(r.completed).toBe(0);
  });

  it('holds back a card with unfinished cards inside it, and says so', () => {
    const inside = card('in');
    const cards = [card('a', { decks: [{ id: 'd', name: null, cards: [inside], createdAt: new Date(0) }] })];
    const r = applySourceSync(cards, { add: [], completeIds: ['a'] });
    expect(cards[0].completed).toBe(false);
    expect(r).toMatchObject({ completed: 0, held: 1 });
  });

  it("with an order: the service's cards take the service's order, in the places they already held", () => {
    // mine1 and mine2 are the user's own cards in the same deck.
    const cards = [card('mine1'), card('x'), card('mine2'), card('y'), card('z')];
    const r = applySourceSync(cards, { add: [], completeIds: [], order: ['z', 'y', 'x'] });
    expect(order(cards)).toEqual(['mine1', 'z', 'mine2', 'y', 'x']);
    expect(r.reordered).toBe(true);
  });

  it('with an order: a new card goes where the service has it, not on top', () => {
    const cards = [card('x'), card('y')];
    applySourceSync(cards, { add: [card('n')], completeIds: [], order: ['x', 'n', 'y'] });
    expect(order(cards)).toEqual(['x', 'n', 'y']);
  });

  it('reports reordered false when the order already matches', () => {
    const cards = [card('x'), card('y')];
    expect(applySourceSync(cards, { add: [], completeIds: [], order: ['x', 'y'] }).reordered).toBe(false);
  });
});
