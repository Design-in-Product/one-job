// scripts/fleet-probe.mjs — the R4.2-lite fleet probe, crude on purpose.
//
// Reads ATTENTION-ROLLUP.md's Open section and emits a One Job backup-
// shaped JSON (v2 flat-tasks envelope) whose cards are the open items.
// Xian imports it on his phone via Settings → paste/file → "Bring in as
// a new deck" and answers agents from the deck for two weeks.
//
// THE CEILING, from the roadmap memo (2026-08-26): "No MCP. No protocol.
// No adapter seam. If this probe grows an architecture, it has failed at
// its job." What it measures is FEEL — whether a card is a good place to
// answer an agent. Answers flow back by whatever is cheapest (chat, the
// briefing artifact's composer — the channels that already exist).
//
// Usage: node scripts/fleet-probe.mjs [> out.json]
//   Writes docs/probe/attention-deck-<date>.json and prints a summary.
//
// Scope: EVERYTHING open (🔴/🟡/🟢 alike) — Xian's call, 2026-08-28:
// the deck carries the real volume, not a curated version.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const rollup = readFileSync('docs/ATTENTION-ROLLUP.md', 'utf8');

// The Open section runs from "## Open" to "## Settled".
const open = rollup.split(/^## Open$/m)[1]?.split(/^## Settled$/m)[0];
if (!open) throw new Error('Could not find the Open section — rollup structure changed?');

// Items are "### <status> <n>. <title>" headings.
//
// EXPLICIT CLASSIFICATION, no silent default (2026-08-31, after the
// cross-pollination brief on filter-widening: "a widening turns a
// previously-unreachable narrow filter into a live silent default").
// The original version ranked with `startsWith('🔴') ? 0 : '🟡' ? 1 : 2`
// and filtered closed items with `!startsWith('✅')` — both anchored to
// exact markers, both silently defaulting anything else. A discriminating
// probe proved the cost: headings marked closed a different way ("✔︎",
// "CLOSED") were dealt to Xian as live work, and an unmarked urgent item
// was buried below the FYI cards. The count went UP, reading as coverage.
//
// Now: every heading must classify against a known marker, or the script
// refuses to write a deck that would mis-deal attention. A five-second
// heading fix beats a silently wrong deck (the deterministic-pipeline
// principle: surface the unhandled shape, never absorb it).
export const OPEN_RANK = { '🔴': 0, '🟡': 1, '🟢': 2 };
export const CLOSED_MARKERS = ['✅'];

/** → {kind:'open', rank} | {kind:'closed'} | {kind:'unclassified'} */
export function classifyHeading(heading) {
  const marker = [...heading.trim()][0];
  if (CLOSED_MARKERS.includes(marker)) return { kind: 'closed' };
  if (marker in OPEN_RANK) return { kind: 'open', rank: OPEN_RANK[marker] };
  return { kind: 'unclassified' };
}

const items = [];
const re = /^### (.+)$/gm;
let m, prev = null;
while ((m = re.exec(open)) !== null) {
  if (prev) prev.body = open.slice(prev.end, m.index).trim();
  prev = { heading: m[1].trim(), end: m.index + m[0].length };
  items.push(prev);
}
if (prev) prev.body = open.slice(prev.end).trim();

for (const i of items) i.status = classifyHeading(i.heading);

const unclassified = items.filter(i => i.status.kind === 'unclassified');
if (unclassified.length) {
  console.error(
    `\nRefusing to deal: ${unclassified.length} rollup heading(s) carry no ` +
    `recognized status marker (${Object.keys(OPEN_RANK).join(' ')} open, ` +
    `${CLOSED_MARKERS.join(' ')} closed):\n` +
    unclassified.map(i => `  ### ${i.heading}`).join('\n') +
    `\n\nA deck built from these would misfile Xian's attention silently.\n` +
    `Fix the heading(s) in docs/ATTENTION-ROLLUP.md, then re-run.\n`
  );
  process.exit(1);
}

const openItems = items.filter(i => i.status.kind === 'open');
// Status ordering: blocking first, FYI last — the deck's initial order.
openItems.sort((a, b) => a.status.rank - b.status.rank);

const today = new Date().toISOString().slice(0, 10);
const tasks = openItems.map((item, i) => ({
  id: randomUUID(),
  title: item.heading,
  // The card face carries enough to answer from; the full ledger stays
  // the source of truth. Truncated at a phone-readable size, provenance
  // stamped so the card names its origin like any future agent card.
  description:
    item.body.slice(0, 900) +
    (item.body.length > 900 ? '\n[…more in ATTENTION-ROLLUP.md]' : '') +
    `\n\n— dealt by Coral from ATTENTION-ROLLUP.md · ${today}`,
  completed: false,
  status: 'todo',
  createdAt: new Date().toISOString(),
  sortOrder: i + 1,
  source: 'coral/attention-rollup',
}));

const backup = {
  app: 'one-job',
  version: 2,
  exportedAt: new Date().toISOString(),
  tasks,
};

mkdirSync('docs/probe', { recursive: true });
const outPath = `docs/probe/attention-deck-${today}.json`;
writeFileSync(outPath, JSON.stringify(backup, null, 2));
console.log(`${tasks.length} open items → ${outPath}`);
for (const t of tasks) console.log('  ·', t.title);
