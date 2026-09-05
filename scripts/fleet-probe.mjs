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

// The Open section runs from "## Open" to the NEXT top-level heading —
// not to "## Settled" specifically. 2026-09-01: an intervening section
// ("What I'm carrying") was added between them and its items silently
// leaked into the deck, because the old split only stopped at Settled.
// Ending at any `## ` means a new section can never leak in unnoticed —
// the same no-silent-default rule the status and Ask guards follow.
const afterOpen = rollup.split(/^## Open$/m)[1];
if (afterOpen === undefined) {
  throw new Error('Could not find the Open section — rollup structure changed?');
}
const open = afterOpen.split(/^## /m)[0];

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

// ---- Card shape (2026-08-31, Xian's probe feedback: "concise and clear
// about what is needed of me"). A card is not a ledger excerpt. It leads
// with the ASK, carries the recommendation, and points at the ledger for
// the rest. Same no-silent-default discipline as the status markers: an
// open item WITHOUT an Ask cannot become a card, because a card that
// doesn't say what it wants is exactly the failure he reported.
// A ledger that reports "open" says only that the item isn't closed NOW.
// It cannot distinguish an ask raised yesterday from one that has been
// waiting five weeks — they render identically, which is precisely why
// Xian's read of the first deck was "some items seemed possibly stale."
// **Since:** converts that boolean into a timestamp. (Cross-pollination
// brief 2026-09-04, from Piper Morgan: an alert that reports silence
// should say when the thing last ran — "the difference between an
// instrument and a fire drill.")
export const ageInDays = (since, now) => {
  const a = Date.parse(`${since}T00:00:00Z`);
  const b = Date.parse(`${now}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
};

export const parseAsk = body => {
  const grab = label => {
    const m = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n### |$)`));
    return m ? m[1].trim().replace(/\s+/g, ' ') : null;
  };
  return { ask: grab('Ask'), rec: grab('Rec'), since: grab('Since') };
};

for (const i of openItems) Object.assign(i, parseAsk(i.body));

const askless = openItems.filter(i => !i.ask);
if (askless.length) {
  console.error(
    `\nRefusing to deal: ${askless.length} open item(s) have no **Ask:** line:\n` +
    askless.map(i => `  ### ${i.heading}`).join('\n') +
    `\n\nA card that doesn't say what it needs is the exact problem this\n` +
    `format exists to fix. Add an **Ask:** to each, then re-run.\n`
  );
  process.exit(1);
}

const dateless = openItems.filter(i => !i.since || ageInDays(i.since, '2026-01-01') === null);
if (dateless.length) {
  console.error(
    `\nRefusing to deal: ${dateless.length} open item(s) have no valid **Since:** line:\n` +
    dateless.map(i => `  ### ${i.heading}`).join('\n') +
    `\n\nWithout a date, an ask raised yesterday and one that has been\n` +
    `waiting five weeks look identical on the card — the staleness Xian\n` +
    `reported. Add **Since:** YYYY-MM-DD to each, then re-run.\n`
  );
  process.exit(1);
}

const today = () => new Date().toISOString().slice(0, 10);
const tasks = openItems.map((item, i) => {
  // Title = the ask itself, so the face of the card is the question.
  // Number + status stay as a short prefix for provenance and triage.
  const num = (item.heading.match(/\b(\d+[a-z]?(?:\/\d+[a-z]?)*)\./) || [, '?'])[1];
  const marker = [...item.heading.trim()][0];
  return {
    id: randomUUID(),
    title: item.ask,
    description:
      `${marker} #${num} · ${item.heading.replace(/^\S+\s*/, '').replace(/^\d+[a-z]?\.\s*/, '')}` +
      (item.rec ? `\n\nCoral's rec: ${item.rec}` : '') +
      `\n\nFull context: docs/ATTENTION-ROLLUP.md` +
      `\n— dealt by Coral · ${today()} · waiting ${ageInDays(item.since, today())} days (since ${item.since})`,
    completed: false,
    status: 'todo',
    createdAt: new Date().toISOString(),
    sortOrder: i + 1,
    source: 'coral/attention-rollup',
  };
});

const backup = {
  app: 'one-job',
  version: 2,
  exportedAt: new Date().toISOString(),
  tasks,
};

mkdirSync('docs/probe', { recursive: true });
const outPath = `docs/probe/attention-deck-${today()}.json`;
writeFileSync(outPath, JSON.stringify(backup, null, 2));
console.log(`${tasks.length} open items → ${outPath}`);
for (const t of tasks) console.log('  ·', t.title);
