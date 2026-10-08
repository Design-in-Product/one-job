// Regression guard for the coral-log Drain-line check (pre-commit).
//
// xian, 2026-10-08 (via Janus): "the fire is a wake, not a time-box."
// Every duty-fire entry must carry a Drain: line, and a Drain line that
// defers work must name its blocker. Per this repo's guard discipline,
// these tests assert each guard can actually FIRE, not just pass.

import { describe, it, expect } from 'vitest';
import { findDrainProblems } from '../../../scripts/check-log-drain.mjs';

const fire = (...body: string[]) => ['## Duty-cycle fire #9 — 2026-10-08 17:49 PDT', '', ...body];

describe('coral-log Drain line guard', () => {
  it('fires when a fire entry has no Drain line', () => {
    const problems = findDrainProblems(fire('- **Sync:** up to date.'));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/without a Drain line/);
  });

  it('fires when a Drain line defers without a named blocker', () => {
    const problems = findDrainProblems(fire('- **Drain:** typecheck gate deferred to the next fire.'));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/without naming a blocker/);
  });

  it('passes a deferral that names its blocker', () => {
    expect(findDrainProblems(fire('- **Drain:** Pilot tester A re-invite deferred — waits on xian sending the link.'))).toEqual([]);
  });

  it('passes the explicit nothing-left line, with or without a list dash', () => {
    expect(findDrainProblems(fire('**Drain:** nothing unblocked after two checks.'))).toEqual([]);
  });

  it('ignores non-fire sections (session notes are not fire entries)', () => {
    expect(findDrainProblems(['## 10:12 PDT — xian in session', '- talked about builds'])).toEqual([]);
  });

  it('checks every fire block, not just the first', () => {
    const lines = [...fire('- **Drain:** nothing unblocked after two checks.'), ...fire('- **Sync:** ok')];
    expect(findDrainProblems(lines)).toHaveLength(1);
  });
});
