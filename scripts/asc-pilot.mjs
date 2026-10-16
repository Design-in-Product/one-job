// Put a build in a TestFlight group and, for an outside-tester group,
// submit it for Beta App Review. Only on xian's word for that build
// ("Pilot 44, yes", 2026-10-16): it hands a build to outside testers.
// The first time this was done by hand (build 40, 2026-10-07); this
// script makes the steps the same every time.
//
// Usage: SCRATCHPAD=<scratchpad with jsonwebtoken> \
//          node scripts/asc-pilot.mjs <version> <build> [group, default Pilot]
//
// Prints what it did and reads it back. Counts only, never names.
// --check: read only. Prints whether the build is in the group and its
// review state, and changes nothing (for watching a review).
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

const check = process.argv.includes('--check');
const [version, buildNumber, groupName = 'Pilot'] = process.argv.slice(2).filter(a => a !== '--check');
if (!version || !buildNumber) {
  console.error('usage: node scripts/asc-pilot.mjs <version> <build> [group]');
  process.exit(1);
}

const token = jwt.sign(
  { iss: ISSUER, aud: 'appstoreconnect-v1', exp: Math.floor(Date.now() / 1000) + 900 },
  readFileSync(P8, 'utf8'),
  { algorithm: 'ES256', keyid: KEY_ID },
);
const api = async (path, init = {}) => {
  const res = await fetch(`https://api.appstoreconnect.apple.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
  const body = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${JSON.stringify(body.errors ?? body).slice(0, 400)}`);
  return body;
};

const builds = await api(`/builds?filter[app]=${APP_ID}&filter[preReleaseVersion.version]=${version}&filter[version]=${buildNumber}&limit=1`);
const build = builds.data[0];
if (!build) throw new Error(`build ${version} (${buildNumber}) not found`);
if (build.attributes.processingState !== 'VALID') throw new Error(`build is ${build.attributes.processingState}, not VALID`);

const groups = await api(`/apps/${APP_ID}/betaGroups?limit=50`);
const group = groups.data.find(g => g.attributes.name === groupName);
if (!group) throw new Error(`no group named ${groupName}`);

if (check) {
  const inGroup = await api(`/betaGroups/${group.id}/builds?limit=50`);
  const review = await api(`/builds/${build.id}/betaAppReviewSubmission`).catch(() => ({ data: null }));
  console.log(`${groupName}: build ${buildNumber} attached = ${inGroup.data.some(b => b.id === build.id)}; review = ${review.data?.attributes.betaReviewState ?? 'none'}`);
  process.exit(0);
}

// 1 · attach (idempotent: attaching an attached build is a no-op)
await api(`/betaGroups/${group.id}/relationships/builds`, {
  method: 'POST',
  body: JSON.stringify({ data: [{ type: 'builds', id: build.id }] }),
});
const inGroup = await api(`/betaGroups/${group.id}/builds?limit=50`);
const attached = inGroup.data.some(b => b.id === build.id);
console.log(`${groupName}: build ${buildNumber} attached = ${attached}`);
if (!attached) process.exit(1);

// 2 · outside testers need Beta App Review; inside groups don't
if (!group.attributes.isInternalGroup) {
  const existing = await api(`/builds/${build.id}/betaAppReviewSubmission`).catch(() => ({ data: null }));
  if (existing.data) {
    console.log(`review: already submitted, state ${existing.data.attributes.betaReviewState}`);
  } else {
    const sub = await api('/betaAppReviewSubmissions', {
      method: 'POST',
      body: JSON.stringify({ data: { type: 'betaAppReviewSubmissions', relationships: { build: { data: { type: 'builds', id: build.id } } } } }),
    });
    console.log(`review: submitted, state ${sub.data.attributes.betaReviewState}`);
  }
}
const testers = await api(`/betaGroups/${group.id}/betaTesters?limit=200`);
console.log(`${groupName}: testers ${testers.data.length}`);
