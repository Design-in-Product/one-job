// Regression guard for the board reconcile check (pre-commit).
//
// CLAUDE.md rule 3 (2026-09-02, after seven closures were lost): every
// `###` item that leaves the board must be present in the archive. That
// was a habit until 2026-10-28; the 10-28 brief (a duty kept as a log
// habit lapses within days) made it a hook. These tests assert the guard
// can actually fire.
import { describe, it, expect } from 'vitest';
import { findLostItems } from '../../../scripts/check-rollup-reconcile.mjs';

const board = (...h: string[]) => ['# Board', '', ...h.map(x => `### ${x}`), ''].join('\n');

describe('board reconcile guard', () => {
  it('passes an item that moved from the board to the archive', () => {
    expect(findLostItems(
      { board: board('🟡 22. UX walk', '🟢 49. Write-back?'), archive: board('✅ 48. Markdown') },
      { board: board('🟡 22. UX walk'), archive: board('✅ 49. Write-back: done', '✅ 48. Markdown') },
    )).toEqual([]);
  });

  it('fires when an item leaves the board and is nowhere in the archive', () => {
    const lost = findLostItems(
      { board: board('🟡 22. UX walk', '🟢 49. Write-back?'), archive: board('✅ 48. Markdown') },
      { board: board('🟡 22. UX walk'), archive: board('✅ 48. Markdown') },
    );
    expect(lost).toEqual(['49']);
  });

  it('matches by number, so a retitled or re-marked item is not lost', () => {
    expect(findLostItems(
      { board: board('🟡 22. UX walk, step 2'), archive: '' },
      { board: board('🔴 22. UX walk, step 3'), archive: '' },
    )).toEqual([]);
  });

  it('fires when an item vanishes from the archive', () => {
    expect(findLostItems(
      { board: '', archive: board('✅ 48. Markdown', '✅ 47. Move a deck') },
      { board: '', archive: board('✅ 48. Markdown') },
    )).toEqual(['47']);
  });

  it('keys an unnumbered heading by its text', () => {
    expect(findLostItems(
      { board: '', archive: board('Watching: 1.1 (38) processing') },
      { board: '', archive: '' },
    )).toEqual(['Watching: 1.1 (38) processing']);
  });

  it('allows new items', () => {
    expect(findLostItems({ board: '', archive: '' }, { board: board('🟢 50. New'), archive: '' })).toEqual([]);
  });
});
