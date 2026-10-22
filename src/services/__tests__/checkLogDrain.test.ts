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

  // 2026-10-18: from 10-11 the fire headings read "## 17:49 PDT — duty
  // fire" and the guard matched only "## Duty-cycle fire", so it checked
  // nothing for a week and every commit passed. The fixture above used
  // the one heading the guard knew, so the tests could not see it. These
  // use the headings actually written.
  it.each([
    '## 17:49 PDT — duty fire',
    '## 17:49 PT — duty fire',
    '## 17:49 PDT · duty fire (first entry today)',
    '## Duty-cycle fire (out of band) #6 — 2026-10-08 07:50 PDT',
  ])('recognises the heading %s as a fire', heading => {
    expect(findDrainProblems([heading, '- **Sync:** ok'])).toHaveLength(1);
  });

  it('does not treat a mail wake or a session as a fire', () => {
    expect(findDrainProblems(['## 18:05 PT — mail wake (Janus)', '- read it'])).toEqual([]);
    expect(findDrainProblems(['## 15:2x — xian in session: fire the old build?', '- no'])).toEqual([]);
  });

  // 2026-10-21: the guard read only the first physical line of a Drain
  // entry. A wrapped entry was judged on half its text: refused when
  // "Deferred" ended line one and the blocker began line two, and
  // never checked when the deferral itself sat on a later line.
  it('reads a wrapped Drain entry as one paragraph (blocker on the next line)', () => {
    expect(findDrainProblems(fire(
      '**Drain:** done: sync, mail. Deferred,',
      'each with its blocker: step 3 (waits on xian).',
    ))).toEqual([]);
  });

  it('fires on a deferral that sits on a continuation line', () => {
    const problems = findDrainProblems(fire(
      '**Drain:** done: sync, mail, TestFlight check.',
      'The typecheck pass is deferred to the next fire.',
    ));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/without naming a blocker/);
  });

  it('ends the Drain paragraph at a blank line', () => {
    expect(findDrainProblems(fire(
      '**Drain:** nothing unblocked after two checks.',
      '',
      'Notes: tomorrow xian may test 44.',
    ))).toEqual([]);
  });

  it('reads a nested list of blockers as part of the Drain entry (10-10 shape)', () => {
    expect(findDrainProblems(fire(
      '- **Drain:** done: the fixes. Deferred with blockers:',
      '  - the push waits on xian approving it (37)',
      '- **Notes:** none.',
    ))).toEqual([]);
  });
});
