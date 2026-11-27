#!/usr/bin/env node
// Pre-commit guard: a coral-log heading may not carry a time that hasn't
// happened yet, and a log file may not be dated after today.
//
// Why (2026-11-19 brief, Piper Morgan: a hook that refuses estimated
// timestamps made "read the clock, don't guess" a guarantee instead of a
// rule). Measured here before building it: of 109 timed headings added
// since 10-01, 6 carried a time later than their own commit (10-11 to
// 10-13; four round numbers, 07:00, 07:45, 14:30, 15:00). Those were
// guesses.
//
// The limit, stated so nobody takes this for more: a guess rounded DOWN
// is indistinguishable from a reading and passes. Only a time in the
// future is provably not read from the clock. Tests pin both sides
// (src/services/__tests__/checkLogClock.test.ts).
//
// The limit's reach, measured (2026-11-26 brief, Klatch: a declared
// blindspot is a floor until its reach is counted). Of the 8 timed
// headings added from 11-19 to 11-25, each was committed 0-3 minutes
// after the time it shows (`git log -L` on each heading line). So a
// rounded-down guess could have hidden at most 3 minutes: in practice,
// no reach. Count again if heading-to-commit gaps start to grow.
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { STAGED_LOG_DIFF } from './check-log-drain.mjs';

const LOG_FILE = /coral-logs\/(\d{4}-\d{2}-\d{2})-coral-log\.md$/;
const HEADING_TIME = /^## .*?\b(\d{1,2}):(\d{2})(?:\s*([AP])M\b)?/i;

const ymd = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hm = mins => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** Pure. `added` is [{file, line}] for lines added to coral logs; `now`
    is the local clock. Returns one message per problem. */
export function findClockProblems(added, now) {
  const today = ymd(now);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const problems = [];
  const futureFiles = new Set();
  for (const { file, line } of added) {
    const date = LOG_FILE.exec(file)?.[1];
    if (!date) continue;
    if (date > today) {
      if (!futureFiles.has(file)) problems.push(`log file dated ${date}, after today (${today}): ${file}`);
      futureFiles.add(file);
      continue;
    }
    if (date !== today) continue; // an earlier day's log: its times are past
    const m = HEADING_TIME.exec(line);
    if (!m) continue;
    let h = Number(m[1]);
    const ampm = m[3]?.toUpperCase();
    if (ampm === 'P' && h < 12) h += 12;
    if (ampm === 'A' && h === 12) h = 0;
    const mins = h * 60 + Number(m[2]);
    if (mins > nowMins) {
      problems.push(`heading time ${hm(mins)} is later than the clock (${hm(nowMins)}): ${line.trim()}`);
    }
  }
  return problems;
}

function main() {
  const added = [];
  let file = null;
  for (const l of execSync(STAGED_LOG_DIFF, { encoding: 'utf8' }).split('\n')) {
    if (l.startsWith('+++ ')) file = l.slice(6);
    else if (l.startsWith('+') && file) added.push({ file, line: l.slice(1) });
  }
  const problems = findClockProblems(added, new Date());
  if (problems.length) {
    for (const p of problems) console.error(`pre-commit: ${p}`);
    console.error('\n    Read the time from the clock (`date`), don\'t estimate it.');
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
