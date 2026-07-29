// scripts/sync-demo-assets.mjs
// Rewrites demo.html's bundle references to match the freshly built
// app/index.html. Runs as part of `npm run build`, so the hashed asset
// filenames never have to be hand-synced again.
//
// m-44 audit, 2026-07-28. The previous version could print
//   "sync-demo-assets: demo.html already up to date"
// in two completely different situations: (a) the references genuinely
// already matched, and (b) the regexes matched NOTHING in demo.html, so
// `.replace()` was a no-op and `updated === demo`. Case (b) is a silent
// failure with teeth — demo.html would keep pointing at a stale bundle
// hash that no longer exists in app/, and the deployed demo would 404 its
// own JavaScript, which is exactly the class of demo breakage this repo
// has burned time on before.
//
// So every exit now names what was actually examined and observed:
// the tags must be FOUND, the rewrite must be VERIFIED in the output, and
// the referenced files must EXIST on disk.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const demoPath = resolve(root, 'demo.html');

const fail = (msg) => {
  console.error(`sync-demo-assets: ${msg}`);
  process.exit(1);
};

const SCRIPT_RE = /<script type="module" crossorigin src="([^"]+)"><\/script>/;
const STYLE_RE = /<link rel="stylesheet" crossorigin href="([^"]+)">/;

const appIndexPath = resolve(root, 'app/index.html');
if (!existsSync(appIndexPath)) {
  fail('app/index.html does not exist — run the vite build before this script');
}
const appIndex = readFileSync(appIndexPath, 'utf8');
const demo = readFileSync(demoPath, 'utf8');

// What the build produced.
const script = appIndex.match(SCRIPT_RE);
const style = appIndex.match(STYLE_RE);
if (!script || !style) {
  fail(
    `could not find bundle tags in app/index.html ` +
      `(script: ${script ? 'found' : 'MISSING'}, style: ${style ? 'found' : 'MISSING'}). ` +
      `The vite output template may have changed shape.`
  );
}

// What demo.html currently claims. Absence here is the silent-failure case:
// without this check a no-op replace reads as success.
const demoScript = demo.match(SCRIPT_RE);
const demoStyle = demo.match(STYLE_RE);
if (!demoScript || !demoStyle) {
  fail(
    `demo.html has no bundle tags to rewrite ` +
      `(script: ${demoScript ? 'found' : 'MISSING'}, style: ${demoStyle ? 'found' : 'MISSING'}). ` +
      `Nothing was changed — demo.html would have shipped pointing at whatever ` +
      `it references now. Fix the tags in demo.html, do not ignore this.`
  );
}

const updated = demo
  .replace(SCRIPT_RE, `<script type="module" crossorigin src="${script[1]}"></script>`)
  .replace(STYLE_RE, `<link rel="stylesheet" crossorigin href="${style[1]}">`);

const changed = updated !== demo;
if (changed) writeFileSync(demoPath, updated);

// Post-condition: read back what is on disk and confirm it says what we
// intended. This is the difference between "the write ran" and "the file
// is correct" — the distinction the export-toast incident was about.
const onDisk = readFileSync(demoPath, 'utf8');
const finalScript = onDisk.match(SCRIPT_RE)?.[1];
const finalStyle = onDisk.match(STYLE_RE)?.[1];
if (finalScript !== script[1] || finalStyle !== style[1]) {
  fail(
    `rewrite did not take. Expected js=${script[1]} css=${style[1]}, ` +
      `demo.html on disk has js=${finalScript} css=${finalStyle}.`
  );
}

// And confirm the bundles the demo now points at are really there.
const missing = [script[1], style[1]]
  .map((ref) => ({ ref, path: resolve(root, ref.replace(/^\//, '')) }))
  .filter(({ path }) => !existsSync(path));
if (missing.length) {
  fail(
    `demo.html now references files that do not exist: ` +
      `${missing.map((m) => m.ref).join(', ')}. ` +
      `The demo would 404 its own bundle.`
  );
}

console.log(
  changed
    ? `sync-demo-assets: rewrote demo.html — js ${demoScript[1]} → ${script[1]}, css ${demoStyle[1]} → ${style[1]}; both files verified present`
    : `sync-demo-assets: verified demo.html already references ${script[1]} and ${style[1]}; both files verified present`
);
