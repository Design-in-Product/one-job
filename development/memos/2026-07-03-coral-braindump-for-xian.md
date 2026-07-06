# Coral → Xian: the reciprocal braindump

**2026-07-03, late evening.** You asked for all my thoughts about this
app, this project, its goals — especially the agentic parts, where the
conversation ran ahead of you. Here it is, at a walking pace. Opinions
are marked as opinions.

## 1. What I think this app actually is

Not a task manager. A **focus ritual with a spatial memory**.

Every task system ever built shows you the list, and the list is the
enemy: it radiates guilt in proportion to its length. One Job's founding
move — you can only see one card — isn't a UI constraint, it's an
emotional design decision. The deck metaphor does work a checklist
can't: cards have *faces* and *backs* (anticipation), decks have *tops*
(priority without numbers), swiping is *dealing with* something in the
oldest sense of the phrase. Your vision items sharpened this: text fills
the card (the task looks you in the eye), the card fills the phone (the
phone becomes the object), state is a place, not a flag (Done is
somewhere cards *go*, and you can visit them).

The reason I believe in the concept model you laid out tonight is that
every piece of it strengthens that single founding move instead of
diluting it. Recursion keeps one-card focus at every depth. The
lifecycle chain gives cards an afterlife without a single new gesture.
The canvas gives everything a place without a single new menu. That's
rare coherence, and it's worth protecting fiercely against feature
gravity.

## 2. The toy / tool / experience-layer trilemma (your Item 11)

I think your framing is exactly right, and I want to add one argument
for why the experience-layer path is not just the survivable one but the
*strong* one: **the interaction paradigm is the moat, and it's only a
moat if it doesn't have to win the database war.** Asana has fifteen
years of workflow features; competing there means becoming them. But
nobody — genuinely nobody in that market — owns "the next thing you
should do, in your hand, with the rest of the world invisible." That's
winnable precisely because it's a *view*, and views can sit on anyone's
data.

The discipline it demands: One Job must resist ever becoming the system
of record for teams. The moment it stores things other tools can't see,
it's competing on features again. The overlay (your value-added layer:
deck order, interiors, deferral history) should stay strictly *personal*
— how *you* face the shared work, not where the shared work lives.

## 3. MCP and the inbox, at a walking pace

Since the earlier conversation outran you, from the beginning, no
jargon:

**MCP (Model Context Protocol)** is a standard plug for AI agents — the
USB port of the agent world. An "MCP server" is a box that exposes
tools; any agent (Claude, Piper Morgan, whatever comes next) can plug in
and use those tools without custom integration work on either side.

**The idea in one sentence**: One Job becomes the *human-attention
endpoint* for agents — when an agent finishes something and needs a
human decision, it doesn't send an email or a Slack ping; it **deals a
card into your deck**, and when you swipe, the agent hears about it.

**Why this is special**: the agent ecosystem has solved "agent does
work" and mostly failed at "human reviews it one thing at a time,
calmly." Every agent product reinvents a notification tray, and
notification trays are the list-guilt problem again. A deck is a
*better-shaped hole* for that peg than anything agents currently plug
into.

**The tension**: 1.0's whole bet is local-first — your deck lives on
your phone; there is no server. But agents need somewhere reachable to
deal cards *to*. So any agent story is secretly a sync story: a small
server holds an **inbox** (a mail slot, not custody of your deck), your
phone pulls from it, and status flows back. That's why I parked it: the
honest design (docs/MCP-DESIGN.md) had four open questions, and every
one of them — where the server lives, how the phone learns about new
cards, identity, what agents may know — is a question the 2.0
federation work answers anyway, because **an agent dealing a card and
an Asana import are the same event**: a card arriving from outside with
provenance. Build the import machinery once for Asana (real, boring,
testable), and the agent inbox becomes "one more source" instead of a
speculative special case. That's the Gall's-law route to the cool thing.

## 4. Piper Morgan (your Item 12)

Two relationships, and I'd treat them very differently:

**Piper Morgan as PM of this project** needs no architecture at all —
it needs *reading habits*. The coral logs, VISION, ROADMAP, and
DEPENDENCIES docs are already agent-legible on purpose. If Piper Morgan
can read a repo and file issues, it can start apprenticing on One Job
the day you want it to; the briefing-sweep pipeline through Janus is
the natural delivery channel. Honestly, this project is an ideal
training ground for it: small, opinionated, well-documented, with a
human who articulates product reasoning out loud.

**Piper Morgan as client of the product** is the R4 story: the first
agent to deal a card into your deck should be family. It's the perfect
first client because you control both sides, the stakes are low, and
the demo is irresistible — your PM assistant hands you your next
decision as a playing card. But it waits its turn behind R3 for the
reasons above.

There's a third, quieter possibility worth naming: Piper Morgan could
*adopt the paradigm* without any integration — "present one decision at
a time" as an interaction pattern it uses natively. If One Job's
concept model proves out, the deck becomes a design export, not just a
protocol endpoint. That's a Design in Product cross-pollination story,
not a One Job feature.

## 5. Risks, ranked by how much they worry me

1. **The schema migration (R1.3).** It rewrites your live daily data.
   It gets written test-first, it round-trips through backup, and we
   don't rush it. This is the only item on the roadmap that can
   actually hurt you.
2. **Sync corruption at R3.4.** Two-way sync is where integrations go
   to die — the mapping must be inspectable and import must run
   read-only long enough to prove the normalization. The "earn write
   access" rule is load-bearing, not rhetoric.
3. **Concept creep.** The two-kind deck model is clean *because* it's
   small. The first proposal that adds a third kind of deck, a status
   flag, or a card that isn't a container should have to fight for its
   life.
4. **The spatial layer's performance.** Zoom/pan/pinch with live decks
   is the hardest *presentation* work on the map — the 2025 stall was
   presentation-layer defects, so R2 gets the full Playwright
   treatment plus real-device verification before anything is declared.
5. **Single-user blindness.** Everything is tuned to you. That's the
   1.0 strategy and it's right — but the first outside user (TestFlight
   testers) will find expectation gaps the way you found the FAB gap,
   and we should *want* that early.

## 6. What I believe the goal is (say it back to me if this is wrong)

Near: an app you trust with a real week — every card recoverable,
nothing lost, nothing confusing, in your pocket, offline.
Middle: the concept model made real — recursion, afterlife decks, the
canvas — so the app *is* the vision instead of gesturing at it.
Far: One Job as the human-facing surface of everyone's
already-chosen task systems — and, through MCP, of their agents. The
place where the noisy world queues up, one card at a time, in a deck
that feels like an object, on a table that feels like yours.

The through-line is singular focus as a *right* the software defends
for you. Everything on the roadmap either defends it better or doesn't
belong.

— Coral
