// scripts/compose-store-shots.mjs
// Marketing-canvas compositor (Xian's scoping correction via Relay,
// 2026-08-04): a store screenshot slot is a CANVAS — device frame,
// background, caption — not a screen dump. This takes the raw captures
// from capture-store-shots.mjs and composes finished slot images.
//
//   node scripts/compose-store-shots.mjs [staging-dir] [profiles...]
//   default staging dir: newest store/screenshots/staging-*/
//
// Division of labor (Relay's decomposition):
//   1. raw captures   — capture-store-shots.mjs (version-DEPENDENT)
//   2. composition    — this file (version-INDEPENDENT)
//   3. caption copy   — CAPTIONS below; DRAFTS until Xian approves
//      (listing copy is his; same rule as LISTING.md)
//
// The canvas: One Job's own identity — brand gradient ground, white
// headline, CSS-drawn device frame with the capture inside. All local,
// deterministic, re-runnable; Figma remains the alternative if design
// iteration wants a canvas tool (frames reusable for Play + site).

import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PW_DIR = process.env.PLAYWRIGHT_DIR
  ?? '/private/tmp/claude-501/-Users-xian-Development-one-job/e3ab1cd8-adf1-4feb-8f0d-60312181d1b0/scratchpad';
const { chromium } = createRequire(resolve(PW_DIR, 'package.json'))('playwright');

// DRAFT caption copy — the install sheet shows only the first three, so
// they carry the whole pitch. Voice matches the approved LISTING.md.
const CAPTIONS = {
  '01-the-deck':          { head: 'See one task.',            sub: 'Everything else waits its turn — face down, out of mind.' },
  '02-swipe-to-complete': { head: 'Do it. Swipe it away.',    sub: 'Right to complete, left to slide it to the bottom.' },
  '03-inside-a-task':     { head: 'Big tasks open up.',       sub: 'Smaller decks inside — focus through them one card at a time.' },
  '04-done-archive-trash':{ head: 'Done has its own room.',   sub: 'Finished cards file themselves. Nothing nags.' },
  '05-hold-anywhere':     { head: 'Hold for everything else.',sub: 'One quiet menu. No chrome between you and the card.' },
  '06-private-by-design': { head: 'Yours. Full stop.',        sub: 'No account, no cloud, no tracking. Backup is a file you own.' },
};

const PROFILES = {
  'iphone-67': { w: 1290, h: 2796, view: { width: 645, height: 1398 }, scale: 2 },
  'iphone-65': { w: 1284, h: 2778, view: { width: 642, height: 1389 }, scale: 2 },
  'ipad-13':   { w: 2064, h: 2752, view: { width: 1032, height: 1376 }, scale: 2 },
};

const stagingArg = process.argv[2] && !PROFILES[process.argv[2]] ? process.argv[2] : null;
const staging = stagingArg ?? (() => {
  const dirs = readdirSync('store/screenshots').filter(d => d.startsWith('staging-')).sort();
  if (!dirs.length) throw new Error('no staging-* capture set found — run capture-store-shots.mjs first');
  return `store/screenshots/${dirs[dirs.length - 1]}`;
})();
const profileArgs = process.argv.slice(2).filter(a => PROFILES[a]);
const targets = profileArgs.length ? profileArgs : Object.keys(PROFILES).filter(p => existsSync(`${staging}/${p}`));

const page_html = (capB64, cap, isPad) => `<!doctype html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body {
    background: linear-gradient(160deg, #f35343 0%, #E73C7E 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex; flex-direction: column; align-items: center;
    padding: ${isPad ? '4.5%' : '7%'} 6% 0;
    overflow: hidden;
  }
  .head {
    color: #fff; font-weight: 800; letter-spacing: -.02em;
    font-size: ${isPad ? '4.6vw' : '7.4vw'}; line-height: 1.12;
    text-align: center; text-wrap: balance;
  }
  .sub {
    color: rgba(255,255,255,.86); font-weight: 500;
    font-size: ${isPad ? '2.1vw' : '3.4vw'}; line-height: 1.35;
    text-align: center; text-wrap: balance;
    margin-top: 1.2vh; max-width: 34em;
  }
  .device {
    margin-top: 3.2vh;
    width: ${isPad ? '62%' : '78%'};
    border-radius: ${isPad ? '3.2vw' : '7.2vw'};
    padding: ${isPad ? '.85vw' : '1.9vw'};
    background: #1c1e24;
    box-shadow: 0 2.2vh 5vh rgba(60, 8, 30, .38);
  }
  .device img {
    display: block; width: 100%;
    border-radius: ${isPad ? '2.5vw' : '5.6vw'};
  }
</style></head><body>
  <div class="head">${cap.head}</div>
  <div class="sub">${cap.sub}</div>
  <div class="device"><img src="data:image/png;base64,${capB64}"></div>
</body></html>`;

const browser = await chromium.launch();
for (const name of targets) {
  const p = PROFILES[name];
  const inDir = `${staging}/${name}`;
  const out = resolve(`${staging}/composed/${name}`);
  mkdirSync(out, { recursive: true });
  const ctx = await browser.newContext({ viewport: p.view, deviceScaleFactor: p.scale });
  const page = await ctx.newPage();
  let n = 0;
  for (const shot of Object.keys(CAPTIONS)) {
    const file = `${inDir}/${shot}.png`;
    if (!existsSync(file)) { console.warn(`[${name}] missing ${shot} — skipped`); continue; }
    const b64 = readFileSync(file).toString('base64');
    await page.setContent(page_html(b64, CAPTIONS[shot], name === 'ipad-13'), { waitUntil: 'load' });
    await page.waitForTimeout(120);
    await page.screenshot({ path: `${out}/${shot}.png` });
    n++;
  }
  await ctx.close();
  console.log(`[${name}] ${n} composed → ${out} (${p.w}×${p.h})`);
}
await browser.close();
