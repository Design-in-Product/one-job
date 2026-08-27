# Memo: xian → Coral · 2026-08-26 · Roadmap reordering after the investment-readiness review

**Status:** 🟡 Wants a decision. Nothing here is blocking; the working
default is "keep going as planned," and I think that default is wrong.

**Provenance:** produced in a Cowork research session that built an
investor pitch deck against the MFM 15-slide framework, ran five parallel
research sweeps to test the venture case, and then took a provisional
investment-readiness review of the resulting materials. Companion
artifacts: `docs/pitch/One_Job_Pitch_Deck_2026-08-26.pptx`,
`docs/pitch/One_Job_Investor_Reference_2026-08-26.docx`, and the earlier
README-corrections memo of the same date.

**This memo is deliberately opinionated.** Xian asked for that. Where I
recommend something, I say so plainly and give the reason; disagree in
the reply rather than splitting the difference silently.

---

## The recommendation in one sentence

**R2 — the spatial layer — should yield to three things that generate
evidence: local instrumentation, a crude agent-inbox probe using Xian's
own agent fleet, and one scoped Todoist integration.** Everything the
roadmap needs is already written down; the ordering is what's wrong.

---

## What changed

Three things, and each one moves a decision.

**1. The venture case does not rest on the app.** Research established
that no company positioned as a layer over existing task systems has
produced a venture outcome, and that at $3.49/month paid acquisition is
arithmetically closed (LTV/CAC ≈ 0.07). The consumer product is a good
solo business with a real ceiling. The part with venture scale in it is
R4 — the agentic layer — and specifically the fact that MCP shipped
Tasks as an official extension on 2026-07-28 with a durable
`input_required` state built for mobile clients on flaky connections,
and that no client implements it yet.

**2. A provisional investment review scored traction 1.0/5 and
distribution 1.5/5**, with founder at 4.5 and timing at 4.0. Those two
low scores are the whole picture; nothing about the deck moves them. Its
own top-line advice was: don't make the deck prettier, produce evidence.
Xian's response — hit a first-50-users milestone before refining the
pitch further, and let the signals decide between lifestyle app and
venture case — is the right read, and this memo is about what has to be
true before those 50 people arrive.

**3. Covenant 7 is a calm-UI principle, not a privacy commitment.**
Xian's clarification, 2026-08-26. This is the unlock for everything in
§1 below, and it should be written into the covenant's own wording so
nobody re-litigates it in three months. "The deck never wears a number"
governs what the interface shows a user. It has never governed what the
app may know locally about its own use.

---

## The core opinion: R2 slips

R2 is the most beautiful work on the roadmap and the least evidential.
The zoom continuum, the table surface, the kinetic conversation — these
are what make One Job *itself*, and I am not arguing they are optional.
I am arguing that every week spent there produces something that cannot
be shown to a skeptic, at a moment when the only thing that changes
anyone's mind is evidence.

R2's own gate says it plainly: *"a new user finds Completed by looking
around."* That gate presumes new users. There are none. Building the
navigation layer for an audience that does not exist yet is the classic
ordering error, and it is the one Gall's law — your own stated ordering
principle — exists to prevent.

**Recommendation: R2.1–R2.8 hold. R2.3 (the table surface) and the
dark-mode pull from the fun shelf are the exceptions** — both are
store-listing quality issues and cheap.

---

## Proposed ordering

### 0 · Unblock submission — and decouple it from the PWA bug

Item 24's white-screen-of-death is a stale-service-worker failure. **Xian
reports it has not occurred in the app container.** If that holds under
one deliberate check, it materially changes the gate:

- **The App Store submission is not blocked by it.** The native build
  does not carry the failure mode. Holding a store submission for a
  PWA-only bug costs weeks and buys nothing.
- **The 50-user cohort *is* blocked by it.** The web app is the
  zero-friction path, it is what Dan actually used, and it is what most
  invitees will touch first. Shipping an invitation into a known
  white-screen is how you spend your one first-impression asset on a bug.

**Recommendation: submit 1.0 from the native build once the device pass
is otherwise clean; treat the PWA service-worker fix as the gate on the
cohort, not on the store.** The likely direction is already named in the
rollup — a version-mismatch detector that force-unregisters a stuck
worker without requiring the user to find Safari's site-data settings.
Do that as its own R0 item with a real test.

### 1 · R1.5 (new) — Local instrumentation, opt-in, before anyone is invited

**This is the highest-leverage item in the memo and the easiest to skip.**

A 50-user cohort observed with no instrumentation produces anecdotes. You
get one first cohort. If it runs uninstrumented, the honest report
afterwards is "some people said they liked it," which is exactly the
sentence the investment review scored 1.0.

The covenant clarification removes the objection. The design that honors
both:

- **Local-only counters.** Nothing leaves the device by default. No
  network calls, no third-party SDK, no identifiers.
- **Opt-in export.** A user who wants to help taps something and gets a
  small JSON blob they can send. Consent is an action, not a checkbox
  buried at install.
- **Nothing surfaces in the deck UI.** The numbers exist in Settings and
  in the export. The deck still never wears a number. Covenant intact.

**Activation and retention, defined now so they are not defined
post-hoc to flatter the result:**

| Metric | Definition |
|---|---|
| **Activated** | Created ≥5 cards AND returned on a second, separate day |
| **Retained** | Active on 4+ distinct days during week 4 |
| **Engaged** | Completed ≥1 card on 4+ days in a week |
| Supporting | Cards created · completed · deferred · deferral depth (how many times one card is pushed) · decks maintained · interiors opened |

Deferral depth matters more than it looks. It is the honest measure of
the failure mode the product deliberately hides, and knowing it privately
is the difference between a design principle and a blind spot.

The `product-tracking-skills` plugin is installed and is built for
exactly this sequence: model the product, audit what exists (nothing),
design the plan, implement it. **Recommendation: use it rather than
hand-rolling.** Dan's own words name the activation moment better than
any framework could — *"I just populated it right away and I really liked
that experience"* — so the onboarding work and the instrumentation work
are the same work: get cards in fast, then measure whether they come back.

### 2 · R4.2-lite (new) — The fleet probe, in the crudest possible form

R4.2 already exists on the roadmap: *"Piper Morgan as first agent client
— deals cards into Xian's deck; the family dogfoods the protocol."* It
sits behind R3 because R4.1's open questions were to be answered by real
R3 infrastructure.

**I am not proposing to jump that dependency. I am proposing a probe
that deliberately is not the architecture.**

Here is the thing nobody has said out loud: **the agent-to-human queue
already exists in this repository, and it is a markdown file.**
`ATTENTION-ROLLUP.md` opens with the words *"things waiting on Xian"* and
carries a status key for blocking / wants-an-answer / FYI. Sixty memos
sit in `docs/mail/`. Fifty-two of fifty-three consecutive
cross-pollination briefs have landed. Every one of those is an agent
handing work to a human, and every one of them is answered by Xian
remembering to go read a file.

That is precisely what One Job claims to be, running today, badly, in
files. And Xian has said the use case materially addresses one of his
real pain points right now — which is the strongest possible reason to
build it and the reason to be suspicious of building it too elaborately.

**The probe, and its deliberate ceiling:**

- A script reads open items from `ATTENTION-ROLLUP.md` and writes them
  into a designated One Job deck as cards, carrying provenance (which
  agent, which project, blocking or not).
- Xian answers them from the deck for two weeks.
- Answers flow back by whatever crude mechanism is cheapest — a file the
  script re-reads is fine.
- **No MCP. No protocol. No adapter seam.** If this probe grows an
  architecture, it has failed at its job.

**What it is for:** learning whether a card is a good place to answer an
agent. That is a question about *feel*, and it is unanswerable by design
work. If two weeks of it is a relief, the venture thesis has its first
real evidence and R4.1 becomes urgent. If it is ceremony — if Xian finds
himself going back to the file — then that is worth knowing in a
fortnight rather than a year, and One Job is a lifestyle app, which is a
legitimate answer and a good business.

**This is the single most informative two weeks available on the
roadmap,** and it costs less than one R2 item.

### 3 · R3.2 + R3.4, scoped hard — one Todoist list, read-only first

Xian named this and I agree, with two conditions.

**Why Todoist over the alternatives:** it is a *personal* task manager
rather than a team tracker (the right shape for a personal overlay), its
Sync and REST APIs were unified into a single v1, and Doist ships an
official MCP server — which means the same integration doubles as
groundwork for the agentic layer. Asana and Jira are team databases;
their shape fights the product.

**Condition 1 — honor your own gate.** R3's opening line is *"Import
first, then sync — in that order. Each source lands read-only before any
source earns write access."* That gate was written before there was any
pressure to demonstrate the lens, and it is right. Read-only import of
one designated list, proven for a week, then completion writes back.
Nothing else. Not due dates, not labels, not multi-project.

**Condition 2 — fix or hide the GitHub import first.** It currently
imports every assigned issue across every repo and produces something
like a thousand unusable cards. Shipping a second integration while the
first one is embarrassing is how a product acquires a reputation for
integrations being broken. Repo-scoping is a small adapter change; do it,
or pull the feature behind a flag until it is done.

**What this buys:** the review's Priority 4 asks for one functioning
integration to turn the "lens" claim from architecture into evidence. One
Todoist list, syncing correctly for a week, is that. Two sources is
better, and two sources built badly is worse than one built well.

### 4 · The cohort — and it should not be homogeneous

Fifty users is the right target. **Fifty users of the same kind is a
wasted cohort.**

- **~40 ordinary invitees** — friends, family, Product Hunt, the PM
  audience. These answer: does a person keep using this? That question
  has a known ceiling in the research, but it is the question that
  decides lifestyle-vs-hobby, and it needs answering.
- **~10 agent-heavy users** — people running Claude Code, Cursor
  agents, or their own fleets. These answer the question that decides
  everything else. Xian is unusually well placed to recruit them: he
  publishes *Building Piper Morgan*, he is embedded in the PM and
  agent-tooling community, and he has an audience that self-selects for
  exactly this.

**Recommendation: recruit the ten first, before the forty.** They are
harder to find, they need the fleet probe to be real before they can try
anything, and their feedback should shape what the forty see.

### 5 · The economic buyer is a conversation, not a build

The review's Priority 3 asks who would pay materially more than $3.49.
Nothing on the roadmap answers that, and nothing should. **Ask the ten.**
Ten conversations with agent-heavy users about what a reliable
human-review queue is worth to them will produce a better answer than
any amount of building, and it costs a week of calendar rather than a
quarter of engineering.

The honest prior from the research: if there is a venture business here,
it is priced per seat to people running agents, not per month to people
managing chores. That is a different company and it is worth finding out
early whether it wants to exist.

---

## What this does to the pitch

Slide 13 currently promises *"the first MCP Tasks client shipped"* as an
eighteen-month milestone. Under this ordering it becomes a near-term
item, and the ask slide gets materially stronger — a founder who ran the
experiment before raising is in a different conversation than one who
proposes to run it with the money.

The deck otherwise does not need work. The review's own conclusion was
that the narrative is adequate and the score moves through evidence.

---

## What I would hold us to

1. **Instrument before you invite.** If exactly one thing in this memo
   lands, make it this one.
2. **The probe stays crude.** The moment it grows an adapter seam it has
   stopped being a probe and started being R4.1 without R3.
3. **Read-only before write, on every source.** Your gate, not mine.
4. **No public invitation while the PWA can white-screen.** The existing
   HARD GATE precedent — no invitation while backup was unproven — held
   for 46 days and was correct. Same discipline, same reason.
5. **Report the cohort honestly, including if it is bad.** A 50-user
   cohort where 6 people retain is a real answer and a useful one. The
   temptation to re-cut the numbers until they look like a curve is the
   exact failure this project has avoided everywhere else.

---

## Questions back to Xian

1. **Does R2 holding sit right?** It is the biggest call in this memo and
   it defers the work that makes One Job feel like the vision.
2. **Confirm the PWA/native split.** One deliberate check: can the
   white-screen be reproduced in the TestFlight container at all? If it
   can, §0 collapses and submission stays gated.
3. **Which rollup items go in the probe?** Everything open, or only the
   🔴/🟡 tiers? My instinct is everything, so the deck carries the real
   volume rather than a curated version.
4. **Should the covenant text change?** Recommend amending covenant 7 in
   VISION.md to name it a calm-UI principle explicitly, so the
   instrumentation decision is recorded rather than remembered.

— filed by xian, 2026-08-26
