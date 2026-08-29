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

// Items are "### <status> <n>. <title>" headings; ✅ items are closed.
const items = [];
const re = /^### (.+)$/gm;
let m, prev = null;
while ((m = re.exec(open)) !== null) {
  if (prev) prev.body = open.slice(prev.end, m.index).trim();
  prev = { heading: m[1].trim(), end: m.index + m[0].length };
  items.push(prev);
}
if (prev) prev.body = open.slice(prev.end).trim();

const openItems = items.filter(i => !i.heading.startsWith('✅'));

// Status ordering: blocking first, FYI last — the deck's initial order.
const rank = h => (h.startsWith('🔴') ? 0 : h.startsWith('🟡') ? 1 : 2);
openItems.sort((a, b) => rank(a.heading) - rank(b.heading));

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
