// Regenerate the landing page's three screenshots (site/screen-*.png)
// from the CURRENT build. Created 2026-09-10 after Xian flagged the set
// as stale — it was from July 23, two UI eras old, quietly contradicting
// the launch announcement on the page launch traffic lands on.
//
// Usage:
//   npm run build              # site shots come from the shipped build
//   npm run preview -- --port 4199   (in another shell, serves /app/)
//   node scripts/capture-site-shots.mjs
//   → overwrites site/screen-deck.png, screen-card.png, screen-done.png
//     (780×1688 = 390×844 @2x, matching the landing page's figures)
//
// Playwright comes from the session scratchpad per the repo rule:
// it is deliberately NOT a project dependency (CLAUDE.md, toolchain
// traps §3). Set PLAYWRIGHT_DIR if yours lives elsewhere.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(
  (process.env.PLAYWRIGHT_DIR ?? '/private/tmp/claude-501/-Users-xian-Development-one-job/e3ab1cd8-adf1-4feb-8f0d-60312181d1b0/scratchpad') + '/'
);
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4199/app/';
const OUT = resolve('site');

const iso = d => new Date(Date.UTC(2026, 7, d, 12)).toISOString();
// Same cast as the store set so the two surfaces tell one story.
// MIRROR capture-store-shots.mjs's SEED exactly — sortOrder drives which
// card surfaces after the defer, and an invented ordering here cost a
// debugging round on day one (party must be sortOrder 1, directly under
// flights at 0). If the store seed changes, change this one with it.
const SEED = {
  schemaVersion: 3, activeDeckId: 'd1',
  decks: [{ id: 'd1', name: 'Tasks', cards: [
    { id: 'c1', title: 'Book flights to Lisbon', description: 'Window seat, morning departure', completed: false, createdAt: iso(20), sortOrder: 0 },
    { id: 'c2', title: 'Plan the launch party', completed: false, createdAt: iso(18), sortOrder: 1,
      decks: [{ id: 'sd1', name: null, createdAt: iso(18), cards: [
        { id: 's1', title: 'Send invitations', completed: true, createdAt: iso(18), completedAt: iso(24) },
        { id: 's2', title: 'Order the cake', description: 'Chocolate, serves 20 — order by Friday', completed: false, createdAt: iso(18) },
        { id: 's3', title: 'Make a playlist', completed: false, createdAt: iso(18) },
      ] }] },
    { id: 'c3', title: 'Water the tomatoes', completed: false, createdAt: iso(19), sortOrder: 2 },
    { id: 'c4', title: 'Renew passport', completed: true, createdAt: iso(2), completedAt: iso(26) },
    { id: 'c5', title: 'Fix the bike brakes', completed: true, createdAt: iso(3), completedAt: iso(25) },
  ] }],
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
});
const page = await ctx.newPage();
await page.addInitScript(([s]) => {
  localStorage.setItem('oneJobTasks', JSON.stringify(s));
  localStorage.setItem('oneJobQuietMode', '1'); // no frozen toasts in stills
}, [SEED]);
await page.goto(BASE_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);

const cx = 195, cardY = 422;
const shot = n => page.screenshot({ path: `${OUT}/${n}.png` });

// screen-back — the top of the deck, card face DOWN. Xian's addition
// (2026-09-10): "a charming part of the experience," and the moment
// the deck-of-cards metaphor becomes legible — it's the state the app
// actually opens in, so it's shot before anything is touched.
await shot('screen-back');

// screen-deck — one card, face up ("One card at a time")
await page.mouse.click(cx, cardY); await page.waitForTimeout(1200);
await shot('screen-deck');

// screen-card — inside a card's own deck ("Cards hold decks of their own")
await page.mouse.move(cx, cardY); await page.mouse.down();
for (let i = 1; i <= 10; i++) { await page.mouse.move(cx - i * 16, cardY); await page.waitForTimeout(16); }
await page.mouse.up(); await page.waitForTimeout(1400); // defer → party card up
const badge = page.getByRole('button', { name: /Open \d+ sub-tasks/ });
if (!(await badge.count())) { console.error('sub-deck badge not found — aborting rather than shipping a wrong shot'); process.exit(1); }
await badge.first().click(); await page.waitForTimeout(900);
await shot('screen-card');
await page.locator('button:has(svg)').first().click(); await page.waitForTimeout(700);

// screen-done — the Done room ("Finished work has a place")
await page.mouse.move(cx, 118); await page.mouse.down();
await page.waitForTimeout(650); await page.mouse.up(); await page.waitForTimeout(450);
await page.getByText('Completed', { exact: true }).click(); await page.waitForTimeout(800);
await shot('screen-done');

console.log('site/screen-{deck,card,done}.png regenerated from', BASE_URL);
await browser.close();
