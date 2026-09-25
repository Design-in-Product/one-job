# Card-exchange design notes — 2026-09-23/24

**What this is:** the durable capture of a two-day conversation between
Xian and Coral about the rollup ↔ fleet-probe card-exchange prototype —
what it's taught us, what model it's converging on, and the trust
boundaries any future version has to respect. Written as the stopping
point before the Pimento walk, per Xian's own bar: "once we've captured
and documented our thoughts in a durable way."

**Status:** design notes, not a spec. Nothing here is committed to
being built. Where something reads as a decision, it's a decision about
principle (what any future version must respect), not about scope
(what we're building next).

---

## 1. The retrospective that started it

Rollup item 27 ("how did answering from the deck actually feel?") sat
open since 2026-08-31 without ever being answered directly — but Xian
had clearly been living the answer the whole time. His verdict, once
asked directly: the card-exchange experiment (the rollup's open items,
dealt to him as an importable deck via `fleet-probe.mjs`) is **the
actual reason he hasn't recruited past himself into the agentic
testing track** — not bandwidth, not names, the mechanism itself.

His diagnosis: "answering from the deck felt gesturally incomplete...
a good way to riffle through an attention queue... but the actions
available feel limited." The specific gap: nothing exists for
**assigning** a card (putting it on someone else's deck) or
**responding** to one, except complete or postpone.

His explicit design lean, stated plainly: not new card-level
properties or hooks ("I've resisted too many hooks being added to the
card concept too quickly") — reuse of the existing multi-deck model.

## 2. The model/view framing

Xian proposed viewing the skeuomorphic card-deck UI as a **human
interface** and the JSON export as an **agentic interface** — different
sensory apparatus, same underlying decks.

This turns out not to be just a metaphor — it's how the app is already
built. The card UI is a rendering of an underlying task/deck model
(the same shape the export already produces); it isn't a second,
lesser interface built to approximate the human one, it's the model
itself, read one layer closer, with the rendering step skipped. The
asymmetry worth naming honestly: only the human side is *experiential*
(something swiped). The agentic side is a data artifact (a file read
directly) — the value of "the agent has a deck" is giving Xian one
consistent mental model for both directions, not simulating an
experience for Coral, who doesn't need one.

**The practical test this gives us:** for any new capability, ask
whether it's already expressible in the shared model — not whether the
card UI has a gesture for it, not whether the card needs a hook.
Something that isn't expressible in the model and has to be bolted on
as a card-level property is, under this test, a hook by another name.

### Assignment passed the test without anyone designing it to

Which deck a card sits in already encodes whose turn it is — a card in
"for Xian" is his; a card in "for Coral" is mine. Turn state is
**positional** (which deck), not a status field on the card. This
resolves the "two decks vs. one shared queue with a status property"
question in favor of two decks: two decks is the primitives path, a
shared queue with a turn-property is the hooks path. Assignment already
has a human gesture (move card between decks, which exists today) and
is already fully present in any deck export. Nothing needs adding to
support it.

## 3. Staleness, reframed

Under the model/view framing, staleness isn't a defect in either
interface — it's the ordinary cost of **two views onto one model with
no live channel**, reconciled only by periodic manual export/import.
That's a real, well-understood tradeoff (eventual consistency instead
of live consistency), and it's one chosen on purpose to stay inside the
constraint that's kept this whole probe small: no MCP, no protocol, no
adapter (CLAUDE.md, "the probe's ceiling").

Concretely, this is why item 31 sat stale for three sessions after
being resolved elsewhere (a LinkedIn post), and why item 27 itself sat
unanswered for three weeks: nothing forces reconciliation except a
Coral session actually happening. The one existing mitigation — every
card carries its "dealt" date so staleness is visible on the card
itself — was already flagged internally as insufficient (the
"twice-bitten threshold" in `docs/coral-logs/2026-09-12`).

**Cross-pollination tie-in (09-24 brief):** the brief's fuse-vs-gate
distinction — a pinned count that clears by restating a number (fuse)
vs. one that clears only by a real decision (gate) — describes item
31's failure exactly. It was a fuse. The probe's two structural guards
(no card ships without an Ask; no regeneration ships with unclassified
items) are gates, which is why they haven't gone stale the same way.

Xian's own read on the cause: "hard to tell if staleness is an aspect
of the model or the extremely manual intermittent proof of concept...
we need to iterate on the process a bit." Landed conclusion: **it's
mostly process, not model** — you can't get live consistency without
giving up the no-protocol constraint, so the lever available right now
is discipline (see §5), not architecture.

## 4. Reducing sneakernet friction without crossing into architecture

Xian riffed on reducing friction with a hypothetical script that
"pulls my latest view... gathers your diffs... pushes updates to both
decks." Splitting that idea by actual risk:

- **A fixed handoff location/convention** (a known spot instead of ad
  hoc paste) — zero new code, pure practice. Fine.
- **A "what changed since your last import" summary card** — a diff
  between two point-in-time JSON snapshots, packaged at the top of the
  next export. Scriptable entirely on Coral's side; no new sync
  mechanism. Fine.
- **Automatic pull-from-phone + push-to-both-decks** — this is,
  structurally, exactly what "no MCP, no protocol, no adapter" was
  written to fence off. Flagged as a conscious boundary, not dismissed:
  if this ever gets built, it's a deliberate revisiting of that
  constraint, not an accretion that happens because a convenience idea
  sounded incremental.
- **A lighter-weight middle path**, if the itch is friction rather than
  live sync: an "Export Deck" App Intent (same shape as the existing
  Add Card intent), Shortcuts-triggerable or personally scheduled. This
  keeps all reconciliation logic — the part that would grow into an
  architecture — out of the app; it only makes getting a fresh file off
  the phone faster.

## 5. The actual itch: daily cadence, not automation

Xian's clarification: "the itch is not for automation yet but for
something that is a potentially daily cadence, which requires some
degree of regularity to establish a routine." Leveraging existing
export, or a slight extension to it, is "completely viable" — the gap
isn't the tool, it's the habit.

**Proposals, offered as options rather than a plan:**

1. **Single-deck export as the slight extension.** Today's backup
   export is whole-app (all decks, v3 format). A scoped export of just
   one named deck — reusing the same serialization, filtered to one
   deck's cards — would make the daily artifact smaller and unambiguous
   (you're always looking at "the Coral deck," never parsing full app
   state to find it). This wasn't independently re-verified against
   the exact current export function during this write-up (time
   pressure, session ending) — treat "single-deck export doesn't exist
   yet" as the working assumption, not a confirmed fact, until checked.
2. **Anchor the habit to something that already happens daily**, rather
   than inventing a standalone task — e.g., as part of closing out a
   day's real use of the app, export the relevant deck before closing.
   Practice design, not a build.
3. **Simplest possible loop, zero new code at all**: export, then
   attach the file to the ongoing conversation the way any file gets
   shared — no fixed repo location needed to start, no new
   infrastructure, immediately compatible with "the same sneakernet
   exchange method for now."
4. **A dogfooding option, flagged honestly**: a recurring reminder card
   in Xian's own deck ("export for Coral"), reused via defer the way he
   already treats recurring life reminders. This deliberately touches
   the known defer-as-recurrence conflation (CLAUDE.md: "Defer doubles
   as recurrence... do not add a recurrence feature; it is a design
   question for the pro-feedback session"). Using it personally as
   practice is fine — it's already how he uses the app — but it's not
   a precedent for building recurrence as a feature.
5. **Shortcuts/App Intent trigger** (§4's middle path) as a later
   upgrade once the habit itself proves worth keeping — not needed to
   start.

None of these were decided; they're the menu as of this write-up.

## 6. The hosting/trust boundary

Xian's concern, stated directly: convenience is fine, "spying on them,
exploiting their data, or even becoming a host for them" is not — and
this must hold regardless of how small or PoC-shaped any convenience
mechanism is.

**This isn't a new value** — it's continuity with what's already
written down as the product's reason for being. README: "no account...
never touch a server." PRICING.md: *"One Job's trust story —
local-first, no account, no tracking, your data is a file — is the
product's soul and its marketing. Charging for any of it would poison
the story."*

**The test proposed and adopted:** does any user's deck data ever pass
through or get stored on infrastructure Design in Product owns or
operates? If yes, it violates the principle regardless of automation
level. If the data only ever moves between things the user themselves
owns (their phone, their iCloud, their own git remote), it's compliant
even if fully automated.

This test also separates two things "no MCP, no protocol, no adapter"
had been doing at once:

1. **Scope discipline** — don't build architecture a two-person team
   doesn't need yet. Pragmatic, can flex.
2. **User trust** — never become the intermediary that touches, stores,
   or could exploit someone's data. Permanent, does not bend for
   convenience.

**A sharper refinement, specific to how Coral and Xian have been
working:** Coral and Xian's own use of the one-job repo for this
exchange is Xian's **personal development practice** — dogfooding the
R4 agent-deck model (see §8) with infrastructure he personally owns. It
sets **no precedent** for the shipped product. If a real feature ever
supports "push an export somewhere," every user must supply and own
their own destination (their Dropbox, their iCloud, their GitHub) —
never a fixed destination the product ships with, and never
infrastructure Design in Product operates, not even a founder's
personal repo used for internal prototyping.

**This is now written into VISION.md**, attached to covenant 3 ("the
device owns the deck; everything remote is an adapter") the same way
the privacy ethos got attached to covenant 7 — a dated, attributed
amendment, not a rewrite. See `docs/VISION.md`, covenant 3, amendment
dated 2026-09-24.

## 7. Three distinct sync ideas, not one

Xian named three related-but-different things worth keeping separate,
since they carry different trust and architecture postures:

**(A) Multi-device sync of your own deck** (PRICING.md item 2,
already scoped as a pro feature). Refined here: the "diffs, not
totals" instinct points at a relay/event-queue architecture — the
server moves deltas between a user's own devices, ideally encrypted,
and never holds a queryable copy of current state. Precedent: Signal,
Bitwarden (both already cited in PRICING.md for the open-core model).
Honest caveat: literal zero-retention doesn't survive a device being
offline for two weeks — something has to hold a queue until
reconnection. The realistic target is "encrypted, short-lived deltas,"
not zero bytes — and that still fully honors "not the data business."

**(B) Two-way sync with a third-party system** (Todoist/Jira/Asana —
PRICING.md item 1). Different from (A): translating between One Job's
card schema and a third party's task schema requires something to read
actual content — you can't map fields on an encrypted blob. But that
something doesn't have to be a Design in Product server. If translation
happens client-side (the user's own device calling Todoist's API
directly with their own token), company infrastructure never enters
the content path at all; the only thing that might need custody is the
token, a narrower trust surface than task content itself.

**(C) A live presentation-layer mode** — no independent authoritative
copy at all; One Job becomes a continuously-current view onto a
backend that owns the real data, surfacing the latest and sending back
updates. Categorically bigger than (A) or (B): it's the fully-grown
version of what VISION.md's "The company it keeps" already describes
(agents dealing cards, completion flowing back), and it's the one
architecture that actually *solves* staleness rather than managing it
— because there's no snapshot to go stale. It's also exactly the live
protocol commitment the probe's ceiling exists to defer right now.
Recorded as the named eventual destination, not the next step.

## 8. The vision already anticipated this

Discovered while finding where to put the covenant-3 amendment:
VISION.md's "The company it keeps" section already describes close to
exactly the model this whole conversation arrived at independently:

> "Agents are actors at the table with decks of their own. They deal
> cards into your deck when they need a human; you deal cards onto
> theirs when you'd rather delegate... Completion flows back... an
> agent's card and an imported Asana task are the same event: a card
> arriving with provenance."

And PRICING.md already scopes this as **R4, a pro feature** ("Agent
features when R4 arrives (MCP inbox, deal-a-card-to-an-agent) — the 2.0
experience-layer thesis monetizes here").

**Today's card-exchange prototype is a hand-run, sneakernet-shaped
instance of R4** — not a new idea being invented from scratch, but the
first real lived experience of a vision that was already written down
and scoped, just not yet built. Worth keeping this framing for whoever
picks up R4 for real: there's already a working proof-of-concept, run
by hand, with real friction data (this document) attached to it.

## 9. A slogan, and a caveat about slogans

Xian, riffing on the trust theme: *"I don't want your data. Your data
is not my business. Your data is none of my business."* Confirmed
deliberate double meaning: the colloquial "none of my business" (not
my concern) and "I don't build my business on your data" (not the
revenue model) landing in one line.

Routed to Themis (messaging is her lane, not Coral's or this
document's) — see `mail(coral->themis cc xian)`,
`designinproduct/docs/mail/`, 2026-09-24.

**The caveat, requested to be kept standing, not one-time:** the
unqualified slogan is stronger than what's literally true. One Job
does want data — shape-of-use metadata, activation/retention counts.
What it doesn't want is *content*. That's the distinction covenant 7's
privacy-ethos amendment already draws carefully ("we measure the shape
of use, never the content of it"). Fine as a gut-level tagline;
anywhere it needs to survive scrutiny (a privacy policy, a page read
closely), it needs the shape-vs-content qualifier nearby so it isn't
overpromising something that has to be walked back later. Xian's own
words: "keep me honest, very much so" — recorded here as a standing
ask, not a one-off correction.

## 10. Also captured this window, adjacent

- **PRICING.md, item 7**: encrypted-at-rest and encrypted-in-export,
  as a potential pro feature distinct from item 2's multi-device E2E
  sync — protects a lost device or an exported file even with no sync
  involved at all.
- **COHORT-ROSTER.md**: the real recruiting inventory as of 2026-09-23
  (Rich Frankel, Sam Spieth, Steve Portigal named; Ted Nadeau and
  Teresa Klein's track fit left as open questions, not silently
  resolved).
- **USER-TESTING-PLAN-2026-09.md**: the two-track testing plan,
  restructured around independent dependency chains rather than a
  single sequential list — Track A (agentic) blocked on this
  conversation's subject maturing; Track B (regular) blocked on a
  recruiting plan that doesn't exist yet.

## What's still genuinely open

- Which of §5's cadence proposals, if any, Xian actually wants to try
- Whether single-deck export is worth building, or whole-backup export
  is good enough for now (unverified against current code as of this
  write-up)
- Whether/when (A), (B), or (C) from §7 become real roadmap items
  rather than named concepts
- The Pimento walk — next, once Themis's runbook is ready
