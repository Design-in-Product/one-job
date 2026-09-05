# The white screen: diagnosis and recovery plan

**By:** Coral, 2026-09-05 · **Status:** plan, awaiting Xian's approval
**Gates:** the 50-user cohort. Does **not** gate the App Store — the
native build has no service worker at all (`mode !== 'capacitor' &&
VitePWA(...)` in vite.config.ts), so this bug structurally cannot occur
there.

---

## What Xian saw

The installed PWA opened to a white screen. **Restarting the phone did
not fix it** — which is the most informative part of the report: the
broken state is persistent on disk, not in memory.

## The mechanism

Confirmed by reading the built service worker:

- `app/sw.js` precaches 20 entries, including
  `{url:"index.html",revision:"ee9cc757…"}`, and registers a
  `NavigationRoute` bound to `createHandlerBoundToURL("index.html")`.
  **Every navigation is answered from cache**, not from the network.
- That cached `index.html` hard-references one exact hashed bundle:
  `/app/assets/index-Cxaa7xEC.js`.
- GitHub Pages deploys **replace** the assets folder. Yesterday's hash
  is gone from the server the moment a new build lands.

So the failure is: **cached HTML from build A survives, but build A's
JS is neither in the cache nor on the server.** The HTML renders (an
empty `<div id="root">`), the module 404s, React never mounts. White
screen. Not blank-because-offline — blank because the page loaded
successfully and its only script did not.

Two ways to reach that state, and I can't yet tell which Xian hit:

1. **Partial precache eviction.** iOS Safari evicts under storage
   pressure and does not treat a precache as all-or-nothing. Lose one
   asset entry, keep `index.html`, and you are here.
2. **A partially-failed install.** `precacheAndRoute` is not
   transactional; a connection that drops mid-install can commit some
   entries and not others.

**Both produce the identical symptom, and the fix below covers both**,
so distinguishing them is not on the critical path. (`fallbackToNetwork`
is on by default, so a *missing* `index.html` would recover by itself —
which is why the failure needs the HTML to be present and the asset to
be absent. That asymmetry is the bug.)

## The actual design flaw

`src/pwaUpdateCheck.ts` already checks for updates on foreground and
hourly, and it is well written. It is also **unreachable in the failure
state**: it is inside the bundle that didn't load.

> The recovery mechanism lives inside the thing that's broken.

Every fix that adds more logic to the React app has this same defect.
The fix has to live somewhere that runs when the bundle does not.

---

## The plan

### Part 1 — A boot watchdog in `index.html` *(the whole fix, really)*

An **inline** script in the HTML `<head>` — not a module, not a
separate file, so it cannot itself 404. This is the only code
guaranteed to run in the white-screen state, because the white screen
*means* the HTML ran and the bundle didn't.

```
on load:
  if a heal already happened this page-load session → stand down
  start a timer (proposed: 8s)
  also listen for script-load errors (capture phase) → fail fast,
    no need to wait out the timer when the bundle 404s
on React mount:
  cancel everything (main.tsx sets a flag after createRoot().render)
on timeout or script error:
  → heal
```

**Heal** = unregister every service worker registration, delete every
entry in `caches`, then `location.reload()`. On reload nothing
intercepts the navigation, the current `index.html` comes from the
network, the current bundle loads, and the SW re-registers clean.

### Part 2 — Loop protection, and an honest failure

A watchdog that reloads on failure can reload forever. Guard with a
`sessionStorage` attempt counter:

- **attempt 1** → heal silently. Fixes the case at hand.
- **attempt 2** → heal again, and this time announce it briefly. Some
  failures need one clean pass to clear the SW and a second to fetch.
- **attempt 3** → **stop.** Render a plain-HTML message in `#root`:
  what happened, that their tasks are safe and still on the device, and
  the one manual step that helps. Never loop.

An app that says "something went wrong loading, your tasks are fine" is
a bad day. An app that flashes white forever is an uninstall.

### Part 3 — What the heal must never touch

**Explicit, and the reason this is a plan and not a commit:**

> The heal clears the **Cache Storage API** and **service worker
> registrations**. It must never touch `localStorage`, and never
> `IndexedDB`.

`oneJobTasks` is the user's actual deck, and `oneJobMetrics` is
theirs too. Both live in localStorage, which is untouched by
`caches.delete()` — but only because I write it that way. A slightly
more thorough "clear all storage" recovery would silently destroy every
task the user has, in a code path that only ever runs when the app is
already broken and nobody is watching. That is precisely the shape of
the 2026-07-05 data loss: a destructive step, sanctioned as a fix.

The test suite gets a case asserting the heal leaves `oneJobTasks`
intact. A test that can go red, not a comment promising good behaviour.

### Part 4 — Reduce how often it's needed

Two smaller changes, worth doing but not sufficient alone:

- **`navigateFallbackDenylist`** so the SW never answers navigations
  outside `/app/`.
- Consider **`NetworkFirst` for navigations** rather than precache-only:
  online users get the current HTML (and therefore current asset
  hashes), and the precached copy stays as the offline fallback. This
  narrows the window rather than closing it — the watchdog still has to
  exist for the offline case — and it costs a network round-trip on
  every cold open. **My lean: do it, but after the watchdog ships and
  we've seen the watchdog work.** One change at a time in the boot path.

---

## What this doesn't fix

**Installs already broken today.** Xian's phone is in the failure state
now, and it holds the *old* `index.html` — which will not contain the
watchdog no matter what we deploy, because the SW keeps serving the old
copy. The watchdog protects against the *next* occurrence; it cannot
reach backwards into a device already stuck.

Recovering an already-stuck install still needs a manual pass (Safari →
Advanced → Website Data → remove onejob.co, or delete and re-add the
home-screen icon). **Before recommending either to anyone**, the
destructive-action protocol applies in full: their deck lives in
localStorage on that device, and clearing website data destroys it.
Export first, **open the export file and see the tasks in it**, and
only then clear. That verification step is not a formality here — the
2026-07-05 loss happened because an export reported success it hadn't
earned.

## Verification, before I'd call it done

1. **Reproduce the failure deliberately** — build, install, then edit
   the deployed asset filename so the cached HTML points at a 404.
   Confirm the white screen. *This is the step that makes the rest of
   the plan trustworthy; without it I'm fixing a bug I've only reasoned
   about.*
2. Confirm the watchdog fires and the app recovers on its own.
3. Confirm tasks survive the heal — by opening the app and seeing them,
   not by reading a log line.
4. Confirm the loop guard stops at three, by making the heal fail.
5. Confirm the watchdog **never** fires on a healthy slow boot
   (throttled to 3G) — a false positive here reloads a working app.

## Estimate

Watchdog + guard + tests, half a day. The deliberate reproduction is
the part I can't time confidently, and it's the part I'd least want to
skip.
