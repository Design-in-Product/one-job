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

  it('creates tasks with sequential sort order', async () => {
    const store = freshStore();
    const a = await store.createTask('A');
    const b = await store.createTask('B');
    expect(a.sortOrder).toBe(1);
    expect(b.sortOrder).toBe(2);
    expect(a.status).toBe('todo');
    expect(a.completed).toBe(false);
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

  it('deferTask moves the task to the bottom and counts deferrals', async () => {
    const store = freshStore();
    const first = await store.createTask('First');
    await store.createTask('Second');
    await store.createTask('Third');

    const deferred = await store.deferTask(first.id);
    expect(deferred.deferralCount).toBe(1);
    expect(deferred.deferredAt).toBeInstanceOf(Date);
    expect(deferred.status ?? 'todo').toBe('todo');

    const order = (await store.getAllTasks()).map(t => t.title);
    expect(order).toEqual(['Second', 'Third', 'First']);

    await store.deferTask(first.id);
    expect((await store.getAllTasks()).find(t => t.title === 'First')!.deferralCount).toBe(2);
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
    expect(reloaded.substacks).toHaveLength(1);
    expect(reloaded.substacks![0].tasks).toHaveLength(1);
    expect(reloaded.substacks![0].tasks[0].completed).toBe(true);
    expect(reloaded.substacks![0].tasks[0].completedAt).toBeInstanceOf(Date);
  });

  it('throws when the substack does not exist', async () => {
    await expect(freshStore().addSubstackTask('nope', 'x')).rejects.toThrow('Substack not found');
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
    const first = await store.createTask('First');
    await store.createTask('Second');
    const snapshot = structuredClone(first);

    await store.deferTask(first.id);
    expect((await store.getAllTasks())[0].title).toBe('Second');

    await store.restoreTask(snapshot);
    const tasks = await store.getAllTasks();
    expect(tasks[0].title).toBe('First');
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
    expect(JSON.parse(localStorage.getItem(snaps[0])!)).toHaveLength(1);
  });

  it('restores from the newest snapshot when the main key disappears', async () => {
    await freshStore().createTask('Survivor');
    localStorage.removeItem(KEY); // the wipe
    const tasks = await freshStore().getAllTasks();
    expect(tasks.map(t => t.title)).toEqual(['Survivor']);
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
    // main key is re-established
    expect(JSON.parse(localStorage.getItem(KEY)!)).toHaveLength(1);
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
    expect(JSON.parse(localStorage.getItem(snaps[0])!)).toHaveLength(1);
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
      substacks: [{
        id: 'sub1',
        name: 'Restored sub',
        createdAt: '2026-01-16T10:00:00.000Z',
        tasks: [{
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
    expect(tasks[0].substacks![0].createdAt).toBeInstanceOf(Date);
    expect(tasks[0].substacks![0].tasks[0].completedAt).toBeInstanceOf(Date);

    // and the round trip survives a cold start
    expect((await freshStore().getAllTasks())[0].title).toBe('Restored');
  });
});
