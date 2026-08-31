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
import { classifyHeading, parseAsk, OPEN_RANK, CLOSED_MARKERS } from '../../../scripts/fleet-probe.mjs';

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

// 2026-08-31, Xian's probe feedback: "we need a format that is concise
// and clear about what is needed of me." Cards now lead with the Ask,
// and an open item without one cannot become a card at all.
describe('fleet probe ask extraction', () => {
  it('pulls the Ask and Rec out of an item body', () => {
    const body = [
      'Some context prose about the item.',
      '',
      '**Ask:** Ship 1.0 now? Say go and I prep everything you need.',
      '**Rec:** Go. Nothing about the white screen should delay the store.',
    ].join('\n');
    expect(parseAsk(body)).toEqual({
      ask: 'Ship 1.0 now? Say go and I prep everything you need.',
      rec: 'Go. Nothing about the white screen should delay the store.',
    });
  });

  it('joins a wrapped Ask into one line (markdown wraps at 72 cols)', () => {
    const body = '**Ask:** Keep the Zapier toast wording,\nor give me different words?\n**Rec:** Keep it.';
    expect(parseAsk(body).ask).toBe('Keep the Zapier toast wording, or give me different words?');
  });

  it('returns null for a body with no Ask — the script refuses to deal these', () => {
    expect(parseAsk('Just prose, no ask at all.').ask).toBeNull();
  });

  it('returns null rec when only an Ask is present (rec is optional)', () => {
    const r = parseAsk('**Ask:** Do the thing?');
    expect(r.ask).toBe('Do the thing?');
    expect(r.rec).toBeNull();
  });
});
