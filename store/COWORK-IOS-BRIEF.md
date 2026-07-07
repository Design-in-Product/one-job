# Cowork Agent Brief: One Job iOS — first device build + TestFlight

**From**: Coral (One Job repo agent)
**For**: any Cowork agent operating Xian's Mac
**Goal**: get One Job running on Xian's iPhone via Xcode, then archive and
upload to TestFlight.
**Prereqs on the Mac**: Xcode installed and signed into Xian's Apple
Developer account (Xcode → Settings → Accounts); Node 20+.

Everything web-side is already built and verified. Your job is the parts
that require macOS + Apple signing. Work top to bottom; each phase has a
checkpoint.

## Phase 1 — Clone and build (10 min)

```bash
git clone https://github.com/Design-in-Product/one-job.git
cd one-job
npm install
npm run build:native     # → dist-native/ (verified working bundle)
npx cap sync ios
npx cap open ios         # opens ios/App in Xcode
```

**Checkpoint**: Xcode opens the App workspace without red errors.
(SPM package resolution may take a minute on first open.)

## Phase 2 — Signing (5 min)

In Xcode, select the **App** target → **Signing & Capabilities**:
1. Check "Automatically manage signing".
2. Team: select Xian's developer team.
3. Bundle Identifier: `co.onejob.deck` (renamed 2026-07-03 after co.onejob.app
   was burned by the free-team trap below — do not change again).
   Xcode will register the App ID with the portal automatically.

**Checkpoint**: "Signing Certificate: Apple Development" shows with no
warnings.

## Phase 3 — Run on device (10 min)

> ⚠️ **BUNDLEID trap (learned 2026-07-03)**: make sure the PAID team is
> selected in Signing & Capabilities BEFORE the first device run. Running
> with the free Personal Team auto-registers the bundle id to that team on
> Apple's backend — bundle ids are globally unique, so the paid team is
> then blocked from registering it, and free-team App IDs are invisible/
> undeletable in the portal. Remedy if hit: Apple Developer Support
> release request, or wait ~7 days for free-provisioning expiry.

1. Connect Xian's iPhone via cable (or same-network wireless debugging).
2. Select the phone as the run destination; press Run (⌘R).
3. First run: the phone will ask to trust the developer profile
   (Settings → General → VPN & Device Management).

**Verify on the phone** (all of these are expected to work):
- App launches to the coral splash, then the deck (or empty state)
- Add a task (long-press → Add Task, or empty-state form)
- Tap deck → card flips; swipe right completes **with a haptic thunk**;
  swipe left defers
- Kill the app, relaunch: tasks persist
- Airplane mode: everything still works

If any of these fail, stop and report back to Xian/Coral with a screen
recording — do not improvise fixes in the native project.

## Phase 4 — Archive → TestFlight (15 min + Apple processing)

1. In Xcode set the run destination to "Any iOS Device (arm64)".
2. Product → Archive.
3. Organizer opens → Distribute App → App Store Connect → Upload
   (accept defaults; automatic signing).
4. If prompted that the app record doesn't exist: create it in
   App Store Connect first (appstoreconnect.apple.com → My Apps → "+" →
   New App → platform iOS, name **One Job**, bundle id `co.onejob.deck`,
   SKU `onejob-ios-1`, language English).
5. When the build finishes processing (~15–30 min, email arrives), enable
   it for internal TestFlight testing and add Xian as a tester.

**Checkpoint**: Xian gets the TestFlight invite on his phone.

## Notes for the store listing (later, not this session)

All listing copy, screenshots, and privacy answers are pre-drafted in
`store/LISTING.md` and `store/screenshots/` in the repo. Privacy policy is
live at https://onejob.co/privacy.html. Apple privacy label: **Data Not
Collected**.

## Optional addendum — Android keystore (5 min, same Mac)

If Xian asks you to handle the Android keystore too:

```bash
brew install --cask temurin        # keytool needs a real JDK (macOS ships a stub)
cd one-job
bash scripts/make-android-keystore.sh
```
The script prompts for a password (generate a strong one, save it to
Xian's password manager) and prints the three GitHub secrets to add at
github.com/Design-in-Product/one-job → Settings → Secrets and variables →
Actions. Add them (or hand the values to Xian to add). Do NOT commit the
keystore; it is gitignored.

## MAIL (added 2026-07-06): check docs/mail/ at session start

Coral ↔ Relay correspondence lives in this repo's `docs/mail/`
(convention: `memo-{from}-to-{to}-{date}-{topic}.md`). Instructions may
arrive there between sessions — read anything addressed to you before
starting work, and file your reports there too.

**How to RECEIVE mail (added 2026-07-07)**: mail is delivered by git —
your `docs/mail/` is only as fresh as your working copy. Checking the
mailbox therefore starts with a sync, BEFORE reading:

```
git checkout main && git pull origin main
ls docs/mail/
```

If you skip the pull, you are reading yesterday's mailbox and may act
on a superseded memo (this happened on 2026-07-07: a session read the
rc.4 promotion memo while main already carried rc.6 and a hold
instruction). Rule of thumb: **pull, then read mail, then act** — and
if a memo names a version, confirm it matches `package.json` in your
now-current checkout before building anything.

## State addendum (2026-07-05, Coral) — read before resuming Phase 4

Main has moved since Phases 1–3. If you cloned before 2026-07-04, **start
from a fresh clone** (clean clone → `npm ci` → `npm run build:native` →
`npx cap sync ios` per Phase 1). What changed that affects you:

- **Version is now 1.0.0-rc.3** (Settings shows it — use it to confirm
  you built current code).
- **New user-visible features to include in the on-device smoke test**:
  (1) swipe a card away → an Undo button appears in the toast for 5s;
  tapping it must bring the card back; (2) Settings → Backup now shows a
  "Last backup…" line; (3) app chrome/splash should blend with the app's
  gray surface (no coral status-bar frame, no cream splash flash).
- **Data safety net** now runs under everything (snapshots + auto-
  restore) — kill/relaunch and airplane-mode checks from Phase 3 remain
  valid as-is.
- **CI note**: all workflows now require Node 22; if you run node
  locally, use 19+ (18 lacks the global crypto the build needs).
- The BUNDLEID warning stands unchanged: **select the paid team BEFORE
  any device run** — co.onejob.deck must never touch a Personal Team.

## Report back

Post results (and any deviations) to Xian; Coral will fold them into the
coral log and fix anything web-side that surfaced.
