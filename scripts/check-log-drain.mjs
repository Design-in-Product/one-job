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

const FIRE_HEADING = /^## Duty-cycle fire\b/;
const DRAIN_LINE = /^\s*(-\s*)?\**Drain:?\**/i;
const DEFERS = /\b(defer|deferred|later|next fire|tomorrow|next session|working session|by \d{1,2}:\d{2})\b/i;
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
    const drains = b.lines.filter(l => DRAIN_LINE.test(l));
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
