// List One Job's TestFlight groups: tester count and builds in each.
// Read-only. Used at every duty fire ("re-check the Pilot tester count")
// and after each upload. Lived in the session scratchpad until macOS's
// /tmp cleanup deleted it (2026-10-16); it lives here now.
//
// Usage: SCRATCHPAD=<session scratchpad with jsonwebtoken> node scripts/asc-groups.mjs
//
// Auth: the same ASC API key as asc-whats-new.mjs. The .p8 stays at its
// canonical path, never in the repo.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(
  (process.env.SCRATCHPAD ?? (() => { throw new Error('Set SCRATCHPAD to this session\'s scratchpad (where jsonwebtoken is installed).'); })()) + '/'
);
const jwt = require('jsonwebtoken');

const KEY_ID = 'D96QY6RRB3';
const ISSUER = '4d7298e0-7bf2-4f1f-a541-cccfe6281485';
const APP_ID = '6787158379';
const P8 = `${process.env.HOME}/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8`;

const token = jwt.sign(
  { iss: ISSUER, aud: 'appstoreconnect-v1', exp: Math.floor(Date.now() / 1000) + 900 },
  readFileSync(P8, 'utf8'),
  { algorithm: 'ES256', keyid: KEY_ID },
);
const api = async (path) => {
  const res = await fetch(`https://api.appstoreconnect.apple.com/v1${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${JSON.stringify(body.errors ?? body).slice(0, 300)}`);
  return body;
};

const groups = await api(`/apps/${APP_ID}/betaGroups?limit=50`);
for (const g of groups.data) {
  const [testers, builds] = await Promise.all([
    api(`/betaGroups/${g.id}/betaTesters?limit=200`),
    api(`/betaGroups/${g.id}/builds?limit=50`),
  ]);
  const numbers = builds.data.map(b => Number(b.attributes.version)).sort((a, b) => b - a);
  // Counts only, never names: this output lands in public logs.
  console.log(`${g.attributes.name} | testers: ${testers.data.length} | builds: ${numbers.join(',')}`);
}
