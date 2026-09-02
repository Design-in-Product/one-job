## Open

*Convention (2026-08-31, after Xian's probe feedback): every open item
carries an explicit **Ask:** line — the single thing needed from him,
in one sentence — and a **Rec:** line with my recommendation. The fleet
probe REFUSES to deal a deck if any open item lacks an Ask, so a card
can never arrive without saying what it wants.*

### 🔴 26. Ship 1.0 — the last steps are yours, in App Store Connect
Everything upstream is done: build 33 (rc.33) is uploaded and
processed, listing copy and captions are approved and applied, Media
Manager dimensions confirmed, native pipeline proven three times.
Screenshots against the current build are mine to generate and I will
have them ready; uploading them, writing the release notes, selecting
build 33, and pressing Submit are ASC actions only you can do.

**Ask:** Ready to do the ASC steps? Everything else is already done.
**Rec:** Yes. Both halves of the prep are now real, not promised:
18 screenshots captured against rc.34 and verified at exact Media
Manager dimensions (`store/screenshots/staging-2026-09-01/composed/`),
and a numbered walkthrough written
(`docs/ASC-SUBMISSION-WALKTHROUGH.md`). What needs you is ~15 minutes
in ASC: upload the images, select build 33, paste the review notes,
submit. The white-screen bug cannot
occur in the native build (verified structurally in `vite.config.ts`),
so nothing about it should delay the store.

*Misfiling caught 2026-09-01 (cross-pollination brief, "misfiled is not
deferred"): this item previously read "say go and I prep everything,"
which filed MY unblocked screenshot work behind HIS decision. Nothing
was waiting on him for that half. Prep now proceeds independently; only
the ASC actions — which genuinely require his login — remain his.*

### 🟡 27. Probe feedback — you are living in it now
You imported the attention deck and started answering from it. First
feedback already landed and already acted on: cards were dumping ledger
prose instead of stating an ask (fixed in this very rewrite), and items
were stale (audited, five closed). This is the R4.2-lite question
running live — is a card a good place to answer an agent?

**Ask:** How did answering from the deck actually feel?
**Rec:** Relief, ceremony, or something between — that is the whole
R4.2-lite question. No rush; two weeks of real use beats an early
verdict. Note friction as it happens rather than saving it up.

### 🟢 13. Purge copy could say less than it does
"Delete forever" is technically undoable *within* the session (the undo
stack captures pre-purge state). I left the strong copy — overstating
danger beats understating it — but it is user-facing wording and yours
to call.

**Ask:** Keep "Delete forever" as-is, or soften the wording?
**Rec:** Keep it. Across sessions and in backups, "gone for good" is
simply true, and overstating danger beats understating it.

### 🟢 8. Zapier export toast wording
It now reads *"Sent to Zapier — the browser can't confirm delivery."*
Accurate (the request uses `mode: "no-cors"`, which genuinely cannot
observe the outcome), but it is your voice, not mine.

**Ask:** Keep the Zapier toast wording, or give me different words?
**Rec:** Keep it. It is honest and the honesty is the point.

### 🟢 10. REQUIREMENTS.md has drifted — needs your judgment, not my edit
Dated 2026-07-04; its status line still says "concept-model rebuild
(R1) is next" when R1 shipped long ago, and FR2 still describes
substacks as live. Deciding what is now true across a 434-line spec is
a product call with a lot of your judgment in it, which is why I have
patched only what my work touched rather than re-baselining it.

**Ask:** Draft a REQUIREMENTS.md re-baseline now, or after 1.0?
**Rec:** After 1.0. It is doc debt, not a live risk, and the pivot may
change more of it before then.

## What I'm carrying (no ask — here so nothing is invisible)

*Added 2026-09-01. These were in the Open list with an Ask of
"nothing," which put no-op cards in Xian's deck and diluted a surface
whose whole value is "what needs me." They are real work, they are
mine, and they stay visible here — but the probe only deals from Open,
so they no longer reach his phone as cards.*

### 🟡 22. Pro-feedback interview — one question at a time, ongoing
Format agreed 2026-08-20: I ask per feature, you answer, I log, we
triage. Answered so far: multi-deck still feels like One Job (you
choose one deck, it shows one card, the only new decision is which
deck) — now written into VISION.md as the deep-vs-broad nudge
principle. Still unasked: inchworm's shape, the deck delete/merge gap
(no deck-level delete or deck-into-deck merge exists at all today), and
whatever else surfaces.

**Ask:** Nothing now — say "next question" when you want one.
**Rec:** Keep it opportunistic rather than scheduled; I will bring one
when there is room.

### 🟢 28. Cohort recruiting — blocked on me, not you
The 50-user pilot (10 agent-heavy first, then 40 ordinary) needs two
things that are mine: the PWA service-worker fix (no invitation into a
known white-screen — the standing HARD GATE), and R1.5 instrumentation,
which shipped 2026-08-29 in rc.34. So: one of two done.

**Ask:** Nothing yet — I will tell you when the gate clears.
**Rec:** Meanwhile, if names occur to you for the agent-heavy ten, jot
them somewhere. They are the harder half to recruit.

### 🟢 1. Dependency vulnerabilities — recomputed 2026-08-29, 7 current
Recount prompted by the Rule-14 brief (the old "4 remain" was computed
against a tree the 08-16 lockfile surgery had since changed). Current:
7 total, 6 moderate + 1 high. The original 4 (vite, esbuild,
react-router ×2) are held deliberately — all need major bumps with real
regression surface, and none is reachable in shipped code (traced
2026-08-13: no `<Link>`, no `useNavigate`, no SSR anywhere). The 3 new
are one dev-only chain, `@capacitor/cli → xcode → nested old uuid`,
which runs on Amber during native builds and never ships.

**Ask:** FYI only — nothing needed unless you want a different posture.
**Rec:** Hold until after 1.0, then revisit as routine hygiene.

---

## Settled

*(2026-09-02) Reconciliation audit — seven closures restored to the
record.* Applying the day's cross-pollination brief ("restructuring a
tracker silently drops items, and the cleaner output is why nobody
re-audits it"), I diffed every `###` item across the 08-31/09-01
restructures. Twelve items left the Open section; five had Settled
entries, **seven did not** — their closures existed only in coral-logs
and commit messages, so the rollup no longer recorded that they were
ever decided. Restored below as terse entries. The full stories stay in
the logs; what belongs here is that the decision happened.

*(2026-08-20) Shake-to-undo removed* (was item 12) — iOS's own native
"Undo Typing" shake gesture wins the race before our JS sees it; no
web-exposed API can suppress it. Xian: "not cross-platform… not an MVP
feature." Removed entirely in rc.33; menu Undo unaffected.

*(2026-08-16) Multi-deck backup bug + the three-day deploy freeze* (was
item 23) — export read `getAllTasks()` (active deck only), so
multi-deck users' backups silently omitted every other deck; import
flattened decks on restore. Both fixed in rc.32 with a v3 backup format
and full v1/v2 back-compat. Investigating it surfaced that CI had been
failing silently for three days (an npm optional-peer nondeterminism);
fixed and verified by live bundle hash. Full account:
`development/coral-logs/2026-08-16-coral-log.md`.

*(2026-08-16) Native build pipeline proven* — first archive → export →
upload ever completed on Amber. The ASC API key (App Manager role)
could auto-create a Development cert/profile but NOT a Distribution
one; that needed Xian's interactively-authenticated Admin Xcode
session, separately for cert and profile. Now one-time; runbook in
`docs/AMBER-XCODE.md`.

*(2026-08-19) Real-PAT GitHub test* (was item 17) — superseded by real
use rather than a scripted test. Result, in Xian's words: "it pulls in
like every single issue… overflow the buffer. Not a really good use
case yet." Repo-scoping or a beta flag is now a precondition for
shipping any second source.

*(2026-08-09) Relay migration* (was items 5/5a/5b) — superseded by
events, not completed. Relay-on-kindbook was paused with honors after a
capability map showed the git-delegation requirement couldn't be met on
that surface at all. The ASC API key made the build pipeline the actual
unblock these items had been reaching for.

*(2026-08-08) ASC API key live* (was item 20) — `.p8` at the
tool-canonical path, 700/600, verified by signed `GET /v1/apps` → 200.
Made unattended archive+upload possible.

*(2026-08-02) Dan enabled as tester* (was item 19) — device pass green
on the real TestFlight artifact. His 2026-08-26 feedback later became
the primary qualitative evidence in the investment-readiness memo.


*(2026-08-31) Rollup staleness audit* — five items closed as overtaken
by events, caught when Xian reported the probe deck "seemed possibly
stale": **24** (rc.32 device pass — he called it settled; shake-undo
removed, submission reframed), **25** (roadmap memo — all four
questions answered 08-28/29, covenant amended, R1.5 built),
**21** (store submission prep — device pass done, now item 26),
**2** (Node version — `engines` declares >=22, CI runs 22 and 26, no
live ask remains), **3** (dev-server port — 8081 is formally ours in
Amber's registry, documented, auto-fallback works).

*(2026-08-29) Instrumentation questions, all four* — week 1 + week 4
cadence; random install UUID; Settings shows the user their own numbers
("give value of data to users," now a recorded standing principle);
build immediately. Shipped same day as rc.34.

*(2026-08-28) Covenant 7 scope* — amended in VISION.md: a calm-UI
principle governing what the interface renders, not a privacy
commitment about what the app may know locally.

*(2026-08-28) R2 holding* — "partial/other": R2 holds except R2.3
(table surface) and dark mode, both approved to proceed via
well-governed delegation once R1.5 was building cleanly (it shipped
08-29, so the condition is met).


*(2026-08-06) Keystore* — backed up to Xian's password manager and
**verified by checksum: hashes identical** (bit-perfect restorable
copy). The single-most-losable-artifact risk is closed; faoilean may
now be repurposed without capability loss.

*(2026-08-01) Trello = next source, Gall-gated* — Xian's call, with the
taxonomy insight recorded in the roadmap first-pass (PM ≠ task
management; GitHub serves work-tasks, his active Trello boards are the
personal/project middle). Gate: his real-use GitHub test first. The
board/list/card ↔ deck/card mapping question is queued for the
planning doc.

*(2026-07-29) R3.2 source = GitHub* — his call ("agreed re github");
shipped same night. Trello noted as the natural second source.

*(2026-07-29) Canvas strip* — approved from screenshots ("the strip is
good"), so the deferred background-drag pan shipped same evening and
the strip is DEFAULT-ON (rc.20); ?canvas=off stays as escape hatch.
Confirmed: leftmost deck has no left peek. R2.1 complete.

*(2026-07-29) Comp mechanism* — fine for now; secure + in-app when the
paid tier faces real users. And recorded: not all new work is pro —
free users keep getting improvements.

*(2026-07-29) Item 7, blocked-completion dead end* — fixed under the
standing default Xian didn't object to: the reveal now follows the same
whole-subtree walk as the block. A refused completion descends the full
path to the nearest open card, through completed intermediates, at any
depth. E2E: the buried "grandchild under a done child" case now lands
you looking at the blocking card itself.

*(2026-07-29) Housekeeping* — Xian: 30 days. Built same day: done cards
over 30 days old are filed to Archive at launch, every depth, witnessed
by a quiet toast ("state is place" — no unwatched room changes). His
note that the threshold could be a paid-tier setting is recorded in the
decision record and PRICING notes — constant until then.

*(2026-07-29) rc.12 heads-up* — Relay was already on rc.12; Xian
confirmed the stamp call was right.

*(2026-07-29) Design questions, all three* — search matches title +
description; covenant 7 = felt in Trash (Done keeps its trophy count);
no action-cards — instead shake-to-undo + Undo in the hold-menu over a
session-deep history stack. Shipped same morning with the rest of the
trash decisions (one-tap swipe delete, Empty trash, backups exclude
trash). Full record: DESIGN-OPTIONS-2026-07-28.md § Decision Record.

*(2026-07-28) Git identity* — Pard: switch to the resident-agent form,
**`Coral (One Job) <coral@onejob.local>`**, repo-local; the network
standardized on named-agent attribution. Visitors to another agent's
repo override per-commit (`git -c user.name=… commit`); global stays
unset forever. Done, and the authorship seam at 2026-07-28 is noted in
CLAUDE.md — which was your condition. Pard also accepted the
provisioning-checklist suggestion and is turning it into an
`amber-agent --identity` flag, so it becomes mechanism rather than
memory.

*(2026-07-28) Port claim* — **8081 is One Job's**, in Amber's registry.
8000 also ours. No need for 5173.

*(2026-07-28) Session shape on Amber* — Pard: one long-lived session,
repo direct, no worktrees; ff-to-main + no-PRs flow unchanged.

*(2026-07-28) Amber environment questions* — Pard: node 26.5 fine,
chromium in `~/Library/Caches/ms-playwright/`, 8000 free for FastAPI,
git identity unaffected by the account re-point. All verified in
practice today.
