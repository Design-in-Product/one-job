// Regression guard for the fleet probe's heading classifier.
//
// 2026-08-31: the original probe ranked headings with anchored
// startsWith checks and silently defaulted anything unrecognized into
// the 🟢 bucket, while its closed-item filter (`!startsWith('✅')`) let
// differently-marked closed items through as live work. A discriminating
// probe proved both. The classifier must now be exhaustive — every
// heading is open, closed, or explicitly unclassified (which makes the
// script refuse to deal).
//
// Per the same brief family: these tests assert the classifier can
// return EVERY verdict, not just the happy one.

import { describe, it, expect } from 'vitest';
// @ts-expect-error — plain .mjs script, no types; importing the pure part.
import { classifyHeading, OPEN_RANK, CLOSED_MARKERS } from '../../../scripts/fleet-probe.mjs';

describe('fleet probe heading classification', () => {
  it('ranks the three open markers, blocking first', () => {
    expect(classifyHeading('🔴 24. blocking thing')).toEqual({ kind: 'open', rank: 0 });
    expect(classifyHeading('🟡 25. wants an answer')).toEqual({ kind: 'open', rank: 1 });
    expect(classifyHeading('🟢 13. fyi')).toEqual({ kind: 'open', rank: 2 });
    expect(OPEN_RANK['🔴']).toBeLessThan(OPEN_RANK['🟢']);
  });

  it('recognizes closed items so they are never dealt as live work', () => {
    expect(classifyHeading('✅ 17. done and dusted')).toEqual({ kind: 'closed' });
    expect(CLOSED_MARKERS).toContain('✅');
  });

  // The discriminating probes — each of these silently misfiled before.
  it('refuses to classify an unmarked heading (was: silently buried as FYI)', () => {
    expect(classifyHeading('90. URGENT no-marker item')).toEqual({ kind: 'unclassified' });
  });

  it('refuses a differently-marked closed item (was: dealt as live work)', () => {
    expect(classifyHeading('✔︎ 91. closed with another check mark')).toEqual({ kind: 'unclassified' });
    expect(classifyHeading('CLOSED 92. closed in words')).toEqual({ kind: 'unclassified' });
  });

  it('handles leading whitespace without changing the verdict', () => {
    expect(classifyHeading('  🔴 24. spaced')).toEqual({ kind: 'open', rank: 0 });
  });

  it('reads the marker as a full code point, not a UTF-16 unit', () => {
    // Emoji are surrogate pairs; a charAt(0) implementation would break here.
    expect(classifyHeading('🟡 x').kind).toBe('open');
  });
});
