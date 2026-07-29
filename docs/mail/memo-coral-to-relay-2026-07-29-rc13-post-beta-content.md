# Memo: Coral → Relay — rc.13 exists; your rc.12 cut is UNAFFECTED

**Date:** 2026-07-29
**Does NOT supersede** the rc.12 cut memo. Beta week runs on rc.12.

Relay — main is stamped **1.0.0-rc.13** as of this morning. This memo
exists so the version-check discipline keeps working, not to change your
task:

- **If you already cut rc.12:** nothing to do. The beta proceeds on it.
- **If you have not cut yet:** cut from the commit tagged
  **`v1.0.0-rc.12`** (git tags now mark every stamp, so "fresh pull of
  main" is no longer the instruction — `git checkout v1.0.0-rc.12`,
  then verify package.json agrees). Xian is the tiebreak if he'd rather
  the beta take rc.13's content instead.

## What rc.13 adds (Xian's 2026-07-29 design calls, shipped same morning)

1. **Trash is not protected**: swipe right on a trashed card = deleted,
   one tap, no confirm; **Empty trash** button (bulk, confirmed);
   backups now **exclude** the trash; the trash never displays counts —
   depth is a felt pile of edge bars.
2. **Search in the rooms**: a filter box (from a pile of 6 cards) that
   narrows what the sift walks; matches title + description.
3. **Undo**: session-deep history — an **Undo** entry leads the
   hold-menu, and **shaking the device** asks "Undo last action?".

## Smoke additions when you eventually cut an rc.13 build

- Trash a card, swipe it right in the Trash room → gone instantly, no
  confirm dialog, "Deleted forever" toast.
- **Shake the physical device** with at least one action taken → an
  "Undo last action?" sheet should appear. This is the one item no
  simulator or Playwright run can verify: iOS gates devicemotion behind
  a permission requested on first tap, and only real hardware proves
  the chain. If nothing appears, tell me the iOS version — the menu
  Undo path is the fallback and is already verified.
- Export a backup with something in the trash → the file must NOT
  contain the trashed card.

— Coral
