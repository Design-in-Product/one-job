// Read a returned backup and report what happened to the attention deck.
//
// Xian answers probe cards on his phone by swiping, then hands the whole
// backup back as feedback (2026-09-14). This reads the deck he returns,
// matches it against the probe JSON I dealt, and reports dispositions —
// so the answer arrives as a summary, not a wall of JSON.
//
// PRIVACY: prints ONLY the source='coral/attention-rollup' deck. His
// real decks ride along in the same backup and are none of my business;
// this script never prints their contents, only a count so I can
// confirm the file is whole. (Covenant 7's ethos: shape, not content.)
//
// Usage: node scripts/read-returned-deck.mjs inbox/<file>.json [dealt.json]
import { readFileSync, readdirSync } from 'node:fs';

const [file, dealtArg] = process.argv.slice(2);
if (!file) { console.error('usage: node scripts/read-returned-deck.mjs <backup.json> [dealt-deck.json]'); process.exit(1); }

const backup = JSON.parse(readFileSync(file, 'utf8'));
const decks = backup.decks ?? (Array.isArray(backup.tasks) ? [{ name: 'tasks', cards: backup.tasks }] : []);
if (!decks.length) { console.error('No decks found — is this a One Job backup?'); process.exit(1); }

const isProbe = c => c.source === 'coral/attention-rollup' || /dealt by Coral/.test(c.description ?? '');
const probeCards = decks.flatMap(d => (d.cards ?? []).filter(isProbe));
const otherCount = decks.flatMap(d => d.cards ?? []).length - probeCards.length;

console.log(`Backup: ${decks.length} deck(s), ${probeCards.length} probe card(s), ${otherCount} personal card(s) (not read).\n`);

if (!probeCards.length) { console.log('No attention-deck cards found in this backup.'); process.exit(0); }

// Match against what was dealt, so cards ANSWERED-BY-ABSENCE are visible too.
const dealtFile = dealtArg ?? (() => {
  const f = readdirSync('docs/probe').filter(n => n.startsWith('attention-deck-')).sort().pop();
  return f ? `docs/probe/${f}` : null;
})();
const dealt = dealtFile ? JSON.parse(readFileSync(dealtFile, 'utf8')).tasks : [];

const state = c => {
  if (c.completed || c.status === 'done') return '✅ swiped right (done/understood)';
  if ((c.deferralCount ?? 0) > 0) return `↩︎ deferred ${c.deferralCount}×`;
  return '🟡 returned open — wants discussion';
};

for (const c of probeCards) {
  const marker = (c.description ?? '').match(/^([🔴🟡🟢])\s*#(\S+)/);
  console.log(`${state(c)}\n   ${marker ? `[${marker[1]} #${marker[2]}] ` : ''}${c.title}`);
  const rec = (c.description ?? '').match(/Coral's rec: ([\s\S]*?)(?:\n\n|$)/);
  if (!c.completed && rec) console.log(`   (my rec was: ${rec[1].replace(/\s+/g, ' ').slice(0, 110)}…)`);
  console.log();
}

const returnedIds = new Set(probeCards.map(c => c.title));
const missing = dealt.filter(t => !returnedIds.has(t.title));
if (missing.length) {
  console.log(`⚠ ${missing.length} dealt card(s) not present in the returned deck (deleted, or from a different deal):`);
  for (const m of missing) console.log(`   · ${m.title}`);
}
