#!/usr/bin/env node
// Pre-commit guard: no `###` item leaves the board unaccounted for.
//
// CLAUDE.md rule 3 (2026-09-02): any rewrite of docs/ATTENTION-ROLLUP.md
// must end with every `###` item present, on the board or in the
// archive. Seven closures were once lost because a rebuilt file read as
// cleaner than the one it replaced, so nobody checked. Until 2026-10-28
// this was a habit; the 10-28 brief (Piper Morgan: a duty kept as a log
// habit lapses within days, one wired into a mechanism persists) made it
// this hook. It compares HEAD with what is staged.
//
// Run over the 79 board commits from 09-03 to 10-28 it flags four, none
// a real loss: three closures archived as prose paragraphs (the 09-04
// form, before `### ✅ N.` entries became the rule) and one watch item
// answered by another heading. It would refuse those forms today.
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const BOARD = 'docs/ATTENTION-ROLLUP.md';
const ARCHIVE = 'docs/archive/ATTENTION-ROLLUP-ARCHIVE.md';

/** An item's identity: its number when it has one (titles and markers
    change), otherwise the heading's text. */
const keys = text =>
  (text.match(/^### .*$/gm) ?? []).map(h => {
    const n = /^### [^\w\s]+ (\d+)\./u.exec(h); // a status marker, then the number
    return n ? n[1] : h.slice(4).trim();
  });

/** Pure. Items in `before` (board or archive) that are in neither after. */
export function findLostItems(before, after) {
  const now = new Set([...keys(after.board), ...keys(after.archive)]);
  return [...new Set([...keys(before.board), ...keys(before.archive)])].filter(k => !now.has(k));
}

const show = ref => {
  try { return execSync(`git show ${ref}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return ''; }
};

function main() {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).split('\n');
  if (!staged.includes(BOARD) && !staged.includes(ARCHIVE)) return;
  const lost = findLostItems(
    { board: show(`HEAD:${BOARD}`), archive: show(`HEAD:${ARCHIVE}`) },
    { board: show(`:${BOARD}`), archive: show(`:${ARCHIVE}`) },
  );
  if (lost.length) {
    for (const k of lost) console.error(`pre-commit: board item "${k}" left the board and is not in the archive.`);
    console.error('\n    Move it to the archive as a `### ✅ N.` entry with its answer recorded');
    console.error('    (CLAUDE.md, rollup rule 3). An unnumbered heading is matched by its text,');
    console.error('    so retitling one also trips this; keep the old text in the archive.');
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
