# Handoff — Coral (One Job) — 2026-09-18

**For:** the fresh Coral session after the Amber reboot. Xian starts
new sessions WITHOUT prior context — this file and the repo are all
you get. Read CLAUDE.md first (it is the operating manual and most
standing rules live there); this file carries only what the repo does
not.

## Where the product actually is

- **1.0 shipped** (App Store, 2026-09-09, three-day review) and **1.1
  shipped** (2026-09-14: the Add Card App Intent — Shortcuts/Siri can
  deal cards into the deck). Live listing:
  apps.apple.com/us/app/one-job-one-task-at-a-time/id6787158379.
- **TestFlight build 39 is current** for testers; **build 40 is
  DELIBERATELY held**: the sentence-case intent fix (see "in flight")
  is committed and compiles, but Teresa Klein is mid-onboarding on 39
  and a new external build mid-join is worse than a title-case quirk.
  Cut 40 when her join settles or Xian's Siri samples arrive.
- **The cohort machinery is live and proven**: TestFlight groups Pilot
  (cap 10, link ends dZ1DdUhJ) and Cohort (cap 40, held back) exist
  with public self-serve links — no email collection, ever. Teresa
  joined through the real link. docs/TESTFLIGHT-COHORT-SPEC.md,
  docs/COHORT-ROSTER.md, docs/COHORT-CHECKIN-QUESTIONS.md are the
  instruments; the roster tracks per-person day-0 clocks because
  starts are rolling.

## Who owes what, both directions

| Counterparty | They owe | We owe |
|---|---|---|
| **Xian** | Two Siri samples (short + sentence: said vs. appeared) to confirm the sentence-case fix; verdict on Teresa's Shortcut (only he can open iCloud Shortcuts); the 8/29 LinkedIn hand-raiser's name; the pro-feedback session + usability screenshots; REQUIREMENTS re-baseline decision | Build 40 when samples arrive; the session walk order is ready in docs/UX-SESSION-PREP-2026-09.md |
| **Teresa Klein** (pilot #1, LinkedIn) | Her experience of the join + first bug reports (she asked for a format: answer was TestFlight's native screenshot flow) | Telling her when build 40 lands; a public credit decision on her Reminders→One Job Shortcut is XIAN'S, not ours |
| **Themis** (DinP, business) | — | Nothing pending. Lane rule: product/build/research mine, timing/messaging theirs, opinions flow freely, approval authority is topic-scoped. The trial "deets" doc lives in THEIR repo (deliverables/launch-brand/) — edit in place, never fork |
| **Janus** (DinP, hub) | — | Nothing pending. Mail conventions in CLAUDE.md header; Letters to xian go to designinproduct/docs/mail/ |
| **Ted Nadeau** | First iPad feedback (invited 09-05, on vacation — Xian: not a chase) | Nothing |
| **Austin Wood** | Maybe nothing ever (a "geeky hello" invite, no obligation) | Nothing |

## In flight, named as in flight

1. **Sentence-case intent fix** — committed (native/ios/AddCardIntent.swift,
   `capitalizationType: .sentences`), compiles, NOT device-verified,
   NOT in any build. Rides in 40. Xian's two samples are the
   verification.
2. **Now What? #5** — Xian is writing it. My inputs are done and
   indexed in docs/ARTIFACTS-INDEX.md: the intervention timeline
   artifact + anecdote scaffolds + docs/NEWSLETTER-5-SOURCE-SCENES.md.
   The 1.1 LinkedIn post went out 09-15 (2,076+ impressions).
3. **Teresa's Reminders→One Job Shortcut** — the community-builds-roads
   thesis's first instance. Xian is evaluating; the roadmap question it
   opens (does a good user-built Reminders importer reframe what the
   Todoist 1.1-follow-up work is FOR?) is item 33 in the rollup and
   deliberately undecided.
4. **R2.3 (table surface) + dark mode via delegation** — approved by
   Xian 08-29, never started. Legitimate next build work if unblocked
   time appears.

## Deliberately unresolved — DO NOT FIX

- **Defer doubles as recurrence** (Xian: "a lot of those life cards
  are recurring reminders"). The deferral-depth metric conflates
  friction with intent BY DESIGN until the week-1 cohort question
  disambiguates. Do not add a recurrence feature; it is a design
  question for the pro-feedback session, and a repeat scheduler
  arriving as a date picker is exactly what covenant 2 forbids.
- **Rooms render sub-cards with active-card auto-sizing** (his
  screenshot #3). Parked FOR THE SESSION — it wants his taste, not a
  patch. Same for the empty-deck design (his blank-card spitball) and
  the feedback-channel structure sketch. All in UX-SESSION-PREP.
- **Siri title-case** — fix exists but the VERIFICATION is his
  samples. Do not also add post-processing; it would destroy "Call
  Teresa Klein".
- **R2 (spatial canvas) is HELD** by his ruling (08-28, reaffirmed
  09-10 "partial/other" note): delegation may not divert from primary
  goals. The wide-viewport peek design (R2.2b) is recorded, not
  scheduled.
- **The probe's ceiling**: no MCP, no protocol, no adapter. If the
  fleet probe grows an architecture it has failed (CLAUDE.md).

## What I most recently got wrong with each counterparty (Pard's rule)

- **Xian:** handed him a TestFlight link wrapped in backticks; he
  pasted it faithfully and Teresa got a not-found error. Anything
  meant for pasting goes over BARE. Also: I read his "some items
  seemed stale" as "audit harder" when he meant "the card doesn't say
  how long" — when he reports a symptom, check whether he is
  describing a missing SIGNAL before assuming a missing effort.
- **Teresa (via the record):** assumed her first report meant ALL CAPS;
  it was Title Case — materially different fix. Get the exact
  artifact before choosing the layer to fix at.
- **Themis:** my "watchdog deployed" claim was false when written
  (9-day CI freeze, discovered later) — with Themis especially,
  never claim shipped without having watched the deploy; they keep
  the risk ledger and my corrections land in permanent records.
- **Janus:** my log recorded what FAILED (the phrase-interpolation
  archive error) but not what shipped as a result, and Janus's test
  guide inherited the ambiguity (told Xian to try Siri; build 38
  couldn't). Logs must record outcomes, not just lessons.

## Traps a fresh session will hit

- **CI**: check `gh run list --workflow=deploy.yml --limit 1` at
  session start (CLAUDE.md step 4) — it froze silently for NINE DAYS
  once. The ci-red-beacon files an issue on failure, but check anyway.
- **Scratchpad deps do not survive session restarts**: playwright
  (pin 1.61.0 — cache match, see CLAUDE.md) and jsonwebtoken (for
  scripts/asc-whats-new.mjs) must be reinstalled into the scratchpad,
  never the repo.
- **Every TestFlight/App Store upload ends with a release note**:
  docs/releases/{version}-{build}.md + `node scripts/asc-whats-new.mjs
  <version> <build> <file>`. Non-optional (AMBER-XCODE.md). The script
  polls for build registration itself.
- **A released version's train closes** — next store submission must
  bump MARKETING_VERSION. Build numbering: CURRENT_PROJECT_VERSION in
  the pbxproj, gitignored, so the walkthrough docs are the record.
- **The ASC API key can do TestFlight groups, What-to-Test, build
  queries** (scripts show how; key at the canonical path per
  AMBER-XCODE.md). It cannot create Distribution certs.
- **Artifacts**: docs/ARTIFACTS-INDEX.md before publishing anything —
  republishing without `url:` mints a duplicate. The account is
  constellation-shared; never touch artifacts not in our index.
- **The capture scripts seed the real oneJobTasks key** — they refuse
  non-localhost targets now, but treat them as loaded weapons anyway.

## The standing rhythm

Daily cross-pollination brief lands at
docs/briefs/cross-pollination/current.md — read at session start,
audit One Job against its insights (this practice has found real bugs
four times: the cold-start firstUse, the empty-backup wipe, the
label-vs-key deck binding, the covenant-4 downgrade). Session log at
development/coral-logs/YYYY-MM-DD-coral-log.md, every session, no
exceptions. Mail flows through docs/mail/ per CLAUDE.md. The rollup +
fleet probe deal Xian's asks as cards; four structural guards enforce
the format — trust the refusals.

**The standing rule from Xian (2026-09-12, via Janus): waiting on him
never means idle. Always move to unblocked work.**
