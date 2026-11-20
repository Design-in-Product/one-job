// Regression guard for the coral-log clock check (pre-commit).
//
// 2026-11-19 brief (Piper Morgan: a hook that refuses estimated
// timestamps turned a stated rule into a guarantee). Measured here first:
// of 109 timed coral-log headings since 10-01, 6 carried a time LATER
// than the commit that added them (10-11 to 10-13, four of them round
// numbers: 07:00, 07:45, 14:30, 15:00). A guess can't be told from a
// reading after the fact, but a time that hasn't happened yet can be
// refused at commit. That is all this checks; a guess rounded DOWN
// passes, and the tests say so.

import { describe, it, expect } from 'vitest';
import { findClockProblems } from '../../../scripts/check-log-clock.mjs';

// 2026-11-19 17:52 local
const now = new Date(2026, 10, 19, 17, 52);
const log = (date: string, ...lines: string[]) => lines.map(line => ({ file: `development/coral-logs/${date}-coral-log.md`, line }));

describe('coral-log clock guard', () => {
  it('refuses a heading on today\'s log whose time has not happened yet', () => {
    const problems = findClockProblems(log('2026-11-19', '## 18:20 PST — mail wake'), now);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/18:20.*later than the clock \(17:52\)/);
  });

  it('passes a heading at or before the clock', () => {
    expect(findClockProblems(log('2026-11-19', '## Fire: 17:49 PST (duty cycle)', '## 17:52 PST — drain'), now)).toEqual([]);
  });

  it('reads a single-digit hour', () => {
    expect(findClockProblems(log('2026-11-19', '## 9:05 PST — morning'), now)).toEqual([]);
    expect(findClockProblems(log('2026-11-19', '## Session #2: 2:30 PM PST'), new Date(2026, 10, 19, 14, 0))).toHaveLength(1);
  });

  it('refuses a log file dated in the future', () => {
    const problems = findClockProblems(log('2026-11-20', '## Fire: 17:49 PST (duty cycle)'), now);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/dated 2026-11-20, after today/);
  });

  it('leaves an earlier day\'s log alone (an evening entry added after midnight is fine)', () => {
    expect(findClockProblems(log('2026-11-18', '## 23:40 PST — late'), now)).toEqual([]);
  });

  it('ignores headings without a time, and non-heading lines', () => {
    expect(findClockProblems(log('2026-11-19', '## Restart: Claude Code 2.1.322', '- at 23:59 the build lands'), now)).toEqual([]);
  });

  // The documented limit: a guess rounded down is indistinguishable
  // from a reading. This pins the limit so nobody mistakes the guard
  // for more than it is.
  it('cannot catch a past-dated guess (documented limit)', () => {
    expect(findClockProblems(log('2026-11-19', '## 17:00 PST — rounded down'), now)).toEqual([]);
  });

  // The six historical instances, replayed at their commit times.
  it.each([
    ['2026-10-13', '## 07:45 PDT — xian: detach offers keep or delete', [6, 43]],
    ['2026-10-13', '## 07:00 PDT — xian tries Todoist on the web', [6, 34]],
    ['2026-10-13', '## 06:20 PDT — Todoist slice 2: the Integrations screen', [5, 58]],
    ['2026-10-11', '## 18:20 PDT — mail wake: the name in the eleven briefs', [18, 19]],
    ['2026-10-11', "## 15:00 PDT — xian's answers, and a scrub miss", [14, 41]],
    ['2026-10-11', '## 14:30 PDT — xian asks whether the five open items are all cards', [14, 22]],
  ] as const)('would have refused %s "%s"', (date, heading, [h, m]) => {
    const [y, mo, d] = date.split('-').map(Number);
    expect(findClockProblems(log(date, heading), new Date(y, mo - 1, d, h, m))).toHaveLength(1);
  });
});
