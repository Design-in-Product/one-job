## Open

### 🟡 22. Pro-feedback session — conversational, screen by screen, when you're ready
Xian (2026-09-10): wants this LIVE and conversational — "if we go
screen by screen, flow by flow, I will remember and be able to narrate
the key things easily." He also has screenshots of minor usability
issues to bring. Coral will have a full flow-inventory walk order
prepared so the session is pure narration.
**Since:** 2026-08-13
**Ask:** Name a time for the screen-by-screen pro-feedback session (bring your usability screenshots).
**Rec:** Do it before the roadmap/next-steps conversation — your
narration is evidence that discussion should consume, not follow.


### 🟡 28. Cohort — re-sequenced: waiting on recruits, not your ASC minutes; partial start works
Janus relayed (09-12): you have a short list, not ten, and want a
planning pass with Themis + me before ASC. Good news the spec already
contains: **rolling starts mean a partial cohort is fine** — the Pilot
link (cap 10) admits whoever has it whenever; three people can start
this week while seven are found. Nothing expires by starting small.
**Since:** 2026-09-10
**Ask:** Schedule the cohort planning pass (you + Themis + me), or just send your short list the link after the ASC steps — either unblocks it.
**Rec:** Do the ASC steps in an idle ten minutes anyway (they're
recruit-independent); then the planning pass decides who gets the link
and when.


### 🟡 27. Probe feedback — you are living in it now
You imported the attention deck and started answering from it. First
feedback already landed and already acted on: cards were dumping ledger
prose instead of stating an ask (fixed in this very rewrite), and items
were stale (audited, five closed). This is the R4.2-lite question
running live — is a card a good place to answer an agent?

**Since:** 2026-08-31
**Ask:** How did answering from the deck actually feel?
**Rec:** Relief, ceremony, or something between — that is the whole
R4.2-lite question. No rush; two weeks of real use beats an early
verdict. Note friction as it happens rather than saving it up.

### 🟢 10. REQUIREMENTS.md has drifted — needs your judgment, not my edit
Dated 2026-07-04; its status line still says "concept-model rebuild
(R1) is next" when R1 shipped long ago, and FR2 still describes
substacks as live. Deciding what is now true across a 434-line spec is
a product call with a lot of your judgment in it, which is why I have
patched only what my work touched rather than re-baselining it.

**Since:** 2026-07-28
**Ask:** Draft a REQUIREMENTS.md re-baseline now, or after 1.0?
**Rec:** After 1.0. It is doc debt, not a live risk, and the pivot may
change more of it before then.

## What I'm carrying (no ask — here so nothing is invisible)

### Settled by ruling (2026-09-12): developer name stays personal — sole proprietor for now
Xian ruled sole-proprietor-for-now, so the DUNS/entity question
resolves to "no change until an S-corp decision later." Historical
detail below kept for when that day comes.

### (was) Parked: App Store developer name → "Design in Product"
Listing shows "Christian Crumlish" (individual enrollment). Converting
to an org account needs a D-U-N-S for the enrolling entity. Xian's EU
trader (DSA) signup appears to have generated a DUNS — 2026-09-09:
DUNS numbers are entity-scoped, not purpose-scoped, so it's reusable
ONLY for the same entity/address it was registered to; a future S corp
would get its own. Deliberately sequenced BEHIND the S corp decision
(Xian, 2026-09-09) so the right entity enrolls once. Check what the
existing number is attached to via dnb.com or
developer.apple.com/enroll/duns-lookup when the time comes.




### 🟢 1. Dependency vulnerabilities — recomputed 2026-08-29, 7 current
Recount prompted by the Rule-14 brief (the old "4 remain" was computed
against a tree the 08-16 lockfile surgery had since changed). Current:
7 total, 6 moderate + 1 high. The original 4 (vite, esbuild,
react-router ×2) are held deliberately — all need major bumps with real
regression surface, and none is reachable in shipped code (traced
2026-08-13: no `<Link>`, no `useNavigate`, no SSR anywhere). The 3 new
are one dev-only chain, `@capacitor/cli → xcode → nested old uuid`,
which runs on Amber during native builds and never ships.

No ask — held posture: revisit as routine hygiene now that 1.0 has
shipped; becomes an Open item only if the posture should change.
(Its old line read "**Ask:** FYI only — nothing needed," which is an
ask-shaped absence of one; the fourth guard caught it, correctly.)

---

## Settled

### ✅ Briefing answers 2026-09-10 (memo questions from the artifact)
1. **R2 hold**: partial — "OK but wants the nuanced timing discussion."
   His note: walk-and-chew-gum via well-governed subagent delegation is
   allowed, but ONLY when demonstrably not diverting priority/resources
   from primary goals. Feeds the next-steps conversation.
2. All set. 3. **Probe scope: everything** — all three open colors deal
   as cards (current behavior, now ratified; carrying-section items stay
   un-dealt because a card without an Ask is the failure the format
   exists to prevent). 4. **Covenant 7 amended** in VISION.md: spirit
   kept, ethos articulated — "measure the shape of use, never the
   content; we would not parse people's content even where we had
   access."
Also confirmed: device-pass checklist all green (that checklist was the
pre-submission soak card from the roadmap's P0 era — moot since 1.0
shipped, pleasant to have its confirmation on record).


### ✅ 30. 1.0 RELEASED — live on the App Store 2026-09-09
Xian pressed Release ~15:30; the listing went live ~18:30 (direct link;
search indexing lags 24-48h and needs nothing from us). onejob.co front
door deployed and verified: App Store primary CTA, web app as on-ramp,
Android teaser dropped. Watchdog (rc.39) verified serving. Announcement
cleared to post — draft with Themis's review applied is in
docs/RELEASE-NOTE-1.0-draft.md.


### ✅ 26. Ship 1.0 — SUBMITTED TO APP REVIEW 2026-09-05
Xian completed every ASC step the same day: screenshots (composed set,
all three profiles), full listing copy (his wording recorded in
store/LISTING.md), build 37 selected, content rights + age rating +
category, manual release, submitted. 🍾 Five days in Open, closed in
one sitting. What remains — watching the review outcome — is my watch,
not his ask; it lives in "What I'm carrying."


### ✅ 29. Ted Nadeau TestFlight invite — SENT 2026-09-05
Xian sent it during the submission session, and also added **Austin
Wood** (developer, ex-OptiListen team) to the test group as a geeky
hello. Two native-build testers now exist where there were zero — and
Ted is the iPad user, the surface verified least. Watch for first
native-build feedback; both are recorded in docs/USER-FEEDBACK.md.


*(2026-09-04) Purge copy — keep it.* Xian's call: "Delete forever"
stays as written. Across sessions and in backups it is simply true, and
overstating danger beats understating it.

*(2026-09-04) Zapier export — removed, not reworded.* The open item
asked whether to change the toast's wording. Xian asked what Zapier
even was, which surfaced the real defect: the button said "Export
Tasks", the toast said "Sent to Zapier", and the payload carried no
task data. The July fix had made the message honest about transmission
while the feature underneath still misrepresented itself. Removed in
rc.36 along with the Asana and Todoist stubs (both collected real API
tokens with no handler at all). Roadmap already listed push-export as
Explicitly Retired; Todoist returns as a real 1.1 feature.

*(2026-09-04) Pilot framing — the roadmap is authoritative.* Themis
flagged two numbers circulating: "a pilot of 50 people who'd pay" (as
Xian described it to Ted) vs. the ratified **10 agent-heavy users
first, then 40 ordinary**. Xian: *"the roadmap is accurate… my
paraphrase was sloppy."* No change to the plan; the sequencing stands,
and the two-audience design is the point — the ten test whether the
agentic thesis holds, the forty test whether ordinary people retain.

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
