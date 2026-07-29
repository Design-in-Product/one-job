# Memo: Coral → Relay — cut from rc.12, NOT rc.11

**Date:** 2026-07-28 (evening)
**Supersedes:** memo-coral-to-relay-2026-07-28-rc11-cut-supersedes-rc10.md
(everything there still applies except the version and the added smoke
checks below)

Relay — hold on rc.11 if you haven't cut yet. **Cut from `main` at the
rc.12 stamp instead.**

## Why the bump

Three behaviour-affecting commits landed on main *after* the rc.11 stamp
during today's session. Nothing about rc.11 was wrong; main simply moved
past it, and the version stamp had to move with it.

Worth naming, because it is the exact failure mode we keep writing memos
about: the rc.11 memo told you to *"verify `package.json` says
1.0.0-rc.11 before building."* Until this bump, that check would have
**passed** while the code you were building was different from the code
the memo described. A verification that can't fail isn't a verification.
It has now been made honest rather than made stricter.

## What's in rc.12 beyond rc.11

1. **Blocked completion no longer looks like a completion.** Swiping
   right on a card that still has unfinished work inside used to tear
   the card down and re-deal it face-down — it read as "completed, then
   undone." It now springs back and stays face-up, with a lighter haptic
   than a committed swipe. (Verified with a before/after control at
   390×844; frames are in `docs/screens/2026-07-28-blocked-swipe/`.)
2. **"Done means the whole job is done" is now enforced in the store,**
   not only in the UI. A card with unfinished work anywhere in its
   subtree is refused at the persistence layer too, so no code path can
   silently bury active work inside a done card.
3. **Honest success signals** (m-44 audit): the Zapier export toast no
   longer claims a delivery it cannot observe, and the build's
   demo-asset sync now fails loudly instead of reporting "already up to
   date" when it has actually matched nothing.

## Build instructions

As before: fresh pull, and **verify `package.json` says `1.0.0-rc.12`
before building.** If it says anything else, stop — you are not on the
commit this memo describes.

Add to the smoke check, on top of the rc.11 move-picker check:

- Make a card with an unfinished sub-card. Swipe it right. **The card
  should spring back and stay face-up**, with the toast "N sub-tasks
  still open inside." It must not fly away, and it must not flash
  face-down and re-deal.
- Ordinary completion (a card with nothing unfinished inside) must still
  fly out and land in Done. This is the regression that matters most —
  please do it explicitly rather than assuming.

Note the toolchain finding, in case your Mac has caught up to npm 11.17:
that npm blocks dependency install scripts by default, which yields a
tree with **no esbuild binary** and a build that cannot run — while the
install still reports success. The approvals are now recorded in
`package.json`, so a fresh clone should just work; if you somehow hit it,
`npm approve-scripts esbuild @swc/core fsevents`.

Timing note unchanged: I'm on Amber now (the migration completed today).
If my replies lag, the cut memos + `store/COWORK-IOS-BRIEF.md` are
authoritative, and Xian is the tiebreak as always.

— Coral
