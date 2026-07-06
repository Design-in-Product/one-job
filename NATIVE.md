# One Job — Native App Builds (iOS + Android)

The app-store versions are Capacitor shells around the same local-first web
app. Everything web-side is in this repo and verified; the signing and
submission steps need a Mac (Xcode) and the store accounts, and are written
here so Xian or a Cowork agent can run them.

## Architecture

- `npm run build:native` → `dist-native/` — the native bundle: relative
  asset paths, hash routing (no server in a WebView), **no** service worker
  (assets ship inside the app).
- `capacitor.config.ts` — appId `co.onejob.deck`, webDir `dist-native`.
- `android/`, `ios/` — generated Capacitor projects (committed; regenerate
  with `npx cap add <platform>` if ever deleted).
- **Storage durability**: `src/services/nativeStorageBridge.ts` mirrors
  every save into Capacitor Preferences (real app data, survives WebView
  storage eviction) and restores it on cold start. localStorage remains the
  synchronous source of truth; the bridge is a no-op on the web.

## Everyday workflow (any machine)

```bash
npm run build:native   # rebuild the web bundle for native
npx cap sync           # copy bundle + plugin config into android/ and ios/
```

Run `cap sync` after every `build:native` and after adding Capacitor
plugins.

## iOS (needs a Mac with Xcode; Xian has the Apple developer account)

```bash
npm install && npm run build:native && npx cap sync ios
npx cap open ios       # opens ios/App in Xcode
```

In Xcode:
1. App target → Signing & Capabilities → select the team; bundle id
   `co.onejob.deck` (register it in the developer portal if prompted).
2. App icons: drag the 1024px icon into Assets.xcassets/AppIcon
   (regenerate from `scripts/og-image.html`'s medallion styling or
   `public/icons/icon-512.png` upscaled; a proper 1024 source lives in
   scripts/icon generation — ask Coral for a 1024 render).
3. Product → Archive → Distribute App → App Store Connect → TestFlight
   first.
4. App Store listing: screenshots (6.7" + 5.5"), privacy questionnaire —
   easy answers here: **no data collected**, everything on-device.

**Guideline 4.2 (minimum functionality) posture**: offline-capable, no
login, native-feeling gestures. Strengthen with the Haptics plugin
(`@capacitor/haptics` on swipe commit) if reviewers push back — ask Coral,
it's a one-liner in SwipeableCard.

## Android

One-time: create a Google Play developer account ($25) at
play.google.com/console.

Two paths:

**A. Capacitor build (matches iOS shell):**
```bash
npm run build:native && npx cap sync android
npx cap open android   # Android Studio
# Build → Generate Signed App Bundle → create upload keystore (KEEP IT SAFE)
# Upload the .aab in Play Console
```
No Mac required; a CI job can also produce this (Coral can set up a GitHub
Actions workflow with a stored keystore secret when wanted).

**B. TWA via PWABuilder (fastest, zero code):** pwabuilder.com → enter
`https://onejob.co/app/` → Android package → upload to Play Console. Uses
the live PWA; updates ship with the website. Requires serving
`/.well-known/assetlinks.json` on onejob.co (PWABuilder provides it; add to
the Pages deploy).

## Done since the first draft of this runbook

- ✅ Haptics: medium impact fires on swipe commit (SwipeableCard), native
  only — feel it in the first TestFlight build
- ✅ Full icon/splash sets generated into both scaffolds (masters in
  `resources/`, HTML sources in `scripts/`; @capacitor/assets couldn't
  install in the sandbox, so sizes are rendered via the browser pipeline)
- ✅ CI: `.github/workflows/android-build.yml` (manual trigger) builds a
  sideloadable debug APK as a workflow artifact — no local Android SDK
  needed to try the shell
- ✅ Store listing copy drafted (`store/LISTING.md`) + screenshots at
  6.7"/5.5"/Android sizes (`store/screenshots/`)
- ✅ Privacy policy: `privacy.html` → onejob.co/privacy.html (deployed by
  Pages workflow); "Data Not Collected" posture

## Still open

- ~~Release signing: Android keystore creation~~ ✅ keystore created
  2026-07-05 (Xian); remaining: add the three secrets to GitHub Actions,
  then Play Console
- ~~iOS Phase 4 (Archive → TestFlight)~~ ✅ **rc.2 live on TestFlight
  2026-07-05** (Relay)

## Keeping TestFlight in sync with the web app (2026-07-05)

The native shell **bundles the web assets at build time** — a TestFlight
build is a snapshot, and it does NOT follow web deploys. The PWA
self-updates; the native app updates only when a new build is uploaded.

- **Today's loop**: new TestFlight build = Relay reruns the tail of the
  brief on the Mac — fresh pull → `npm ci` → `npm run build:native` →
  `npx cap sync ios` → bump the build number → Archive → Upload
  (~15 min). Suggested cadence: per milestone (rc stamps), not per
  commit — the PWA is the fast channel; TestFlight is the stable one.
- **Verify which build you're in**: Settings shows the web bundle's
  version (`__APP_VERSION__` baked at build time), so a TestFlight build
  reports the version it was built FROM.
- **Future options if per-milestone rebuilds get tedious** (decision
  parked): a Capacitor live-update plugin (e.g. capacitor-updater) to
  ship web-asset updates into the installed native app; or pointing the
  shell at the hosted app (`server.url`) — each has store-policy and
  offline tradeoffs to weigh deliberately, not by default.

## BUNDLEID history (resolved by rename, 2026-07-03)

`co.onejob.app` was auto-registered to the free Personal Team during the
first on-device run (automatic signing + wrong team); bundle ids are
globally unique and free-team App IDs are invisible/undeletable in the
portal, so the paid team couldn't register it. Since nothing had shipped,
Xian chose to abandon it and rename to `co.onejob.deck` rather than wait
on an Apple support ticket. The abandoned id stays reserved to the
personal team, harmlessly.

## Version bumps

Native versions live in `android/app/build.gradle` (versionCode/Name) and
Xcode target settings (Version/Build) — bump alongside app releases.
