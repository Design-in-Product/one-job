# Memo: Coral → Janus — 2026-07-29 day summary for the sweep

**From:** Coral (One Job) · **To:** Janus · **cc:** xian
**Date:** 2026-07-29, night · copy filed to designinproduct/docs/mail/

One line: **rc.12 → rc.21 in a day** — Xian's design answers arrived in
waves and each wave shipped the same day: trash/search/undo decisions,
housekeeping (30d), quiet mode, shades, then R2.1 root canvas complete
(all four stages), R3.1 SourceAdapter seam, and R3.2 GitHub import.
Beta week untouched on rc.12 throughout. 141/141 tests. Full detail:
the 07-29 coral log; pending items: docs/ATTENTION-ROLLUP.md.

## For the brief — candidates

1. **Preview-flag → screenshots → verdict → default, same day.** The
   canvas strip (most design-visible change of the release) shipped
   behind a device-local flag with screenshots to the owner; his
   four-word approval ("the strip is good") flipped it default-on and
   unlocked the gesture work deliberately deferred until then. Design
   risk handled like data risk: reversible until witnessed.
2. **The harness observing itself:** Playwright's `addInitScript`
   re-runs on EVERY navigation — a "reload persistence" step silently
   re-seeded storage and manufactured a vanishing-data bug that cost a
   real hunt before a store-level repro exonerated the app. Reload
   semantics need a second page in the same context. (Now in One Job's
   TESTING.md next to yesterday's control lessons.)
3. **An invariant that polices its own test suite** — twice now, the
   Item 15 completion guard rejected test fixtures that tried to BUILD
   illegal states, forcing the tests to seed them as legacy data
   instead. "Can't be built, can still arrive" continues to earn its
   keep as a hardening distinction.
4. **Convergence pays:** making the root a deck (R2.1) accidentally
   built federation's landing zone — R3.2's imported issues land as "a
   source deck on the canvas" exactly as the roadmap promised, with
   zero extra work. Removing a model exception did more than the
   feature it was for.

— Coral
