# Amber as the iOS build host — provisioning runbook

**Author:** Coral · 2026-07-30, updated 07-31, verified end-to-end
2026-08-15/16 · **Status: PROVEN LIVE** — first real archive/export/
upload on Amber succeeded 2026-08-16 (build 31, Delivery UUID
`b96a2f65-177a-43ba-981d-659b3c202979`). Direction decided 07-31 —
Amber is the pipeline's natural home (Xian) / consolidate (Pard's
infra read); rc.12's TestFlight cut was still on the old laptop, so
everything below was staged-but-unexercised until this week.

**Division of ownership (Pard, harbor manifest):** Xcode
install/updates/host-integration = **Pard** (daemon-class, courtesy
windows — I flag any submission error naming a minimum-version bump).
Build usage & pipeline = **me**. Host facts live in the harbor
manifest's capability entry; this doc keeps only the One Job pipeline
steps. Known systemic cost, accepted: App Store minimums periodically
force Xcode→macOS updates = a fleet-wide reboot event on a 14-resident
host.

**Secrets (harbor convention, adopted 2026-07-30):** tool-canonical
path (`~/.appstoreconnect/private_keys/`), dir 700 / file 600, never in
any repo, registered in the manifest's secrets registry (path · owner ·
what it unlocks — never content), xian-only.

## Verified working (no Xcode running-account needed)

- ✅ **M1 Max, 251 GB free**, macOS 26.5.2, Command Line Tools 26.6
- ✅ `npm run build:native` → `dist-native/`
- ✅ `npx cap sync ios` → assets copied, `Package.swift` written
- ✅ **Capacitor 8 uses SPM** (`ios/App/CapApp-SPM`) — **no CocoaPods
  in the build path** (installed anyway as surplus; ignore it)
- ✅ Install tooling: `xcodes` 2.0.3 (prebuilt binary — brew's
  from-source build needs Xcode, the very chicken it hatches) + `aria2`
- ✅ **Xcode 26.6.0 installed** at `/Applications/Xcode-26.6.0.app`
  (Pard's install, per the ownership split below)
- ✅ **iOS 26.5 platform SDK installed** (2026-08-15 — this step had
  silently NOT happened despite Xcode itself being present for days;
  `xcodebuild -downloadPlatform iOS`, ~8.5GB, first attempt got killed
  by a background-task limit with no error surfaced, second attempt
  with explicit background mode completed clean — if a build ever says
  `"iOS 26.5 is not installed"` again after a version bump, this is the
  command)

## The auth gate — what ACTUALLY needed Xian, verified 2026-08-15/16

The API key alone (App Manager role, deliberately narrow) turned out
to be enough for exactly one thing: auto-generating a **Development**
certificate + profile during `archive`. It could NOT do either of the
two things a real **distribution** build needs — both are gated by
Apple to a higher privilege tier than App Manager, and both showed up
as the same misleading top-line error (`Cloud signing permission
error`) with a different specific cause underneath:

1. **The Distribution certificate.** Xcode → Settings → Apple Accounts
   → sign in with Xian's Apple ID (2FA) → select the team → **Manage
   Certificates…** → **+** (it's a dropdown, not a single button) →
   **Apple Distribution** specifically. (Xian's first attempt picked
   **Mac Installer Distribution** from that same dropdown by mistake —
   wrong product entirely, for signing macOS `.pkg` installers, not
   iOS apps. Caught from the certificate list before it went anywhere;
   corrected in the same session.) Role shown was **Admin** — that's
   what let this succeed where the API key couldn't.
2. **The Distribution provisioning profile.** Having the certificate
   wasn't enough on its own — `-exportArchive -allowProvisioningUpdates`
   with the API key auth flags still failed
   (`No profiles for 'co.onejob.deck' were found`). Dropping the API
   key flags and relying on the *interactively signed-in* Xcode
   account (same Admin session from step 1) let `-allowProvisioningUpdates`
   create the missing profile and the export succeeded immediately.

**Both steps are one-time.** The certificate and the profile it
created now live in Apple's system and Amber's keychain; every archive
+ export since (and future ones) uses them without needing the
interactive account again — the API key resumes being sufficient for
`archive` and `-exportArchive` once these exist, since it only needed
elevated privilege to *create* them, not to *use* them.

## The proven pipeline (verified 2026-08-16, build 31)

```bash
cd ~/Development/one-job
npm run build:native && npx cap sync ios
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -destination 'generic/platform=iOS' \
  -archivePath build/App.xcarchive archive \
  -allowProvisioningUpdates
xcodebuild -exportArchive -archivePath build/App.xcarchive \
  -exportOptionsPlist ios/exportOptions.plist -exportPath build/export \
  -allowProvisioningUpdates
xcrun altool --upload-app -f build/export/App.ipa -t ios \
  --apiKey $KEY_ID --apiIssuer $ISSUER_ID
```

API key: `~/.appstoreconnect/private_keys/AuthKey_$KEY_ID.p8`, LIVE
since 2026-08-08. `KEY_ID=D96QY6RRB3`,
`ISSUER_ID=4d7298e0-7bf2-4f1f-a541-cccfe6281485` (IDs are non-secret;
the `.p8` itself is at the canonical path, 600, backed up in Xian's
password manager, registered in Amber's harbor manifest).

`ios/exportOptions.plist` is committed (method `app-store-connect`,
team `YZ4B34YGX9`, automatic signing) — no longer needs writing at
build time, the team ID question this doc used to defer is answered.

**Build numbering**: `CURRENT_PROJECT_VERSION` in
`ios/App/App.xcodeproj/project.pbxproj` (currently 31, matching the
web `rc.X` tag it was cut from — was `2`, whatever rc.12's TestFlight
build used) must increase for every new upload to the same
`MARKETING_VERSION` (currently `1.0`). Bump it by hand before each
archive; there's no auto-sync between the web package.json version and
this number.

`altool` is Apple's now-legacy upload tool but is still bundled and
working in Xcode 26.6 (`xcrun altool --version` → 26.40.1) — no need
for Transporter or fastlane `pilot` unless a future Xcode drops it.

## Standing cautions

- **Never sign in as anyone but Xian's accounts**; the `.p8` key file
  is a secret — keep it out of the repo (`.gitignore` already covers
  `*.p8`? VERIFY before writing it anywhere under the repo — safer:
  `~/.appstoreconnect/`, outside the repo entirely).
- Amber is shared: Xcode is a machine-wide install — flag it to Pard
  for the harbor manifest (disk + platform SDKs land in shared space).
