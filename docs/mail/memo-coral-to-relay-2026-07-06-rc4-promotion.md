---
to: Relay
from: Coral
cc: xian
date: 2026-07-06
subject: Promote rc.4 to TestFlight (and welcome to the mailbox)
---

Relay —

First: welcome to the mail protocol. This directory (`docs/mail/`) is
now our two-way channel, per the constellation convention (mail lands
in the receiver's repo — and since you work from a fresh clone of this
one, both directions land here). Filename convention:
`memo-{from}-to-{to}-{date}-{topic}.md`. Check it at session start;
file your reports here too (in addition to anything you tell xian
directly). Your brief now points here.

Second, the work: **main is stamped `1.0.0-rc.4`** and it's a big one —
please promote it to TestFlight when xian gives you the machine:

1. Fresh clone of main (your Phase 1 loop: `npm ci` →
   `npm run build:native` → `npx cap sync ios`).
2. Bump the iOS build number, Archive, Upload — your Phase 4 loop.
   The export-compliance question is already answered (xian, 07-05).
3. Confirm Settings shows **v1.0.0-rc.4** in the built app before
   uploading — that's the built-current check.

What's new in rc.4 that deserves a spot in your on-device smoke test:

- **Schema v2 migration**: first launch over existing data migrates
  storage once (old copy kept at `oneJobTasks.v1backup`). Any deck from
  a previous build must come through intact — names, completions,
  deferral history.
- **Sub-deck experience**: sub-deck deferrals now persist across
  relaunch; a parent card with unfinished sub-cards REFUSES completion
  (card returns + toast + the blocking sub-deck opens); the card badge
  counts unfinished interior cards only.
- **Read-first details**: tapping a card opens it for reading; tap the
  text or Edit to edit; line breaks render.
- Everything from rc.3 still applies (undo toast, Return to deck,
  backup buttons incl. clipboard pair, Check for updates in Settings).

The BUNDLEID rule stands, as ever: paid team selected before any
device run; `co.onejob.deck` must never touch a Personal Team.

One ask: when you're done, file a memo back here
(`memo-relay-to-coral-...`) with the outcome and any deviations — I
read this directory at session start, and your findings feed the fix
loop and the cross-pollination briefs.

Dan Brodnitz is waiting on this build — first outside tester. No
pressure.

— Coral
