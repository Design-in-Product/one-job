# One Job — Store Listing Copy (draft for Xian's review)

Shared across App Store and Play Store unless noted. Screenshots live in
`store/screenshots/` (regenerable; see NATIVE.md).

## Identity

- **App name**: One Job
  - *Etymology (Xian, recorded 2026-08-03)*: the name comes from the
    **"you had one job"** meme. Worth knowing before writing any copy —
    the name is already a joke the reader is in on, and copy that plays
    to it lands harder than copy that explains the product. This is why
    screenshot caption 1 is "You have one job": it closes the loop the
    name opens.
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
> • Big tasks break into smaller decks you can focus through one card at a time
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
> for the menu (Undo / Add Task / Inchworm walk / Completed / Integrations
> / Settings — a single-deck device won't show "Decks…", a pro-only
> entry). Settings includes export/import backup. Haptic feedback fires
> on swipe commits.

---

## Copy review vs current UI (Coral, 2026-08-04) — APPLIED 2026-08-13

Both deltas are now applied to the approved copy above, since 1.0 =
rc.31 (confirmed 2026-08-13, not rc.12):

1. ~~"Big tasks break into substacks"~~ → *"Big tasks break into
   smaller decks you can focus through one card at a time."* — Xian
   approved the exact proposed wording. Applied.
2. ~~Review notes menu list~~ — regenerated for rc.31's actual
   long-press menu (Undo, Add Task, Inchworm walk, Completed,
   Integrations, Settings; Decks… only on multi-deck/pro devices, so
   omitted for the reviewer's plain device) and the shake-to-undo path
   added, which rc.12's notes never mentioned. Applied.
   **Superseded 2026-08-20**: shake-to-undo removed entirely (root
   cause diagnosed — iOS's own system "Undo Typing" gesture wins the
   race and undoes nothing, a platform collision, not fixable from web
   content). The shake mention above is now stale history; the live
   review notes (top of this file) reflect the removal.
3. Screenshots line: now regenerable in one command —
   `node scripts/capture-store-shots.mjs` (see header for env; staging
   sets land in `store/screenshots/staging-<date>/`). Release version
   is decided (rc.31, 2026-08-13) — the SHUTTER for final assets now
   waits only on Xian's device-pass soak clearing; the harness makes
   re-capture free so assets can never age the way the rc.2 set did.

## Screenshot captions — historical drafting (Relay, 2026-08-03)

**Superseded 2026-08-13** — Xian edited five of six directly; the live
captions now live in `scripts/compose-store-shots.mjs`'s `CAPTIONS`
object, which is the source of truth. This table is kept as drafting
history only.

The marketing canvases need a headline line per shot. Nothing was drafted
yet, and these are the highest-leverage words in the listing: the **first
three** appear on the install sheet, so more people will read caption 1
than will ever read the description.

Written against Coral's six-shot list. Voice follows the approved copy —
plain, warm, faintly wry; no jargon a user wouldn't use ("sub-deck",
"rooms", "hold-menu" all avoided).

| # | Shot | Caption | Alternate |
|---|---|---|---|
| 01 | `01-the-deck` | **You have one job.** *(Xian, 2026-08-03)* | This is your whole to-do list. |
| 02 | `02-swipe-to-complete` | **Done? Swipe it away.** | Finishing is a gesture. |
| 03 | `03-inside-a-task` | **Big job? Deal it out.** | Every card can hold a deck. |
| 04 | `04-done-archive-trash` | **Nothing ever just disappears.** | Done, archived, or gone — your call. |
| 05 | `05-hold-anywhere` | **No clutter. Press and hold for the rest.** | Everything's one press away. |
| 06 | `06-private-by-design` | **Your deck never leaves your device.** | No account. No cloud. No tracking. |

**The arc, deliberately:** 1 states the premise and provokes the obvious
question (*where's the rest of it?*) — the screenshot answers it. 2 shows
the core gesture. 3 answers the first real objection (*that can't scale to
big work*). Those three stand alone on the install sheet and have to carry
the whole pitch between them. 4–6 then reassure: nothing is lost, nothing
is cluttered, nothing leaves the device.

**On caption 1** — Xian's line replaced my draft, and it's the stronger
one. "This is your whole to-do list" *describes the screen*; "You have one
job" *addresses the reader*, and does three things at once: it states the
product name as a sentence, it borrows an idiom people already say with a
wry edge ("you had one job"), and it puts the user in the frame rather
than the software. Second person beats third for a line whose whole task
is to make a stranger feel spoken to.

Notes for whoever composes the frames:

- These are sized for display at headline scale — roughly 3–7 words. If a
  frame design wants a subhead too, ask and I'll draft second lines rather
  than have the primaries stretched.
- Caption 1 is doing the most work and is the one most worth arguing about.
- Unreviewed against actual frames; type size and line breaks may push some
  toward the shorter alternates.
- If the Play listing reuses the frames, these hold — nothing here is
  App-Store-specific.

## iPad presentation note (2026-08-04, from the 13" captures)

Functionally clean at 2064×2752 — every flow drives. Presentation is a
phone-width column centered in a wide field; the afterlife peek reads
as a thin bar at this height. Options, Xian's call:
(a) ship the honest centered column for 1.0;
(b) scale card geometry up at tablet breakpoints (cheap, cosmetic);
(c) the real answer is R2's canvas — 13" is where multiple decks
side-by-side stops being a metaphor. Not a 1.0 blocker either way.

### Rendered slate (Coral, 2026-08-04) — Relay's headlines + Coral's sublines

The composed canvases in `store/screenshots/staging-2026-08-04/composed/`
render a MERGED slate: Relay's headline set (the stronger of the two
parallel drafts — 01 provokes the question the screenshot answers; the
install-sheet arc runs premise → gesture → first objection) with short
supporting sublines. Alternates remain in Relay's table above. All of it
awaits Xian's wordsmithing; edits are one line + one command.
