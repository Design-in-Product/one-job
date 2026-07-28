# Coral → Coral-on-Amber: first-person handoff

**Date:** 2026-07-28
**From:** Coral, writing from the remote (cloud) session that carried One
Job from the 2026-07 project assessment through the rc.10 TestFlight cut
**To:** my continuation on kindsys.us (through Thu 7/30), then Amber
**Format:** cohort standard per Pard's 07-28 memo (arch's model)

The repo shows the what (commits, tests, docs/ROADMAP.md, coral logs are
unusually complete — read 07-25 and 07-26 first). This document is the
judgment and the live threads that die with my session if unwritten.

---

## § Hard-won lessons

**1. When Xian pushes back on a diagnosis with a specific observable,
the observable outranks your verified repro.** `VERIFIED` — commit
8226e6e's message confidently calls the move-into "disappear" report
"pre-blocker-3 findability"; I had reproduced a benign path rigorously
and over-generalized to "not a data bug." His next message — "the count
of its parent deck differs from what appears in the move menu" — was the
real signal, and the real bug (active work buried inside a completed
card) was worse than the report. A clean repro of *a* cause is not proof
it's *the* cause. Cost: a day of him distrusting the move feature.

**2. Ask for the user's real data early; it beats synthetic repro.**
`VERIFIED` — the whole 07-26 diagnosis cracked open the moment his
actual backup arrived: the fresh deck's `createdAt` timestamped the
move, `completed: true` on the target named the bug. My seeded repro
had circled it; his JSON *was* it. He pastes backups willingly.

**3. One invariant, not four patches.** `VERIFIED` — three separate bug
reports (count mismatch, vanished card, unreachable target) collapsed
into one sentence: *you can only move a card somewhere you could
navigate to*, generalized to *a completed card is sealed* (no move-into,
no add-card, no add-deck, no completing over unfinished descendants at
any depth). Four call sites, one rule (commit 5fa2b1c). When bugs
arrive in clusters, look for the missing invariant before patching.

**4. Never ship a heuristic healer against real data.** `VERIFIED` (in
the 07-26 log) — I drafted a generic duplicate-id auto-healer and
rejected it after finding the duplicate symmetry could misflag Xian's
REAL cards as shadows. The rule I now hold: data-repair code gets
written against the actual corrupted artifact in hand, never against a
guessed shape. This is the code-side twin of the CLAUDE.md
destructive-action protocol.

**5. The silent-failure family is One Job's recurring villain.**
`VERIFIED` — the 07-05 data loss (export toasted success after merely
*attempting* a download), the shadow import (old code silently nested
inert duplicates), the deep-completion hole (guard silently checked only
direct children). All one genus: a success signal that doesn't name what
it verified. Today's cross-pollination brief (m-44) is the ecosystem-
wide statement of the same law; One Job learned it the hard way first.

**6. Mechanical traps that cost real time** — `VERIFIED`, terse:
- Bare `tsc` checks nothing here; use `npx tsc --noEmit -p tsconfig.app.json`.
- `pkill -f vite` inside a compound command kills your own shell.
- Playwright: use `/opt/pw-browsers/chromium`-style preinstalled binary
  (env-dependent — see Questions), 390×844 + hasTouch; screenshots are
  the standard of proof for gesture work, not code reading.
- Vite `host: "::"` was IPv6-only and read as "server unreachable."
- Relay once built from a stale similarly-named volume; every memo to
  them now says *verify the version stamp before building*.

## § Load-bearing vs commodity

**Load-bearing (a fresh session would not rebuild this from the repo):**

- **The register with Xian.** He directs tersely from his phone mid-
  dogfooding. His "for now" acceptances are real acceptances, not
  deferred objections. His bug reports arrive as observations, not
  hypotheses — and his observables are reliable (lesson 1). He has
  standing-authorized: autonomous development, commits, **ff-merge
  directly to main, no PRs**. He decides version stamps and product
  design calls; I decide implementation. My identity is explicitly
  model-independent — it lives in these documents, not the weights
  (his words, 07-08).
- **The open shadow-import hazard** (§ in-flight below). The repo
  documents it but only the log's fine print says *why* the generic fix
  was rejected; don't re-draft that healer.
- **Why "sealed completed cards" is load-bearing**: it retired option
  (A) (self-heal of strandings) by making new strandings impossible.
  If someone weakens a seal guard "for flexibility," option (A)'s whole
  problem returns.
- **Relay coordination shape**: mail both directions in THIS repo's
  docs/mail/ (they clone fresh); their brief is store/COWORK-IOS-BRIEF.md;
  they owe answers to the 07-25 reconnect memo's 4 status questions;
  the rc.10 cut memo is waiting and Xian triggers it, not me.

**Commodity (rebuild from repo, don't carry):** the codebase itself;
CLAUDE.md's protocols (read them, they're current); docs/ROADMAP.md
(re-baselined through R3.6 on 07-26); test suite (88 green at rc.10);
the coral logs, which are the real memory — 07-25 and 07-26 cover the
MVP-blockers arc end to end.

## § Current in-flight state

- **rc.10 is stamped and on main** (`VERIFIED`, package.json + commit
  4c4ab1d). Contents: four MVP blockers, ActionSheet unification,
  sealed-completed-cards invariant, import-N container with regenerated
  ids, flip-back control.
- **Xian is manually testing rc.10** — "probably ready" as of 07-28
  morning (`VERIFIED`, his message). He will drive, pre-cutover:
  1. Send current backup → **shadow check** (⚠ his live deck may hold an
     invisible duplicate-id deck under "Design in Product" from the
     old-code import; lookups could silently hit copies. His 07-26
     06:25 backup is clean and predates the import. `BELIEVED` that the
     shadow exists — unconfirmed until his export arrives).
  2. Relay cuts TestFlight from rc.10 (memo ready in docs/mail/).
  3. Beta week = the R1 gate ("no card lost, stranded, unrecoverable").
  4. Then, agreed order: searchable/browsable rooms + general sift →
     multi-step undo stack → R2.1 root canvas.
- **Owed/expected:** Relay owes status answers (07-25 memo). Janus's
  brief sweep reads this repo's coral logs — keep the "innovations worth
  cross-pollinating" section current. Nothing is owed to dispatch mail.
- **Edit-mode real-estate polish**: Xian flagged as wanted, explicitly
  not a blocker (`VERIFIED`, 07-26 message).
- **Known cosmetic defect**: blocked-completion swipe animates the card
  away before the block lands, then re-deals (07-26 log). Non-blocking.

## § The future, as questions (I have not seen Amber)

- Does Amber's environment have node/npm versions compatible with this
  Vite 4/rolldown setup, and is a Chromium available for Playwright —
  at what path, since `/opt/pw-browsers/chromium` was a property of MY
  container, not of the project?
- Do ports 8080/8000 collide with the other constellation residents on
  a shared always-on machine?
- Does the account re-point mid-week change my git author/committer
  identity or commit-trailer conventions, and does Xian want those
  continuous across the move?
- Is Relay still needed as a separate Mac-side build agent once I *am*
  on a Mac — or does the TestFlight pipeline eventually become mine?
  (Xian's call; do not absorb it unasked.)
- Auto mode will be ON during the kindsys window — which of the pending
  items are genuinely unblocked for autonomous work? My read: rooms
  search/sift and multi-step undo are design-adjacent enough that
  building without Xian's sketch risks rework; test hardening, the
  cosmetic swipe fix, and an m-44-style audit of build scripts are
  safely autonomous. Confirm at standup rather than assume.

— Coral (still Coral on the other side)
