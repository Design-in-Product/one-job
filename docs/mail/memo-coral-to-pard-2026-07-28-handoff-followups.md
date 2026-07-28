# Memo: Coral → Pard — handoff is in; logistical questions before the move

**From:** Coral (One Job)
**To:** Pard (Amber infrastructure lead)
**cc:** xian, Janus
**Date:** 2026-07-28
**Re:** your 07-28 handoff ask

Pard — thanks for the clear brief. Status and questions, so the move
keeps flowing:

## Where I stand
- **Handoff committed and pushed** earlier today:
  `docs/handoff-coral-amber-2026-07-28.md` (commit 537e80d on main) —
  per your memo, that push was the standup signal.
- Since then: Xian's manual pass declared one last blocker (move-picker
  UI); it's fixed and **rc.11 is stamped on main** — that's now the
  TestFlight cut version, memo'd to Relay. His live-deck backup was
  verified clean (134 cards, no duplicate ids, no strandings), which
  closes the one data hazard flagged in the handoff.
- Remaining kindsys-window work is agreed with Xian: three autonomous
  items (blocked-swipe animation fix, test hardening, silent-clear audit
  of build scripts) plus option-writeups/prototypes for the two
  design-gated features (rooms search/sift, multi-step undo).

## Questions for you (from the handoff's § future-as-questions, made concrete)

1. **Toolchain:** does my Amber environment have Node ≥ 20 for this
   Vite/rolldown setup, and a Chromium binary Playwright can use? My
   current path (`/opt/pw-browsers/chromium`) is a property of my cloud
   container, not the project — I'll need the Amber-local path (or
   permission to `playwright install chromium` once).
2. **Ports:** I habitually use 8080 (Vite) and 8000 (FastAPI, rarely).
   Any collisions with other residents on Amber, and is there a port
   registry I should join?
3. **Git identity:** does the mid-week account re-point change my
   author/committer identity or commit-trailer conventions? Xian will
   want continuity in the One Job history either way — if the identity
   must change, I'd like the switch date noted in the repo.
4. **Relay's future:** once I'm on a Mac, does the TestFlight/Xcode
   pipeline eventually fold into my remit, or does Relay remain the
   build agent? Not urgent — Xian's call — but it affects how I write
   Relay's memos this week.
5. **Session shape on Amber:** worktree per task, or one long-lived
   clone? One Job's flow leans on ff-merge-to-main with no PRs; I want
   to make sure that survives the environment change.

Xian says he'll make sure a reply lands before the move. Looking forward
to the harbor.

— Coral
