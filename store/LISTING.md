# One Job — Store Listing Copy (draft for Xian's review)

Shared across App Store and Play Store unless noted. Screenshots live in
`store/screenshots/` (regenerable; see NATIVE.md).

## Identity

- **App name**: One Job
- **Bundle/package id**: co.onejob.deck  (renamed 2026-07-03; co.onejob.app abandoned to the free-team registration trap)
- **Category**: Productivity
- **Price**: Free
- **Privacy policy URL**: https://onejob.co/privacy.html
- **Support URL**: https://onejob.co
- **Marketing URL**: https://onejob.co

> Listing copy approved by Xian 2026-07-02. Localization of the app and
> then the listings is on the post-1.0 roadmap.

## App Store subtitle (30 chars max)

> One task at a time. Really.

## Promotional text (170 chars, App Store)

> Your to-do list is a deck of cards. Flip one over, do it, swipe it away.
> Everything else waits its turn — face down, out of mind.

## Description

> **See one task. Do one task. Feel accomplished.**
>
> One Job turns your to-do list into a deck of cards. Tap the deck to flip
> over your top task. Do it, then swipe right to complete it — or swipe
> left to slide it to the bottom of the pile for later. The next card is
> already waiting.
>
> No lists. No badges. No guilt. Just the one thing you're doing now.
>
> **Why it works**
> • Single-tasking beats juggling: seeing one task removes the anxiety of
>   seeing all of them
> • Deferring is a gesture, not a failure — the card just waits its turn
> • Big tasks break into substacks you can focus through one card at a time
>
> **Private by design**
> • Your tasks live on your device — no account, no cloud, no tracking
> • Works completely offline
> • One-tap backup to a file you control
>
> Fifteen years of to-do apps tried to show you everything.
> One Job shows you what matters: the next thing.

## Keywords (App Store, 100 chars)

> tasks,todo,focus,adhd,single task,productivity,simple,offline,private,cards,one thing

## Play Store short description (80 chars)

> Your to-do list as a deck of cards. See one task, do it, swipe. Private, offline.

## Data safety / privacy questionnaire answers

- Data collected: **None**
- Data shared: **None**
- Data encrypted in transit: N/A (no transmission)
- Deletion request mechanism: N/A (all data is on-device; deleting the app
  deletes the data; export/import is user-controlled)
- Apple "Privacy Nutrition Label": **Data Not Collected**

## Review notes (for Apple reviewer)

> One Job is a fully offline, local-first task manager. No login is
> required or possible; all data is stored on-device. To test: launch,
> add a task from the empty-state form or the long-press menu, tap the
> deck to reveal, swipe right to complete, swipe left to defer, long-press
> for the menu (Add Task / Completed / Integrations / Settings). Settings
> includes export/import backup. Haptic feedback fires on swipe commits.

---

## Copy review vs current UI (Coral, 2026-08-04) — PROPOSED deltas, not applied

The approved copy above holds up well; two spots aged and one is
version-dependent:

1. **"Big tasks break into substacks"** — "substack" is retired
   vocabulary (now sub-decks / cards all the way down). Proposed:
   *"Big tasks break into smaller decks you can focus through one card
   at a time."*
2. **Review notes menu list** is accurate for rc.12 but not later
   builds (rc.13+ adds Undo; rc.17+ adds Decks…; rc.22+ Inchworm).
   Keep as-is if 1.0 ships from rc.12; regenerate this line with the
   release-version decision otherwise.
3. Screenshots line: now regenerable in one command —
   `node scripts/capture-store-shots.mjs` (see header for env; staging
   sets land in `store/screenshots/staging-<date>/`). The SHUTTER for
   final assets waits on the release-version decision; the harness
   makes re-capture free so assets can never age the way the rc.2 set
   did.

## iPad presentation note (2026-08-04, from the 13" captures)

Functionally clean at 2064×2752 — every flow drives. Presentation is a
phone-width column centered in a wide field; the afterlife peek reads
as a thin bar at this height. Options, Xian's call:
(a) ship the honest centered column for 1.0;
(b) scale card geometry up at tablet breakpoints (cheap, cosmetic);
(c) the real answer is R2's canvas — 13" is where multiple decks
side-by-side stops being a metaphor. Not a 1.0 blocker either way.
