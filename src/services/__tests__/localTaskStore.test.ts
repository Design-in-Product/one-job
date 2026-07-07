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
    expect(JSON.parse(localStorage.getItem(snaps[0])!).cards).toHaveLength(1);
  });

  it('restores from the newest snapshot when the main key disappears', async () => {
    await freshStore().createTask('Survivor');
    localStorage.removeItem(KEY); // the wipe
    const tasks = await freshStore().getAllTasks();
    expect(tasks.map(t => t.title)).toEqual(['Survivor']);
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
    // main key is re-established (v2 envelope)
    expect(JSON.parse(localStorage.getItem(KEY)!).cards).toHaveLength(1);
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
    expect(JSON.parse(localStorage.getItem(snaps[0])!).cards).toHaveLength(1);
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
