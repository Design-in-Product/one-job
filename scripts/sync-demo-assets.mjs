// scripts/sync-demo-assets.mjs
// Rewrites demo.html's bundle references to match the freshly built
// app/index.html. Runs as part of `npm run build`, so the hashed asset
// filenames never have to be hand-synced again.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appIndex = readFileSync(resolve(root, 'app/index.html'), 'utf8');
const demoPath = resolve(root, 'demo.html');
const demo = readFileSync(demoPath, 'utf8');

const script = appIndex.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const style = appIndex.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);

if (!script || !style) {
  console.error('sync-demo-assets: could not find bundle tags in app/index.html');
  process.exit(1);
}

const updated = demo
  .replace(
    /<script type="module" crossorigin src="[^"]*"><\/script>/,
    `<script type="module" crossorigin src="${script[1]}"></script>`
  )
  .replace(
    /<link rel="stylesheet" crossorigin href="[^"]*">/,
    `<link rel="stylesheet" crossorigin href="${style[1]}">`
  );

if (updated !== demo) {
  writeFileSync(demoPath, updated);
  console.log(`sync-demo-assets: demo.html now references ${script[1]} and ${style[1]}`);
} else {
  console.log('sync-demo-assets: demo.html already up to date');
}
