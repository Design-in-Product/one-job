#!/usr/bin/env node
// Pre-commit guard: every NEW duty-fire entry in development/coral-logs/
// must carry a "Drain:" line, and a Drain line that defers work must name
// its blocker.
//
// The rule (xian, 2026-10-08, via Janus): a fire is a wake, not a
// time-box. Do all unblocked work now; go idle only after two clean
// checks; defer only with a named blocker. Adapted from Janus's
// designinproduct/scripts/check-pulse-drain.mjs. Prose rules regress,
// so the hook makes a missing Drain line fail at commit time.
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Any heading naming a duty fire, in either wording ("Duty-cycle fire #9",
// "17:49 PDT — duty fire"). Until 2026-10-18 this matched only the first,
// so from 10-11 it checked no fire at all and passed every commit.
const FIRE_HEADING = /^## .*\bduty(?:-cycle)? fire\b/i;
const DRAIN_LINE = /^\s*(-\s*)?\**Drain:?\**/i;
// Every form of the word (defers, deferring, deferral), not two exact
// spellings (widened 2026-10-21 after Janus found the same gap in theirs).
const DEFERS = /\b(defer\w*|postpon\w*|on hold|later|next fire|tomorrow|next session|working session|by \d{1,2}:\d{2})\b/i;
const NAMES_BLOCKER = /(blocked on|blocker:|waits? on|waiting on|needs .* from|owed by)/i;

/** Pure over its input (added log lines). Returns one message per problem. */
export function findDrainProblems(lines) {
  const blocks = [];
  for (const line of lines) {
    if (/^## /.test(line)) {
      blocks.push(FIRE_HEADING.test(line) ? { head: line, lines: [] } : null);
    } else if (blocks.length && blocks[blocks.length - 1]) {
      blocks[blocks.length - 1].lines.push(line);
    }
  }
  const problems = [];
  for (const b of blocks.filter(Boolean)) {
    // A Drain entry is its whole paragraph: the Drain line plus the lines
    // after it, up to a blank line or the next list item at its own depth. Until 2026-10-21
    // only the first physical line was read, so a wrapped entry was judged
    // on half its text, and a deferral on a later line went unchecked.
    const drains = [];
    b.lines.forEach((l, i) => {
      if (!DRAIN_LINE.test(l)) return;
      let text = l;
      const indent = l.search(/\S/);
      for (let j = i + 1; j < b.lines.length; j++) {
        const next = b.lines[j];
        // A list item indented deeper than the Drain line is its sub-list
        // (blockers listed one per line), so it belongs to the entry.
        const sibling = /^\s*[-*] /.test(next) && next.search(/\S/) <= indent;
        if (!next.trim() || sibling || DRAIN_LINE.test(next)) break;
        text += ' ' + next.trim();
      }
      drains.push(text);
    });
    if (!drains.length) {
      problems.push(`fire entry without a Drain line: ${b.head}`);
      continue;
    }
    for (const d of drains) {
      if (DEFERS.test(d) && !NAMES_BLOCKER.test(d)) {
        problems.push(`Drain line defers work without naming a blocker: ${d.trim().slice(0, 160)}`);
      }
    }
  }
  return problems;
}

function main() {
  const added = execSync('git diff --cached -U0 -- development/coral-logs/', { encoding: 'utf8' })
    .split('\n')
    .filter(l => l.startsWith('+') && !l.startsWith('+++'))
    .map(l => l.slice(1));
  const problems = findDrainProblems(added);
  if (problems.length) {
    for (const p of problems) console.error(`pre-commit: ${p}`);
    console.error('\n    A fire is a wake, not a time-box: do unblocked work now, and defer');
    console.error('    only with a named blocker ("waits on xian sending the link").');
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
