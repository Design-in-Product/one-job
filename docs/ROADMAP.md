# One Job — Roadmap

**Author**: Coral · 2026-07-03 · **REORDERED 2026-08-28** (investment-
readiness review + Xian's answers; see "The pivot" below) · original
baseline converged with Xian 2026-07-04. Supersedes the tier sketch in
BIG-PICTURE-2026-07-03.md. Companion docs: VISION.md (the distillation,
covenant 7 amended 2026-08-28), DOMAIN-MODEL.md, DEPENDENCIES.md,
`docs/mail/memo-xian-to-coral-2026-08-26-roadmap-reordering-after-investment-review.md`
(the reordering's full argument), `docs/plans/2026-08-28-instrumentation-plan.md`
(P1's full design).

---

## The pivot (2026-08-28) — evidence before beauty

An investment-readiness review (2026-08-26) scored traction 1.0/5 and
distribution 1.5/5 — and its advice was: don't polish the pitch,
produce evidence. Xian ratified a reordering (with one hedge, recorded
below): **R2, the spatial layer, holds** — except R2.3 (table surface)
and dark-mode, both cheap store-listing-quality work — in favor of
work that generates evidence. The venture-scale part of the vision is
R4 (agents dealing cards), and MCP shipped Tasks as an official
extension 2026-07-28 with no client yet implementing it.

**The priority sequence now:**

| P | What | State |
|---|---|---|
| P0 | **Submit 1.0 to the App Store from the native build** (build 32+, white-screen bug structurally impossible there — verified). The PWA service-worker fix gates the *cohort*, not the store | Ready when Xian's device-pass soak feels settled; shake-to-undo removal (rc.33) not yet in a native build — cut build 33 at submission |
| P1 | **R1.5 Local instrumentation** (new) — opt-in, on-device, pre-registered metrics; instrument BEFORE anyone is invited. Full design: `docs/plans/2026-08-28-instrumentation-plan.md` (plan approved by Xian 2026-08-29, "looks good") | Designed; 4 open questions pending his answers, then build |
| P2 | **R4.2-lite fleet probe** (new) — the crudest thing that works: this repo's own ATTENTION-ROLLUP items land as cards in a One Job deck; Xian answers from the deck for two weeks. NO MCP, no protocol, no adapter seam — if it grows an architecture it has failed. Scope: EVERYTHING on the rollup (his call, 2026-08-28). Likely zero new app code (script emits backup-import-shaped JSON) | Not started |
| P3 | **Todoist integration — now a 1.1 RELEASE FEATURE** (Xian, 2026-09-04: "prioritize the todoist integration asap as a 1.1 release feature"). One designated list, read-only first, earning write-back after a proven week. Rides the R3.1 seam the GitHub import already proves. **Precondition: fix or flag-hide the GitHub import** (pulls every assigned issue across every repo — "a thousand cards… overflow the buffer"); shipping a second source while the first embarrasses is how integrations get a reputation | **NEXT UP** — P1/P2 both shipped |
| P4 | **The 50-user cohort** — ~10 agent-heavy users recruited FIRST, then ~40 ordinary. Gated on P1 (instrument before inviting) and the PWA white-screen fix (no invitation into a known white-screen — the standing HARD GATE discipline, same reason) | Blocked on P1 + SW fix |
| P5 | **Economic-buyer conversations** — ask the ten agent-heavy users what a reliable human-review queue is worth; a week of calendar, not a quarter of engineering | After P4 recruiting starts |

**Xian's hedge on R2 holding (2026-08-28, recorded verbatim in the
rollup):** "we can probably walk and chew gum at the same time by
developing solid plans and delegating them to well governed subagents,
but this should be done only when we are sure we are not diverting
priority or resources from meeting our primary goals." Working
reading: R2.3 + dark-mode are the bounded, low-review-cost candidates
that fit this; the rest of R2 waits for evidence.

**What the pivot does NOT change:** the HARD GATE (below), the R3
read-only-before-write gate, covenant discipline, and the release
rhythm (steady drumbeat once there are active users).

**Ordering principle** (Xian): Gall's law, Cunningham-style — a complex
system that works evolves from a simple system that works; do the
easiest thing that could possibly work first. Applied here: every release
must leave the app *more* trustworthy for daily use than the last, and
no stage builds on an unproven stage.

**Release gate discipline** (unchanged from the big-picture review):
1.0 is declared when **Xian trusts it with a real week** — and each
later stage has an equivalent felt-trust gate, not a feature count.

**HARD GATE (added 2026-07-05 after the first real data loss):** no
public invitation, store listing activation, or landing-page CTA while
the backup story is unproven on a real device. A backup path counts as
proven only when its success signal reports an OBSERVED outcome (share
sheet resolved, clipboard write resolved, download event seen) and the
restore half has been exercised on-device. Losing a user's deck once is
a bug; inviting users before the backup story is trustworthy would be a
choice.

---

## R0 — Trust for daily use (finish 1.0) — ✅ ESSENTIALLY COMPLETE (rc series through rc.33)

*Status annotation 2026-08-29: R0.0–R0.4 shipped across the rc series
(undo went beyond the toast — session-deep menu undo + redo; backup
proven on-device including the multi-deck fix, rc.32). R0.5: build 32
on TestFlight, store submission is P0 above.*

The app is Xian's daily driver as of 07-03; these are the holes real use
has already found. All are small, none touch the concept model, all pay
off immediately.

| # | Item | Source |
|---|---|---|
| R0.0 | **Data durability** — ✅ safety net (snapshots/quarantine/restore, 07-04); ✅ backup-age nudge (07-04); ✅ honest export: share-sheet + clipboard copy/paste paths, outcome-verified toasts (07-05, after real data loss); remaining: on-device proof of the share-sheet path (Xian), export-location hint | Item 13 🔴 |
| R0.1 | **Undo toast** after complete/defer (5s window, one tap) | audit gap 1 |
| R0.2 | **Deck-depth signal** — CALLED 2026-07-08: *suggestion, never a number*. A deck that visibly thickens/bulges as it grows and asymptotes at "wow, that's a big deck" — no count anywhere on the deck (covenant 7; badge stays 1-or-none). Design the thickening scale together with **card aging** (Item 22) as ONE material language — time and volume made tactile and gentle | audit gap 4 |
| R0.3 | **Portal crispness pass** — kill the "swimming in an ill-fitting frame" feel (background/theme-color/overscroll/dvh suspects listed in Vision Item 9) | Item 9a |
| R0.4 | Xian's odd-behavior reports as they land | testing |
| R0.5 | iOS TestFlight + Android internal track (in motion, human-gated: Cowork Phase 4, keystore) | store track |

*Deliberately absent*: delete-task UI and un-complete. In the old plan
these were R0 patches; the domain model makes them fall out of the
lifecycle chain (R1.2) as *one* coherent feature instead of two bolted
switches. Undo (R0.1) covers the accident-recovery need meanwhile —
that's the easiest thing that could possibly work.

## R1 — The concept model lands (1.x series) — ✅ SHIPPED

*Status annotation 2026-08-29: R1.1–R1.4 all live (recursive cards,
lifecycle chain with rooms at every depth, schema — now v3 with root
decks — and card-face ergonomics). The R1 gate ("a week of real use
where no card is lost, stranded, or unrecoverable") has been met by
weeks of Xian's daily driving. New sub-item from the pivot:*

| # | Item | What changes |
|---|---|---|
| **R1.5** | **Local instrumentation** (NEW, 2026-08-28 — P1 above) — opt-in, on-device metrics with pre-registered definitions; full design in `docs/plans/2026-08-28-instrumentation-plan.md` | roadmap memo |

Original R1 sequence, for the record:

| # | Item | What changes |
|---|---|---|
| R1.1 | **Recursive cards** — card interior = canvas with a deck; subtasks are cards; migrate `Substack` data (each old substack's tasks become interior cards; names preserved in migration notes) | Items 1, 8, 10 |
| R1.2 | **Lifecycle chain** — Done/Archive/Trash as system decks with advance/regress gestures; provenance (home-deck memory); un-complete and delete arrive here for free. *Amended 2026-07-07 (Xian-approved, shipped in rc.7): rooms gather cards from EVERY depth with a parent breadcrumb — completed interior work was invisible everywhere, the "nothing shows up in Done anymore" trust bug* | Items 2, 10 |
| R1.3 | **Store schema v2** — versioned envelope, substacks become named interior decks holding full recursive cards, migration from v1 (fixture-corpus tests first — RED ZONE; deck-membership-as-state deferred to the R1.2 chain) | domain §7, Item 17 |
| R1.4 | **Card-face ergonomics** — details open read-first like a baseball card, second tap edits (create still opens in edit); line breaks render in descriptions | Items 18, 20 |

Gate: the chain feels *safe* — a week of real use where no card is ever
lost, stranded, or unrecoverable.

## R2 — The spatial layer (the app becomes the vision) — ⏸ HOLDS (2026-08-28), two exceptions

*Status annotation 2026-08-29: R2.1 (root canvas strip, rc.16–20) and
R2.7 (inchworm, rc.22) already SHIPPED before the pivot. The rest
holds per the pivot — except **R2.3 (table surface)** and **dark-mode**
(fun shelf), both store-listing-quality and cheap, proposed to proceed
via well-governed delegation per Xian's hedge; awaiting his
confirmation.*

| # | Item | What changes |
|---|---|---|
| R2.1 | **Root canvas** — multiple top-level decks side by side; system decks have a place; pan between decks | Item 3 |
| R2.2 | **Zoom continuum** — canvas ⇄ deck ⇄ card-fills-the-phone; pinch navigation; deck-is-the-UI mode | Item 6 |
| R2.3 | **The table surface** — design the dead space (empty/black/white/reflection/abstract); same material as the canvas | Item 9b |
| R2.4 | **Discoverability dissolve** — arc menu items find homes on the canvas (Settings/Integrations); menu may remain as shortcut | audit gap 6 |
| R2.5 | **Details-as-expansion** — the founding spec's "tap face-up → full-viewport expansion" replaces the modal once the zoom continuum exists; breadcrumbs/place-trail and the search-vs-philosophy question are design inputs here | archaeology |
| R2.6 | **Per-deck afterlife** — each interior deck keeps its own visible Done pile inside the deck (Xian agreed 2026-07-07; complements the flattened rooms, doesn't replace them). Design with the zoom grammar | option 2 of the Done-room fix |
| R2.7 | **"Inchworm" mode** — view toggle that flattens the whole tree into one walkable stack, unflattenable at any time; `flattenWithParent` is the ready seam | Item 27 |
| R2.8 | **The kinetic conversation** — one design pass over riffle-to-jump (cut the deck vs. pull to top), exploded-view reorder, and the vertical gesture grammar (Xian's confirmed intent: vertical = chain-level movement, rhyming with zoom). Gated on his play with rc.8's sifting; do NOT build further vertical semantics before that | Items 26, 28, 29 |

Gate: navigation needs no menu for daily flow; a new user finds
Completed by *looking around*, not by long-pressing.

## R3 — 2.0: the experience layer (federation) — partially shipped; next move is P3

*Status annotation 2026-08-29: R3.1 (SourceAdapter seam) and R3.2
(first import = GitHub, read-only, rc.21) SHIPPED — but the GitHub
import needs repo-scoping or a beta flag before any second source
ships (P3's precondition). Todoist is the chosen second source
(personal-shaped, unified API, official MCP server — doubles as R4
groundwork): one designated list, read-only for a proven week, then
completion write-back only (R3.4, scoped to that single list).*

Import first, then sync — in that order, per Item 11. Each source lands
read-only before any source earns write access.

| # | Item | What changes |
|---|---|---|
| R3.1 | **Source adapter seam** — formalize `SourceAdapter` on top of the TaskStore seam; provenance carries `{service, externalId, mapping}` | Item 11 |
| R3.2 | **First import (one service, read-only)** — pick the one Xian actually uses; imported cards land in a source deck on the canvas | Item 11.1 |
| R3.3 | **Mapping store** — bidirectional id/field mapping as a first-class, inspectable artifact | Item 11.3 |
| R3.4 | **Two-way sync (one service)** — complete-in-One-Job closes the source task; the One Job overlay (deck order, interior structure, history, lifecycle placement) never flattens into the source | Item 11.2 |
| R3.5 | **Multi-source federation** — Asana + Trello + Todoist side by side, normalized into the one paradigm | Item 11.4 |
| R3.6 | **Import as merge, with conflict resolution** — the OS file-move model: on import, detect cards already present (by id/provenance) and ask per-conflict *keep both / replace / skip*, instead of always landing a fresh copy. Supersedes the rc-era "import-N container" once we have real identity/provenance to compare on (Xian, 2026-07-26) | testing |

Gate: Xian (or his employer's tool) runs a real project where One Job is
the *only* surface he touches daily, and nothing in the source system is
ever corrupted or surprised.

## R4 — The agentic layer — now the strategic center; probe first

*Status annotation 2026-08-29: the pivot names this stage as where the
venture-scale case lives (MCP Tasks shipped as an official extension
2026-07-28, durable `input_required` state, no client implements it
yet). The path in is NOT R4.1 — it's **R4.2-lite** (P2 above): the
deliberately-crude fleet probe, this repo's own attention items as
cards, two weeks of Xian answering from the deck. What it measures is
*feel* — if it's a relief, R4.1 becomes urgent; if it's ceremony,
One Job is a lifestyle app and that's a legitimate answer. The probe
must not grow an adapter seam.*

**The category framing (Ted Nadeau via Themis, 2026-09-02) — recorded,
not yet ratified as positioning.** Ted's criticism of classical task
tooling: *"task-based management things like Jira, they have no
structure for responsibility… make sure the work area is clean, make
sure this rule is checked, make sure this stays this way — all of those
responsibility notations are never in task management software."*
Xian's gloss from the same call: a task is workload; **responsibility
is the lens, the portfolio, the thing you're in charge of.**

Why this matters here rather than as trivia: **agents do not primarily
hold tasks — they hold standing responsibilities, and tasks are what
those responsibilities emit.** That is the gap which makes pointing One
Job at agent oversight coherent rather than opportunistic, and it
explains why generic task managers feel wrong for the job even when
they technically work.

Themis's observation, which I think is correct and was unplanned: the
fleet probe's `Ask:`/`Rec:` convention is already a **responsibility-
surface** convention rather than a task convention. An attention card
does not say *here is a unit of work to complete*; it says *here is the
judgment my standing responsibility requires from you*. The R4.2-lite
probe is therefore testing something narrower and more interesting than
"can agents deal cards" — it is testing whether a card is a good
surface for **an emission from a responsibility**.

*Candidate positioning language, Xian's call, not adopted:* the
category is less "task manager for agents" than "the surface where
standing responsibilities produce the few decisions only the human can
make."

| # | Item | What changes |
|---|---|---|
| R4.1 | **MCP inbox** — agents deal cards into a per-user inbox; the phone pulls; status events flow back (MCP-DESIGN.md's model, its 4 open questions answered by then-real R3 infrastructure — an agent is just another source) | MCP memo |
| R4.2 | **Piper Morgan as first agent client** — deals cards into Xian's deck; the family dogfoods the protocol | Item 12 |
| R4.3 | **Dispatch: deal a card to an agent** — assign from the card ("Pard could do this"); the card lands on the agent's deck, stays visible on yours with its fate in their hands; completion flows back. The outbound twin of R4.1 | Item 14 |
| R4.4 | **Text-entry relief** — capture via share-sheet/voice/agent so typing on cards stops being the bottleneck | Item 4 |

Gate: an agent-dealt card is indistinguishable in feel from a
hand-written one, and no agent can ever reorder your deck.

## The fun shelf (no stage, pull when joy demands)

- Custom card backs: upload-your-own (discreet watermark) + playing-card
  generator (Item 7)
- Flip-preset settings, deck themes, haptic tuning
- Localization files (i18n plumbing already done)
- Flip-back gesture (Item 19 — timer is acceptable meanwhile; design
  with the zoom grammar)
- Toast quiet mode (Item 16 — needs an undo surface decision first)
- **Card aging** (Item 22 — cards yellow/craze at the edges when
  untended; gentle whimsy, never a deadline-nag. One material language
  with the deck-thickness depth-signal, R0.2 — time and volume made
  tactile; design the two together, R2-era)
- **Recovered from the Nov-2025 stratum** (archaeology, 2026-07-06):
  sparkle empty state · skeleton shimmer loader · designed error state ·
  M-for-menu keyboard shortcut · swipe tint overlays (A/B vs. pills) ·
  pulsing dot on live-source badges (R3-era)
- **Dark mode — dark background by default** (existed Nov 2025, lost in
  the rebuild — also a store expectation). Xian endorsed dark-by-default
  on 2026-07-07: first pull from this shelf when fit-and-finish work
  resumes after the TestFlight cut. Explicitly does NOT block letting
  testers in.

## The premium shelf (post-launch, candidates)

- Multiple named sub-decks per card (Item 17 — model supports it today)
- Bold/italic and image attachments in descriptions (Item 20 upper tier)
- Advanced card metadata riding the federation mapping — due dates,
  assignees, labels arriving WITH connected sources (Item 21, R3-era)
- **Actionable cards** (Xian↔Ted Nadeau call, 2026-08-19) — a card
  isn't just "swipe when done"; it can carry a tappable action (a link
  to the Slack thread it's about, a way to start the task from the
  card itself). Named as the natural precursor to R4's agentic layer,
  not a replacement for it.
- **"Trump card"** (his term, from the Zelazny Amber novels; same call)
  — a card that opens a connection to a specific *person* rather than
  a deck, the way the books' trump cards open a portal to whoever's
  pictured on them. Ted's live extension: the card could place an
  actual call ("if the card says 'make a date with Ted,' click Ted, it
  calls Ted").
- **"Magic cards"** (same call) — one card existing in more than one
  deck simultaneously (a task lives in both a "Today" deck and its real
  project deck at once). Named by Xian as the harder, less skeuomorphic
  idea explicitly ("as soon as it's nested you're getting a little bit
  into... unpure") — flag as an architecture question, not just a UI one,
  before scoping.
- **Shared deck between two named people** (same call, prompted by
  Ted's "does it have a viral coefficient?") — both people contribute
  to and act on shared tasks. Framed by Xian as "the righteous form" of
  virality — useful first, not a "my friend tagged me" growth hack — and
  became a formal action item on his own notes: "Design a shared One
  Job deck concept with Ted." Distinct from R3's federation (which
  connects to external services, not to other people) and from R4's
  agent-dealt cards (a person, not an agent, on the other end).
- **Seeded starter stacks** (Ted 2026-09-04 + Dan 2026-08-26, the
  strongest independent convergence in `docs/USER-FEEDBACK.md`) — offer
  a sample deck at first run so the activation moment (*"I just
  populated it right away and I really liked that experience"*) is
  reachable without typing eight cards first. Ted's own suggestions:
  plan a party · buy a car · become a ballet dancer · build an app · be
  a Product Manager · transform your house · shop for groceries ·
  spring cleaning. **The mechanism already exists** (DemoService seeds
  decks) — what is missing is the placement. Cheap, and it is the same
  work as measuring activation. **Not premium — this is onboarding**,
  and belongs near 1.1 rather than on this shelf.
- **`defer [why]`** (Ted 2026-09-04) — capture the *reason* a card was
  deferred. Would turn R1.5's deferral-depth metric from descriptive
  into diagnostic. **Held: Xian's "cool but rather friction-y"
  (2026-09-04) is the right objection** — deferring is meant to cost
  nothing; any version must be optional and silent by default or it
  turns the kindest gesture into an interrogation.
- **The 2-card A/B format** (Ted 2026-09-04) — "pick one, gives an A/B
  option." **Meaning unresolved**: Coral read it as pick-one-of-two
  (a choice rather than a sort — the only proposed prioritization
  mechanic that does not violate the anti-grooming ethos); Xian read it
  differently and has asked Ted. Both branches kept deliberately, his
  call — a productive misreading is still a design idea.
- **`card-types: task, rule`** (Ted 2026-09-04, arrived at
  independently twice — see the R4 category-framing note) — a "rule"
  card is a standing responsibility; a task card is an emission from
  one. Architecture question before UI question.
- **AI-constructed deck from unstructured sources** (same call) — an
  alternative to a classic PM/to-do backend: an AI layer builds someone's
  deck FOR them from "handwritten note pages... a complex Google doc...
  other sources," without One Job ever becoming a classic project-
  management tool. Named as a pro/enterprise angle for once there's a
  real backend story (post-R3).

## Parallel track (human-gated, any time)

- iOS TestFlight → App Store (Cowork Phase 4 under co.onejob.deck)
- Android keystore → internal testing → Play listing
- Landing page CTA flip / public invitation — *after* the R1 gate, when
  strangers can trust it too

## Explicitly retired

- Push-export "integrations" framing (Zapier-outward) — reversed by the
  experience-layer thesis; the Integrations view becomes the door to
  R3 sources.
- Backend-required deployment path as a mainline concern (Render
  stands by for R3/R4 server needs; nothing before that needs a server).

---

## The build sequence — 2026-07-04's ten moves: ✅ ALL COMPLETE

The original converged sequence (data safety net → undo → backup nudge
→ crispness → depth signal → domain extraction → schema migration →
recursive cards → lifecycle chain → R1 gate week) shipped in full
across the rc series, several of them exceeded (undo became
session-deep + redo; schema went to v3).

## 1.1 — the first post-launch release (scoped 2026-09-04)

**Todoist, done properly**, is the headline. Context that makes it
urgent rather than merely next: cutting the scaffold-era stubs today
(Asana, Todoist, Zapier — see below) means One Job currently ships
*one* real source, GitHub, and that one overflows. 1.1's job is to make
the integration story true.

Scope, deliberately narrow:
1. **GitHub repo-scoping or beta-hide** — the precondition. A source
   that dumps a thousand cards is the counter-advertisement for the
   whole lens thesis.
2. **Todoist read-only, one designated list** — the R3.2 pattern the
   GitHub adapter already established, pointed at a personal task
   manager (the right shape for a personal overlay; Doist ships an
   official MCP server, so it doubles as R4 groundwork).
3. **A proven week of read-only** before completion write-back (R3.4).
   The R3 gate is Xian's own and predates any pressure to demo the
   lens.

*Stub removal, 2026-09-04:* Asana and Todoist sat in the Integrations
picker collecting real API tokens with **no handler at all** — a fake
spinner, then silence. Zapier POSTed a payload containing no tasks
while its button read "Export Tasks." All three removed before 1.0
ships (rc.36). Todoist returns in 1.1 as a real integration; Asana
stays retired (a team database, wrong shape for a personal overlay —
the 2026-08-02 source-dimension survey's finding).

## The build sequence NOW (from the pivot, 2026-08-28)

1. **Cut native build 33** (rc.33 — shake removal isn't in build 32)
   and **submit 1.0** when Xian's soak feels settled (P0).
2. **Answer the instrumentation plan's 4 open questions** → build
   R1.5 (P1): metricsStore + store seam + Settings surface + collate
   script. Instrument before anyone is invited.
3. **Fleet probe** (P2): rollup→cards script, two-week trial.
4. **PWA service-worker fix** (version-mismatch detector,
   force-unregister) — gates the cohort, runs parallel to 2–3.
5. **GitHub import repo-scoping or beta-flag hide**, then **Todoist
   read-only** (P3).
6. **Recruit the ten**, then the forty (P4); economic-buyer
   conversations ride along (P5).
7. R2.3 + dark-mode via delegation, if/when Xian confirms the
   walk-and-chew-gum path.

*REQUIREMENTS.md re-baselined against this document 2026-07-04; a
fresh re-baseline is queued post-pivot (rollup item 10).*
