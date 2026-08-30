// scripts/collate-metrics.mjs — checkpoint-day collation for the pilot.
//
// Takes N usage-summary JSON files (participants' Settings exports) and
// produces the cohort report with HONEST BOUNDS: non-responders can't be
// counted as retained, so every rate is reported as
//   confirmed-of-responders  AND  lower-bound-of-cohort.
// (docs/plans/2026-08-28-instrumentation-plan.md §"non-response is signal")
//
// Usage: node scripts/collate-metrics.mjs --cohort 50 exports/*.json

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const ci = args.indexOf('--cohort');
const cohortSize = ci !== -1 ? Number(args[ci + 1]) : null;
const files = args.filter((a, i) => a !== '--cohort' && i !== ci + 1);

if (files.length === 0) {
  console.error('usage: node scripts/collate-metrics.mjs [--cohort N] <export.json...>');
  process.exit(1);
}

const rows = [];
for (const f of files) {
  try {
    const d = JSON.parse(readFileSync(f, 'utf8'));
    if (d.kind !== 'usage-summary') {
      console.error(`skip (not a usage summary): ${f}`);
      continue;
    }
    rows.push({ file: f, id: d.metrics.installId, ...d.computed, m: d.metrics });
  } catch (e) {
    console.error(`skip (unreadable): ${f} — ${e.message}`);
  }
}

// Multiple checkpoints from one install: keep the newest per installId.
const byId = new Map();
for (const r of rows) {
  const prev = byId.get(r.id);
  if (!prev || r.m.activeDays.length >= prev.m.activeDays.length) byId.set(r.id, r);
}
const people = [...byId.values()];
const n = people.length;

const count = pred => people.filter(pred).length;
const pct = x => (n ? Math.round((100 * x) / n) : 0);
const bound = x => (cohortSize ? Math.round((100 * x) / cohortSize) : null);

const activated = count(p => p.activated);
const retained = count(p => p.retained);
const engagedAny = count(p => (p.engagedWeeks ?? []).length > 0);

console.log(`# Pilot checkpoint — ${new Date().toISOString().slice(0, 10)}`);
console.log(`Responders: ${n}${cohortSize ? ` of ${cohortSize} cohort` : ''} (${rows.length} files, deduped by install)`);
console.log('');
const line = (label, x) =>
  console.log(
    `${label}: ${x}/${n} responders (${pct(x)}%)` +
      (cohortSize ? ` · cohort lower bound ${bound(x)}% (if every non-responder failed this metric)` : '')
  );
line('Activated', activated);
line('Retained (week 4)', retained);
line('Engaged (any week)', engagedAny);
console.log('');
console.log('Supporting (responders only):');
const sum = k => people.reduce((a, p) => a + p.m.totals[k], 0);
console.log(`  cards created ${sum('created')} · completed ${sum('completed')} · deferred ${sum('deferred')}`);
const maxDepth = Math.max(0, ...people.map(p => p.m.deferralDepth.max));
console.log(`  deepest deferral anywhere: ${maxDepth}`);
const days = people.map(p => p.m.activeDays.length).sort((a, b) => a - b);
console.log(`  active days per responder: median ${days[Math.floor(days.length / 2)] ?? 0}, range ${days[0] ?? 0}–${days[days.length - 1] ?? 0}`);
