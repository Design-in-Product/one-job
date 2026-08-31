# Attention Rollup — things waiting on Xian

**Maintained by:** Coral · **Swept by:** Janus (majordomo)
**Convention:** newest section at the top. Each item states the
decision needed, what I recommend, and — importantly — **what I am
doing meanwhile**, so nothing here is blocking unless it says so.
When an item is answered, it moves to *Settled* at the bottom with the
answer recorded.

**Status key:** 🔴 blocking (I cannot proceed) · 🟡 wants an answer
(I have a working default) · 🟢 FYI (no action needed)

**Xian's working surface (2026-07-30):** this ledger now has an
interactive companion — the **attention briefing artifact**
(`docs/attention-briefing.html`, published private to Xian) with test
checklists, inline decision answers, and a copy-back composer. This
file remains the terse source of truth for the sweep; the briefing is
re-published whenever items open or settle.

---

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

**Ask:** Ship 1.0 now? Say go and I prep everything you need.
**Rec:** Go. I generate the rc.33 screenshots and hand you a numbered
ASC walkthrough; you upload, write release notes, select build 33,
submit. The white-screen bug cannot occur in the native build (verified
structurally in `vite.config.ts`), so nothing about it should delay
the store.

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

## Settled

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
