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

describe('activeSiblingTargets (move-into = push to a sibling; promote = pop)', () => {
  const deck = (id: string, cards: Task[]) =>
    ({ id, name: null, createdAt: new Date('2026-01-01'), cards });

  it('offers only the active peers of the same deck, excluding self', async () => {
    const { activeSiblingTargets } = await import('../tasks');
    const moving = mk({ id: 'move' });
    const tree: Task[] = [
      mk({ id: 'parent', decks: [deck('pd', [
        moving,
        mk({ id: 'active-sib' }),
        mk({ id: 'done-sib', completed: true }), // sealed — never a target
      ])] }),
      mk({ id: 'elsewhere' }), // not a sibling — not offered
    ];
    expect(activeSiblingTargets(tree, moving).map(c => c.id)).toEqual(['active-sib']);
  });

  it("treats top-level cards as each other's siblings", async () => {
    const { activeSiblingTargets } = await import('../tasks');
    const moving = mk({ id: 'move' });
    const tree: Task[] = [
      moving,
      mk({ id: 'peer' }),
      mk({ id: 'done-peer', completed: true }),
    ];
    expect(activeSiblingTargets(tree, moving).map(c => c.id)).toEqual(['peer']);
  });

  it('returns empty when the moving card is the only active card in its deck', async () => {
    const { activeSiblingTargets } = await import('../tasks');
    const moving = mk({ id: 'move' });
    const tree: Task[] = [
      mk({ id: 'parent', decks: [deck('pd', [moving, mk({ id: 'done', completed: true })])] }),
    ];
    expect(activeSiblingTargets(tree, moving)).toEqual([]);
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

describe('pathToUnfinished (the block is the reveal, at ANY depth — item 7)', () => {
  const mk = (over: Partial<Task>): Task => ({
    id: 'x', title: 't', completed: false, createdAt: new Date('2026-07-01'), ...over,
  } as Task);

  it('one level: returns the deck holding a direct unfinished child', async () => {
    const { pathToUnfinished } = await import('../tasks');
    const deck = { id: 'd1', name: null, createdAt: new Date(), cards: [mk({ id: 'open', title: 'open child' })] };
    const parent = mk({ id: 'p', decks: [deck] });
    const path = pathToUnfinished(parent);
    expect(path.map(l => l.deck.id)).toEqual(['d1']);
    expect(path[0].parent.id).toBe('p');
  });

  it('deep: walks THROUGH a completed child to the deck holding the buried card', async () => {
    const { pathToUnfinished } = await import('../tasks');
    const inner = { id: 'd2', name: null, createdAt: new Date(), cards: [mk({ id: 'buried', title: 'buried open' })] };
    const doneChild = mk({ id: 'c', completed: true, completedAt: new Date(), decks: [inner] });
    const outer = { id: 'd1', name: null, createdAt: new Date(), cards: [doneChild] };
    const parent = mk({ id: 'p', decks: [outer] });
    const path = pathToUnfinished(parent);
    expect(path.map(l => `${l.parent.id}>${l.deck.id}`)).toEqual(['p>d1', 'c>d2']);
  });

  it('prefers a deck with a DIRECT open child over one that is only deep', async () => {
    const { pathToUnfinished } = await import('../tasks');
    const deepInner = { id: 'dd', name: null, createdAt: new Date(), cards: [mk({ id: 'deep' })] };
    const deepChild = mk({ id: 'dc', completed: true, completedAt: new Date(), decks: [deepInner] });
    const deckDeep = { id: 'd1', name: null, createdAt: new Date(), cards: [deepChild] };
    const deckDirect = { id: 'd2', name: null, createdAt: new Date(), cards: [mk({ id: 'direct' })] };
    const parent = mk({ id: 'p', decks: [deckDeep, deckDirect] });
    expect(pathToUnfinished(parent).map(l => l.deck.id)).toEqual(['d2']);
  });

  it('empty when the whole subtree is done', async () => {
    const { pathToUnfinished } = await import('../tasks');
    const deck = { id: 'd', name: null, createdAt: new Date(),
      cards: [mk({ id: 'done', completed: true, completedAt: new Date() })] };
    expect(pathToUnfinished(mk({ id: 'p', decks: [deck] }))).toEqual([]);
  });
});

describe('inchwormWalk (R2.7: one walkable stack, leaves first)', () => {
  const mk = (over: Partial<Task>): Task => ({
    id: 'x', title: 't', completed: false, createdAt: new Date('2026-07-01'), ...over,
  } as Task);

  it('walks post-order: interior cards surface BEFORE their parents', async () => {
    const { inchwormWalk } = await import('../tasks');
    const tree = [
      mk({ id: 'p', title: 'parent', sortOrder: 0, decks: [{
        id: 'd', name: null, createdAt: new Date(),
        cards: [
          mk({ id: 'c1', title: 'child one' }),
          mk({ id: 'c2', title: 'child two', decks: [{
            id: 'd2', name: null, createdAt: new Date(),
            cards: [mk({ id: 'g', title: 'grandchild' })],
          }] }),
        ],
      }] }),
      mk({ id: 'q', title: 'plain', sortOrder: 1 }),
    ];
    const walk = inchwormWalk(tree);
    // Item 15 harmony: by the time a parent surfaces, its interior is done
    expect(walk.map(w => w.card.id)).toEqual(['c1', 'g', 'c2', 'p', 'q']);
  });

  it('excludes completed/archived/trashed cards — only the living walk', async () => {
    const { inchwormWalk } = await import('../tasks');
    const tree = [
      mk({ id: 'p', title: 'parent', decks: [{
        id: 'd', name: null, createdAt: new Date(),
        cards: [
          mk({ id: 'done', completed: true, completedAt: new Date() }),
          mk({ id: 'open' }),
        ],
      }] }),
      mk({ id: 'tr', completed: true, completedAt: new Date(),
           archivedAt: new Date(), trashedAt: new Date() }),
    ];
    expect(inchwormWalk(tree).map(w => w.card.id)).toEqual(['open', 'p']);
  });

  it('carries the parent chain as a breadcrumb trail', async () => {
    const { inchwormWalk } = await import('../tasks');
    const tree = [
      mk({ id: 'p', title: 'Ship it', decks: [{
        id: 'd', name: null, createdAt: new Date(),
        cards: [mk({ id: 'c', title: 'sub', decks: [{
          id: 'd2', name: null, createdAt: new Date(),
          cards: [mk({ id: 'g', title: 'deep' })],
        }] })],
      }] }),
    ];
    const walk = inchwormWalk(tree);
    const deep = walk.find(w => w.card.id === 'g')!;
    expect(deep.trail.map(a => a.title)).toEqual(['Ship it', 'sub']);
    expect(walk.find(w => w.card.id === 'p')!.trail).toEqual([]);
  });
});

describe('deck palette (identity build, Xian-blessed 2026-08-06)', () => {
  const mkDeck = (over: Record<string, unknown>) => ({
    id: 'd', name: null, createdAt: new Date(), cards: [], ...over,
  }) as { color?: { g1: string; g2: string } };

  it('deck-1 never gets a color — the first deck IS the brand', async () => {
    const { nextDeckColor } = await import('../tasks');
    expect(nextDeckColor([])).toBeUndefined();
  });

  it('later decks draw distinct hues from the curated family, in order', async () => {
    const { nextDeckColor, DECK_PALETTE } = await import('../tasks');
    const d1 = mkDeck({ id: 'r1' });                       // brand, no color
    const c2 = nextDeckColor([d1]);
    expect(c2).toEqual(DECK_PALETTE[0]);
    const d2 = mkDeck({ id: 'r2', color: c2 });
    const c3 = nextDeckColor([d1, d2]);
    expect(c3).toEqual(DECK_PALETTE[1]);
    expect(c3).not.toEqual(c2);
  });

  it('skips hues already in use (deletion holes refill first-free)', async () => {
    const { nextDeckColor, DECK_PALETTE } = await import('../tasks');
    const decks = [ mkDeck({ id: 'r1' }), mkDeck({ id: 'r3', color: DECK_PALETTE[1] }) ];
    expect(nextDeckColor(decks)).toEqual(DECK_PALETTE[0]);
  });

  it('cycles once the family is exhausted rather than failing', async () => {
    const { nextDeckColor, DECK_PALETTE } = await import('../tasks');
    const decks = [ mkDeck({ id: 'r0' }),
      ...DECK_PALETTE.map((color, i) => mkDeck({ id: 'r'+(i+1), color })) ];
    expect(DECK_PALETTE).toContainEqual(nextDeckColor(decks));
  });
});
