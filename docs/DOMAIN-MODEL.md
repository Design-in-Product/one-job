# One Job — Domain Model

**Author**: Coral · 2026-07-03, baselined 2026-07-04 after Xian's review
("your reflections are apt") · distilled from docs/VISION-2026-07.md
(fourteen vision items) plus the shipped 1.0 codebase.
**Status**: BASELINE. This is the concept model the code converges on;
where today's code differs, the difference is noted.

## The one-sentence model

A **canvas** holds **decks**; a **deck** holds **cards**; every card's
interior is another canvas — and you only ever face one card at a time,
no matter how deep you are.

## 1. Card

The atomic unit. A card has:

| Property | Notes |
|---|---|
| `id` | stable identity across all movement |
| `title`, `description` | the face; text sized-to-fit (Item 5) |
| `provenance` | home deck (for return from Done) + external source link (for federation) |
| `history` | createdAt, completedAt, deferredAt, deferralCount |
| `interior` | a canvas — empty until the first subtask is added |

**A card is a container** (Item 8). Creating a subtask creates a card
within a card: the flipped card's face becomes a canvas holding a
smaller deck, seeded with that one subtask. Recursion is unlimited.
There is no separate "subtask" type — a subtask *is* a card, with all
the same mechanics (Item 10). One-card focus holds at every depth.

A card does **not** have a status field in the domain model. Its
lifecycle state is *where it is* — which deck it sits in. (Code today:
`completed: boolean` + backend `status`; both become derivable from
deck membership.)

**"In progress" is emergent, not stored** (Item 14, Xian's own
resolution): a card is binary — done or not — at leaf level, always. A
card whose interior holds unfinished cards *is* in progress: it comes
back to the top of the deck and you see the remaining work. The
containment tree already knows; no third state exists.

## 2. Deck

An ordered stack of cards; the top card is the one job. There are
exactly **two kinds** (Item 10), identical in presentation, distinct in
concept:

### 2a. User decks (working decks)

The decks you create: top-level decks on the root canvas ("Work,"
"Health"…) and the deck inside every card. **Uniform mechanics at every
depth:**

- **Swipe right** → complete: the card leaves for Done (carrying
  provenance).
- **Swipe left** → defer: the card goes to the bottom of *this* deck.
  (Left never means "up a level" here — above a top-level deck is only
  the canvas, and cards don't live on canvases; decks do.)
- **Tap** → flip / open the card.
- **Swipe up** *(reserved, undesigned)* → promote a card up one level
  (Item 8; explicitly not designed yet).

### 2b. System decks (lifecycle decks — Xian's "afterlife decks")

A small, fixed, system-owned chain that every user deck at every depth
drains into:

```
                    right →        right →        right →
  [any user deck] ─────────▶ DONE ─────────▶ ARCHIVE ─────────▶ TRASH (→ purge)
                             ◀─────────      ◀─────────
                              ← left          ← left
                            (returns home
                             via provenance)
```

- **Right always advances** a card along the chain; **left always
  regresses** it. Same two gestures, meaning supplied by location
  (Item 2).
- Left from Done returns the card to its **home deck** (provenance),
  not to a generic top deck — confirmed by Xian.
- System decks are **not part of the recursion**: a card's interior
  contains user decks only. They are convergent — one Done for
  everything, whatever depth it came from.
- Naming per prior art (offered): IMAP special-use mailboxes (RFC
  6154), system vs. user folders. This doc uses **system decks**.

Open questions (parked for discussion): does Trash purge on a timer or
manually? Does a completed parent's interior (unfinished sub-cards)
travel with it to Done?

## 3. Canvas

A surface on which decks sit, side by side (Item 3). Two places it
appears:

- **The root canvas**: holds all top-level user decks plus the system
  decks. Zoom out to see it; swipe across it to move between decks;
  zoom in to focus one.
- **Every card's interior**: same surface, one level down. Initially
  empty; first subtask creates its first deck.

Whether an interior canvas can hold *multiple* decks (that would be the
old "substack" as a rare power feature — Item 1 says "worry about it
later") is deliberately unresolved. The model permits it; 
the roadmap doesn't promise it.

## 4. The zoom continuum (Items 6 + 9)

One spatial scale, three landings:

```
root canvas (all decks) ⇄ one deck framed ⇄ the card fills the phone
```

At maximum zoom the deck **is** the UI — the phone in your hand is a
pack of cards, not a screen depicting one. Pinch out and the deck is
revealed sitting on the canvas. The dead space around a 5:7 card on a
~19.5:9 phone is a *designed surface* — "the table the deck sits on" —
material not yet chosen (empty/black/white/reflection/abstract, Item 9).
The same surface, seen close, is the table; seen far, it's the canvas.

## 5. Gesture grammar (summary)

| Gesture | In a user deck | In a system deck | On the canvas |
|---|---|---|---|
| Swipe right | complete → Done | advance along chain | — |
| Swipe left | defer to bottom | regress (Done → home) | — |
| Tap | flip / open card | flip / open card | zoom into deck |
| Swipe up | *(reserved: promote)* | — | — |
| Pinch / back | zoom out one level | zoom out | pan between decks |
| Long press | menu (today's arc; may dissolve into the canvas) | | |

Design invariant: **horizontal = fate, vertical = hierarchy, zoom =
attention.** New capabilities should extend the grammar, not add
buttons.

## 6. Provenance and the source layer (Item 11, 2.0)

Provenance has two faces on the same card:

- **Internal**: the home-deck path — what makes un-done return a card
  home. Exists the moment lifecycle decks exist.
- **External**: the source link — `{ service, externalId, mapping }`
  for cards federated from Asana/Trello/Todoist/agents. One Job is an
  **experience layer** over already-chosen backends: import first, then
  two-way sync; metadata normalized *in*, mapping preserved *both
  ways*; One Job's value-added concepts (deck order, deferral history,
  interior structure, lifecycle placement) live in an **overlay that
  sync must never flatten** into the source.

A key unification: an **agent dealing a card** (MCP inbox) and an
**imported Asana task** are the same domain event — a card arriving
with external provenance. One seam serves both (see ARCHITECTURE.md).

## 6b. Actors and assignment (Item 14, far horizon)

**Decks belong to actors.** The human owns theirs; a known agent
("Pard," "Carl") can own one too. **Assignment = dealing a card onto
another actor's deck** — the same move-between-decks mechanic as
everything else; "state is place" extends to *whose* place. The card
stays visible on the human's deck while assigned (delegation reads as
"the inside of this is in someone else's hands" — the same visual
language as an unfinished interior). Completion events flow back, and
the card advances exactly as if the human had swiped it. Inbox
(agent→human) and dispatch (human→agent) are the two directions of one
card-dealing protocol.

## 7. What this supersedes

| Today (code) | Domain model |
|---|---|
| `Substack { name, tasks[] }`, one level deep, mandatory door to nesting | card interior canvas + user decks; recursion; naming optional/rare |
| `completed: boolean` / backend `status` | deck membership (Done is a place) |
| `CompletedTasksView` (display-only dead end) | Done as a system deck with the chain gestures |
| No delete UI | Trash as the far end of the chain |
| Long-press arc menu as sole navigation | canvas as the place views live (menu may remain as shortcut) |
| `source`/`externalId` vestigial fields | provenance, first-class |

## 8. Invariants (the things that must stay true)

1. **One card at a time** — at every depth, in every deck kind.
2. **Two gestures carry the system** — location gives them meaning.
3. **Cards belong to decks; decks sit on canvases; a card contains a
   canvas.** No other containment exists.
4. **State is place.** No status enum drives behavior that deck
   membership could.
5. **The One Job layer is preserved value** — no sync, import, or agent
   may flatten deck order, interior structure, or history into a
   connected service's shape.
6. **Local-first**: the device owns the deck; everything remote is an
   adapter at the store seam.
7. **An update never costs the user their data** (Item 13). Every save
   is snapshotted; loss paths restore, corruption quarantines; schema
   changes migrate and round-trip through backup — or they don't ship.
