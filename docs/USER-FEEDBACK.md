# User feedback — the independent record

**Maintained by:** Coral · started 2026-09-04

Everyone who has used One Job and reported back, other than Xian. Kept
separate from the roadmap on purpose: the roadmap is what we intend,
this is what people actually said. When the two disagree, this file is
the evidence and the roadmap is the argument.

**n = 2.** That is the honest headline. Two people is not a finding;
it is two people. What makes the entries below worth reading is where
they **converge independently** — neither saw the other's feedback, and
neither had seen the roadmap.

---

## The convergences (what two independent users both pointed at)

**1 · Get cards in fast — populating IS the activation moment.**
- **Dan** (2026-08-26), unprompted, on what made it click: *"I just
  populated it right away and I really liked that experience."*
- **Ted** (2026-09-04), unprompted, asking for what would have helped
  him: *"Should be able to pre-load sample stack (to see how it works)"*
  — with his own list: plan a party · buy a car · become a ballet
  dancer · build an app · be a Product Manager · transform your house ·
  shop for groceries · spring cleaning.

One person described the moment that worked; the other asked for a
shortcut to it. **This is the strongest signal in the file**, and it is
cheap: seeded starter stacks are days of work, not weeks. It also
matches the instrumentation plan's own note that onboarding work and
activation measurement are the same work.

Xian's own reaction: *"great idea! this used to be the 'demo' area for
just that."* The capability exists (DemoService, seeded decks) — it is
the *placement* that is missing, not the mechanism.

**2 · A card is not always a task.**
- **Ted** (2026-09-04), in a bare list of card properties:
  *"card-types: task, rule"*.
- **Ted again** (2026-09-02, via Themis, before writing this list):
  classical task tooling *"has no structure for responsibility"* —
  "make sure this stays this way" has no home in task software.

He arrived at the same distinction twice, from different directions,
without prompting. A "rule" card is a standing responsibility; a task
card is an emission from one. See ROADMAP R4's category-framing note.
**Not yet a build item** — recorded because two independent arrivals at
the same distinction is the kind of thing that turns out to matter.

**3 · Layer, not replacement.**
- **Dan**: *"could I promote some things from my to-do app to this to
  knock them out?"* … *"how do you picture this working with their main
  to do?"*
- **Ted**: *"or connect to other task repository"* as his second line.

Both immediately assumed One Job sits on top of something rather than
replacing it. This is why Todoist is now a 1.1 release feature.

---

## Ted Nadeau — 2026-09-04 (email, full)

Context: long-time friend of Xian's, product/architecture mind, iPad
user (no iPhone), TestFlight invite pending. Had used the web app.
Sent an unprompted structured list.

**Asked for:**
- Upload a deck / connect to another task repository *(backup JSON
  exists; Todoist is 1.1)*
- Pre-load a sample stack — see convergence 1
- The **full reaction-gesture palette**: what tap, click-and-hold,
  swipe, double-tap each mean *(GESTURES.md exists; Xian: "needs some
  conceptual work as we stretch it")*
- **From a card**: work-on · refine (clarify, define reason, define
  value & cost) · defer **[why]** · forward/re-assign · push to another
  platform (GitHub issue, Google Tasks) · post-gesture (log) · card →
  stack of sub-cards *(already exists — the UI does not communicate
  it)* · card-types: task, rule
- **Of a deck**: filter (topic, location/context) · define
  prioritization method
- **Viral**: how to involve others — RACI, witness
- **UI**: a **2-card format (pick one, gives an A/B option)**

**Two of these are genuinely novel and worth flagging:**

- **`defer [why]`** — capturing the *reason* for a deferral, not just
  the count. We already instrument deferral depth (R1.5) as "the honest
  measure of the failure mode the product deliberately hides." A reason
  would make that measure diagnostic rather than merely descriptive.
- **The 2-card A/B format** — pick one of two rather than rank a list.
  This is the only prioritization mechanic anyone has proposed that
  does not violate the anti-grooming ethos: it is a *choice*, not a
  sort. Worth real design thought.

**Xian's framing in reply**, worth preserving as policy: most of these
become pro features for three reasons — each takes more work and adds
more value; most appeal only to a subset; **most are in some tension
with the radical-simplicity concept** ("but that's ok if people want
it"). He also noted a separate request already received for an *"active
but not done"* state, and that "that alone challenges the paradigm."

---

## Dan Brodnitz — 2026-08-26 (chat)

Used the web app. Feedback pasted into the session by Xian.

- *"The experience is beautiful."*
- Empty state reads "a little dry" **(Xian's own view; Dan disagreed —
  he populated immediately and liked that)**
- **Swipe direction instinct was reversed**: wanted left = complete.
  Understood and accepted the intentionality argument once explained.
  Xian noted flipping it could be an easy user preference.
- Confusion that the web app and the native app are the same thing —
  a real onboarding-copy gap, unaddressed.
- The central question, unprompted: does this replace my existing
  to-do apps, or sit on top of them? — see convergence 3.
- Later, unprompted: *"a funny way this would be a useful front end for
  all of my messaging inputs"* — email, Slack, WhatsApp unread, with
  source indicated. Echoes the Ted Nadeau call's "AI-constructed deck
  from unstructured sources" (premium shelf).

---

## Open gaps this record exposes

- **No one has yet used the native (TestFlight) build and reported
  back.** Both data points are web. Ted's invite is pending and he is
  an iPad user — the surface verified least.
- **No one outside Xian's immediate circle has used it at all.** Both
  are friends with product backgrounds. The 50-user cohort exists to
  fix exactly this.
