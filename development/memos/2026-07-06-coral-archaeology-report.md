# Repo Archaeology Report — lost experience & delight ideas

**Coral · 2026-07-06 · prompted by Xian**: "I feel [the aging cards]
was discussed somewhere in the life of the project... there could be
other experience/delight ideas we've lost."

## Method

Full-history sweep: `git log --all -S` for material/delight terms;
deleted-file listing; complete reads of `development/archive/` (the
2025-08 pivot handoffs) and every recoverable session log, including
strata not present in today's tree.

## Finding 0 — the aging cards themselves: NOT in the repo

No mention of aging, yellowing, or patina exists anywhere in history
before yesterday's Item 22. The nearest yellow-relatives (below) are a
defer-tint and a sparkle. If it was discussed, it was in conversation
outside the repo — which is itself a finding: **spoken delight ideas
had no landing place before the vision doc existed.** Item 22 is now
the canonical capture.

## Finding 1 — a LOST STRATUM: the November 2025 polish session

Between the August 2025 stall and the July 2026 resurrection there was
a **2025-11-15 "frontend polish" session** whose session logs were
never carried forward (recovered from commit `4e122fd`). Its components
were replaced wholesale by the 2026-07-01 mechanics rebuild, and with
them these ideas silently vanished:

| Lost idea | Status today | Worth reviving? |
|---|---|---|
| **Full dark mode** across every component | Light-only | Yes — table stakes for stores; fun-shelf candidate |
| **Search (Cmd/Ctrl+K)** — a whole SearchBar with keyboard nav, breadcrumbs, staggered result animation | No search exists | Philosophy question: search cuts against one-card focus, but a deep deck may need it (canvas era?) |
| **Keyboard shortcuts** — ⌘K search, ↑↓ navigate, **M opens the menu** | None | M-for-menu is cheap and aids desktop use + discoverability |
| **Empty-state floating sparkles** (yellow 3s / blue 4s / purple 3.5s staggered loops + pop-in star) | Static empty state | Pure delight, nearly free |
| **Skeleton loader with shimmer** | Plain "Loading…" text | Cheap perceived-performance win |
| **Designed error state** (spring icon, reload button) | Plain error text | Small trust win |
| **Swipe tint overlays** — green/yellow 10% wash + icon at 70% threshold + dynamic border | Hint pills only | Alternative feedback vocabulary; compare on device |
| **Pulsing dot on external-source badges** | Static badge | Charming for the R3 federation era ("live" sources) |
| **Breadcrumb component** (nested navigation trail) | None | Canvas-era relevant (where am I in the recursion?) |

## Finding 2 — the original Card Deck spec's unbuilt intentions (2025-08-06)

From `HANDOFF_CARD_DECK_IMPLEMENTATION.md` (the pivot handoff quoting
Xian's original spec):

1. **"Tap Face-Up: Expand to detail view — full viewport expansion"** —
   the spec wanted the card to EXPAND, not open a modal. We built a
   Dialog. This is the same instinct as Item 6 (card fills the phone)
   and yesterday's Item 23 language ("the back expands into the
   screen") — **the expansion was in the founding spec and got lost as
   a modal.** Strong candidate to honor when the zoom continuum (R2)
   is built: details = zooming INTO the card.
2. **"Ceremonial interaction"** — intentional tapping as ritual; named
   as a core principle. Alive in spirit; worth keeping as design
   vocabulary.
3. **"Card takes 80–90% of viewport real estate"** — Item 6's ancestor.
4. **"Done Stack Toggle"** — superseded (better) by yesterday's chain.
5. **Random flip variations** — alive (4 presets, randomly chosen).

## Recommendations (no action taken — shelved for prioritization)

- Added to the **fun shelf**: sparkle empty state, skeleton shimmer,
  M-for-menu, swipe tint overlays (device A/B vs. current pills).
- Added to **R2 design inputs**: details-as-expansion (founding spec),
  breadcrumbs-as-place-trail, search-vs-philosophy question.
- Added to **store-readiness list**: dark mode (also an OS-level
  expectation on iOS).
- Process fix already in force: the vision doc is the landing place
  spoken ideas never had.
