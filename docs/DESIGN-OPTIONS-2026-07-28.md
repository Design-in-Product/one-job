# Design options — searchable/browsable rooms, and multi-step undo

**Author:** Coral · 2026-07-28 · **Status:** DECIDED 2026-07-29 (Xian) —
see the decision record at the end; shipped the same morning.
Original options kept below for the reasoning trail. These are the two design-gated items in the agreed order after
beta week. Xian's instruction: recommend where the gestural grammar
points one way, lay out alternatives where the tradeoffs genuinely
differ. I've done both, and said which is which.

---

## How I'm reading the constraints

Four covenants do the deciding here:

1. **One card at a time, at every depth, forever.**
2. **Two gestures carry the system; new powers extend the grammar, they
   don't add chrome.**
5. **State is place.** If a status flag can be a location, it must be.
7. **The count is one or none.** Depth is felt, never tallied.

Covenant 2 is the sharp one for both features. Search and undo are, in
every other task app, *chrome*: a search bar, an undo stack. If we ship
either as chrome we've traded the thing that makes One Job itself for
two features nobody opens the app for. So the question I kept asking is
not "how do we add search / undo" but **"what existing gesture already
means this, and what would it mean at depth?"**

---

# Part 1 — Finding a card in the rooms

### What ships today

`ChainView` renders Done / Archive / Trash, gathering cards from every
depth with a parent breadcrumb. Vertical swipe **sifts**: down digs
deeper into the pile, up comes back, wrapping around. The hint reads
`{{n}} of {{count}} · swipe ↓ to sift deeper, ↑ to come back`.

### The problem, stated honestly

Sift is **O(n)**. Twenty-seven completed cards is twenty-seven swipes to
reach the last one, with no way to aim. Your real deck is 134 cards
across 32 decks; Done will outgrow sifting within weeks of daily use, if
it hasn't already. Sift is a lovely way to *browse* and a hopeless way to
*find*.

### The tension

Search, everywhere else, produces a **list of results** — which is
precisely the thing covenant 1 forbids. A results list is many cards at
once. So the design problem is: *how do you aim at a card without
rendering a list?*

### Option A — Search as a **filter on the pile**, not a view

Typing narrows *which cards the sift walks*. There is no results screen:
the room simply contains fewer cards, and the existing vertical gesture
walks them. Clear the query and the pile fills back in.

- **For:** invents no new concept; extends the grammar rather than
  adding chrome (covenant 2); one-card-at-a-time survives untouched; and
  it reuses the material language we already committed to for depth —
  the deck visibly *thins* as you type, which is the same felt-volume
  idea as R0.2's thickening. Search becomes a physical act on the deck.
- **Against:** no scent. You can't tell "did that narrow to 3 or 30?"
  without stepping through — and covenant 7 forbids just telling you.
  Mitigation: thinning IS the signal, if the thickness rendering is good
  enough. That's a real dependency on R0.2, not a throwaway.
- **Cost:** small. A query string filtering `flattenWithParent` entries
  before the existing sift index. No new components.

### Option B — Riffle / scrub (no typing)

Thumb along the deck edge riffles it fast, rolodex-style; release to
land. Already on the roadmap as R2.8 "riffle-to-jump."

- **For:** purely gestural, no keyboard on mobile, and the most *One Job*
  of the three — it's the physical-deck metaphor paying off.
- **Against:** still O(n) for the eye. Brilliant for "I'll know it when
  I see it," useless for "find the card about the dentist" among 200.
- **Read:** this is a **browse** answer, not a **find** answer. It
  complements A rather than competing with it, and it's already planned.
  I would not build it *instead of* search.

### Option C — The search result **is a deck** (a place)

Typing produces a temporary deck containing the matches. You navigate
into it exactly like any other deck — sift inside it, act on cards
inside it — and it evaporates when you leave.

- **For:** covenant 5 taken completely literally. A search is a place.
  It reuses every piece of deck machinery already built and tested, and
  one-card-at-a-time holds *inside* the result deck for free.
- **Against:** introduces an ephemeral-deck concept the model doesn't
  have yet, and it needs an answer to "where does it sit on the R2.1
  root canvas?" — which doesn't exist yet.
- **Cost:** moderate, and genuinely blocked on R2.1.

### Recommendation

**Build A now; design it so it becomes C later.** The grammar points one
way here and I'm fairly confident: A is C minus the place, so nothing
about A has to be thrown away when the canvas arrives and the filtered
pile can be promoted into a real ephemeral deck. B is a separate,
already-planned pleasure — worth having, not a substitute.

The one thing I'd want from you before building A: **what does the query
match?** Title only is predictable and cheap. Title + description finds
more but surfaces cards whose *visible face* doesn't contain the word,
which feels like the app lying. My instinct is title-first with
description as a later refinement, but that's a felt call, not a
technical one.

### ⚠️ A covenant-7 problem in shipped code, while we're here

The sift hint renders **`3 of 27`** — a tallied pile. Covenant 7 says the
count is one or none, and that depth is felt, never tallied. Three ways
to read it:

- It's fine: a Done-room count is a *trophy*, not dread — the covenant
  was written about the backlog.
- It's not fine in **Trash**, where "41" is exactly the dread the
  covenant guards against.
- It's not fine anywhere, and the position indicator should be felt
  (edge thickness above/below the current card) rather than numbered.

I genuinely don't know which you'll say, and it's cheap either way — so
I've flagged it rather than "fixed" it. It also matters *now*, because
whatever we decide is the same signal Option A leans on for its scent.

---

# Part 2 — Multi-step undo

### The insight I'd start from

**The chain already IS undo for the biggest action, and it's better than
an undo stack.** Completing a card doesn't need a time-travel stack —
because state is place, the card is *in the Done room*, and un-completing
is walking it home. That's reversal that never expires, doesn't depend on
a toast still being on screen, and requires no history to be recorded
anywhere.

So the real question isn't "add multi-step undo." It's: **which actions
lack a place-based reversal?**

| Action | Reversible today? | How |
|---|---|---|
| Complete | ✅ permanently | It's in Done; walk it home |
| Archive / Trash | ✅ permanently | It's in that room; walk it back |
| **Defer** | ⚠️ 5s only | Toast undo; after that the ordering is just… gone |
| **Move-into / promote** | ⚠️ manual | Reversible only by doing the inverse move by hand |
| **Edit text** | ❌ | No reversal at all |
| **Import** | ⚠️ partly | Lands in an `import-N` container you can delete |
| Purge | ❌ **by design** | The one destructive act; button + confirm |

That table is the actual scope. It's smaller and more specific than
"multi-step undo," and three of the four gaps are *ordering and
structure* — not content.

### Option A — Deepen the toast (undo stack behind the toast)

Keep undo where it lives; let it go back more than one step.

- **For:** cheapest possible; no new surface.
- **Against:** it's still bound to toast lifetime, still invisible, and
  it **collides head-on with Item 16** (quiet mode) — which is already
  documented as blocked on exactly this decision. Making the toast carry
  *more* weight makes the quiet-mode problem worse, not better.

### Option B — Undo as a **place**: a "Recent" room

A fourth room alongside Done / Archive / Trash holding the last N
actions, each shown as a card you can put back. Same sift grammar as
Part 1 to walk it.

- **For:** covenant 5 again — history becomes a location rather than a
  timer. It survives quiet mode, which **unblocks Item 16**. It's
  browsable with the gesture we're already sharpening in Part 1. And it
  covers every row in that table with one mechanism.
- **Against:** it's a genuinely new surface, and — the part I'd want you
  to chew on — **an action card is a new species of card.** Every card in
  One Job so far is a *thing to do*. A card that represents "you moved
  Foo into Bar at 4:15" is a different kind of object wearing the same
  clothes. That might be a lovely unification or a category error, and
  I don't think I should decide that one.
- **Cost:** moderate; the room shell and sift already exist.

### Option C — Snapshot rewind (coarse time travel)

The store already writes a dated snapshot on **every save** and keeps 7.
Expose "put the deck back the way it was before X."

- **For:** nearly free and already tested — this machinery is live.
  It's the only option that covers a bulk mistake (a bad import) in one
  move.
- **Against:** it's **whole-deck**, so restoring also discards unrelated
  good work done since. That is a destructive act wearing an undo label,
  and it runs straight into the destructive-action protocol.
- **Read:** valuable, but **not as undo**. It's a *safety net*, and it
  should be framed and gated like one — with the protocol's staging
  (verify by observation before replacing anything).

### Recommendation

**B, with C behind it and explicitly not called undo.** B is the option
that fits the covenants rather than fighting them, and it has a
concrete second payoff: it retires the Item 16 blocker, which has been
sitting open since 07-05 precisely because undo lives in a toast.

The thing I'd genuinely like your read on is the **action-card species
question** in B. If action-cards feel wrong, there's a variant worth
considering: the Recent room shows the *affected task cards* (the real
ones) with a "put it back" action, rather than abstract action cards.
Less expressive — you can't distinguish two different things done to the
same card — but it keeps every card in the app a genuine task.

---

## What I'd need from you to start building

Small, in priority order:

1. **Part 1:** title-only match, or title + description?
2. **Part 1:** the `3 of 27` covenant-7 call — keep, trash-only, or make
   it felt?
3. **Part 2:** does the "Recent" room hold **action cards** or **task
   cards with a put-back**?

Everything else I can take from here. None of this is blocking — the
beta week and the R1 trust gate come first, and I'd rather not have a
half-built search competing for your attention while you're reading
whether the chain feels safe.


---

# DECISION RECORD — Xian, 2026-07-29 (shipped same morning)

1. **Search matches title + description** ("cheap and good"). Built as
   Option A — a filter on the pile, no results list, shown from a pile
   of 6 up so small piles stay pure sift.
2. **Covenant 7:** *felt* in the Trash — no tab count, no "n of m",
   depth as capped edge bars under the card. Done keeps its count
   (trophy, not dread).
3. **No action-cards.** The Recent-room idea is retired; his sharper
   frame replaced it:
   - Undo's main use is *immediately after a mistake* → **shake to get
     an undo prompt** (iOS at least) + **Undo leads the hold-menu**.
   - History is worth keeping if cheap → **session-deep undo stack**
     captured at the store's save choke point (undoes anything,
     including a whole-deck import). No big undo UI.
4. **Fussiness principle** (new, governing): retrieval/management is
   real but *secondary* — never lead people into procrastinating by
   playing with the taxonomy of past tasks.
5. **Don't over-perfect Done/Archive/Trash** before integrations and
   real users teach us what they need.
6. **Funnel goals**: Done stays skimmable via housekeeping to Archive
   after **30 days** (set 2026-07-29; shipped same day — threshold is a
   paid-tier-setting candidate, his note); Archive may become
   export/agent-fodder rather than UI; Done→Trash may become a first-
   class path; **trash is not protected** — one-tap swipe delete, bulk
   empty, excluded from backups. (The last group shipped 2026-07-29.)
7. **Aesthetic:** age/size as subtle hints; capture totals in data,
   never render them as dread (deferralCount stays data-only).
