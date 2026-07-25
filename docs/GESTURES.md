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

## Open questions for Xian

1. **App menu trigger** — comfortable with "hold the deck / empty space
   → app menu (Add · Completed · Integrations · Settings)"? Or would you
   rather app-nav sit behind one visible button and reserve *all* holds
   for card actions? (I lean hold-the-deck; it keeps the screen clean
   and is true to the principle — the deck is an object with actions.)
2. **Chain-room cards** — give them the same card-hold menu (restore /
   move / delete-forever) for consistency, or leave the rooms with just
   their swipe grammar + the purge button they already have?
3. **Default tap on a face-up card** — keep it as "open to read," or is
   there a different default you'd expect from a single tap now?
4. **The "+" vs hold-deck redundancy** — keep both (express lane + full
   menu), as proposed? Or does the always-visible plus make the
   "Add a card" row in the deck menu redundant enough to drop?

Once you react to these, blocker 1 is fully specified and I build it
test-first. The add-affordance change (small centered plus everywhere)
is already decided and unambiguous — I can ship that immediately as the
first concrete step while the menu design settles, if you'd like.
