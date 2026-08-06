import { describe, it, expect, beforeEach } from 'vitest';
import { featureOn, setBetaOptIn, STAGES } from '../featureStages';
import { setPro } from '../entitlements';

beforeEach(() => { localStorage.clear(); });

describe('feature stages (Xian four-tier model, 2026-08-06)', () => {
  it('beta features are OFF for free devices — the wall holds even in dev', () => {
    // (tests run under DEV, where alpha is on by design — tier 4:
    // "testable locally on my browser". Alpha substitutes for the
    // opt-in toggle but NEVER for pro.)
    expect(featureOn('inchworm')).toBe(false);
  });
  it('pro in a dev/alpha session gets beta without the toggle (tier 4 ⊃ tier 3)', () => {
    setPro(true);
    expect(featureOn('inchworm')).toBe(true);
  });
  it('beta = pro + opt-in toggle', () => {
    setPro(true); setBetaOptIn(true);
    expect(featureOn('inchworm')).toBe(true);
    expect(featureOn('githubImport')).toBe(true);
  });
  it('opt-in without pro is not enough (the wall holds)', () => {
    setBetaOptIn(true);
    expect(featureOn('githubImport')).toBe(false);
  });
  it('registry names the two 08-06 demotions', () => {
    expect(STAGES.inchworm).toBe('beta');
    expect(STAGES.githubImport).toBe('beta');
  });
});
