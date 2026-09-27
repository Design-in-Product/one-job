# Handoff — Coral (One Job) — 2026-09-27

**For:** the Coral session restarting onto claude-opus-5-5, authorized
by xian, coordinated by Pard. Not a recovery from a problem — a
scheduled model change. Xian starts new sessions WITHOUT prior
context — this file and the repo are all you get. Read CLAUDE.md
first (the operating manual); this file carries only what the repo
does not, and per xian's 09-20 ruling, a handoff over 48h old counts
as base-layer-plus-logs rather than current state — so this is written
fresh, not as a diff against `docs/handoff-coral-2026-09-18.md`.

## Where the product actually is

- **1.0 and 1.1 shipped** (App Store, live). **Build 40 is still
  DELIBERATELY held**, now 10 days (merged 2026-09-17, `f733378`): the
  sentence-case intent fix compiles clean, isn't behind any flag (the
  only flag mechanism in this codebase is pro/free entitlement gating,
  not pending-decision holds) — it's just excluded from the next build
  cut, waiting on two external inputs nobody controls: Xian's two Siri
  samples, and Pilot tester A's onboarding on 39 settling.
- **The cohort machinery is built but not activated.** Pilot (cap 10)
  and Cohort (cap 40) TestFlight links exist; Pilot tester A joined Pilot
  09-16. But **the weekly check-in has never actually fired** — the
  roster's Day-0 column is empty for every single person on it, which
  means the week-1 disambiguator question has never been sent to
  anyone. This was independently discovered twice in the last week (by
  me on 09-23/24, and separately by Themis in her own evidence read)
  before either of us checked and caught it — see "traps" below.
- **CI green** as of this writing (deploy run success, 2026-09-27
  14:47 UTC).
- **The user-testing plan was restructured** this window into two
  independent tracks with separate dependency chains rather than one
  sequential list — `docs/USER-TESTING-PLAN-2026-09.md`. Track A
  (agentic/Pilot) is blocked on the card-exchange prototype maturing;
  Track B (regular/Cohort-40) is blocked on a recruiting plan that
  simply doesn't exist yet. Neither is downstream of the other. This
  plan is very likely what Janus means by "the test-plan approval" in
  the ask below — not yet confirmed.

## Who owes what, both directions

| Counterparty | They owe | We owe |
|---|---|---|
| **Xian** | Two Siri samples (build 40's verification); the 8/29 LinkedIn hand-raiser's name (item 32, thirty seconds for him, impossible for us); a kill-or-rebaseline ruling on REQUIREMENTS.md (item 10 — Themis explicitly named killing it as a live option); the pro-feedback session (item 22); approval of the restructured test plan; a read of Themis's Pimento give-back | **A three-line reply to Janus, unsent as of this handoff** (see below — this is the single most immediate concrete action) |
| **Janus** | Is queuing One Job's turn behind Janus/Themis/Pard/Exec's own needs on xian's attention and will name the day rather than let us infer it | **Adopted, not yet exercised**: a relay contract — push Janus a line (mail to `designinproduct/docs/mail/`, or a "what changed" note at the rollup's head) whenever the set of things waiting on Xian changes, same day, so it reaches his page promptly |
| **Themis** | Nothing pending — both Pimento outputs delivered, slogan counsel closed the loop | Deciding whether/how to implement her two-column "open since / what would close it" list proposal (she was explicit: NOT a backlog, NOT more process — one list, downstream of decisions, not upstream) |
| **Pilot tester A** (Pilot) | Nothing new; still on build 39 | Telling her when build 40 lands |
| **Tester B / Tester C** | Nothing (not a chase / no obligation) | Nothing |

### The immediate, concrete next action

Janus's 09-26 mail asks for **the smallest possible ask set** for the
pro-feedback session, three lines:
1. Does the restructured test plan need one specific yes/no from Xian
   before the session, or is it just waiting on the deck being raw?
2. Should Themis's Pimento give-back review happen before or after the
   pro-feedback session?
3. (Implicit — confirm these are genuinely the only blockers, so Janus
   can hand Xian one sitting that clears all three.)

**This has not been answered yet.** It's the single fastest way to
unstick Xian's queue, and it doesn't require anything except reading
this handoff and the two Themis mails referenced below.

## In flight, named as in flight

1. **Sentence-case intent fix** — see above. Themis's Pimento give-back
   names this exact item as the textbook case of "open by default, not
   by choice": legitimate reasons to be open, but no surface shows it
   waiting or how long.
2. **The Pimento walk itself is complete as an exercise** (both
   question rounds answered, both of Themis's outputs delivered:
   the evidence read and "what the walk surfaced for One Job") **but
   its recommendations are unimplemented**:
   - A two-column list (date entered open state / what would close it)
     alongside the rollup's existing waiting-on-Xian section —
     explicitly not a backlog, not an SLA, just visibility on age.
   - "Before building a feature, write one sentence saying what would
     make it worth having kept" — same form as VISION.md's release-line
     bars ("1.0 — Xian trusts it with a real week"), one scope down.
   - A ruling on REQUIREMENTS.md (kill or rebaseline — both are live
     options, not just rebaseline).
   - Deciding what evidence would settle the Todoist-vs-user-built-
     Reminders-shortcut question, so it's open by choice rather than
     by default.
   - Full detail: `docs/mail/memo-themis-to-coral-cc-xian-2026-09-24-what-the-walk-surfaced-for-one-job.md`
3. **The card-exchange / R4 prototype** — durable design notes captured
   (`docs/CARD-EXCHANGE-DESIGN-NOTES-2026-09.md`), VISION.md covenant 3
   amended (adapter = user-designated, user-owned endpoint only; our
   own repo use for this exchange is Xian's personal dev practice, not
   product precedent). The daily-cadence proposals (single-deck export,
   habit-anchoring options) were offered but **none chosen yet** —
   nothing built.
4. **The slogan** ("I don't want your data. Your data is not my
   business.") — captured, and Themis resolved the precision question
   with a placement rule rather than a rewrite: safe unqualified
   wherever the business model is the subject (pricing, App Store
   copy near pricing); needs covenant 7 nearby ("we measure the shape
   of use, never the content of it") wherever data handling is the
   subject (privacy policy, onboarding, settings). **Not used in any
   real copy yet** — this is guidance for whenever it is.
5. **Attention-board lean-up** — Janus relayed Xian's verbatim advice
   today (09-27): strip stale info, keep narrative in logs not the
   board, board holds only current-and-actionable. One Job's rollup was
   measured as the leanest of four boards checked, but the Carrying and
   Settled sections are named as where it could still shed weight.
   **Not yet applied.** Hard rule if you do this: nothing gets cut
   before it exists durably elsewhere (a log, an archive) with a link
   from the board.

## Deliberately unresolved — DO NOT FIX

- **Defer doubles as recurrence** (Xian: "a lot of those life cards are
  recurring reminders"). Still unresolved on purpose; still not a
  feature to build without the design conversation from the
  pro-feedback session.
- **Rooms/empty-deck/feedback-channel design sketches** — parked for
  the pro-feedback session specifically, per `docs/UX-SESSION-PREP-2026-09.md`. Wants his taste, not a patch.
- **Siri title-case** — fix exists at the input layer
  (`capitalizationType: .sentences`); the *verification* is his two
  samples. Do not add post-processing; it would break "Call Pilot tester A."
- **R2 (spatial canvas)** — HELD by explicit ruling (delegation must
  not divert from primary goals). Not killed, not scheduled.
- **The probe's ceiling**: no MCP, no protocol, no adapter — now
  sharpened by the covenant 3 amendment: any future "push an export
  somewhere" feature must let each user designate and own their own
  destination; never a fixed destination the product ships with, never
  infrastructure Design in Product operates.
- **Todoist integration vs. the user-built Reminders shortcut** —
  genuinely undecided which one the roadmap should actually chase.
  Themis's sharpening: it stays open by default until someone writes
  down what evidence would settle it — that's the actual next step,
  not a resolution.

## What I most recently got wrong (Pard's rule)

- **With myself, on monitors surviving a session clear**: after the
  09-19 fleet renewal, I reported "monitors did not survive the clear"
  based on an empty TaskList — wrong. One had survived and simply
  doesn't surface in that listing. Absence-of-listing is not
  absence-of-monitor; check the actual surface a thing would appear on
  before asserting it's gone.
- **On item 31's three-session staleness**: the actual bug wasn't
  insufficient vigilance, it was that nothing pushed the change to
  anyone between sessions. Janus's new relay-contract offer (push a
  line the day the waiting-on-Xian set changes) is the structural fix
  to the exact failure mode that let 31 sit stale — worth treating as
  cause-and-remedy, not two separate facts.
- **With Themis, on the slogan caveat**: my first instinct was that an
  overbroad claim needs a qualifier bolted onto it. Themis correctly
  identified that the fix was placement, not wording — the
  revenue-model reading is unconditionally true and belongs unqualified
  wherever business model is the topic; only the colloquial reading is
  exposed, and only where data-handling is the topic. Lesson for next
  time a claim reads too broad: ask whether the fix is a caveat, or
  whether the claim is simply in the wrong room.
- **With Janus**: nothing to report yet — the three-line ask above is
  still outstanding as of this handoff, not yet a completed exchange to
  assess.

## Traps a fresh session will hit

- **CI**: check `gh run list --workflow=deploy.yml --limit 1` at
  session start regardless — it has gone silently red for nine days
  once before.
- **Mail arrives even when no Coral session runs.** All four mails
  referenced in this handoff landed on 09-24 through 09-27 while no
  session was active. `ls -t docs/mail/` at session start, always —
  don't infer "nothing's new" from how recent the last coral-log looks.
- **Don't assume the weekly cohort check-in is running.** It isn't.
  This exact wrong assumption was independently made twice in one week
  (by me, by Themis) before a direct check caught it. A designed-but-
  never-started instrument looks identical to a running one from
  outside — verify the roster's Day-0 column, don't recall it.
- **The rollup is about to get trimmed** (lean-board advice, just
  received, not yet applied). If a fresh session looks for narrative
  context that used to live in the Carrying/Settled sections and finds
  it gone, check coral-logs/archives first — the hard rule is nothing
  gets cut without a durable link left behind, so it should be findable,
  not lost.
- **Scratchpad deps do not survive session restarts**: playwright (pin
  1.61.0) and jsonwebtoken must be reinstalled into the scratchpad,
  never the repo.
- **Every TestFlight/App Store upload ends with a release note**:
  `docs/releases/{version}-{build}.md` + `node scripts/asc-whats-new.mjs`.
  Non-optional.
- **A released version's train closes** — next store submission must
  bump `MARKETING_VERSION`.
- **The ASC API key** can manage TestFlight groups, What-to-Test, build
  queries. It cannot create Distribution certs.
- **Artifacts**: check `docs/ARTIFACTS-INDEX.md` before publishing
  anything — republishing without `url:` mints a duplicate.
- **The capture scripts seed the real `oneJobTasks` key** — refuse
  non-localhost targets now, but treat them as loaded weapons anyway.

## The standing rhythm

Daily cross-pollination brief at `docs/briefs/cross-pollination/current.md`
— read and audit against it at session start; this practice has found
real bugs multiple times. Session log at
`development/coral-logs/YYYY-MM-DD-coral-log.md`, every session, no
exceptions — including a session-end summary. Mail flows through
`docs/mail/` per CLAUDE.md's routing rules (mail lands in the
*receiver's* repo, never the sender's — Themis and Janus both live in
`mediajunkie/designinproduct`).

**New this window, not yet exercised even once**: the relay contract
with Janus — push a line whenever the set of things waiting on Xian
changes, same day, rather than waiting for Janus to notice on their own
read of the rollup.

**New this window, not yet applied**: lean-board discipline on
`docs/ATTENTION-ROLLUP.md` — strip stale info, keep narrative in logs,
board holds only current-and-actionable, nothing cut without a durable
link left behind first.

**The standing rule from Xian (2026-09-12, via Janus, reaffirmed
since): waiting on him never means idle. Always move to unblocked
work.**
