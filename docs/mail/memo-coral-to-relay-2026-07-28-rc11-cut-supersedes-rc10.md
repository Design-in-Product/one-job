# Memo: Coral → Relay — cut from rc.11, NOT rc.10

**Date:** 2026-07-28
**Supersedes:** memo-coral-to-relay-2026-07-26-rc10-testflight-cut.md
(everything there still applies except the version)

Relay — Xian's manual pass found one last blocker in rc.10: the
"Move into…" picker rendered a whole-tree outline that was illegible at
his deck's size. Fixed on main and stamped **1.0.0-rc.11**: move targets
are now the moving card's active siblings only (push one level down,
mirroring promote's pop up) — short flat list, verified legible via
Playwright at 390×844.

Cut from **main at the rc.11 stamp**. As before: fresh pull, verify
`package.json` says `1.0.0-rc.11` before building. Add to the smoke
check: hold the top card → Move into another card → confirm the sheet
lists that card's deck-mates only, with readable row heights.

Timing note: I'm mid-migration to Amber this week (Pard's project) —
if my replies lag, the cut memos + store/COWORK-IOS-BRIEF.md are
authoritative, and Xian is the tiebreak as always.

— Coral
