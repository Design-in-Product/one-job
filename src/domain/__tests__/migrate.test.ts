// Tests for the v1 → v2 storage migration (build sequence #7).
// RED ZONE: this code rewrites live user data. Every fixture in the v1
// corpus must come through with nothing lost, and migration must be
// idempotent (a v2 document passes through untouched).

import { describe, it, expect } from 'vitest';
import { migrateDocument, CURRENT_SCHEMA_VERSION } from '../migrate';
import { allFixtures, substackDeck, strandedInteriorDeck } from './fixtures/v1-decks';

describe('v1 → v2 migration over the fixture corpus', () => {
  for (const [name, fixture] of Object.entries(allFixtures)) {
    it(`${name}: preserves every card and every nested task`, () => {
      const v1 = JSON.parse(JSON.stringify(fixture));
      const doc = migrateDocument(v1);

      expect(doc.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(doc.cards).toHaveLength((fixture as unknown[]).length);

      const countV1 = (tasks: any[]): number =>
        tasks.reduce((n, t) => n + 1 + (t.substacks ?? []).reduce(
          (m: number, s: any) => m + s.tasks.length, 0), 0);
      const countV2 = (cards: any[]): number =>
        cards.reduce((n, c) => n + 1 + (c.decks ?? []).reduce(
          (m: number, d: any) => m + countV2(d.cards), 0), 0);
      expect(countV2(doc.cards)).toBe(countV1(fixture as any[]));

      // no card carries the old shape forward
      for (const card of doc.cards) {
        expect('substacks' in card).toBe(false);
      }
    });
  }

  it('substack names become interior deck names; empty substacks become empty decks', () => {
    const doc = migrateDocument(JSON.parse(JSON.stringify(substackDeck)));
    const [parent] = doc.cards;
    expect(parent.decks).toHaveLength(3);
    expect(parent.decks!.map(d => d.name)).toEqual(['Logistics', 'Agenda', 'Empty ideas']);
    expect(parent.decks![2].cards).toEqual([]);
    // nested task fields survive: completion, deferral history, sortOrder
    const catering = parent.decks![0].cards.find(c => c.title === 'Arrange catering')!;
    expect(catering.completed).toBe(false);
    expect(catering.deferralCount).toBe(2);
    expect(catering.sortOrder).toBe(2);
  });

  it('interior cards are recursion-capable full cards (may carry their own decks)', () => {
    const doc = migrateDocument(JSON.parse(JSON.stringify(substackDeck)));
    const inner = doc.cards[0].decks![0].cards[0];
    // v1 substack tasks had no substacks; migrated cards simply have no decks yet
    expect(inner.decks ?? []).toEqual([]);
    expect(inner.id).toBeTruthy();
    expect(inner.createdAt).toBeTruthy();
  });

  it('the stranded interior survives: completed parent keeps its open interior cards', () => {
    const doc = migrateDocument(JSON.parse(JSON.stringify(strandedInteriorDeck)));
    const [parent] = doc.cards;
    expect(parent.completed).toBe(true);
    const stranded = parent.decks![0].cards.filter(c => !c.completed);
    expect(stranded).toHaveLength(1);
    expect(stranded[0].title).toBe('Thank the contributors');
  });

  it('is idempotent: a v2 document passes through unchanged', () => {
    const once = migrateDocument(JSON.parse(JSON.stringify(substackDeck)));
    const twice = migrateDocument(JSON.parse(JSON.stringify(once)));
    expect(twice).toEqual(once);
  });

  it('tolerates unknown future versions by passing them through untouched', () => {
    const future = { schemaVersion: 99, cards: [], somethingNew: true };
    expect(migrateDocument(JSON.parse(JSON.stringify(future)))).toEqual(future);
  });

  it('treats garbage shapes as empty (never throws, never invents data)', () => {
    expect(migrateDocument(null).cards).toEqual([]);
    expect(migrateDocument(undefined).cards).toEqual([]);
    expect(migrateDocument({ not: 'a deck' }).cards).toEqual([]);
    expect(migrateDocument(42).cards).toEqual([]);
  });
});
