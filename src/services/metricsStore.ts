// src/services/metricsStore.ts
// R1.5 local instrumentation (docs/plans/2026-08-28-instrumentation-plan.md).
//
// Everything here is LOCAL: a separate localStorage key, never inside the
// task document, never in task backups, no network calls ever. The only
// way data leaves the device is the user tapping "Share my usage summary"
// in Settings (covenant 7 as amended 2026-08-28: numbers live in Settings
// and the export — never on the deck).
//
// THE ONE HARD RULE: metrics failures must never break a task operation.
// Every write path is wrapped; on any storage error this module degrades
// to silence. The deck always wins.
//
// Pre-registered metric definitions (activated/retained/engaged) are
// EXECUTABLE FUNCTIONS here, not prose — so the numbers can't be re-cut
// post-hoc to flatter a result (the plan's own anti-Rule-14 discipline).

import { v4 as uuidv4 } from 'uuid';
import { storageMode } from '@/config';

const METRICS_KEY = 'oneJobMetrics';
/** Bounded day-set: the pilot needs 28 days; 90 gives margin. */
const MAX_DAYS = 90;

export interface MetricsDocument {
  v: 1;
  installId: string;
  /** ISO date (YYYY-MM-DD) of first recorded activity. */
  firstUse: string;
  /** Where firstUse came from. 'observed' = this instrument was present
      from the user's first day. 'derived' = the instrument arrived later
      and the real start was recovered from the deck. Absent on documents
      written before 2026-09-05. See deriveFirstUse. */
  firstUseSource?: 'observed' | 'derived';
  /** ISO dates with ANY recorded activity (bounded, oldest dropped). */
  activeDays: string[];
  /** ISO dates with ≥1 completion — the "engaged" definition needs
      completion days specifically, not just activity days. */
  completionDays: string[];
  totals: {
    created: number;
    completed: number;
    deferred: number;
    interiorsOpened: number;
  };
  /** Deferral-event histogram keyed by the deferral count the card
      REACHED with that defer (a card deferred to depth 3 increments
      buckets 1, 2, 3 over its lifetime — event counts, not final-state
      counts; max carries the deepest single card). */
  deferralDepth: { max: number; histogram: Record<string, number> };
}

/** Metrics record only in plain local mode: a demo session isn't usage,
    and remote mode is out of the pilot's scope. */
const enabled = () => storageMode === 'local';

const today = () => new Date().toISOString().slice(0, 10);

// ---- Cold start (2026-09-05) ------------------------------------------
// This instrument shipped in rc.34, long after people started using the
// app. Setting firstUse to the day the metrics document is created dates
// the USER from the day the INSTRUMENT arrived — so someone with a
// hundred cards and eight months of history reads as brand new, and
// isActivated (5 created) is false for a daily user until they happen to
// create five more. The numbers stay plausible while being wrong, which
// is the dangerous kind.
//
// The fix is to ask a history that exists independently of this module:
// the deck itself, whose cards carry createdAt. Read-only, never imported
// through taskStore (that would be a cycle), never written to.
//
// From the cross-pollination brief 2026-09-05 (Piper Morgan): "every new
// instrument has a cold-start period where absence-of-data and
// absence-of-event are indistinguishable, and the natural phrasing of
// absence is exactly wrong during it. When you say 'never,' check whether
// you mean 'not since I was installed.'"
const TASKS_KEY = 'oneJobTasks';

/** Earliest card creation day across every deck, or null if unknowable.
    Exported for tests; pure over its input so it needs no storage. */
export const earliestCardDay = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const doc = JSON.parse(raw);
    // v3 is {schemaVersion, decks:[{cards:[…]}]}; older shapes were a bare
    // array of tasks. Accept both — a wrong guess here must not throw.
    const decks = Array.isArray(doc) ? [{ cards: doc }] : doc?.decks;
    if (!Array.isArray(decks)) return null;
    let best: number | null = null;
    for (const deck of decks) {
      for (const card of deck?.cards ?? []) {
        const t = Date.parse(card?.createdAt);
        if (!Number.isNaN(t) && (best === null || t < best)) best = t;
      }
    }
    return best === null ? null : new Date(best).toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

/** firstUse for a document being created or repaired. Only ever moves the
    date EARLIER — a derived value that post-dates what we already recorded
    is discarded, so this can never shorten someone's history. */
const deriveFirstUse = (
  current: string,
): { firstUse: string; firstUseSource: 'observed' | 'derived' } => {
  let derived: string | null = null;
  try {
    derived = earliestCardDay(localStorage.getItem(TASKS_KEY));
  } catch {
    /* storage unavailable — fall through to observed */
  }
  return derived && derived < current
    ? { firstUse: derived, firstUseSource: 'derived' }
    : { firstUse: current, firstUseSource: 'observed' };
};

const fresh = (): MetricsDocument => ({
  v: 1,
  installId: uuidv4(),
  ...deriveFirstUse(today()),
  activeDays: [],
  completionDays: [],
  totals: { created: 0, completed: 0, deferred: 0, interiorsOpened: 0 },
  deferralDepth: { max: 0, histogram: {} },
});

function load(): MetricsDocument {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (raw) {
      const doc = JSON.parse(raw) as MetricsDocument;
      if (doc && doc.v === 1) {
        // Repair documents written before the cold-start fix. One-shot:
        // once firstUseSource is set we never re-derive, so a user who
        // deletes their oldest card doesn't get re-dated.
        if (!doc.firstUseSource) {
          Object.assign(doc, deriveFirstUse(doc.firstUse));
          save(doc);
        }
        return doc;
      }
    }
  } catch {
    /* unreadable/absent — start clean; metrics are never worth an error */
  }
  return fresh();
}

function save(doc: MetricsDocument): void {
  try {
    localStorage.setItem(METRICS_KEY, JSON.stringify(doc));
  } catch {
    /* quota/unavailable — silently drop; the deck always wins */
  }
}

const pushBounded = (days: string[], day: string) => {
  if (days[days.length - 1] === day || days.includes(day)) return;
  days.push(day);
  if (days.length > MAX_DAYS) days.splice(0, days.length - MAX_DAYS);
};

/** Shared mutation wrapper: every recorder is a no-op unless enabled,
    and can never throw. */
function record(mutate: (doc: MetricsDocument) => void): void {
  if (!enabled()) return;
  try {
    const doc = load();
    pushBounded(doc.activeDays, today());
    mutate(doc);
    save(doc);
  } catch {
    /* never propagate — see THE ONE HARD RULE above */
  }
}

// ---- Recorders (called from the store seam / UI) ------------------------

/** Hand-created cards only — imports are bulk arrivals, not the
    activation behavior the "created ≥5" definition measures. */
export const recordCardCreated = () =>
  record(doc => { doc.totals.created++; });

export const recordCardCompleted = () =>
  record(doc => {
    doc.totals.completed++;
    pushBounded(doc.completionDays, today());
  });

export const recordCardDeferred = (deferralCount: number) =>
  record(doc => {
    doc.totals.deferred++;
    const bucket = String(deferralCount);
    doc.deferralDepth.histogram[bucket] =
      (doc.deferralDepth.histogram[bucket] ?? 0) + 1;
    if (deferralCount > doc.deferralDepth.max)
      doc.deferralDepth.max = deferralCount;
  });

export const recordInteriorOpened = () =>
  record(doc => { doc.totals.interiorsOpened++; });

// ---- Pre-registered definitions (pure, executable, tested) --------------

/** Day index relative to first use: first day = 1. */
export const dayIndex = (isoDay: string, firstUse: string): number =>
  Math.floor(
    (Date.parse(isoDay) - Date.parse(firstUse)) / 86_400_000
  ) + 1;

/** Activated: created ≥5 cards AND returned on a second, separate day. */
export const isActivated = (m: MetricsDocument): boolean =>
  m.totals.created >= 5 && m.activeDays.length >= 2;

/** Retained: active on 4+ distinct days during week 4 (days 22–28). */
export const isRetained = (m: MetricsDocument): boolean =>
  m.activeDays.filter(d => {
    const i = dayIndex(d, m.firstUse);
    return i >= 22 && i <= 28;
  }).length >= 4;

/** Engaged (per week n, 1-based): completed ≥1 card on 4+ days of that
    week. Returns the list of week numbers that qualify. */
export const engagedWeeks = (m: MetricsDocument): number[] => {
  const byWeek: Record<number, number> = {};
  for (const d of m.completionDays) {
    const week = Math.ceil(dayIndex(d, m.firstUse) / 7);
    byWeek[week] = (byWeek[week] ?? 0) + 1;
  }
  return Object.entries(byWeek)
    .filter(([, days]) => days >= 4)
    .map(([w]) => Number(w))
    .sort((a, b) => a - b);
};

// ---- Read / export ------------------------------------------------------

/** The current document, for the Settings surface. Null when disabled
    or nothing recorded yet. */
export function getMetrics(): MetricsDocument | null {
  if (!enabled()) return null;
  try {
    return localStorage.getItem(METRICS_KEY) ? load() : null;
  } catch {
    return null;
  }
}

/** The export payload: the raw document plus the computed verdicts and
    point-in-time snapshots the collate script consumes. `decksActive`
    is a snapshot computed by the caller (store knowledge lives there). */
export function buildUsageExport(decksActive: number | null) {
  const m = getMetrics();
  if (!m) return null;
  return {
    app: 'one-job',
    kind: 'usage-summary',
    v: 1,
    exportedAt: new Date().toISOString(),
    metrics: m,
    computed: {
      activated: isActivated(m),
      retained: isRetained(m),
      engagedWeeks: engagedWeeks(m),
      activeDayCount: m.activeDays.length,
      ...(decksActive !== null ? { decksActive } : {}),
    },
  };
}
