# DRAFT — Xian → Ted, considered reply to the 2026-09-04 feedback

**Status:** draft for Xian's editing. Written by Coral, 2026-09-05.
Voice aimed at Xian's, but every claim is checkable against the repo —
see the notes at the bottom for what I deliberately did and didn't say.

---

Ted —

I gave your list the time it deserved rather than firing back. A few of
these landed harder than you probably intended, so let me take them in
order of how much they changed my thinking.

## The one that actually moved something

**`card-types: task, rule`.**

You wrote that as a throwaway line in a list of card properties. It is
the same distinction you made on our call two days earlier — that
classical task tooling "has no structure for responsibility," that
*make sure the work area is clean* has no home in Jira. You arrived at
it twice, from different directions, without either of us prompting it.

Here is why that matters more than a feature request: my agents don't
primarily hold tasks. They hold **standing responsibilities**, and
tasks are what those responsibilities *emit*. A tool that can only
represent discrete completable units cannot represent what an agent
actually is — which is exactly why every generic task manager feels
subtly wrong for the job even when it technically works.

The thing I didn't expect: I'd already built a small version of this
without having the concept. My agent's attention queue now requires
every open item to carry an explicit **Ask** — one line naming the
judgment it needs from me — and refuses to hand me a card that doesn't
have one. That's not a task convention. It's a *responsibility
surface*: "here is the decision my standing job requires from you,"
rather than "here is a unit of work."

I'm not claiming that's a product yet. But you named the category, and
the category is the interesting part.

## The one I'm going to ship soonest

**Pre-loaded sample stacks.** You want to see how it works before
committing to typing your life into it. Obvious in retrospect, and it
converges with the only other outside feedback I have: Dan's reaction
to the app was *"I just populated it right away and I really liked that
experience."*

You asked for the shortcut; he described arriving there the long way.
That's the same finding twice, and it's cheap — the seeding machinery
already exists, it's just pointed at a demo sandbox instead of at new
users. Your list is going in almost verbatim, ballet dancer included.

## The one where you're right and it costs us

**`defer [why]`.**

I want this and I don't think I can have the obvious version. Deferring
is meant to cost nothing — that's the whole emotional trick. A card you
push is a card that waits its turn, not a confession. The moment I ask
"why?", I've converted the kindest gesture in the app into a small
interrogation, and I think people would start avoiding the defer rather
than answering the prompt.

What I want the data for is real, though: the app already privately
counts how many times a card gets pushed, because that's the honest
measure of the failure mode the design deliberately hides. A *reason*
would turn that from a symptom into a diagnosis. So the question I'm
sitting with is whether there's a version that's optional and silent by
default — something you can opt into when you notice yourself pushing
the same card for the ninth time, rather than a field that greets
everyone at the door.

Open to ideas. This one's genuinely unsolved.

## The one I need you to clarify

**"2-card format (pick one, gives A/B option)."**

We read this differently, which is usually a sign the idea is bigger
than the sentence. I read it as *back-design* — aesthetics. Coral read
it as a prioritization mechanic: show two cards, pick one, and the
choosing itself does the sorting — a choice rather than a sort.

That second reading is interesting to me precisely because it's the
only prioritization idea anyone has proposed that doesn't violate the
premise. The app argues against grooming lists; ranking is grooming.
But *picking between two things* is what you were going to do anyway.

Which did you mean? I'd like both branches even if one of them turns
out to be something you never said.

## On gestures, and why the palette is thin on purpose

You asked for the full reaction-gesture palette. The current grammar is
three axes:

> **Horizontal is fate. Vertical is hierarchy. Zoom is attention.**

Right advances a card's fate, left retreats it — and *where you are*
supplies the meaning. In your deck: right is done, left is not-yet. In
the afterlife (Done → Archive → Trash) the same two gestures move a
card along that chain and back, all the way home, remembering where it
came from. Nothing is a dead end and nothing needs a button.

The reason the palette is thin is a rule I've held to: **new powers
extend the grammar, they don't add chrome.** Most of your card actions
— work-on, refine, forward, push-to-platform, log — are real, and each
one is a small negotiation with that rule. The honest answer is that
most become pro features, for three reasons: each takes more work and
adds more value, most appeal to a subset, and **most are in some
tension with the radical-simplicity concept** — which is fine if people
want them, but the default has to stay ruthless.

I'll send you the gesture spec, the vision doc, and the roadmap. I'd
rather you argue with the actual documents than with my summary of
them.

## Two quick ones

**Cards inside cards already exists** — I'm not sure that came through.
Any card can hold a deck; it goes down as far as you like. The UI
undersells it badly, which is my fault and now a known problem. When
you get in, open "Plan the launch party."

**Connect to another task repository:** Todoist is now the next release.
Read-only first, one list, earning write-back after it's proven. Your
"or connect to other task repository" was the second line of your email
and Dan's central question was the same thing — I'd already decided,
but two-for-two from the only two outside users is a good sign I
decided right.

## What I actually want from you

The TestFlight invite is coming today. You're the first person who'll
use the native build, and — because you're on iPad — you'll be looking
at the surface I've examined least. Expect rough edges there
specifically, and tell me about them.

And the thing I'd most like your eye on isn't a feature. It's whether
the deck works as **an attention surface for an agent** — my main use
of it right now is having my One Job agent deal me the decisions it
needs from me, and answering them from the deck instead of from a file.
Two days in, I genuinely don't know yet whether that's a relief or a
ceremony. You'd have a useful opinion.

x

---

## Coral's notes on this draft (delete before sending)

**What I did:**
- Ordered by how much each item moved something, not by his list order
  — the `task, rule` line deserved the top slot and he probably doesn't
  know it was the most valuable thing he wrote.
- Gave him the real reasoning on `defer [why]` rather than a polite
  "good idea, backlogged." He's a systems person; the constraint is the
  interesting part, and it's genuinely unsolved.
- Named the A/B ambiguity honestly, including that Coral and you read
  it differently. Asking rather than guessing.
- Quoted the gesture grammar verbatim from VISION.md so nothing here
  overstates what exists.
- Preserved your three-reason pro-feature framing from your quick reply,
  since it's a good policy and he's already seen it.

**What I deliberately did NOT do:**
- No promises with dates, except Todoist-is-next, which is now on the
  roadmap as a 1.1 release feature.
- Didn't claim the responsibility-surface idea is a product direction —
  it's recorded on the roadmap as a *candidate framing*, explicitly not
  adopted, and that's your call to make, not mine to announce.
- Didn't mention the store submission timing. If you want to tell him
  1.0 is at Apple, add it; I don't know when you want that public.

**Check before sending:** the claim that the attention-queue convention
"refuses to hand me a card without an Ask" is true as of today —
`scripts/fleet-probe.mjs` exits non-zero. Also verify you're comfortable
describing your agent workflow to him in that much detail.
