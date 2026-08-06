# One Job — Gestural Grammar

**Started**: 2026-07-25, Coral, at Xian's request — "spend a little time
exploring our gestural mapping so far and see if we can rationalize
this," before building the per-card action menu (MVP blocker 1).

Status: **audit + proposal, for Xian's reaction.** No code changed yet.

## The organizing principle (Xian)

> To **tap-and-hold** on an object is to say you want to do an action
> *to that object* — so the object should reveal what actions it can do.
> To **tap** an object typically means: do the object's *default*
> action.

Everything below is measured against that spine. A third verb is already
core to the app and folds in cleanly:

> To **swipe** a card is an *express lane* for its most common action —
> the one or two things you do so constantly they deserve a shortcut.

So: **tap = default · hold = reveal all actions · swipe = express the
common ones.** Three verbs, one coherent story.

## What we actually have today (accurate inventory)

| Object / context | Tap | Tap-hold | Swipe |
|---|---|---|---|
| Card, face-down (deck top) | **flip to reveal** | — (hold hits the *deck*, below) | — |
| Card, face-up (deck top) | **open details (read)** | *(none on the card — see note)* | R = done · L = defer |
| Card, in a sub-deck | open details (read) | **nothing** | R = done · L = defer |
| Card, in a chain room | nothing | nothing | R/L = chain move · ↑/↓ = sift |
| The deck / background | — | **app menu** (Add · Completed · Integrations · Settings) | — |
| The "+" button | add a card | — | — |

**The one incoherence, and it's the whole of blocker 1:** tap-hold is
currently bound to the *deck/background* and reveals *app navigation* —
not to a *card* revealing *its* actions. And it only works at the top
level. Under the principle, that's backwards: holding an object should
surface *that object's* actions, at any depth.

## The rationalized grammar (proposal)

The fix is to stop conflating two different objects. A **card** is one
object; the **deck/table** is another. Each gets its own hold-menu.

### On a CARD — tap-hold reveals the card's actions (at any depth)

The per-card menu is simply the card's full action set. Swipes stay as
express lanes for the two commonest; the menu is the superset that also
holds the rarer ones:

- Complete *(also swipe →)*
- Defer *(also swipe ←)*
- **Promote** — pop up to be a peer of its parent *(blocker 1)*
- **Move into…** — drop into another card's sub-deck *(blocker 1)*
- Open sub-deck *(if any)*
- Edit
- Delete

Mental model for the user: **swipe for the two you do all the time; hold
to see everything you can do to this card.** Same gesture, every depth —
which also closes blocker 1's "hold only works at the top level."

### On the DECK / table — tap-hold reveals deck-level actions

The current arc menu isn't wrong, it's just mis-triggered. Its contents
are *table* actions, not *card* actions: Add a card, view Completed,
Integrations, Settings. So it stays — reached by holding the **deck /
empty space**, not any card. Holding a card can never again mean "open
Settings."

### Tap stays "the safe default"

A single tap never mutates state. Face-down card → reveal. Face-up card
→ open to read. That's already true and it's correct — stateful actions
(complete/delete/promote) require either a deliberate swipe or a pick
from the hold-menu, never a stray tap.

### The "+" is the express lane for the deck's commonest action

Creating a card is to the deck what "done" is to a card: the thing you
do most, so it earns an always-visible shortcut. **Decision (Xian,
07-25): the add affordance is a small centered "+", consistently —
never the long wide button, never off in the right corner.** Same plus
on the main deck, the empty state, and inside every sub-deck. (It
coexists with "hold the deck → Add a card"; the plus is just the
express lane, exactly parallel to swipe-vs-hold on a card.)

## How the four MVP blockers sit in this grammar

1. **Promote / demote + per-card menu at any depth** — *is* the
   card-hold menu above. Promote and Move-into are two of its rows.
   Demote target = a hierarchical outline picker (Xian: drag to any
   level, not just peers; "whatever functions for now is okay").
   Promoted card lands **newest-on-top** of its new deck (confirmed).
2. **Face-up on sub-deck exit** — not a menu item; a navigation rule:
   the card you land on is face-up on arrival (turns itself face-up if
   it wasn't). The existing "a face-up card eventually turns back over"
   touch stays — it just always greets you face-up. (Confirmed.)
3. **Sub-deck visible from the parent** — MVP: the unfinished-count
   badge on the card face becomes **tappable → opens the sub-deck**, no
   edit step. Back-of-card mini-deck is the later, more skeuomorphic
   form. (Confirmed "good enough for now.")
4. **Import as sub-deck** — a deck/table action, lives in the deck-hold
   menu and/or Settings. **Never default to anything destructive
   without affirmative confirmation** (Xian) — so "replace my deck"
   (restore) always confirms; "import as a new sub-deck" is the
   non-destructive path and the safer default. Receiving card = the
   active/top card for now; a picker is a 2.0 concern.

## Resolved with Xian (2026-07-25)

The design principle, in his words:

> Objects reveal their affordances on **introspection** (long tap); the
> interface provides **custom-designed elements** for the happy-path /
> flywheel experiences.

That's the whole grammar in one line: hold to introspect anything;
hand-built shortcuts (swipe, the +) for the moves you make constantly.

1. **App menu = hold the deck / empty space.** Confirmed. Holding a
   card never opens Settings.
2. **Lifecycle-room cards** (Done/Archive/Trash — Xian didn't know my
   "chain-room" jargon, fair): **still open** pending his call, but
   Coral's lean and the consistency principle both point to *yes, give
   them the same hold-menu* (Restore / Move / Delete-forever). Awaiting
   his confirm.
3. **Single tap unchanged** — face-down → reveal, face-up → open/read.
4. **Keep BOTH the + and the hold-menu.** Confirmed, on the principle
   above — the + is a custom flywheel element, the menu is introspection.

### Litmus test (Xian, 2026-07-25)
> "Would a person expect this gesture to do something?" If yes, it should.
Applied to every card at every depth — the reason the hold-menu now works
in sub-decks, not just the top level.

### Shipped 2026-07-25
- **Add affordance = one small centered "+"** — retired the wide
  "Add New Task" button (TaskForm now shows a centered circular plus)
  and moved the deck FAB from bottom-right to bottom-center; removed the
  redundant second add button from the empty state. Verified on the web
  surface (populated + empty). This is the first concrete step; the
  per-card hold-menu (blocker 1 proper) follows once #2 is confirmed.

### Shipped 2026-07-29 — trash is not protected; undo joins the grammar

Xian's calls (message of 2026-07-29):

- **Right-swipe in the Trash = delete forever, one tap, no confirm.**
  The chain grammar already means "right advances the afterlife"; for a
  trashed card, advancing is out of existence. The two deliberate moves
  that put a card in the trash ARE the confirmation. The only confirm
  left in the room is **Empty trash**, because it is bulk.
- **Backups exclude the trash** — a restore never resurrects what was
  already thrown away.
- **The trash never counts itself.** No count on the tab, no "n of m"
  in the sift hint — depth is a felt pile (edge bars under the card,
  capped at 6: the asymptote is the point). Done keeps its count; a
  Done number is a trophy, a Trash number is dread (covenant 7).
- **Search is a filter on the pile, not a results view** (rooms, from a
  pile of 6 up): typing narrows what the existing sift walks, matching
  title AND description; one-card-at-a-time survives untouched.
- **Undo enters the grammar twice:** an **Undo** entry leads the
  hold-menu (mistake recovery is time-sensitive; the rest of that menu
  is navigation), and **shaking the phone** asks "Undo last action?" —
  asks, because a shake can be an accident. Session-deep history behind
  both: every mutation is undoable back to session start, including a
  whole-deck import. Cross-session recovery stays with the dated
  snapshots.

### Shipped 2026-07-29 (evening) — R2.1 stages 1–3

- **The root is a deck** (schema v3, invisible migration, rc.16).
- **Decks…** in the hold-menu (rc.17) — only when a device has >1 deck
  or a pro grant; names, no counts. Creation is the sole pro-walled act.
- **"Move to another deck…"** on a TOP-LEVEL card's hold-menu (rc.18)
  when another deck exists — promote-at-top gaining its meaning: pop at
  the top of the tree moves sideways. Lands on TOP of the target
  (newest-on-top). Nested cards still promote one altitude at a time.
- **The block is the reveal at any depth** (rc.18, item 7): a refused
  completion descends the whole path to the nearest open card, through
  completed intermediates — you are shown the blocker, not told about it.

### Shipped 2026-07-29 (night) — the pan (R2.1 complete)

Grab any non-card space and pull sideways: the strip pans — decks in
order, the afterlife past the last one, home again rightward. The card
keeps its own horizontal grammar untouched: the pan arms only from
pointer-downs outside the card (disambiguation by target, same trick as
the two hold menus). Peeks remain as tap targets and affordance.
E2E-pinned collision rule: a drag starting ON the card completes/defers
the card and never pans the strip.

### Shipped 2026-07-30 — inchworm walk (R2.7)

Deck hold-menu → **Inchworm walk**: the active deck's whole tree as one
stack, **leaves first** (post-order). The order is the insight: Item 15
already forbids completing a parent over open children, so the inchworm
eats the tree bottom-up — by the time a parent surfaces, its interior
is done, and the walk almost never hits a block. Each deep card wears
its ancestor trail ("in Ship it › sub"). Scoped to the active deck:
decks are places; inchworm flattens depth, not place. Toggle off any
time; a device preference, never data.

### Shipped 2026-08-06 — deck identity (Xian's design session)

With more than one deck, each deck owns its look: **name first** at the
top of the back (the eye's landing point — his call), a **hue per deck**
from a curated family (the red-deck/blue-deck move; deck-1 keeps the
full brand gradient forever), "One Job" receding to a quiet wordmark.
Face-up, the card's **margin takes the deck hue at ~50% saturation**
(4px) with a small eyebrow name — the back's cream-margin idea on the
reading side, so the object stays "of its deck" both ways. **Peeks
inherit the hue**: the 14px sliver tells you what's next before you
pan. Hue is DECK DATA (same on every device, in every backup); system
rooms never take user hues; single-deck users see the classic back —
no cruft till it's needed.
