# Amber as the iOS build host — provisioning runbook

**Author:** Coral · 2026-07-30 · **Status:** tracks laid up to the
Apple-auth gate. Context: Relay's Xcode wedged on Xian's laptop;
Xian asked for Amber as a parallel/backup path ("I can do the auth
steps when needed"). Whether Amber *becomes* the pipeline home is
rollup item 5 — this doc makes it possible, not decided.

## Verified working today (no Xcode needed)

- ✅ **M1 Max, 251 GB free**, macOS 26.5.2, Command Line Tools 26.6
- ✅ `npm run build:native` → `dist-native/` (rc.22)
- ✅ `npx cap sync ios` → assets copied, `Package.swift` written
- ✅ **Capacitor 8 uses SPM** (`ios/App/CapApp-SPM`) — **no CocoaPods
  in the build path** (installed anyway as surplus; ignore it)
- ✅ Install tooling: `xcodes` 2.0.3 (prebuilt binary — brew's
  from-source build needs Xcode, the very chicken it hatches) + `aria2`

## The auth gate — Xian's steps, in order

Every Xcode acquisition path requires an Apple ID; there is no
unattended workaround, by design.

1. **Download Xcode** — everything is staged; the one command is:
   ```bash
   xcodes install 26.6 --experimental-unxip
   ```
   (xcodes 2.0.3 installed at /opt/homebrew/bin — the brew formula
   failed building from Swift source *because that needs Xcode*; the
   prebuilt release binary sidestepped the chicken-and-egg. aria2 is in
   place, so the ~8 GB moves fast. **26.6 (17F113)** is current stable,
   matching the CLT already on Amber.) Prompts for Apple ID + 2FA
   interactively — run it in a terminal, or `!`-prefix it in a Coral
   session so the output lands in-conversation.
2. **First-run**: `sudo xcode-select -s /Applications/Xcode.app` then
   `sudo xcodebuild -license accept` and let it install iOS platform
   support (`xcodebuild -downloadPlatform iOS`).
3. **Signing** (the real gate):
   - Xcode → Settings → Accounts → add your Apple ID (team lives there), **or**
   - Better for unattended repeatability: an **App Store Connect API
     key** (App Store Connect → Users and Access → Integrations →
     App Store Connect API → Team key, role App Manager). Download the
     `.p8` ONCE, note Key ID + Issuer ID. With that on Amber, archive
     upload needs no interactive login ever again.

## What I run once the gate opens (no further Xian input)

```bash
cd ~/Development/one-job
npm run build:native && npx cap sync ios
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -destination 'generic/platform=iOS' \
  -archivePath build/App.xcarchive archive
xcodebuild -exportArchive -archivePath build/App.xcarchive \
  -exportOptionsPlist ios/exportOptions.plist -exportPath build/export
# upload: xcrun altool --upload-app -f build/export/*.ipa \
#   --apiKey $KEY_ID --apiIssuer $ISSUER_ID   (API key at
#   ~/.appstoreconnect/private_keys/AuthKey_$KEY_ID.p8)
```

`ios/exportOptions.plist` (method `app-store-connect`, team ID) gets
written when we know the team ID — first archive run surfaces it.

## Open choices (decide at first build, not before)

- **Upload tool**: `altool` with API key is the simplest scriptable
  path; if the installed Xcode has retired it, fall back to Transporter
  or add fastlane `pilot`. Decide against the actual Xcode version.
- **Relay's role** (rollup 5, Xian's call): this runbook works equally
  as Relay-on-Amber instructions or as my pipeline. The memos flow
  either way.

## Standing cautions

- **Never sign in as anyone but Xian's accounts**; the `.p8` key file
  is a secret — keep it out of the repo (`.gitignore` already covers
  `*.p8`? VERIFY before writing it anywhere under the repo — safer:
  `~/.appstoreconnect/`, outside the repo entirely).
- Amber is shared: Xcode is a machine-wide install — flag it to Pard
  for the harbor manifest (disk + platform SDKs land in shared space).
