// Pins the v1 storage contract: every fixture in the corpus must load
// through today's store exactly as real user data does — revived dates,
// preserved fields, correct ordering — and survive the backup
// round-trip. When the v2 migration lands (build sequence #7), these
// same fixtures become its inputs; this file is the "before" picture.

import { describe, it, expect, beforeEach } from 'vitest';
import { LocalTaskStore } from '@/services/localTaskStore';
import { Task } from '@/types/task';
import { allFixtures, substackDeck, strandedInteriorDeck, deferralDeck } from './fixtures/v1-decks';

const KEY = 'fixtureTasks';

const loadFixture = (fixture: unknown): LocalTaskStore => {
  localStorage.setItem(KEY, JSON.stringify(fixture));
  return new LocalTaskStore(KEY);
};

beforeEach(() => localStorage.clear());

describe('v1 fixture corpus loads through the current store', () => {
  for (const [name, fixture] of Object.entries(allFixtures)) {
    it(`${name}: loads, revives dates, and survives the backup round-trip`, async () => {
      const store = loadFixture(fixture);
      const tasks = await store.getAllTasks();
      expect(tasks).toHaveLength((fixture as unknown[]).length);
      for (const task of tasks) {
        expect(task.createdAt).toBeInstanceOf(Date);
        if (task.completed) expect(task.completedAt).toBeInstanceOf(Date);
        for (const sub of task.substacks ?? []) {
          expect(sub.createdAt).toBeInstanceOf(Date);
          for (const st of sub.tasks) expect(st.createdAt).toBeInstanceOf(Date);
        }
      }

      // backup round-trip: export shape → import → identical titles/ids
      const exported: Task[] = JSON.parse(JSON.stringify(tasks));
      localStorage.clear();
      const restoreStore = new LocalTaskStore(KEY);
      await restoreStore.importTasks(exported);
      const restored = await restoreStore.getAllTasks();
      expect(restored.map(t => t.id).sort()).toEqual(tasks.map(t => t.id).sort());
    });
  }
});

describe('v1 semantics the migration must preserve', () => {
  it('active-before-completed ordering (simple deck)', async () => {
    const tasks = await loadFixture(allFixtures.simpleDeck).getAllTasks();
    expect(tasks.map(t => t.id)).toEqual(['a1', 'a2', 'a3']);
  });

  it('deferral history survives (count and timestamp)', async () => {
    const tasks = await loadFixture(deferralDeck).getAllTasks();
    const veteran = tasks.find(t => t.id === 'b1')!;
    expect(veteran.deferralCount).toBe(7);
    expect(veteran.deferredAt).toBeInstanceOf(Date);
    // and it sits below the newer task despite being older
    expect(tasks[0].id).toBe('b2');
  });

  it('substack states: mixed progress, all-done, and empty all load', async () => {
    const [parent] = await loadFixture(substackDeck).getAllTasks();
    expect(parent.substacks).toHaveLength(3);
    const byName = Object.fromEntries(parent.substacks!.map(s => [s.name, s]));
    expect(byName['Logistics'].tasks.filter(t => !t.completed)).toHaveLength(1);
    expect(byName['Agenda'].tasks.every(t => t.completed)).toBe(true);
    expect(byName['Empty ideas'].tasks).toHaveLength(0);
  });

  it('stranded interior: completed parent with open sub-tasks exists in v1 data', async () => {
    const [parent] = await loadFixture(strandedInteriorDeck).getAllTasks();
    expect(parent.completed).toBe(true);
    const stranded = parent.substacks![0].tasks.filter(t => !t.completed);
    expect(stranded).toHaveLength(1); // migration must NOT lose this task
  });

  it('legacy field drift: missing status/sortOrder/substacks tolerated', async () => {
    const tasks = await loadFixture(allFixtures.legacyFieldsDeck).getAllTasks();
    const preStatus = tasks.find(t => t.id === 'e1')!;
    expect(preStatus.status).toBeUndefined();
    expect(preStatus.substacks).toBeUndefined();
    const imported = tasks.find(t => t.id === 'e2')!;
    expect(imported.source).toBe('Asana');
    expect(imported.externalId).toBe('asana-12345');
  });
});
