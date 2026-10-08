# Track B recruiting plan: the forty ordinary testers (DRAFT)

**By:** Coral, 2026-09-27, on xian's ask ("work on the larger tester
plan"). **Status: draft for xian's review. Nothing has been sent and no
program is active.** This fills step 2 of Track B in
`USER-TESTING-PLAN-2026-09.md`.

**Standing constraint (xian, 2026-09-27): no check-ins start until a
program is actually running.** An empty Day-0 column in the roster is
correct right now, not a gap. Starting the program is xian's call, and
it's gate G5 below.

---

## Who we're looking for

The question Track B answers is whether the one-card-at-a-time loop
keeps **ordinary people with no agent workflow**. So the person we want:

- **Keeps some kind of to-do list today, or has tried and quit.** That
  includes paper, Notes, Reminders, and texts to themselves. Someone
  who has never wanted a list can't tell us whether this one is better.
- **Has an iPhone or iPad.** TestFlight is iOS only, and there's no
  Android build.
- **Doesn't work in product, design, or software.** They can still be
  friends of people who do.

**The bias risk, stated up front.** xian's network leans toward UX, PM,
and tech. Those people are generous testers and unrepresentative users:
they notice the craft, and they forgive friction because they know how
hard it is. **Target: at least half of the forty from outside that
bubble.** The roster will mark each person's source so we can check.
Friends are welcome, but their data gets read with that in mind.

## Pace: waves, not a flood

Everyone gets their own 28-day clock (rolling starts, already built),
so nothing forces all forty at once. Recommend three waves:

| Wave | Size | Why |
|---|---|---|
| 1 | ~8 | Shake out onboarding, the plain-framing doc and the check-in rhythm on few enough people that mistakes cost little |
| 2 | ~12 | Opens after wave 1's week 2, once anything wave 1 broke has been fixed |
| 3 | ~20 | Fills the rest, weighted toward whichever sources wave 1–2 show are under-represented |

The Cohort link's cap of 40 stays the hard limit whatever the waves do.

## Channels, cheapest for xian first

1. **Ask friends to pass it on (best for getting outside the bubble).**
   Ask 5–8 trusted people (Candidate G is the natural first) *not*
   to test, but to each forward it to 2–3 people in their lives who
   "have a sticky-note problem." That reaches beyond the tech crowd
   through someone they already trust. xian's cost: 5–8 short messages.
   I draft them all.
2. **xian's own non-work circles.** Family, neighbours, other parents.
   These are the most ordinary users he can reach directly.
3. **A public post (LinkedIn or the newsletter).** This reaches the most
   people, but it draws his audience, which is the bias above. Use it
   in wave 2 or 3 and cap it at a share of the slots, not first.
4. **Communities (the listing is tagged "adhd"; there are focus and
   productivity groups).** These are the best-fit users, but only with
   a moderator's permission and never cold-posted. Parked unless xian
   wants it. It's the one channel that could look like marketing
   dressed as research.

## Screening (in DM, before anyone gets the link)

The Cohort link lets anyone join on their own with no email, so
screening has to happen before we hand it over. Three one-line
questions:

1. iPhone or iPad?
2. How do you keep track of things you need to do right now?
3. Do you use AI assistants or agents for your work?

The answer to 3 sends "yes, heavily" to Track A (Pilot) instead. The
answer to 2 goes in the roster's notes column in their own words, and
it's the baseline we compare against later. Nothing else is recorded,
per the roster's privacy posture.

## Gates: nothing is sent until all are green

| # | Gate | Owner | State |
|---|---|---|---|
| G1 | Success criteria refined for full-deck cycling (Track B step 1) | Coral drafts, xian rules | **Drafted 2026-10-08** (below); waits on xian's ruling, incl. whether to build `sweeps` |
| G2 | Plain-framing trial doc written (Track B step 4). Themis's agent-framed one is Track A's | Coral drafts, Themis reviews | **Drafted 2026-10-08** (below); waits on Themis's review |
| G3 | A build attached to the Cohort group | Coral (ASC API) | Open. Do it when G5 is close, so the build isn't stale |
| G4 | A synthesis owner: who reads four weeks of one-line answers, and what they produce | xian decides | Open. The test plan flags nobody owns this |
| G5 | **xian declares the program active.** Only then do sends and weekly check-ins begin | xian | **Not active (2026-09-27)** |

## Draft G1: success criteria for the forty (for xian to rule on)

The existing bars stay as they are: **activated** = 5 cards created and
2 active days; **retained** = 4 active days in days 22–28. What G1 adds
is a way to read deferral honestly. Today's data can't separate three
different behaviours that all show up as "lots of defers":

| Behaviour | What it looks like | What it means |
|---|---|---|
| **Avoidance** | the same few cards deferred again and again | friction: the card or the app is failing |
| **Recurrence** | a card deferred on a rhythm (weekly, say) | the feature working; defer standing in for "again later" (your own use) |
| **Full-deck sweep** | deferring every card in a row, to see what's there | browsing, not avoiding any one card |

The per-card deferral counts we record can't tell a sweep from N
avoidant defers.

**Proposed: one new counter, `sweeps`**: the number of times a run of
consecutive defers, with no completion in between, reached the size of
the deck. It counts shape only, never content (covenant 7), and it's
about 15 lines in `metricsStore`. **Not built: it changes what the app
measures, so it's yours to approve.**

**Proposed reading rule:** a tester whose deferrals are mostly sweeps,
or recurring per the week-1 question, is **not** counted as
friction. Only repeated defers of the same few cards that are neither
sweeps nor recurring are counted as friction.

**Proposed track success bar, one sentence in the VISION style:**
*"Track B succeeds if at least half of activated testers are still
opening their deck in week 4, and fewer than one in four show
avoidance-shaped deferral."* The numbers are placeholders for your
ruling. The sentence's form is the point.

## Draft G2: the plain-language tester description (for the Cohort group)

This is the agent-free version for the forty. TestFlight's Beta App
Description is **app-wide**, so it can't differ by group. This text is
for the invite message and the Cohort's What to Test, not the shared
description.

> One Job is a to-do list that shows you one thing at a time. Your
> tasks are a deck of cards: do the top one and swipe it away, or swipe
> it to the back for later. That's the whole app.
>
> It's free, it works offline, and there's no account. Your list stays
> on your phone and is never sent anywhere.
>
> We're asking a few people to use it for four weeks, as much or as
> little as feels natural. Not using it tells us something too. If
> you're willing, Settings can produce a short usage summary (counts
> and days, never what your tasks say) that you can read before
> choosing to send it.

There's no weekly-question line: that waits for a program to be
declared active (xian, 2026-10-07).

## What I need from xian

The only decision needed is the review itself. It can happen in the
pro-feedback session or after it, and it's not urgent:

- Are the waves (8 / 12 / 20) OK, or would you rather go faster?
- Is it OK to ask friends to pass it on, with Candidate G first?
- Communities: in or out?
- Any thank-you for testers? My recommendation: no money, since paying
  changes who shows up and why. Early access to pro features instead,
  consistent with PRICING.md.

## What I can do now without a ruling

Draft G1's refined criteria, G2's plain trial doc, the pass-it-on
message, and the screener DM. All of it stays in drafts until G5.

## Tier

Recruiting isn't a feature, so there's no tier question here. The
build testers get is the free build, per the rc-1.0 MVP-is-free rule.
