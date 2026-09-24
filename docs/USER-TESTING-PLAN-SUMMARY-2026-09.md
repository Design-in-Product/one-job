# User testing plan — as documented so far (summary for review)

**Superseded 2026-09-23** by `USER-TESTING-PLAN-2026-09.md` — the
working conversation this doc kicked off produced a real dependency-
chain reframe (two independent tracks, not one sequential one). Kept
here as the historical snapshot of pre-conversation state; the other
file is the living plan.

**Purpose of this doc:** not a new plan — a synthesis of what's already
decided and built, spread across four files, so Xian can react to the
whole shape at once and focus on where he actually has questions. His
own framing (2026-09-23): "unexamined thoughts on the testing" —
meaning the pieces exist but haven't had one sitting where he looks at
them together.

**Sources:** `TESTFLIGHT-COHORT-SPEC.md`, `COHORT-CHECKIN-QUESTIONS.md`,
`COHORT-ROSTER.md`, `ATTENTION-ROLLUP.md` (Settled section, pilot
framing + item 27), `VISION.md` (covenant 7).

---

## Goals, as they're actually stated across the docs

No single doc states "here is what this test is for" end to end — the
goal lives in fragments:

- **Two different questions, deliberately split across two groups**
  (rollup, Settled, 2026-09-04): the ten test **whether the agentic
  thesis holds** (can an agent hand you a card and does that feel
  good); the forty test **whether ordinary people retain** (does the
  core loop hold up for someone with no agent workflow at all).
- **A specific measurement gap this is meant to close**: R1.5's
  deferral-depth metric can't tell "avoidance" from "this is my
  recurring reminder" apart, and Xian's own use is full of the second
  kind. Week 1's question exists only to fix that ambiguity before it
  contaminates every other number.
- **What "success" means operationally** is defined only for the
  instrument, not the test: activation = 5 cards + 2 active days;
  retention = 4 active days in days 22–28 (computed per-person from
  their own day-0, since starts are rolling). Nowhere is there a
  stated bar like "if N% retain, the thesis holds" — the numbers exist,
  the decision rule over them doesn't yet.
- **Not a stated goal anywhere**: nothing in these docs ties this
  cohort to validating **pro features** specifically. The cohort spec
  and questions are about the free core loop; pro-feature feedback
  runs on a separate track (your own long-delayed usability pass,
  topic 3 on your list) with no documented connection between the two.

## Design: two groups, not one

| | Pilot | Cohort |
|---|---|---|
| Size | 10 | 40 |
| Who | Agent-heavy, hand-recruited | Plainer framing, recruited later |
| Status | **Live** — link shared 09-14, Teresa Klein joined | **Created, not shared** — link exists, waiting for that motion to start |
| Trial doc | Themis's agent-framed draft | Plainer revision, not yet written |

Rolling starts by design: no shared cohort date, no synchronized
4-week window. Each person's day-0 is their own first real use, not
their join date — this is why the roster (a spreadsheet, not
automation) exists at all.

## Recruiting, as it stands

- **Mechanism**: public, self-serve TestFlight links, no email
  collection, ever — a deliberate instance of the data-value principle
  (don't take more than you need from people).
- **Actual roster** (4 entries): **Teresa Klein** (joined, two
  unprompted contributions already — the App Intents idea and a
  Reminders→One Job Shortcut); **Ted Nadeau** (invited, iPad-only, on
  vacation, explicitly not a chase); **Austin Wood** (invited, "geeky
  hello," no obligation attached); **the 8/29 LinkedIn hand-raiser**
  (unnamed — this is rollup item 32, still open, needs thirty seconds
  of you checking your own post).
- **The forty**: nobody recruited yet. No documented trigger for when
  that motion starts, beyond "later."
- **Xian's own short list**: noted 2026-09-12 as "names not yet written
  down" — never transcribed to the roster.

## Method: what actually gets asked, and how often

- **Instrumentation**: on-device only (R1.5 metrics + a user-triggered
  export from Settings). Covenant 7 governs it — shape of use, never
  content; nothing here is new tracking.
- **Weekly check-in**: one question a week, Coral drafts, Xian sends.
  Explicitly not a survey — no scales, no homework, non-use framed as
  data rather than failure.
  - Week 1: recurrence-vs-avoidance disambiguator (the load-bearing one)
  - Week 2: did you open it, and if not, what did you do instead
  - Week 3: what felt like work
  - Week 4: the retention question, with its "why"
  - Reserve bank exists for early answers or dead ends, including a
    Pilot-only question about the agentic angle specifically.
- **What happens with the answers** is undocumented past "Coral reads
  them" — no stated synthesis step, no owner for turning four weeks of
  one-sentence answers into a decision.

## What's actually running right now

Pilot cap 10, one real joiner (Teresa), three more invited-not-joined.
Weekly questions haven't started yet by the roster's own record — no
day-0 is filled in for anyone. Cohort-40 is fully specified but inert.

## Gaps this summary surfaces (not proposals — just what's missing)

1. No stated decision rule connecting the retention/activation numbers
   to a go/no-go call.
2. No link between this cohort and pro-feature validation.
3. No trigger condition for starting the Cohort-40 recruiting motion.
4. No day-0 has actually been recorded yet — the weekly-question
   machinery is specified but not yet in motion for anyone.
5. Item 27's open question (rollup) — how it feels to answer your own
   asks from a dealt card, i.e. this whole probe-as-interface
   experiment — is itself a live, unanswered test running on you in
   parallel with the user cohort, and nothing here connects the two
   loops even though they're testing adjacent things (does a small,
   attention-respecting interaction model work, for users and for you).
