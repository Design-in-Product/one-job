// src/services/featureStages.ts
// Xian's four-tier release model (2026-08-06), as mechanism:
//   released-free  → not in this registry at all
//   released-pro   → gated by hasPro() at the call site (the wall)
//   beta           → pro device AND the Settings beta toggle
//   alpha          → dev server / ?alpha device flag; never store builds
//
// The registry is the ONLY place a feature's stage lives. Promotion is a
// one-line dated diff — which gives the release drumbeat its changelog.
// A TestFlight tester reaches beta the same honest way anyone does:
// comp code + toggle. The SUBMITTED build therefore never carries beta
// surface by default — his "okay for TestFlight, not okay in the build
// we submit" holds without needing to detect which native channel we
// are (which Apple gives no reliable runtime signal for).

import { hasPro } from './entitlements';

export const STAGES = {
  // beta (2026-08-06, both Xian's calls):
  inchworm: 'beta',       // "buggy… nice-to-have, not MVP" — parked
  githubImport: 'beta',   // wrong-shaped v1 (all-repos); v2 spec filed
} as const;

export type StagedFeature = keyof typeof STAGES;

const BETA_KEY = 'oneJobBeta';
const ALPHA_KEY = 'oneJobAlpha';

try {
  const a = new URLSearchParams(window.location.search).get('alpha');
  if (a === 'on') localStorage.setItem(ALPHA_KEY, '1');
  if (a === 'off') localStorage.removeItem(ALPHA_KEY);
} catch { /* no window/storage */ }

export const betaOptIn = (): boolean => {
  try { return localStorage.getItem(BETA_KEY) === '1'; } catch { return false; }
};
export const setBetaOptIn = (on: boolean): void => {
  try {
    if (on) localStorage.setItem(BETA_KEY, '1');
    else localStorage.removeItem(BETA_KEY);
  } catch { /* */ }
};

const alphaOn = (): boolean => {
  try {
    return import.meta.env.DEV || localStorage.getItem(ALPHA_KEY) === '1';
  } catch { return false; }
};

export const featureOn = (f: StagedFeature): boolean => {
  const stage: string = STAGES[f];
  if (stage === 'alpha') return alphaOn();
  if (stage === 'beta') return hasPro() && (betaOptIn() || alphaOn());
  return true;
};
