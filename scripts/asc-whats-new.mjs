// Set a TestFlight build's "What to Test" via the App Store Connect API.
// Standing practice as of 2026-09-12 (Xian's tester feedback via Janus:
// "it isn't clear what's new" — the note existed in the coral-log but
// never travelled to the surface testers read). Every upload now ends
// with this; the content lives in docs/releases/<version>-<build>.md.
//
// Usage:
//   node scripts/asc-whats-new.mjs <version> <buildNumber> <notes-file>
//   e.g. node scripts/asc-whats-new.mjs 1.1 38 docs/releases/1.1-38.md
//
// Auth: the same ASC API key the upload uses (AMBER-XCODE.md). The .p8
// stays at its canonical path, never in the repo. jsonwebtoken comes
// from the session scratchpad (like Playwright — not a project dep).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(
  (process.env.SCRATCHPAD ?? '/private/tmp/claude-501/-Users-xian-Development-one-job/e3ab1cd8-adf1-4feb-8f0d-60312181d1b0/scratchpad') + '/'
);
const jwt = require('jsonwebtoken');

const KEY_ID = 'D96QY6RRB3';
const ISSUER = '4d7298e0-7bf2-4f1f-a541-cccfe6281485';
const APP_ID = '6787158379';
const P8 = `${process.env.HOME}/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8`;

const [version, buildNumber, notesFile] = process.argv.slice(2);
if (!version || !buildNumber || !notesFile) {
  console.error('usage: node scripts/asc-whats-new.mjs <version> <build> <notes-file>');
  process.exit(1);
}

// TestFlight's field caps at 4000 chars; take the markdown up to
// "## Known limits" if the full note is longer than fits.
let notes = readFileSync(notesFile, 'utf8');
if (notes.length > 3900) notes = notes.slice(0, 3900) + '\n…(full note in the repo)';

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
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${JSON.stringify(body.errors ?? body).slice(0, 300)}`);
  return body;
};

// 1 · find the build. A fresh upload takes minutes to register in the
// API (learned on 39: the pipeline ran this immediately after altool
// and raced the lag), so poll rather than fail — the retry lives HERE
// so no pipeline has to remember it.
let build;
for (let i = 0; i < 12; i++) {
  const builds = await api(
    `/builds?filter[app]=${APP_ID}&filter[preReleaseVersion.version]=${version}&filter[version]=${buildNumber}&limit=1`
  );
  if (builds.data?.length) { build = builds.data[0]; break; }
  console.log(`build ${version} (${buildNumber}) not registered yet (${i + 1}/12) — waiting 60s`);
  await new Promise(r => setTimeout(r, 60_000));
}
if (!build) throw new Error(`build ${version} (${buildNumber}) never registered — check the upload`);
console.log(`build ${version} (${buildNumber}): processingState=${build.attributes.processingState}`);

// 2 · its beta localization (en-US exists once processing finishes)
const locs = await api(`/builds/${build.id}/betaBuildLocalizations`);
const loc = locs.data?.find(l => l.attributes.locale === 'en-US') ?? locs.data?.[0];

if (loc) {
  await api(`/betaBuildLocalizations/${loc.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: { type: 'betaBuildLocalizations', id: loc.id, attributes: { whatsNew: notes } },
    }),
  });
  console.log(`What to Test set on ${loc.attributes.locale} (${notes.length} chars)`);
} else {
  await api('/betaBuildLocalizations', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'betaBuildLocalizations',
        attributes: { locale: 'en-US', whatsNew: notes },
        relationships: { build: { data: { type: 'builds', id: build.id } } },
      },
    }),
  });
  console.log(`What to Test created for en-US (${notes.length} chars)`);
}
