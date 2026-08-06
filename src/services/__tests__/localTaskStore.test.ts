// Tests for the local-first persistence layer — the store that holds real
// user data on-device. RED ZONE per CLAUDE.md: task state, ordering, and
// deferral logic must be covered.

import { describe, it, expect, beforeEach } from 'vitest';
import { LocalTaskStore } from '../localTaskStore';
import { Task } from '@/types/task';

const KEY = 'testTasks';

const freshStore = () => new LocalTaskStore(KEY);

beforeEach(() => {
  localStorage.clear();
});

describe('LocalTaskStore basics', () => {
  it('starts empty without seed tasks', async () => {
    expect(await freshStore().getAllTasks()).toEqual([]);
  });

  it('seeds only when storage is empty', async () => {
    const seed: Task[] = [{
      id: 's1', title: 'Seeded', completed: false, createdAt: new Date(), sortOrder: 1
    }];
    const seeded = new LocalTaskStore(KEY, seed);
    expect((await seeded.getAllTasks()).map(t => t.title)).toEqual(['Seeded']);

    // A second instance with a different seed must respect stored data
    const second = new LocalTaskStore(KEY, [{ ...seed[0], id: 's2', title: 'Other' }]);
    expect((await second.getAllTasks()).map(t => t.title)).toEqual(['Seeded']);
  });

  it('new tasks land on TOP of the deck (2026-07-05 design call)', async () => {
    const store = freshStore();
    const a = await store.createTask('A');
    expect(a.status).toBe('todo');
    expect(a.completed).toBe(false);
    await store.createTask('B');
    await store.createTask('C');
    const order = (await store.getAllTasks()).map(t => t.title);
    expect(order).toEqual(['C', 'B', 'A']);
  });

  it('persists across store instances (cold start)', async () => {
    await freshStore().createTask('Survives', 'a description');
    const tasks = await freshStore().getAllTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Survives');
    expect(tasks[0].description).toBe('a description');
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
  });

  it('recovers from corrupt storage by reseeding when no snapshot exists', async () => {
    localStorage.setItem(KEY, '{not json');
    const store = new LocalTaskStore(KEY, []);
    expect(await store.getAllTasks()).toEqual([]);
    // and storage is now valid again
    expect(() => JSON.parse(localStorage.getItem(KEY)!)).not.toThrow();
  });

  it('keeps stores with different keys isolated', async () => {
    await new LocalTaskStore('keyA').createTask('A-task');
    const b = new LocalTaskStore('keyB');
    expect(await b.getAllTasks()).toEqual([]);
  });
});

describe('completion and deferral', () => {
  it('completeTask sets status, completed flag, and timestamp', async () => {
    const store = freshStore();
    const t = await store.createTask('Do me');
    const done = await store.completeTask(t.id);
    expect(done.completed).toBe(true);
    expect(done.status).toBe('done');
    expect(done.completedAt).toBeInstanceOf(Date);
  });

  it('deferTask moves the top task to the bottom and counts deferrals', async () => {
    const store = freshStore();
    await store.createTask('First');
    await store.createTask('Second');
    const third = await store.createTask('Third'); // newest → on top

    const deferred = await store.deferTask(third.id);
    expect(deferred.deferralCount).toBe(1);
    expect(deferred.deferredAt).toBeInstanceOf(Date);
    expect(deferred.status ?? 'todo').toBe('todo');

    const order = (await store.getAllTasks()).map(t => t.title);
    expect(order).toEqual(['Second', 'First', 'Third']);

    await store.deferTask(third.id);
    expect((await store.getAllTasks()).find(t => t.title === 'Third')!.deferralCount).toBe(2);
  });

  it('sorts active by sortOrder and completed by completion date desc, active first', async () => {
    const store = freshStore();
    const a = await store.createTask('A');
    const b = await store.createTask('B');
    await store.createTask('C');

    await store.completeTask(a.id);
    // ensure distinct timestamps
    await new Promise(r => setTimeout(r, 5));
    await store.completeTask(b.id);

    const tasks = await store.getAllTasks();
    expect(tasks.map(t => t.title)).toEqual(['C', 'B', 'A']);
  });

  it('throws on unknown task ids', async () => {
    await expect(freshStore().completeTask('nope')).rejects.toThrow('Task not found');
  });
});

describe('substacks', () => {
  it('creates substacks and persists their tasks through completion', async () => {
    const store = freshStore();
    const parent = await store.createTask('Parent');
    const sub = await store.createSubstack(parent.id, 'Steps');
    expect(sub.name).toBe('Steps');

    const st = await store.addSubstackTask(sub.id, 'Step one', 'details');
    await store.completeSubstackTask(st.id);

    // cold start: everything survived
    const reloaded = (await freshStore().getAllTasks())[0];
    expect(reloaded.decks).toHaveLength(1);
    expect(reloaded.decks![0].cards).toHaveLength(1);
    expect(reloaded.decks![0].cards[0].completed).toBe(true);
    expect(reloaded.decks![0].cards[0].completedAt).toBeInstanceOf(Date);
  });

  it('throws when the substack does not exist', async () => {
    await expect(freshStore().addSubstackTask('nope', 'x')).rejects.toThrow('Substack not found');
  });

  it('creates the default (unnamed) sub-deck — no naming ritual (Item 23)', async () => {
    const store = freshStore();
    const parent = await store.createTask('Parent');
    const deck = await store.createSubstack(parent.id, null);
    expect(deck.name).toBeNull();
    await store.addSubstackTask(deck.id, 'First sub-task');
    const reloaded = (await freshStore().getAllTasks())[0];
    expect(reloaded.decks![0].name).toBeNull();
    expect(reloaded.decks![0].cards).toHaveLength(1);
  });

  it('sub-deck deferral persists: card moves to the bottom and survives cold start', async () => {
    const store = freshStore();
    const parent = await store.createTask('Parent');
    const deck = await store.createSubstack(parent.id, 'Steps');
    await store.addSubstackTask(deck.id, 'Old top');
    const newest = await store.addSubstackTask(deck.id, 'Newest'); // lands on top

    const deferred = await store.deferSubstackTask(newest.id);
    expect(deferred.deferralCount).toBe(1);
    expect(deferred.deferredAt).toBeInstanceOf(Date);

    // display order = array order: deferred card is now last
    const reloaded = (await freshStore().getAllTasks())[0];
    expect(reloaded.decks![0].cards.map(c => c.title)).toEqual(['Old top', 'Newest']);
    expect(reloaded.decks![0].cards[1].deferralCount).toBe(1);
  });

  it('deferSubstackTask throws on unknown ids', async () => {
    await expect(freshStore().deferSubstackTask('nope')).rejects.toThrow('Substack task not found');
  });
});

describe('undo via restoreTask', () => {
  it('restoring a pre-completion snapshot un-completes the task', async () => {
    const store = freshStore();
    const t = await store.createTask('Oops');
    const snapshot = structuredClone(t);
    await store.completeTask(t.id);

    await store.restoreTask(snapshot);
    const restored = (await store.getAllTasks()).find(x => x.id === t.id)!;
    expect(restored.completed).toBe(false);
    expect(restored.completedAt).toBeUndefined();
    expect(restored.status).toBe('todo');

    // survives a cold start with dates revived
    const cold = (await freshStore().getAllTasks()).find(x => x.id === t.id)!;
    expect(cold.completed).toBe(false);
    expect(cold.createdAt).toBeInstanceOf(Date);
  });

  it('restoring a pre-deferral snapshot puts the task back on top', async () => {
    const store = freshStore();
    await store.createTask('First');
    const second = await store.createTask('Second'); // newest → on top
    const snapshot = structuredClone(second);

    await store.deferTask(second.id);
    expect((await store.getAllTasks())[0].title).toBe('First');

    await store.restoreTask(snapshot);
    const tasks = await store.getAllTasks();
    expect(tasks[0].title).toBe('Second');
    expect(tasks[0].deferralCount ?? 0).toBe(0);
  });

  it('throws when the snapshot task no longer exists', async () => {
    const ghost: Task = {
      id: 'ghost', title: 'Ghost', completed: false, createdAt: new Date(), sortOrder: 1
    };
    await expect(freshStore().restoreTask(ghost)).rejects.toThrow('Task not found');
  });
});

describe('un-complete (recovery from accidental completion)', () => {
  it('returns a completed task to the TOP of the active deck', async () => {
    const store = freshStore();
    const oops = await store.createTask('Oops done');
    await store.createTask('Still active');
    await store.completeTask(oops.id);

    const revived = await store.uncompleteTask(oops.id);
    expect(revived.completed).toBe(false);
    expect(revived.status).toBe('todo');
    expect(revived.completedAt).toBeUndefined();

    const tasks = await store.getAllTasks();
    expect(tasks[0].title).toBe('Oops done'); // top of deck, not bottom

    // survives cold start
    expect((await freshStore().getAllTasks())[0].title).toBe('Oops done');
  });

  it('works when it is the only task', async () => {
    const store = freshStore();
    const t = await store.createTask('Solo');
    await store.completeTask(t.id);
    await store.uncompleteTask(t.id);
    const tasks = await store.getAllTasks();
    expect(tasks[0].completed).toBe(false);
  });

  it('throws on unknown ids', async () => {
    await expect(freshStore().uncompleteTask('nope')).rejects.toThrow('Task not found');
  });
});

describe('recursion: sub-sub-tasks (cards all the way down)', () => {
  it('creates a deck ON a sub-card and adds cards to it (was: "Task not found")', async () => {
    const store = freshStore();
    const parent = await store.createTask('Project');
    const deck = await store.createSubstack(parent.id, null);
    const subCard = await store.addSubstackTask(deck.id, 'Phase one');

    // the bug: creating a deck on a card that lives INSIDE a deck
    const subDeck = await store.createSubstack(subCard.id, null);
    const subSub = await store.addSubstackTask(subDeck.id, 'Step 1.1');
    expect(subSub.title).toBe('Step 1.1');

    // complete + defer at depth 2 work and persist
    await store.addSubstackTask(subDeck.id, 'Step 1.2');
    await store.completeSubstackTask(subSub.id);
    const reloaded = (await freshStore().getAllTasks())[0];
    const rDeck = reloaded.decks![0].cards[0].decks![0];
    expect(rDeck.cards).toHaveLength(2);
    expect(rDeck.cards.find(c => c.title === 'Step 1.1')!.completed).toBe(true);

    await store.deferSubstackTask(rDeck.cards.find(c => !c.completed)!.id);
    const again = (await freshStore().getAllTasks())[0];
    expect(again.decks![0].cards[0].decks![0].cards[1].deferralCount).toBe(1);
  });
});

describe('lifecycle chain (R1.2): Done → Archive → Trash and back', () => {
  const walkToDone = async (store: LocalTaskStore, title = 'Traveler') => {
    const t = await store.createTask(title);
    await store.completeTask(t.id);
    return t;
  };

  it('walks a card all the way down the chain and all the way back home', async () => {
    const store = freshStore();
    const t = await walkToDone(store);

    await store.archiveTask(t.id);
    expect((await store.getAllTasks()).find(x => x.id === t.id)!.archivedAt).toBeInstanceOf(Date);

    await store.trashTask(t.id);
    expect((await store.getAllTasks()).find(x => x.id === t.id)!.trashedAt).toBeInstanceOf(Date);

    // walk back: trash → archive → done → home (top of deck)
    await store.restoreFromTrash(t.id);
    await store.unarchiveTask(t.id);
    const home = await store.uncompleteTask(t.id);
    expect(home.completed).toBe(false);
    expect(home.archivedAt).toBeUndefined();
    expect(home.trashedAt).toBeUndefined();
    expect((await store.getAllTasks())[0].id).toBe(t.id); // top of the deck

    // and the whole journey survives a cold start
    const cold = (await freshStore().getAllTasks()).find(x => x.id === t.id)!;
    expect(cold.completed).toBe(false);
  });

  it('guards every move: no skipping rooms', async () => {
    const store = freshStore();
    const active = await store.createTask('Active');
    await expect(store.archiveTask(active.id)).rejects.toThrow('Only done cards');
    await expect(store.trashTask(active.id)).rejects.toThrow('Only archived cards');
    await expect(store.purgeTask(active.id)).rejects.toThrow('Only trashed cards');

    const done = await walkToDone(store, 'Done one');
    await expect(store.unarchiveTask(done.id)).rejects.toThrow('not archived');
    await expect(store.trashTask(done.id)).rejects.toThrow('Only archived cards');
  });

  it('purge permanently removes a trashed card', async () => {
    const store = freshStore();
    const t = await walkToDone(store);
    await store.archiveTask(t.id);
    await store.trashTask(t.id);
    await store.purgeTask(t.id);
    expect((await store.getAllTasks()).find(x => x.id === t.id)).toBeUndefined();
    // gone after cold start too
    expect((await freshStore().getAllTasks()).find(x => x.id === t.id)).toBeUndefined();
  });

  it('archived and trashed cards never appear in the active deck filter', async () => {
    const store = freshStore();
    const t = await walkToDone(store);
    await store.archiveTask(t.id);
    const active = (await store.getAllTasks()).filter(x => !x.completed);
    expect(active.find(x => x.id === t.id)).toBeUndefined();
  });
});

describe('data safety net (wipe protection)', () => {
  const snapshotKeys = () => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(`${KEY}.snapshot.`)) keys.push(k);
    }
    return keys.sort();
  };

  it('writes meta and a dated snapshot on every save', async () => {
    await freshStore().createTask('Precious');
    const meta = JSON.parse(localStorage.getItem(`${KEY}.meta`)!);
    expect(meta.count).toBe(1);
    expect(meta.updatedAt).toBeTruthy();
    const snaps = snapshotKeys();
    expect(snaps).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(snaps[0])!).decks[0].cards).toHaveLength(1);
  });

  it('restores from the newest snapshot when the main key disappears', async () => {
    await freshStore().createTask('Survivor');
    localStorage.removeItem(KEY); // the wipe
    const tasks = await freshStore().getAllTasks();
    expect(tasks.map(t => t.title)).toEqual(['Survivor']);
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
    // main key is re-established (v3 envelope)
    expect(JSON.parse(localStorage.getItem(KEY)!).decks[0].cards).toHaveLength(1);
  });

  it('does not restore for a genuinely fresh install (no meta)', async () => {
    // simulate a stray snapshot without meta — e.g. partial manual cleanup
    localStorage.setItem(`${KEY}.snapshot.2026-01-01`, JSON.stringify([{ id: 'x', title: 'Ghost', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }]));
    expect(await freshStore().getAllTasks()).toEqual([]);
  });

  it('quarantines corrupt data instead of overwriting it, then restores from snapshot', async () => {
    await freshStore().createTask('Fragile');
    localStorage.setItem(KEY, '{not json'); // corruption
    const tasks = await freshStore().getAllTasks();
    expect(tasks.map(t => t.title)).toEqual(['Fragile']);
    // the corrupt payload was preserved, not clobbered
    const quarantined: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(`${KEY}.corrupt.`)) quarantined.push(k);
    }
    expect(quarantined).toHaveLength(1);
    expect(localStorage.getItem(quarantined[0])).toBe('{not json');
  });

  it('never overwrites a non-empty snapshot with an empty deck', async () => {
    const store = freshStore();
    await store.createTask('Keep me');
    await store.importTasks([]); // legitimate empty save
    const snaps = snapshotKeys();
    expect(snaps).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(snaps[0])!).decks[0].cards).toHaveLength(1);
  });

  it('prunes snapshots beyond the retention window', async () => {
    for (let d = 1; d <= 9; d++) {
      localStorage.setItem(`${KEY}.snapshot.2026-06-0${d}`, '[]');
    }
    await freshStore().createTask('Today');
    const snaps = snapshotKeys();
    expect(snaps.length).toBeLessThanOrEqual(7);
    // the newest (today's) snapshot is among the survivors
    expect(snaps.some(k => !k.includes('2026-06-'))).toBe(true);
  });
});

describe('backup import (restore path)', () => {
  it('replaces tasks and revives dates, including nested substack tasks', async () => {
    const store = freshStore();
    await store.createTask('Will be replaced');

    // Simulate a parsed JSON backup: dates are strings
    const backup = JSON.parse(JSON.stringify([{
      id: 'r1',
      title: 'Restored',
      completed: false,
      createdAt: '2026-01-15T10:00:00.000Z',
      sortOrder: 1,
      decks: [{
        id: 'sub1',
        name: 'Restored sub',
        createdAt: '2026-01-16T10:00:00.000Z',
        cards: [{
          id: 'st1', title: 'Sub task', completed: true,
          createdAt: '2026-01-17T10:00:00.000Z',
          completedAt: '2026-01-18T10:00:00.000Z', sortOrder: 1
        }]
      }]
    }]));

    await store.importTasks(backup);
    const tasks = await store.getAllTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Restored');
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
    expect(tasks[0].decks![0].createdAt).toBeInstanceOf(Date);
    expect(tasks[0].decks![0].cards[0].completedAt).toBeInstanceOf(Date);

    // and the round trip survives a cold start
    expect((await freshStore().getAllTasks())[0].title).toBe('Restored');
  });
});

describe('Chain at depth: completed sub-cards live in the rooms too (2026-07-07)', () => {
  const buildNest = async (store: LocalTaskStore) => {
    const parent = await store.createTask('parent');
    const deck = await store.createSubstack(parent.id, null);
    const subA = await store.addSubstackTask(deck.id, 'sub A');
    const subB = await store.addSubstackTask(deck.id, 'sub B');
    return { parent, deck, subA, subB };
  };

  it('walks a completed sub-card down the whole chain and back', async () => {
    const store = freshStore();
    const { subA } = await buildNest(store);
    await store.completeSubstackTask(subA.id);

    const archived = await store.archiveTask(subA.id);
    expect(archived.archivedAt).toBeInstanceOf(Date);
    const trashed = await store.trashTask(subA.id);
    expect(trashed.trashedAt).toBeInstanceOf(Date);
    const restored = await store.restoreFromTrash(subA.id);
    expect(restored.trashedAt).toBeUndefined();
    expect(restored.archivedAt).toBeInstanceOf(Date);

    // and it survives a reload at the right place in the tree
    const reloaded = await freshStore().getAllTasks();
    const deckCards = reloaded[0].decks![0].cards;
    expect(deckCards.find(c => c.title === 'sub A')!.archivedAt).toBeInstanceOf(Date);
  });

  it('purges a trashed sub-card out of its deck (and only its deck)', async () => {
    const store = freshStore();
    const { subA } = await buildNest(store);
    await store.completeSubstackTask(subA.id);
    await store.archiveTask(subA.id);
    await store.trashTask(subA.id);

    await store.purgeTask(subA.id);

    const all = await store.getAllTasks();
    expect(all).toHaveLength(1); // parent untouched
    expect(all[0].decks![0].cards.map(c => c.title)).toEqual(['sub B']);
  });

  it('refuses to purge a sub-card that is not in the trash', async () => {
    const store = freshStore();
    const { subA } = await buildNest(store);
    await store.completeSubstackTask(subA.id);
    await expect(store.purgeTask(subA.id)).rejects.toThrow(/trash/i);
  });

  it('un-does a completed sub-card back to the TOP of its own deck', async () => {
    const store = freshStore();
    const { subA } = await buildNest(store);
    await store.completeSubstackTask(subA.id);

    const undone = await store.uncompleteTask(subA.id);
    expect(undone.completed).toBe(false);
    expect(undone.completedAt).toBeUndefined();

    const all = await store.getAllTasks();
    // display order in decks = array order; the returned card leads it
    expect(all[0].decks![0].cards.map(c => c.title)).toEqual(['sub A', 'sub B']);
  });

  it('undo (restoreTask) reaches snapshots of cards at depth', async () => {
    const store = freshStore();
    const { subA } = await buildNest(store);
    const snapshot = structuredClone(
      (await store.getAllTasks())[0].decks![0].cards.find(c => c.id === subA.id)!
    );
    await store.completeSubstackTask(subA.id);

    await store.restoreTask(snapshot);
    const all = await store.getAllTasks();
    const restored = all[0].decks![0].cards.find(c => c.id === subA.id)!;
    expect(restored.completed).toBe(false);
    expect(restored.completedAt).toBeUndefined();
  });
});

describe('Promote / move-into (MVP blocker 1, 2026-07-25)', () => {
  const nest = async (store: LocalTaskStore) => {
    const parent = await store.createTask('parent');
    const deck = await store.createSubstack(parent.id, null);
    const child = await store.addSubstackTask(deck.id, 'child');
    return { parent, deck, child };
  };

  it('promotes a sub-card to be a peer of its parent, newest-on-top', async () => {
    const store = freshStore();
    await store.createTask('older top card');
    const { parent, child } = await nest(store);
    await store.promoteCard(child.id);
    const all = await store.getAllTasks();
    // now top-level AND on top (newest-on-top)
    expect(all[0].title).toBe('child');
    // removed from parent's deck
    expect(all.find(t => t.id === parent.id)!.decks![0].cards).toHaveLength(0);
    // survives reload as a top-level card
    const reloaded = await freshStore().getAllTasks();
    expect(reloaded.some(t => t.id === child.id)).toBe(true);
  });

  it('promotes a depth-2 card to be a peer of its sub-card parent', async () => {
    const store = freshStore();
    const { parent, child } = await nest(store);
    const childDeck = await store.createSubstack(child.id, null);
    const grand = await store.addSubstackTask(childDeck.id, 'grand');
    await store.promoteCard(grand.id);
    const all = await store.getAllTasks();
    const parentDeck = all.find(t => t.id === parent.id)!.decks![0];
    // grand now sits beside child in the parent's deck, on top
    expect(parentDeck.cards.map(c => c.title)).toEqual(['grand', 'child']);
  });

  it('refuses to promote a top-level card', async () => {
    const store = freshStore();
    const t = await store.createTask('top');
    await expect(store.promoteCard(t.id)).rejects.toThrow(/top level/i);
  });

  it('moves a card into another card, creating a sub-deck, newest-on-top', async () => {
    const store = freshStore();
    const a = await store.createTask('A');
    const b = await store.createTask('B');
    await store.moveCardInto(a.id, b.id);
    const all = await store.getAllTasks();
    expect(all.map(t => t.title)).not.toContain('A');
    expect(all.find(t => t.id === b.id)!.decks![0].cards.map(c => c.title)).toEqual(['A']);
  });

  it('moves into an existing sub-deck at newest-on-top', async () => {
    const store = freshStore();
    const { parent } = await nest(store); // parent deck holds [child]
    const loose = await store.createTask('loose');
    await store.moveCardInto(loose.id, parent.id);
    const parentDeck = (await store.getAllTasks()).find(t => t.id === parent.id)!.decks![0];
    expect(parentDeck.cards.map(c => c.title)).toEqual(['loose', 'child']);
  });

  it('refuses to move a card into itself', async () => {
    const store = freshStore();
    const a = await store.createTask('A');
    await expect(store.moveCardInto(a.id, a.id)).rejects.toThrow(/itself/i);
  });

  it('refuses to move a card into its own descendant (no cycles)', async () => {
    const store = freshStore();
    const { parent, child } = await nest(store);
    await expect(store.moveCardInto(parent.id, child.id)).rejects.toThrow(/descendant/i);
  });

  it('refuses to move a card into a completed card (would bury it, 2026-07-26)', async () => {
    const store = freshStore();
    const a = await store.createTask('A');
    const done = await store.createTask('done');
    await store.completeTask(done.id);
    await expect(store.moveCardInto(a.id, done.id)).rejects.toThrow(/completed/i);
    // A stays put — nothing buried
    expect((await store.getAllTasks()).map(t => t.title)).toContain('A');
  });
});

describe('importAsSubdeck (MVP blocker 4; import-N container, 2026-07-26)', () => {
  it('lands the import in a NEW top-level "import-1" card, existing deck intact', async () => {
    const store = freshStore();
    await store.createTask('existing top');
    const backup = [
      { id: 'x', title: 'imported A', completed: false, createdAt: new Date().toISOString(), sortOrder: 1 },
      { id: 'y', title: 'imported B', completed: false, createdAt: new Date().toISOString(), sortOrder: 2 },
    ];
    await store.importAsSubdeck!(backup as any);
    const all = await store.getAllTasks();
    expect(all.map(t => t.title).sort()).toEqual(['existing top', 'import-1']);
    const container = all.find(t => t.title === 'import-1')!;
    expect(container.decks![0].cards.map(c => c.title).sort()).toEqual(['imported A', 'imported B']);
  });

  it('regenerates every id so an imported copy never collides with existing cards', async () => {
    const store = freshStore();
    const backup = [{
      id: 'dup', title: 'orig', completed: false, createdAt: new Date().toISOString(), sortOrder: 1,
      decks: [{ id: 'd', name: null, createdAt: new Date().toISOString(), cards: [
        { id: 'kid', title: 'child', completed: false, createdAt: new Date().toISOString(), sortOrder: 1 },
      ]}],
    }];
    await store.importAsSubdeck!(backup as any);
    const container = (await store.getAllTasks()).find(t => t.title === 'import-1')!;
    const parent = container.decks![0].cards[0];
    expect(parent.id).not.toBe('dup');
    expect(parent.decks![0].id).not.toBe('d');
    expect(parent.decks![0].cards[0].id).not.toBe('kid');
  });

  it('increments the label: a second import becomes import-2', async () => {
    const store = freshStore();
    const backup = [{ id: 'x', title: 'solo', completed: false, createdAt: new Date().toISOString(), sortOrder: 1 }];
    await store.importAsSubdeck!(backup as any);
    await store.importAsSubdeck!(backup as any);
    const titles = (await store.getAllTasks()).map(t => t.title).sort();
    expect(titles).toEqual(['import-1', 'import-2']);
  });

  it('honors an explicit container name', async () => {
    const store = freshStore();
    const backup = [{ id: 'x', title: 'solo', completed: false, createdAt: new Date().toISOString(), sortOrder: 1 }];
    await store.importAsSubdeck!(backup as any, 'Todoist archive');
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['Todoist archive']);
  });
});

describe('completed cards are sealed (Xian, 2026-07-26)', () => {
  const KEY2 = 'sealtest';
  const store2 = () => new LocalTaskStore(KEY2);

  it('refuses to add a card to a deck owned by a completed card', async () => {
    localStorage.clear();
    const store = store2();
    const owner = await store.createTask('owner');
    const deck = await store.createSubstack(owner.id, null);
    await store.completeTask(owner.id);
    await expect(store.addSubstackTask(deck.id, 'buried')).rejects.toThrow(/completed/i);
  });

  it('refuses to add a new deck to a completed card', async () => {
    localStorage.clear();
    const store = store2();
    const owner = await store.createTask('owner');
    await store.completeTask(owner.id);
    await expect(store.createSubstack(owner.id, null)).rejects.toThrow(/completed/i);
  });
});

describe('completing over unfinished work is refused by the STORE (2026-07-28)', () => {
  // Item 15 ("done means the whole job is done") was enforced only in
  // Index.tsx — the UI. Every other half of the sealed-card invariant lives
  // in the store, and CLAUDE.md is explicit that task state logic belongs in
  // the domain, not in frontend state management. A UI-only guard means any
  // other path to completeTask can silently bury unfinished work, which is
  // the precise failure the invariant exists to prevent. The UI still owns
  // explaining WHY and descending into the blocking deck; this is the backstop.
  const KEY3 = 'blockcomplete';
  const store3 = () => new LocalTaskStore(KEY3);

  it('refuses to complete a card with an unfinished direct child', async () => {
    localStorage.clear();
    const store = store3();
    const parent = await store.createTask('parent');
    const deck = await store.createSubstack(parent.id, null);
    await store.addSubstackTask(deck.id, 'still open');
    await expect(store.completeTask(parent.id)).rejects.toThrow(/unfinished/i);
  });

  it('refuses when the unfinished work is a GRANDchild under a completed child', async () => {
    // The deep case: Index's blockingDeck lookup only scans DIRECT children,
    // so this shape reaches the store looking innocent — nothing visible to
    // descend into, but active work is buried down there.
    //
    // Note this state can no longer be BUILT through the API: completing the
    // middle card is itself refused now, which is the invariant doing its job
    // (no new strandings). It can still ARRIVE — legacy decks and imports —
    // which is exactly why the guard has to be checked on the way out too.
    // So we seed the buried shape directly, the way a real old deck would.
    localStorage.clear();
    localStorage.setItem(KEY3, JSON.stringify({
      schemaVersion: 2,
      cards: [{
        id: 'p', title: 'parent', completed: false, createdAt: '2026-07-01T00:00:00.000Z', sortOrder: 1,
        decks: [{
          id: 'd', name: null, createdAt: '2026-07-01T00:00:00.000Z',
          cards: [{
            id: 'c', title: 'child', completed: true,
            createdAt: '2026-07-01T00:00:00.000Z', completedAt: '2026-07-02T00:00:00.000Z',
            decks: [{
              id: 'd2', name: null, createdAt: '2026-07-01T00:00:00.000Z',
              cards: [{ id: 'g', title: 'buried but open', completed: false, createdAt: '2026-07-01T00:00:00.000Z' }],
            }],
          }],
        }],
      }],
    }));
    const store = store3();
    await expect(store.completeTask('p')).rejects.toThrow(/unfinished/i);
  });

  it('allows completion once the whole subtree is done', async () => {
    localStorage.clear();
    const store = store3();
    const parent = await store.createTask('parent');
    const deck = await store.createSubstack(parent.id, null);
    const child = await store.addSubstackTask(deck.id, 'child');
    await store.completeSubstackTask(child.id);
    const done = await store.completeTask(parent.id);
    expect(done.completed).toBe(true);
  });

  it('applies at depth too: a sub-card cannot complete over its own unfinished interior', async () => {
    localStorage.clear();
    const store = store3();
    const parent = await store.createTask('parent');
    const deck = await store.createSubstack(parent.id, null);
    const child = await store.addSubstackTask(deck.id, 'child');
    const inner = await store.createSubstack(child.id, null);
    await store.addSubstackTask(inner.id, 'still open');
    await expect(store.completeSubstackTask(child.id)).rejects.toThrow(/unfinished/i);
  });

  it('leaves a childless card completable (no false positives)', async () => {
    localStorage.clear();
    const store = store3();
    const solo = await store.createTask('solo');
    const done = await store.completeTask(solo.id);
    expect(done.completed).toBe(true);
  });
});

describe("Trash decisions (Xian, 2026-07-29): trash is not protected", () => {
  const KEY4 = 'trashtest';
  const store4 = () => new LocalTaskStore(KEY4);

  // Walk a fresh card into the trash through the legal chain.
  const trashCard = async (store: LocalTaskStore, title: string) => {
    const card = await store.createTask(title);
    await store.completeTask(card.id);
    await store.archiveTask(card.id);
    await store.trashTask(card.id);
    return card;
  };

  it('emptyTrash purges every trashed card in one move and reports the count', async () => {
    localStorage.clear();
    const store = store4();
    await trashCard(store, 'junk one');
    await trashCard(store, 'junk two');
    const keep = await store.createTask('keeper');
    const removed = await store.emptyTrash();
    expect(removed).toBe(2);
    const all = await store.getAllTasks();
    expect(all.map(t => t.title)).toEqual(['keeper']);
    expect(keep.id).toBeDefined();
  });

  it('emptyTrash reaches trashed cards at depth, leaving their siblings alone', async () => {
    localStorage.clear();
    const store = store4();
    const parent = await store.createTask('parent');
    const deck = await store.createSubstack(parent.id, null);
    const junk = await store.addSubstackTask(deck.id, 'buried junk');
    await store.addSubstackTask(deck.id, 'buried keeper');
    await store.completeSubstackTask(junk.id);
    await store.archiveTask(junk.id);
    await store.trashTask(junk.id);
    const removed = await store.emptyTrash();
    expect(removed).toBe(1);
    const freshParent = (await store.getAllTasks()).find(t => t.id === parent.id)!;
    expect(freshParent.decks![0].cards.map(c => c.title)).toEqual(['buried keeper']);
  });

  it('emptyTrash on an empty trash is a harmless zero', async () => {
    localStorage.clear();
    const store = store4();
    await store.createTask('untouched');
    expect(await store.emptyTrash()).toBe(0);
    expect((await store.getAllTasks()).length).toBe(1);
  });
});

describe('withoutTrashed (backups exclude the trash — Xian, 2026-07-29)', () => {
  it('drops trashed cards at every depth without touching the rest', async () => {
    const { withoutTrashed } = await import('../../domain/tasks');
    const mk = (over: Partial<Task>): Task => ({
      id: over.id ?? 'x', title: over.title ?? 't', completed: false,
      createdAt: new Date('2026-07-01'), ...over,
    } as Task);
    const cards: Task[] = [
      mk({ id: 'live', title: 'live' }),
      mk({ id: 'gone', title: 'gone', completed: true,
           completedAt: new Date('2026-07-02'),
           archivedAt: new Date('2026-07-03'),
           trashedAt: new Date('2026-07-04') }),
      mk({ id: 'holder', title: 'holder', decks: [{
        id: 'd', name: null, createdAt: new Date('2026-07-01'),
        cards: [
          mk({ id: 'deep-live', title: 'deep live' }),
          mk({ id: 'deep-gone', title: 'deep gone', completed: true,
               completedAt: new Date('2026-07-02'),
               archivedAt: new Date('2026-07-03'),
               trashedAt: new Date('2026-07-04') }),
        ],
      }] }),
    ];
    const kept = withoutTrashed(cards);
    expect(kept.map(c => c.id)).toEqual(['live', 'holder']);
    expect(kept[1].decks![0].cards.map(c => c.id)).toEqual(['deep-live']);
    // and the original tree is untouched (pure function)
    expect(cards.length).toBe(3);
    expect(cards[2].decks![0].cards.length).toBe(2);
  });
});

describe('undo history (Xian, 2026-07-29: shake/menu undo, session-deep)', () => {
  const KEY5 = 'undotest';
  const store5 = () => new LocalTaskStore(KEY5);

  it('walks back through multiple mutations in order', async () => {
    localStorage.clear();
    const store = store5();
    const a = await store.createTask('first');
    await store.createTask('second');
    await store.completeTask(a.id);
    expect(store.canUndo()).toBe(true);

    await store.undoLast();   // un-does the completion
    let all = await store.getAllTasks();
    expect(all.find(t => t.id === a.id)!.completed).toBe(false);
    expect(all.length).toBe(2);

    await store.undoLast();   // un-does creating "second"
    all = await store.getAllTasks();
    expect(all.map(t => t.title)).toEqual(['first']);
  });

  it('undo walks history, not a two-state toggle', async () => {
    // Regression guard for the classic bug: if undo's own save is captured,
    // repeated undo bounces A<->B instead of walking A<-B<-C.
    localStorage.clear();
    const store = store5();
    await store.createTask('one');
    await store.createTask('two');
    await store.createTask('three');
    await store.undoLast();
    await store.undoLast();
    const all = await store.getAllTasks();
    expect(all.map(t => t.title)).toEqual(['one']);
  });

  it('undoing past the session start returns false and changes nothing', async () => {
    localStorage.clear();
    const store = store5();
    await store.createTask('only');
    while (await store.undoLast()) { /* drain */ }
    expect(store.canUndo()).toBe(false);
    expect(await store.undoLast()).toBe(false);
    expect((await store.getAllTasks()).length).toBeGreaterThanOrEqual(0); // no throw is the point
  });

  it('undo can reverse an import that replaced the whole deck', async () => {
    localStorage.clear();
    const store = store5();
    await store.createTask('precious');
    await store.importTasks([
      { id: 'imp', title: 'imported', completed: false, createdAt: new Date() } as Task,
    ]);
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['imported']);
    await store.undoLast();
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['precious']);
  });
});

describe('Done→Archive housekeeping (Xian, 2026-07-29: 30 days)', () => {
  const KEY6 = 'housekeeptest';
  const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  const seed = (cards: unknown[]) =>
    localStorage.setItem(KEY6, JSON.stringify({ schemaVersion: 2, cards }));

  it('files done cards older than 30 days to the archive on load', async () => {
    localStorage.clear();
    seed([
      { id: 'old', title: 'old done', completed: true,
        createdAt: daysAgo(60), completedAt: daysAgo(40) },
      { id: 'fresh', title: 'fresh done', completed: true,
        createdAt: daysAgo(10), completedAt: daysAgo(5) },
      { id: 'active', title: 'still todo', completed: false, createdAt: daysAgo(60) },
    ]);
    const store = new LocalTaskStore(KEY6);
    expect(store.lastHousekeeping).toBe(1);
    const all = await store.getAllTasks();
    expect(all.find(t => t.id === 'old')!.archivedAt).toBeInstanceOf(Date);
    expect(all.find(t => t.id === 'fresh')!.archivedAt).toBeUndefined();
    expect(all.find(t => t.id === 'active')!.completed).toBe(false);
  });

  it('reaches old done cards at depth and survives a cold start', async () => {
    localStorage.clear();
    seed([
      { id: 'p', title: 'parent', completed: false, createdAt: daysAgo(60),
        decks: [{ id: 'd', name: null, createdAt: daysAgo(60), cards: [
          { id: 'deep-old', title: 'deep old done', completed: true,
            createdAt: daysAgo(60), completedAt: daysAgo(45) },
        ] }] },
    ]);
    new LocalTaskStore(KEY6); // housekeeping runs at load
    const cold = new LocalTaskStore(KEY6);
    expect(cold.lastHousekeeping).toBe(0); // already filed — no rework
    const p = (await cold.getAllTasks())[0];
    expect(p.decks![0].cards[0].archivedAt).toBeInstanceOf(Date);
  });

  it('leaves already-archived, trashed, and undated-done cards alone', async () => {
    localStorage.clear();
    seed([
      { id: 'arch', title: 'already archived', completed: true,
        createdAt: daysAgo(90), completedAt: daysAgo(80), archivedAt: daysAgo(50) },
      { id: 'tr', title: 'trashed', completed: true, createdAt: daysAgo(90),
        completedAt: daysAgo(80), archivedAt: daysAgo(70), trashedAt: daysAgo(60) },
      { id: 'undated', title: 'done but no date', completed: true, createdAt: daysAgo(90) },
    ]);
    const store = new LocalTaskStore(KEY6);
    expect(store.lastHousekeeping).toBe(0);
    const all = await store.getAllTasks();
    // the trashed card kept its trashedAt; the undated one was not guessed at
    expect(all.find(t => t.id === 'tr')!.trashedAt).toBeInstanceOf(Date);
    expect(all.find(t => t.id === 'undated')!.archivedAt).toBeUndefined();
  });
});

describe('v3 root-deck migration at the store (R2.1 stage 1, 2026-07-29)', () => {
  const KEY7 = 'v3migrate';
  const V2_DOC = {
    schemaVersion: 2,
    cards: [
      { id: 'a', title: 'live one', completed: false, createdAt: '2026-07-01T10:00:00.000Z', sortOrder: 0,
        decks: [{ id: 'd1', name: 'Steps', createdAt: '2026-07-01T10:00:00.000Z',
          cards: [{ id: 'a1', title: 'sub', completed: false, createdAt: '2026-07-01T10:00:00.000Z' }] }] },
      { id: 'b', title: 'done one', completed: true, createdAt: '2026-07-01T09:00:00.000Z',
        completedAt: '2026-07-28T10:00:00.000Z' },
    ],
  };

  it('cold-starts a v2 deck into v3 with a .v2backup paranoia copy', async () => {
    localStorage.clear();
    localStorage.setItem(KEY7, JSON.stringify(V2_DOC));
    const store = new LocalTaskStore(KEY7);

    // the untouched v2 document is preserved BEFORE the first v3 write
    expect(JSON.parse(localStorage.getItem(`${KEY7}.v2backup`)!)).toEqual(V2_DOC);

    // storage is now a v3 envelope, root deck named deck-1, cards intact
    const stored = JSON.parse(localStorage.getItem(KEY7)!);
    expect(stored.schemaVersion).toBe(3);
    expect(stored.decks).toHaveLength(1);
    expect(stored.decks[0].name).toBe('first deck');
    expect(stored.decks[0].cards.map((c: { id: string }) => c.id)).toEqual(['a', 'b']);

    // the API contract is unchanged: same cards, dates revived
    const tasks = await store.getAllTasks();
    expect(tasks.map(t => t.id)).toEqual(['a', 'b']);
    expect(tasks[0].decks![0].cards[0].title).toBe('sub');
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
  });

  it('migrates once: the second cold start is a plain v3 load', async () => {
    localStorage.clear();
    localStorage.setItem(KEY7, JSON.stringify(V2_DOC));
    new LocalTaskStore(KEY7);
    const afterFirst = localStorage.getItem(KEY7);
    const second = new LocalTaskStore(KEY7);
    expect((await second.getAllTasks()).map(t => t.id)).toEqual(['a', 'b']);
    // idempotent: the document did not churn on the second load
    expect(localStorage.getItem(KEY7)).toBe(afterFirst);
  });

  it('mutations and undo work across the migration boundary', async () => {
    localStorage.clear();
    localStorage.setItem(KEY7, JSON.stringify(V2_DOC));
    const store = new LocalTaskStore(KEY7);
    // ('a' holds an unfinished sub-card, so Item 15 rightly refuses its
    // completion — the invariant caught this test's first draft too.
    // Finish the interior first, then the parent.)
    await store.completeSubstackTask('a1');
    await store.completeTask('a');
    expect((await store.getAllTasks()).find(t => t.id === 'a')!.completed).toBe(true);
    await store.undoLast(); // un-does the parent completion
    expect((await store.getAllTasks()).find(t => t.id === 'a')!.completed).toBe(false);
  });

  it('a v1 deck reaches v3 in one cold start, both paranoia copies present', async () => {
    localStorage.clear();
    const v1 = [{ id: 'x', title: 'ancient', completed: false, createdAt: '2025-08-01T10:00:00.000Z',
                  substacks: [{ id: 's', name: 'Old sub', tasks: [] }] }];
    localStorage.setItem(KEY7, JSON.stringify(v1));
    const store = new LocalTaskStore(KEY7);
    expect(localStorage.getItem(`${KEY7}.v1backup`)).not.toBeNull();
    const stored = JSON.parse(localStorage.getItem(KEY7)!);
    expect(stored.schemaVersion).toBe(3);
    expect(stored.decks[0].cards[0].decks[0].name).toBe('Old sub');
    expect((await store.getAllTasks())[0].title).toBe('ancient');
  });
});

describe('root deck CRUD + active deck (R2.1 stage 2, 2026-07-29)', () => {
  const KEY8 = 'deckcrud';
  const store8 = () => new LocalTaskStore(KEY8);

  it('a fresh store has exactly deck-1, which is active', async () => {
    localStorage.clear();
    const store = store8();
    const decks = await store.getDecks();
    expect(decks).toHaveLength(1);
    expect(decks[0].name).toBe('first deck');
    expect(store.activeDeckId()).toBe(decks[0].id);
  });

  it('createDeck adds an empty root deck with the next free slug name', async () => {
    localStorage.clear();
    const store = store8();
    const d2 = await store.createDeck();
    expect(d2.name).toBe('deck 2');
    expect(d2.cards).toEqual([]);
    const d3 = await store.createDeck('work');
    expect(d3.name).toBe('work');
    expect((await store.getDecks()).map(d => d.name)).toEqual(['first deck', 'deck 2', 'work']);
  });

  it('switchDeck changes where new cards land; decks stay isolated', async () => {
    localStorage.clear();
    const store = store8();
    await store.createTask('in one');
    const d2 = await store.createDeck('work');
    await store.switchDeck(d2.id);
    expect(store.activeDeckId()).toBe(d2.id);
    await store.createTask('in work');
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['in work']);
    const decks = await store.getDecks();
    expect(decks[0].cards.map(c => c.title)).toEqual(['in one']);
    expect(decks[1].cards.map(c => c.title)).toEqual(['in work']);
  });

  it('the active deck survives a cold start (device preference, not deck data)', async () => {
    localStorage.clear();
    const store = store8();
    const d2 = await store.createDeck('work');
    await store.switchDeck(d2.id);
    await store.createTask('landed in work');
    const cold = store8();
    expect(cold.activeDeckId()).toBe(d2.id);
    expect((await cold.getAllTasks()).map(t => t.title)).toEqual(['landed in work']);
    // and the preference key is NOT inside the document
    expect(localStorage.getItem(KEY8)!.includes('activeDeck')).toBe(false);
  });

  it('switching to an unknown deck throws; a stale preference falls back to deck-1', async () => {
    localStorage.clear();
    const store = store8();
    await expect(store.switchDeck('nope')).rejects.toThrow(/deck/i);
    localStorage.setItem(`${KEY8}.activeDeck`, 'ghost-deck');
    const next = store8();
    expect((await next.getDecks())[0].id).toBe(next.activeDeckId());
  });

  it('renameDeck renames; deleteDeck refuses a non-empty deck and the last deck', async () => {
    localStorage.clear();
    const store = store8();
    const [d1] = await store.getDecks();
    await store.renameDeck(d1.id, 'life');
    expect((await store.getDecks())[0].name).toBe('life');

    await store.createTask('occupant');
    await expect(store.deleteDeck(d1.id)).rejects.toThrow(/cards/i);

    const d2 = await store.createDeck('empty one');
    await store.deleteDeck(d2.id);
    expect((await store.getDecks())).toHaveLength(1);
    await expect(store.deleteDeck(d1.id)).rejects.toThrow(/cards|last/i);
  });

  it('deleting the ACTIVE deck moves the active pointer home to deck[0]', async () => {
    localStorage.clear();
    const store = store8();
    const d2 = await store.createDeck('temp');
    await store.switchDeck(d2.id);
    await store.deleteDeck(d2.id);
    expect(store.activeDeckId()).toBe((await store.getDecks())[0].id);
  });

  it('cross-deck invariants hold: rooms, undo, and find reach every deck', async () => {
    localStorage.clear();
    const store = store8();
    const done1 = await store.createTask('done in one');
    await store.completeTask(done1.id);
    const d2 = await store.createDeck('work');
    await store.switchDeck(d2.id);
    const done2 = await store.createTask('done in work');
    await store.completeTask(done2.id);
    // find + mutate a card that lives in the NON-active deck
    await store.uncompleteTask(done1.id);
    const decks = await store.getDecks();
    expect(decks[0].cards[0].completed).toBe(false);
    expect(decks[1].cards[0].completed).toBe(true);
    // undo (a cross-deck document restore) un-does that un-completion
    await store.undoLast();
    expect((await store.getDecks())[0].cards[0].completed).toBe(true);
  });
});

describe('moveCardToDeck (R2.1 stage 3: promote-at-top gains a meaning)', () => {
  const KEY9 = 'movedeck';
  const store9 = () => new LocalTaskStore(KEY9);

  it('moves a top-level card to the TOP of another deck (newest-on-top rule)', async () => {
    localStorage.clear();
    const store = store9();
    const mover = await store.createTask('mover');
    const d2 = await store.createDeck('work');
    await store.switchDeck(d2.id);
    await store.createTask('already here');
    await store.moveCardToDeck(mover.id, d2.id);
    const decks = await store.getDecks();
    expect(decks[0].cards).toHaveLength(0);
    // top of target: active order puts the mover first
    await store.switchDeck(d2.id);
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['mover', 'already here']);
  });

  it('the whole interior rides along', async () => {
    localStorage.clear();
    const store = store9();
    const mover = await store.createTask('mover');
    const deck = await store.createSubstack(mover.id, 'steps');
    await store.addSubstackTask(deck.id, 'inside');
    const d2 = await store.createDeck('work');
    await store.moveCardToDeck(mover.id, d2.id);
    const decks = await store.getDecks();
    expect(decks[1].cards[0].decks![0].cards[0].title).toBe('inside');
  });

  it('refuses unknown cards, unknown decks, no-op same-deck moves, and nested cards', async () => {
    localStorage.clear();
    const store = store9();
    const top = await store.createTask('top');
    const inner = await store.createSubstack(top.id, null);
    const nested = await store.addSubstackTask(inner.id, 'nested');
    const d2 = await store.createDeck('work');
    await expect(store.moveCardToDeck('ghost', d2.id)).rejects.toThrow(/not found/i);
    await expect(store.moveCardToDeck(top.id, 'ghost-deck')).rejects.toThrow(/deck/i);
    await expect(store.moveCardToDeck(top.id, (await store.getDecks())[0].id)).rejects.toThrow(/already/i);
    await expect(store.moveCardToDeck(nested.id, d2.id)).rejects.toThrow(/top-level|promote/i);
  });
});

describe('future data refuses to boot — never quarantine-and-rollback (2026-08-04)', () => {
  it('constructor throws, main key untouched, nothing quarantined, no snapshot rollback', () => {
    localStorage.clear();
    const KEY = 'futuretest';
    // an older snapshot that a wrong recovery path would roll back to
    localStorage.setItem(`${KEY}.meta`, JSON.stringify({ count: 1, updatedAt: '2026-08-01T00:00:00Z' }));
    localStorage.setItem(`${KEY}.snapshot.2026-08-01`, JSON.stringify({ schemaVersion: 3, decks: [
      { id: 'r', name: 'deck-1', createdAt: '2026-08-01T00:00:00Z', cards: [
        { id: 'old', title: 'stale snapshot card', completed: false, createdAt: '2026-08-01T00:00:00Z' } ] } ] }));
    const futureDoc = JSON.stringify({ schemaVersion: 99, holos: [{ shards: [] }] });
    localStorage.setItem(KEY, futureDoc);

    expect(() => new LocalTaskStore(KEY)).toThrow(/newer/i);
    // the stored document is byte-identical — no write of any kind
    expect(localStorage.getItem(KEY)).toBe(futureDoc);
    // and no quarantine copy was minted
    for (let i = 0; i < localStorage.length; i++) {
      expect(localStorage.key(i)!.includes('.corrupt.')).toBe(false);
    }
  });
});

describe('housekeeping is NOT undoable (Xian 2026-08-06: shake undid the wrong thing)', () => {
  const KEY = 'hkundo';
  const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

  it('a launch sweep leaves the undo stack EMPTY — undo must reverse user actions only', async () => {
    localStorage.clear();
    localStorage.setItem(KEY, JSON.stringify({ schemaVersion: 3, decks: [{
      id: 'r', name: 'deck-1', createdAt: daysAgo(90), cards: [
        { id: 'old', title: 'ancient done', completed: true, createdAt: daysAgo(90), completedAt: daysAgo(40) },
        { id: 'live', title: 'live', completed: false, createdAt: daysAgo(2), sortOrder: 0 },
      ] }] }));
    const store = new LocalTaskStore(KEY);
    expect(store.lastHousekeeping).toBe(1);          // the sweep DID something
    expect(store.canUndo()).toBe(false);             // ...and it is not on the stack
    // so a shake right after launch offers nothing, instead of silently
    // reversing a background chore the user never performed
    expect(await store.undoLast()).toBe(false);
  });

  it('user actions after a sweep still undo normally', async () => {
    localStorage.clear();
    localStorage.setItem(KEY, JSON.stringify({ schemaVersion: 3, decks: [{
      id: 'r', name: 'deck-1', createdAt: daysAgo(90), cards: [
        { id: 'old', title: 'ancient done', completed: true, createdAt: daysAgo(90), completedAt: daysAgo(40) },
        { id: 'live', title: 'live', completed: false, createdAt: daysAgo(2), sortOrder: 0 },
      ] }] }));
    const store = new LocalTaskStore(KEY);
    await store.completeTask('live');
    expect(store.canUndo()).toBe(true);
    await store.undoLast();
    const live = (await store.getDecks())[0].cards.find(c => c.id === 'live')!;
    expect(live.completed).toBe(false);
    // and the housekeeping result is NOT rolled back by that undo
    const old = (await store.getDecks())[0].cards.find(c => c.id === 'old')!;
    expect(old.archivedAt).toBeTruthy();
  });
});

describe('redo (Xian 2026-08-06: "especially if undoing too fast")', () => {
  const KEY = 'redotest';
  const store0 = () => new LocalTaskStore(KEY);

  it('redo re-applies what undo reversed', async () => {
    localStorage.clear();
    const store = store0();
    const a = await store.createTask('target');
    await store.completeTask(a.id);
    await store.undoLast();
    expect((await store.getAllTasks()).find(t => t.id === a.id)!.completed).toBe(false);
    expect(store.canRedo()).toBe(true);
    await store.redoLast();
    expect((await store.getAllTasks()).find(t => t.id === a.id)!.completed).toBe(true);
  });

  it('walks: undo undo redo redo lands where it started; undo after redo works', async () => {
    localStorage.clear();
    const store = store0();
    await store.createTask('one');
    await store.createTask('two');
    await store.undoLast(); await store.undoLast();       // back to just 'one'... then empty? one createTask remains
    await store.redoLast(); await store.redoLast();
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['two', 'one']);
    await store.undoLast();                                // undo-of-redo
    expect((await store.getAllTasks()).map(t => t.title)).toEqual(['one']);
  });

  it('a NEW user action clears redo — no forked histories', async () => {
    localStorage.clear();
    const store = store0();
    await store.createTask('one');
    await store.createTask('two');
    await store.undoLast();
    expect(store.canRedo()).toBe(true);
    await store.createTask('three');       // divergence
    expect(store.canRedo()).toBe(false);
    expect(await store.redoLast()).toBe(false);
  });

  it('empty redo returns false harmlessly', async () => {
    localStorage.clear();
    const store = store0();
    expect(store.canRedo()).toBe(false);
    expect(await store.redoLast()).toBe(false);
  });
});
