// Boot watchdog (docs/PWA-RECOVERY-PLAN.md; inline script in index.html).
//
// RED ZONE with the plan's one absolute: the heal clears Cache Storage
// and service-worker registrations and MUST NEVER touch localStorage —
// the deck (oneJobTasks) lives there, and this code path only runs when
// the app is already broken and nobody is watching. That property is
// asserted here, not promised in a comment.
//
// The script under test is extracted from index.html itself, so these
// tests exercise the exact bytes that ship — there is no parallel
// "testable copy" to drift out of sync.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve(__dirname, '../../../index.html'), 'utf8');
const match = html.match(/<script>\s*([\s\S]*?)<\/script>/);
if (!match) throw new Error('inline watchdog script not found in index.html');
const watchdogSrc = match[1];

// The script references location/navigator/caches; injecting them as
// function parameters shadows the globals so jsdom's non-configurable
// location is never touched.
type FakeReg = { unregister: () => Promise<boolean> };
function arm(opts?: { healAttempts?: number; controlled?: boolean }) {
  const reloads = vi.fn();
  const unregister = vi.fn().mockResolvedValue(true);
  const registrations: FakeReg[] = [{ unregister }];
  const cacheDelete = vi.fn().mockResolvedValue(true);
  const fakeCaches = {
    keys: vi.fn().mockResolvedValue(['workbox-precache-v2', 'other']),
    delete: cacheDelete,
  };
  (window as unknown as { caches: unknown }).caches = fakeCaches;
  if (opts?.healAttempts !== undefined) {
    sessionStorage.setItem('oneJobBootHeals', String(opts.healAttempts));
  }
  const fakeNavigator = {
    serviceWorker: {
      // the watchdog only arms on CONTROLLED pages (cached-HTML state);
      // tests model that state unless a case says otherwise
      controller: opts?.controlled === false ? null : {},
      getRegistrations: () => Promise.resolve(registrations),
    },
  };
  const fakeLocation = { reload: reloads };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('navigator', 'location', 'caches', watchdogSrc)(
    fakeNavigator,
    fakeLocation,
    fakeCaches,
  );
  return { reloads, unregister, cacheDelete };
}

const flush = async () => {
  // let the heal's promise chain settle
  for (let i = 0; i < 6; i++) await Promise.resolve();
};

describe('boot watchdog (the inline script that ships in index.html)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    sessionStorage.clear();
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    // Stand THIS test's watchdog down before leaving: its error listener
    // stays subscribed on the shared jsdom window, and a live stale
    // closure would consume the heal-attempt budget of later tests.
    (window as unknown as { __oneJobBooted?: () => void }).__oneJobBooted?.();
    vi.useRealTimers();
    delete (window as unknown as { __oneJobBooted?: unknown }).__oneJobBooted;
  });

  it('stands down when the app mounts in time', async () => {
    const { reloads } = arm();
    (window as unknown as { __oneJobBooted: () => void }).__oneJobBooted();
    vi.advanceTimersByTime(20_000);
    await flush();
    expect(reloads).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('oneJobBootHeals')).toBeNull();
  });

  it('heals on timeout: unregisters the SW, clears caches, reloads', async () => {
    const { reloads, unregister, cacheDelete } = arm();
    vi.advanceTimersByTime(8_000);
    await flush();
    expect(unregister).toHaveBeenCalled();
    expect(cacheDelete).toHaveBeenCalledWith('workbox-precache-v2');
    expect(cacheDelete).toHaveBeenCalledWith('other');
    expect(reloads).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('oneJobBootHeals')).toBe('1');
  });

  it('THE HARD RULE: the heal never touches localStorage — the deck survives byte-for-byte', async () => {
    const deck = JSON.stringify({ schemaVersion: 3, decks: [{ cards: [{ title: 'precious' }] }] });
    localStorage.setItem('oneJobTasks', deck);
    localStorage.setItem('oneJobMetrics', '{"v":1}');
    arm();
    vi.advanceTimersByTime(8_000);
    await flush();
    expect(localStorage.getItem('oneJobTasks')).toBe(deck);
    expect(localStorage.getItem('oneJobMetrics')).toBe('{"v":1}');
  });

  it('fails fast on a bundle 404 instead of waiting out the timer', async () => {
    const { reloads } = arm();
    const s = document.createElement('script');
    s.src = 'https://onejob.co/app/assets/index-GONE.js';
    document.head.appendChild(s);
    s.dispatchEvent(new Event('error')); // resource errors don't bubble; watchdog listens in capture
    await flush();
    expect(reloads).toHaveBeenCalledTimes(1);
  });

  it('stops after two heals and renders the honest message — never loops', async () => {
    const { reloads } = arm({ healAttempts: 2 });
    vi.advanceTimersByTime(8_000);
    await flush();
    expect(reloads).not.toHaveBeenCalled();
    const root = document.getElementById('root')!;
    expect(root.textContent).toContain('Your tasks are safe');
    // and it must never advise the one step that WOULD destroy the deck
    expect(root.textContent).toContain('don’t clear the site’s data');
  });

  it('stays UNARMED on an uncontrolled page — a slow first visit must never be healed', async () => {
    const { reloads } = arm({ controlled: false });
    // even a bundle 404 does nothing here: no cached HTML, so the server
    // is the one serving broken references and a reload cannot fix it
    const s = document.createElement('script');
    s.src = 'https://onejob.co/app/assets/index-SLOW.js';
    document.head.appendChild(s);
    s.dispatchEvent(new Event('error'));
    vi.advanceTimersByTime(30_000);
    await flush();
    expect(reloads).not.toHaveBeenCalled();
    expect(document.getElementById('boot-fallback')).toBeNull();
  });

  it('a successful boot resets the attempt counter (heal → recover → clean slate)', async () => {
    arm({ healAttempts: 1 });
    (window as unknown as { __oneJobBooted: () => void }).__oneJobBooted();
    expect(sessionStorage.getItem('oneJobBootHeals')).toBeNull();
  });
});
