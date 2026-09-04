// scripts/capture-store-shots.mjs
// Store-screenshot capture harness (Relay's 2026-08-03 ask: prep the
// pipeline now; the SHUTTER waits on the release-version decision).
//
// Design: the version question gates the capture, not the harness — so
// re-capture against any build is ONE command, and assets can never age
// the way the rc.2 set did without the fix being cheap.
//
//   PLAYWRIGHT_DIR=<dir with node_modules/playwright> \
//   BASE_URL=http://localhost:8081 \
//   node scripts/capture-store-shots.mjs [iphone-67] [ipad-13] ...
//
// Playwright is deliberately NOT a project dependency (TESTING.md):
// point PLAYWRIGHT_DIR at the session scratchpad install, version-matched
// to the browser cache (playwright@1.61.0 ↔ chromium-1228 on Amber).
//
// Store dimension slots (CONFIRMED against Media Manager 2026-08-13 —
// Apple renamed the bucket labels since these were captured, pixel
// sizes unchanged; Relay's original warning is why this note exists):
//   iphone-67:  1290×2796  (bucket now labeled "6.9"" — was "6.7"")
//   iphone-65:  1284×2778  (bucket still labeled "6.5"")
//   ipad-13:    2064×2752  (bucket still labeled "13"")
// Each = viewport × deviceScaleFactor below. Media Manager also lists
// smaller/legacy buckets (6.3", 6.1", 5.5", 4.7", 4", 3.5", plus
// several iPad sizes) — per Apple's own copy ("we'll use these
// screenshots for all iOS display sizes"), the largest bucket per
// family covers the rest; we don't generate assets for those.

import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const PW_DIR = process.env.PLAYWRIGHT_DIR
  ?? '/private/tmp/claude-501/-Users-xian-Development-one-job/e3ab1cd8-adf1-4feb-8f0d-60312181d1b0/scratchpad';
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8081';
const { chromium } = createRequire(resolve(PW_DIR, 'package.json'))('playwright');

const PROFILES = {
  'iphone-67': { width: 430, height: 932, scale: 3 },   // → 1290×2796
  'iphone-65': { width: 428, height: 926, scale: 3 },   // → 1284×2778
  'ipad-13':   { width: 1032, height: 1376, scale: 2 }, // → 2064×2752
};

// A deck whose content reads well at a glance — the screenshot IS the
// pitch. Real-ish, warm, no lorem, no in-jokes.
const iso = (d, h = 10) => `2026-07-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:00:00.000Z`;
const SEED = {
  schemaVersion: 3,
  decks: [{
    id: 'r1', name: 'deck-1', createdAt: iso(1),
    cards: [
      { id: 'c1', title: 'Book flights to Lisbon', description: 'Window seat, morning departure', completed: false, createdAt: iso(20), sortOrder: 0 },
      { id: 'c2', title: 'Plan the launch party', completed: false, createdAt: iso(18), sortOrder: 1,
        decks: [{ id: 'd2', name: null, createdAt: iso(18), cards: [
          { id: 's1', title: 'Send invitations', completed: true, createdAt: iso(18), completedAt: iso(24) },
          // 2026-09-04: this sub-card carries a description on purpose.
          // Without one the card is short AND the title auto-sizes up to
          // fill it, so shot 03 rendered as a shouty two-word card jammed
          // under the breadcrumb with ~40% dead space below — it read as a
          // broken layout rather than a feature. Xian caught it mid-upload.
          { id: 's2', title: 'Order the cake', description: 'Chocolate, serves 20 — order by Friday', completed: false, createdAt: iso(18) },
          { id: 's3', title: 'Make a playlist', completed: false, createdAt: iso(18) },
        ] }] },
      { id: 'c3', title: 'Water the tomatoes', completed: false, createdAt: iso(19), sortOrder: 2 },
      { id: 'c4', title: 'Renew passport', completed: true, createdAt: iso(2), completedAt: iso(26) },
      { id: 'c5', title: 'Fix the bike brakes', completed: true, createdAt: iso(3), completedAt: iso(25) },
    ],
  }],
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROFILES);
const stamp = new Date().toISOString().slice(0, 10);

const browser = await chromium.launch();
for (const name of targets) {
  const p = PROFILES[name];
  if (!p) { console.error(`unknown profile ${name}`); continue; }
  const out = resolve(`store/screenshots/staging-${stamp}/${name}`);
  mkdirSync(out, { recursive: true });

  const ctx = await browser.newContext({
    viewport: { width: p.width, height: p.height },
    deviceScaleFactor: p.scale, hasTouch: true, isMobile: p.width < 800,
  });
  const page = await ctx.newPage();
  // Seed the deck AND enable quiet mode (2026-09-01): without it,
  // transient toasts freeze into the shots — the 09-01 set caught a
  // housekeeping notice ("Tidied up: 3 done cards…") sitting across the
  // TOP of 01-the-deck, the install sheet's lead image, where a stranger
  // reads it as an error. Quiet mode mutes confirmations; problems still
  // surface, so nothing real is being hidden from the capture.
  await page.addInitScript(([s]) => {
    localStorage.setItem('oneJobTasks', JSON.stringify(s));
    localStorage.setItem('oneJobQuietMode', '1');
  }, [SEED]);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  const cx = p.width / 2;
  const cardY = p.height * 0.5;
  const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
  const holdMenu = async () => {
    await page.mouse.move(cx, p.height * 0.14); await page.mouse.down();
    await page.waitForTimeout(650); await page.mouse.up(); await page.waitForTimeout(450);
  };

  // 01 — the premise: one card, face up
  await page.mouse.click(cx, cardY); await page.waitForTimeout(1200);
  await shot('01-the-deck');

  // 02 — swipe-to-complete mid-gesture (drag, shoot, return — no commit)
  await page.mouse.move(cx, cardY); await page.mouse.down();
  for (let i = 1; i <= 5; i++) { await page.mouse.move(cx + i * 14, cardY); await page.waitForTimeout(16); }
  await page.waitForTimeout(150);
  await shot('02-swipe-to-complete');
  for (let i = 5; i >= 0; i--) { await page.mouse.move(cx + i * 14, cardY); await page.waitForTimeout(16); }
  await page.mouse.up(); await page.waitForTimeout(600);

  // 03 — a card's interior: defer to reach the sub-deck card, open it
  await page.mouse.move(cx, cardY); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(cx - i * 16, cardY); await page.waitForTimeout(16); }
  await page.mouse.up(); await page.waitForTimeout(1400); // defer → party card up
  // The badge shows icon+count; "Open N sub-tasks" is its aria-label.
  const badge = page.getByRole('button', { name: /Open \d+ sub-tasks/ });
  if (await badge.count()) {
    await badge.first().click(); await page.waitForTimeout(900);
    await shot('03-inside-a-task');
    // SubstackView's back is an icon-only ghost button (ArrowLeft), first in its header
    await page.locator('button:has(svg)').first().click(); await page.waitForTimeout(700);
  } else {
    console.warn(`[${name}] sub-deck badge not found; skipping 03`);
  }

  // 04 — the rooms
  await holdMenu();
  await page.getByText('Completed', { exact: true }).click(); await page.waitForTimeout(800);
  await shot('04-done-archive-trash');
  await page.getByText('← Back to Tasks').click(); await page.waitForTimeout(700);

  // 05 — the hold-menu itself
  await holdMenu();
  await shot('05-hold-anywhere');
  await page.mouse.click(cx, p.height * 0.05); await page.waitForTimeout(400);

  // 06 — settings: the your-data-stays-yours story
  await holdMenu();
  await page.getByText('Settings', { exact: true }).click(); await page.waitForTimeout(700);
  await shot('06-private-by-design');

  await ctx.close();
  console.log(`[${name}] 6 shots → ${out} (${p.width * p.scale}×${p.height * p.scale})`);
}
await browser.close();
