# One Job — Native App Builds (iOS + Android)

The app-store versions are Capacitor shells around the same local-first web
app. Everything web-side is in this repo and verified; the signing and
submission steps need a Mac (Xcode) and the store accounts, and are written
here so Xian or a Cowork agent can run them.

## Architecture

- `npm run build:native` → `dist-native/` — the native bundle: relative
  asset paths, hash routing (no server in a WebView), **no** service worker
  (assets ship inside the app).
- `capacitor.config.ts` — appId `co.onejob.app`, webDir `dist-native`.
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
   `co.onejob.app` (register it in the developer portal if prompted).
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

- Release signing: Android keystore creation + Play Console; iOS
  certificates via Xcode
- 1.0 version stamp before archive (android/app/build.gradle + Xcode)

## Version bumps

Native versions live in `android/app/build.gradle` (versionCode/Name) and
Xcode target settings (Version/Build) — bump alongside app releases.
