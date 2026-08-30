// R1.5 local instrumentation (docs/plans/2026-08-28-instrumentation-plan.md).
// YELLOW ZONE with one RED-zone rule: metrics failures must never break a
// task operation — proven here, not asserted in prose.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  recordCardCreated,
  recordCardCompleted,
  recordCardDeferred,
  recordInteriorOpened,
  getMetrics,
  buildUsageExport,
  isActivated,
  isRetained,
  engagedWeeks,
  dayIndex,
  type MetricsDocument,
} from '../metricsStore';
import { LocalTaskStore } from '../localTaskStore';

const KEY = 'oneJobMetrics';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  vi.restoreAllMocks();
});

// Synthetic document builder for the pure-definition tests.
const doc = (over: Partial<MetricsDocument> = {}): MetricsDocument => ({
  v: 1,
  installId: 'test',
  firstUse: '2026-09-01',
  activeDays: [],
  completionDays: [],
  totals: { created: 0, completed: 0, deferred: 0, interiorsOpened: 0 },
  deferralDepth: { max: 0, histogram: {} },
  ...over,
});

describe('recorders', () => {
  it('creates the document on first record, with install id and firstUse', () => {
    recordCardCreated();
    const m = getMetrics()!;
    expect(m.totals.created).toBe(1);
    expect(m.installId).toBeTruthy();
    expect(m.firstUse).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(m.activeDays).toHaveLength(1);
  });

  it('counts completions and their days; activity days never duplicate', () => {
    recordCardCompleted();
    recordCardCompleted();
    const m = getMetrics()!;
    expect(m.totals.completed).toBe(2);
    expect(m.completionDays).toHaveLength(1); // same day, one entry
    expect(m.activeDays).toHaveLength(1);
  });

  it('tracks deferral depth as max + per-depth event histogram', () => {
    recordCardDeferred(1);
    recordCardDeferred(2);
    recordCardDeferred(1);
    const m = getMetrics()!;
    expect(m.totals.deferred).toBe(3);
    expect(m.deferralDepth.max).toBe(2);
    expect(m.deferralDepth.histogram).toEqual({ '1': 2, '2': 1 });
  });

  it('counts interior opens', () => {
    recordInteriorOpened();
    expect(getMetrics()!.totals.interiorsOpened).toBe(1);
  });

  it('getMetrics is null before anything is recorded', () => {
    expect(getMetrics()).toBeNull();
  });
});

describe('THE ONE HARD RULE: metrics can never break a task operation', () => {
  it('a task create succeeds even when the metrics write throws (quota)', async () => {
    const store = new LocalTaskStore('metricsguard');
    const realSetItem = localStorage.setItem.bind(localStorage);
    // Fail ONLY the metrics key — the task document must still save.
    vi.spyOn(localStorage, 'setItem').mockImplementation((k: string, v: string) => {
      if (k === KEY) throw new Error('QuotaExceededError');
      return realSetItem(k, v);
    });
    const task = await store.createTask('survives');
    expect(task.title).toBe('survives');
    expect((await store.getAllTasks()).map(t => t.title)).toContain('survives');
  });

  it('complete and defer also survive a poisoned metrics store', async () => {
    const store = new LocalTaskStore('metricsguard2');
    const t1 = await store.createTask('one');
    const t2 = await store.createTask('two');
    localStorage.setItem(KEY, '{not json'); // corrupt document
    await expect(store.completeTask(t1.id)).resolves.toBeTruthy();
    await expect(store.deferTask(t2.id)).resolves.toBeTruthy();
  });
});

describe('store seam records real operations', () => {
  it('create/complete/defer flow lands in metrics with correct counts', async () => {
    const store = new LocalTaskStore('metricsseam');
    const a = await store.createTask('a');
    const b = await store.createTask('b');
    await store.completeTask(a.id);
    await store.deferTask(b.id);
    const m = getMetrics()!;
    expect(m.totals).toMatchObject({ created: 2, completed: 1, deferred: 1 });
    expect(m.deferralDepth.max).toBe(1);
  });

  it('sub-deck creation and completion count too (a card is a card at depth)', async () => {
    const store = new LocalTaskStore('metricsdepth');
    const parent = await store.createTask('parent');
    const deck = await store.createSubstack(parent.id, null);
    const child = await store.addSubstackTask(deck.id, 'child');
    await store.completeSubstackTask(child.id);
    const m = getMetrics()!;
    expect(m.totals.created).toBe(2); // parent + child
    expect(m.totals.completed).toBe(1);
  });

  it('imports do NOT count as created (bulk arrival is not activation)', async () => {
    const store = new LocalTaskStore('metricsimport');
    await store.importAsSubdeck([
      { id: 'x', title: 'imported', completed: false, createdAt: new Date() } as never,
    ]);
    expect(getMetrics()).toBeNull(); // no hand-creation happened
  });
});

describe('pre-registered definitions (executable, not prose)', () => {
  it('dayIndex: first day is 1', () => {
    expect(dayIndex('2026-09-01', '2026-09-01')).toBe(1);
    expect(dayIndex('2026-09-22', '2026-09-01')).toBe(22);
    expect(dayIndex('2026-09-28', '2026-09-01')).toBe(28);
  });

  it('activated = ≥5 created AND a second distinct day', () => {
    expect(isActivated(doc({
      totals: { created: 5, completed: 0, deferred: 0, interiorsOpened: 0 },
      activeDays: ['2026-09-01', '2026-09-03'],
    }))).toBe(true);
    // 5 cards but a single day: not activated
    expect(isActivated(doc({
      totals: { created: 5, completed: 0, deferred: 0, interiorsOpened: 0 },
      activeDays: ['2026-09-01'],
    }))).toBe(false);
    // two days but only 4 cards: not activated
    expect(isActivated(doc({
      totals: { created: 4, completed: 0, deferred: 0, interiorsOpened: 0 },
      activeDays: ['2026-09-01', '2026-09-03'],
    }))).toBe(false);
  });

  it('retained = 4+ active days inside days 22–28 (week 4), boundaries exact', () => {
    // Days 22, 24, 26, 28 → retained
    expect(isRetained(doc({
      activeDays: ['2026-09-22', '2026-09-24', '2026-09-26', '2026-09-28'],
    }))).toBe(true);
    // Day 21 and day 29 fall OUTSIDE the window: only 3 qualifying days
    expect(isRetained(doc({
      activeDays: ['2026-09-21', '2026-09-22', '2026-09-24', '2026-09-26', '2026-09-29'],
    }))).toBe(false);
  });

  it('engaged weeks = weeks with completions on 4+ distinct days', () => {
    // Week 1 = days 1–7: four completion days qualifies
    expect(engagedWeeks(doc({
      completionDays: ['2026-09-01', '2026-09-02', '2026-09-04', '2026-09-07'],
    }))).toEqual([1]);
    // Three days in week 1, four in week 2 → only week 2
    expect(engagedWeeks(doc({
      completionDays: [
        '2026-09-01', '2026-09-02', '2026-09-03',
        '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11',
      ],
    }))).toEqual([2]);
  });
});

describe('export payload', () => {
  it('carries raw metrics + computed verdicts + the decks snapshot', () => {
    recordCardCreated();
    const payload = buildUsageExport(3)!;
    expect(payload.kind).toBe('usage-summary');
    expect(payload.metrics.totals.created).toBe(1);
    expect(payload.computed.activated).toBe(false);
    expect(payload.computed.decksActive).toBe(3);
  });

  it('is null when nothing was ever recorded (no empty exports)', () => {
    expect(buildUsageExport(1)).toBeNull();
  });
});
