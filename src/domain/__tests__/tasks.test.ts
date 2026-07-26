// Tests for the pure domain layer. These pin today's exact rules so the
// R1 rebuild (recursive cards, lifecycle decks) changes behavior only on
// purpose, never by accident.

import { describe, it, expect } from 'vitest';
import { Task } from '@/types/task';
import { reviveTask, sortTasks, nextSortOrder, applyCompletion, applyDeferral } from '../tasks';

const mk = (over: Partial<Task>): Task => ({
  id: over.id ?? Math.random().toString(36).slice(2),
  title: 'T',
  completed: false,
  createdAt: new Date('2026-01-01'),
  ...over
});

describe('sortTasks', () => {
  it('puts active before completed, active by sortOrder, completed newest-first', () => {
    const done1 = mk({ id: 'd1', completed: true, completedAt: new Date('2026-02-01') });
    const done2 = mk({ id: 'd2', completed: true, completedAt: new Date('2026-03-01') });
    const a2 = mk({ id: 'a2', sortOrder: 2 });
    const a1 = mk({ id: 'a1', sortOrder: 1 });
    expect(sortTasks([done1, a2, done2, a1]).map(t => t.id)).toEqual(['a1', 'a2', 'd2', 'd1']);
  });

  it('treats missing sortOrder as 0 and missing completedAt as oldest', () => {
    const noOrder = mk({ id: 'n' });
    const ordered = mk({ id: 'o', sortOrder: 1 });
    const doneNoDate = mk({ id: 'dn', completed: true });
    const doneDated = mk({ id: 'dd', completed: true, completedAt: new Date('2026-02-01') });
    expect(sortTasks([ordered, doneNoDate, doneDated, noOrder]).map(t => t.id))
      .toEqual(['n', 'o', 'dd', 'dn']);
  });
});

describe('nextSortOrder', () => {
  it('is 1 for an empty or fully-completed deck', () => {
    expect(nextSortOrder([])).toBe(1);
    expect(nextSortOrder([mk({ completed: true, sortOrder: 9 })])).toBe(1);
  });

  it('is one past the deepest active card, ignoring completed ones', () => {
    expect(nextSortOrder([
      mk({ sortOrder: 3 }),
      mk({ sortOrder: 7 }),
      mk({ completed: true, sortOrder: 99 })
    ])).toBe(8);
  });
});

describe('applyCompletion / applyDeferral', () => {
  it('completion sets the full done shape', () => {
    const t = applyCompletion(mk({}));
    expect(t.completed).toBe(true);
    expect(t.status).toBe('done');
    expect(t.completedAt).toBeInstanceOf(Date);
  });

  it('deferral sends the card to the bottom and counts', () => {
    const deck = [mk({ id: 'x', sortOrder: 1 }), mk({ sortOrder: 2 })];
    const t = applyDeferral(deck[0], deck);
    expect(t.sortOrder).toBe(3);
    expect(t.deferralCount).toBe(1);
    expect(t.deferredAt).toBeInstanceOf(Date);
    applyDeferral(deck[0], deck);
    expect(deck[0].deferralCount).toBe(2);
  });
});

describe('reviveTask', () => {
  it('revives dates recursively through substacks', () => {
    const revived = reviveTask(JSON.parse(JSON.stringify(mk({
      completedAt: new Date('2026-02-02'),
      decks: [{
        id: 's', name: 'S', createdAt: new Date('2026-01-05'),
        cards: [mk({ deferredAt: new Date('2026-01-06') })]
      }]
    }))));
    expect(revived.createdAt).toBeInstanceOf(Date);
    expect(revived.completedAt).toBeInstanceOf(Date);
    expect(revived.decks![0].createdAt).toBeInstanceOf(Date);
    expect(revived.decks![0].cards[0].deferredAt).toBeInstanceOf(Date);
  });
});

describe('flattenWithParent (chain rooms gather cards from every depth)', () => {
  it('walks the whole tree, tagging each card with its parent card', async () => {
    const { flattenWithParent } = await import('../tasks');
    const now = new Date();
    const mk = (id: string, extra: object = {}): Task =>
      ({ id, title: id, completed: false, createdAt: now, sortOrder: 1, ...extra });
    const tree: Task[] = [
      mk('top1', { decks: [{ id: 'd1', name: null, createdAt: now, cards: [
        mk('sub1'),
        mk('sub2', { decks: [{ id: 'd2', name: null, createdAt: now, cards: [mk('subsub1')] }] }),
      ]}]}),
      mk('top2'),
    ];
    const flat = flattenWithParent(tree);
    expect(flat.map(e => `${e.card.id}<${e.parent?.id ?? ''}`)).toEqual([
      'top1<', 'sub1<top1', 'sub2<top1', 'subsub1<sub2', 'top2<',
    ]);
  });
});

describe('reachableMoveTargets (you can only move where you could navigate)', () => {
  const deck = (id: string, cards: Task[]) =>
    ({ id, name: null, createdAt: new Date('2026-01-01'), cards });

  it('excludes the moving card and its whole subtree (no cycles)', async () => {
    const { reachableMoveTargets } = await import('../tasks');
    const moving = mk({ id: 'move', decks: [deck('d', [mk({ id: 'child' })])] });
    const tree: Task[] = [moving, mk({ id: 'other' })];
    expect(reachableMoveTargets(tree, moving).map(t => t.card.id)).toEqual(['other']);
  });

  it('excludes completed cards AND everything nested inside them', async () => {
    const { reachableMoveTargets } = await import('../tasks');
    // "crumlish .me" (done) holds "Layers of Meta" (active) — the real
    // 2026-07-26 shape. Neither may be offered as a move target: the done
    // card is hidden from the deck, so nothing under it is reachable.
    const done = mk({ id: 'crumlish', completed: true, decks: [
      deck('bd', [mk({ id: 'layers' })]),
    ]});
    const moving = mk({ id: 'move' });
    const tree: Task[] = [
      mk({ id: 'parent', decks: [deck('pd', [done, mk({ id: 'active-sib' })])] }),
      moving,
    ];
    const ids = reachableMoveTargets(tree, moving).map(t => t.card.id);
    expect(ids).toContain('parent');
    expect(ids).toContain('active-sib');
    expect(ids).not.toContain('crumlish'); // done → hidden
    expect(ids).not.toContain('layers');   // buried under a done card
  });

  it('reports indent depth, descending only through active cards', async () => {
    const { reachableMoveTargets } = await import('../tasks');
    const tree: Task[] = [
      mk({ id: 'top', decks: [deck('d', [mk({ id: 'sub' })])] }),
    ];
    const moving = mk({ id: 'move' });
    const targets = reachableMoveTargets([...tree, moving], moving);
    expect(targets.find(t => t.card.id === 'top')?.depth).toBe(0);
    expect(targets.find(t => t.card.id === 'sub')?.depth).toBe(1);
  });
});

describe('unfinishedDescendants (a card is not done until its whole subtree is)', () => {
  const deck = (id: string, cards: Task[]) =>
    ({ id, name: null, createdAt: new Date('2026-01-01'), cards });

  it('finds unfinished work at any depth, even beneath a completed child', async () => {
    const { unfinishedDescendants } = await import('../tasks');
    // parent > [doneChild(completed) > [activeGrandchild]] — the shallow
    // "direct children only" check would MISS activeGrandchild and let the
    // parent complete, burying it. This is the 2026-07-26 regression.
    const card = mk({ id: 'parent', decks: [deck('d', [
      mk({ id: 'doneChild', completed: true, decks: [deck('dd', [mk({ id: 'activeGrandchild' })])] }),
    ])]});
    expect(unfinishedDescendants(card).map(c => c.id)).toEqual(['activeGrandchild']);
  });

  it('is empty when the whole subtree is done', async () => {
    const { unfinishedDescendants } = await import('../tasks');
    const card = mk({ id: 'p', decks: [deck('d', [mk({ id: 'c', completed: true })])] });
    expect(unfinishedDescendants(card)).toEqual([]);
  });
});
