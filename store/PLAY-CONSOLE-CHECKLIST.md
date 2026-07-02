# Play Console: One Job first release (internal testing)

For Xian, first time through the Play Console. Everything you'll be asked
for is pre-drafted — this is mostly copy-paste. Total: ~30–45 minutes.

## 0. Prereqs

- [x] Play developer account (done 2026-07-02)
- [ ] Keystore secrets in GitHub (see "Keystore" below)
- [ ] A signed AAB from the **Android Release** workflow
      (repo → Actions → "Android Release (signed AAB)" → Run workflow →
      download the `one-job-release-aab` artifact when green)

## Keystore (once, on your Mac)

```bash
cd one-job
bash scripts/make-android-keystore.sh
```
Then add the three secrets it prints to GitHub → repo Settings → Secrets
and variables → Actions. Keep the keystore file + password in your
password manager too.

## 1. Create the app

Play Console → All apps → **Create app**
- App name: **One Job**
- Default language: English (US)
- App or game: App · Free
- Accept declarations → Create

## 2. Set up the app (the "Dashboard" task list)

Work through "Set up your app" — answers for every prompt:

| Prompt | Answer |
|---|---|
| Privacy policy | `https://onejob.co/privacy.html` |
| App access | All functionality available without special access (no login) |
| Ads | No ads |
| Content rating questionnaire | Category: Utility/Productivity; answer No to everything |
| Target audience | 18+ (simplest; not designed for children) |
| News app | No |
| Data safety | **No data collected, no data shared** (matches store/LISTING.md) |
| Government app | No |
| Financial features | None |
| App category | Productivity |
| Contact email | xian@pipermorgan.ai |
| Store listing | Copy from `store/LISTING.md` (short + full description) |
| Graphics | Icon 512×512: `store/play-icon-512.png`; Feature graphic 1024×500: `store/feature-graphic-1024x500.png`; Screenshots: `store/screenshots/android/` |

## 3. Internal testing release

Testing → **Internal testing** → Create new release
- Upload the `.aab` from the workflow artifact
- Release name: `1.0.0 (1)` (pre-filled)
- Release notes: "First release: the card deck, local-first."
- Save → Review release → Start rollout to internal testing

## 4. Add testers

Internal testing → Testers tab → Create email list → add your alpha
testers' Gmail addresses → Save. Copy the opt-in link and send it to them;
they tap it once, then install One Job from the Play Store like any app.

## 5. Later: production

When alpha feels good: Production → Create release → same AAB (or a newer
one) → this triggers Google's full review (usually 1–3 days for a new
developer account).
