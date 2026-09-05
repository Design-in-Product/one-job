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
import { classifyHeading, parseAsk, OPEN_RANK, CLOSED_MARKERS, ageInDays} from '../../../scripts/fleet-probe.mjs';

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
      since: null, // absent here on purpose — the **Since:** guard is what catches it
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

// Third structural guard (2026-09-05). An "open" marker is a present-tense
// boolean: it cannot separate an ask raised yesterday from one waiting five
// weeks, and both deal onto an identical card. That is the staleness Xian
// reported after living in the first deck. **Since:** makes it a timestamp,
// and like the status and Ask guards it is enforced by the script refusing
// to run, not by my remembering.
describe('age (the **Since:** guard)', () => {
  it('measures the wait in whole days', () => {
    expect(ageInDays('2026-07-28', '2026-09-05')).toBe(39);
    expect(ageInDays('2026-09-05', '2026-09-05')).toBe(0);
  });

  it('is null for a missing or malformed date, so the guard can fire', () => {
    expect(ageInDays(undefined, '2026-09-05')).toBeNull();
    expect(ageInDays('last Tuesday', '2026-09-05')).toBeNull();
    expect(ageInDays('2026-13-45', '2026-09-05')).toBeNull();
  });

  it('survives a month boundary and a leap day', () => {
    expect(ageInDays('2026-08-31', '2026-09-05')).toBe(5);
    expect(ageInDays('2024-02-28', '2024-03-01')).toBe(2);
  });
});
