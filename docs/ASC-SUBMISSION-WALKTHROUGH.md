# App Store submission — the numbered walkthrough

**For:** Xian · **Prepared by:** Coral, 2026-09-01
**State:** everything on my side is done. These are the steps that
require your App Store Connect login and nobody else's.

Estimated time: ~15 minutes, most of it uploading images.

---

## Before you start

Open [App Store Connect](https://appstoreconnect.apple.com) → **My
Apps** → **One Job** → the **1.0 Prepare for Submission** page (left
rail, under the iOS app).

**What's already true, so you don't have to check:**
- **Build 37** (cut from rc.37, 2026-09-05) is uploaded — Delivery UUID
  `45248f86-9c7b-4335-91fd-0bfccc947f37`. It supersedes build 33: it has
  the sub-deck centering fix and the Zapier/Asana/Todoist stubs removed
  (the review notes describe the current Integrations screen either way).
- Export compliance is pre-answered in the binary
  (`ITSAppUsesNonExemptEncryption=false`), so it shouldn't stop to ask.
- Privacy label: **Data Not Collected** — still accurate as of rc.34's
  instrumentation, verified against Apple's own definition (on-device
  processing is not "collection"; the usage export is user-initiated).

---

## 1 · Upload the screenshots

Files are in the repo at
`store/screenshots/staging-2026-09-05/composed/` — the staging folder
now contains only `composed/` (upload these) and `raw/` (inputs, never
uploaded). If what you're looking at has no red gradient and no caption,
you're in `raw/` — back out one level and open `composed/`.

Three folders map to three Media Manager buckets:

| Folder | Media Manager bucket | Pixels |
|---|---|---|
| `iphone-67/` | **iPhone 6.9" Display** | 1290 × 2796 |
| `iphone-65/` | **iPhone 6.5" Display** | 1284 × 2778 |
| `ipad-13/` | **iPad 13" Display** | 2064 × 2752 |

Drag all six from each folder into its bucket. **Order matters** — the
files are numbered `01`–`06` and the first three are what appear on the
install sheet, carrying the whole pitch:

1. `01-the-deck` — "You have one job."
2. `02-swipe-to-complete` — "Done? Swipe right."
3. `03-inside-a-task` — "Big job?"
4. `04-done-archive-trash` — "Know what you did."
5. `05-hold-anywhere` — "Calm uncluttered clarity."
6. `06-private-by-design` — "Your deck never leaves your device."

If they land out of order, drag to reorder — ASC keeps upload order.

## 2 · Select the build

Scroll to the **Build** section → **+** (or "Select a build before you
submit") → choose **1.0 (37)**. Not 31–33 — 37 is the one cut from the
same code the screenshots show. (If 37 isn't listed yet it's still
processing; that usually takes 15–60 minutes from upload.)

## 3 · Paste the review notes

The **App Review Information → Notes** field. Text lives in
`store/LISTING.md` under "Review notes," current as of rc.33:

> One Job is a fully offline, local-first task manager. No login is
> required or possible; all data is stored on-device. To test: launch,
> add a task from the empty-state form or the long-press menu, tap the
> deck to reveal, swipe right to complete, swipe left to defer,
> long-press for the menu (Undo / Add Task / Inchworm walk / Completed
> / Integrations / Settings — a single-deck device won't show "Decks…",
> a pro-only entry). Settings includes export/import backup. Haptic
> feedback fires on swipe commits.

No demo account needed — say so if it asks; there are no accounts.

## 4 · Release notes / "What's New"

First release, so this field may be absent or optional. If present,
something plain:

> One Job's first release. See one task. Do one task. Feel accomplished.

## 5 · Version release option

**Manually release this version** is the safer default — it means
approval doesn't put you live at 3am unannounced; you press the button
when you're ready. (Automatic is fine too if you'd rather not think
about it again.)

## 6 · Submit

**Add for Review** → **Submit to App Review**.

---

## After you submit

- Status goes **Waiting for Review** → **In Review** → **Pending
  Developer Release** (if you chose manual) or **Ready for Sale**.
- Typical turnaround is 24–48 hours, sometimes same-day.
- **If it's rejected**, forward me the resolution-center message. Most
  first-submission rejections are metadata questions, not code, and I
  can usually turn a fix around same-day.

## What I'd want to know

Tell me when it's submitted and I'll update the roadmap and rollup, and
start watching for the review outcome. If anything in ASC doesn't match
what's written above — a bucket named differently, a field that isn't
there — tell me exactly what you see rather than working around it;
Apple moves this UI and I'd rather fix the walkthrough than have you
improvise.
