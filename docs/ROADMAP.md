# One Job — Roadmap

**Author**: Coral · 2026-07-03 · **Status**: DRAFT for Xian's review —
this is a proposal, not a decree. Supersedes the tier sketch in
BIG-PICTURE-2026-07-03.md. Companion docs: DOMAIN-MODEL.md (what we're
building toward), DEPENDENCIES.md (why this order), VISION-2026-07.md
(source material).

**Ordering principle** (Xian): Gall's law, Cunningham-style — a complex
system that works evolves from a simple system that works; do the
easiest thing that could possibly work first. Applied here: every release
must leave the app *more* trustworthy for daily use than the last, and
no stage builds on an unproven stage.

**Release gate discipline** (unchanged from the big-picture review):
1.0 is declared when **Xian trusts it with a real week** — and each
later stage has an equivalent felt-trust gate, not a feature count.

---

## R0 — Trust for daily use (finish 1.0) — NOW

The app is Xian's daily driver as of 07-03; these are the holes real use
has already found. All are small, none touch the concept model, all pay
off immediately.

| # | Item | Source |
|---|---|---|
| R0.1 | **Undo toast** after complete/defer (5s window, one tap) | audit gap 1 |
| R0.2 | **Deck-depth signal** (design call needed: number vs. suggestion) | audit gap 4 |
| R0.3 | **Portal crispness pass** — kill the "swimming in an ill-fitting frame" feel (background/theme-color/overscroll/dvh suspects listed in Vision Item 9) | Item 9a |
| R0.4 | Xian's odd-behavior reports as they land | testing |
| R0.5 | iOS TestFlight + Android internal track (in motion, human-gated: Cowork Phase 4, keystore) | store track |

*Deliberately absent*: delete-task UI and un-complete. In the old plan
these were R0 patches; the domain model makes them fall out of the
lifecycle chain (R1.2) as *one* coherent feature instead of two bolted
switches. Undo (R0.1) covers the accident-recovery need meanwhile —
that's the easiest thing that could possibly work.

## R1 — The concept model lands (1.x series)

Rebuild the core around the domain model, one proven step at a time.
This is the Gall sequence: each sub-stage is shippable and the app works
after each.

| # | Item | What changes |
|---|---|---|
| R1.1 | **Recursive cards** — card interior = canvas with a deck; subtasks are cards; migrate `Substack` data (each old substack's tasks become interior cards; names preserved in migration notes) | Items 1, 8, 10 |
| R1.2 | **Lifecycle chain** — Done/Archive/Trash as system decks with advance/regress gestures; provenance (home-deck memory); un-complete and delete arrive here for free | Items 2, 10 |
| R1.3 | **Store schema v2** — deck-membership-as-state, provenance fields, versioned migration from v1 (13-test suite extended before the migration ships — RED ZONE) | domain §7 |

Gate: the chain feels *safe* — a week of real use where no card is ever
lost, stranded, or unrecoverable.

## R2 — The spatial layer (the app becomes the vision)

| # | Item | What changes |
|---|---|---|
| R2.1 | **Root canvas** — multiple top-level decks side by side; system decks have a place; pan between decks | Item 3 |
| R2.2 | **Zoom continuum** — canvas ⇄ deck ⇄ card-fills-the-phone; pinch navigation; deck-is-the-UI mode | Item 6 |
| R2.3 | **The table surface** — design the dead space (empty/black/white/reflection/abstract); same material as the canvas | Item 9b |
| R2.4 | **Discoverability dissolve** — arc menu items find homes on the canvas (Settings/Integrations); menu may remain as shortcut | audit gap 6 |

Gate: navigation needs no menu for daily flow; a new user finds
Completed by *looking around*, not by long-pressing.

## R3 — 2.0: the experience layer (federation)

Import first, then sync — in that order, per Item 11. Each source lands
read-only before any source earns write access.

| # | Item | What changes |
|---|---|---|
| R3.1 | **Source adapter seam** — formalize `SourceAdapter` on top of the TaskStore seam; provenance carries `{service, externalId, mapping}` | Item 11 |
| R3.2 | **First import (one service, read-only)** — pick the one Xian actually uses; imported cards land in a source deck on the canvas | Item 11.1 |
| R3.3 | **Mapping store** — bidirectional id/field mapping as a first-class, inspectable artifact | Item 11.3 |
| R3.4 | **Two-way sync (one service)** — complete-in-One-Job closes the source task; the One Job overlay (deck order, interior structure, history, lifecycle placement) never flattens into the source | Item 11.2 |
| R3.5 | **Multi-source federation** — Asana + Trello + Todoist side by side, normalized into the one paradigm | Item 11.4 |

Gate: Xian (or his employer's tool) runs a real project where One Job is
the *only* surface he touches daily, and nothing in the source system is
ever corrupted or surprised.

## R4 — The agentic layer

| # | Item | What changes |
|---|---|---|
| R4.1 | **MCP inbox** — agents deal cards into a per-user inbox; the phone pulls; status events flow back (MCP-DESIGN.md's model, its 4 open questions answered by then-real R3 infrastructure — an agent is just another source) | MCP memo |
| R4.2 | **Piper Morgan as first agent client** — deals cards into Xian's deck; the family dogfoods the protocol | Item 12 |
| R4.3 | **Text-entry relief** — capture via share-sheet/voice/agent so typing on cards stops being the bottleneck | Item 4 |

Gate: an agent-dealt card is indistinguishable in feel from a
hand-written one, and no agent can ever reorder your deck.

## The fun shelf (no stage, pull when joy demands)

- Custom card backs: upload-your-own (discreet watermark) + playing-card
  generator (Item 7)
- Flip-preset settings, deck themes, haptic tuning
- Localization files (i18n plumbing already done)

## Parallel track (human-gated, any time)

- iOS TestFlight → App Store (Cowork Phase 4 under co.onejob.deck)
- Android keystore → internal testing → Play listing
- Landing page CTA flip / public invitation — *after* the R1 gate, when
  strangers can trust it too

## Explicitly retired

- Push-export "integrations" framing (Zapier-outward) — reversed by the
  experience-layer thesis; the Integrations view becomes the door to
  R3 sources.
- Backend-required deployment path as a mainline concern (Render
  stands by for R3/R4 server needs; nothing before that needs a server).

---

*Next action on this document: Xian reviews the ordering, especially the
R0 scope and the R1.1/R1.2 sequence. Then REQUIREMENTS.md gets
re-baselined to match, and REQUIREMENTS FR2 (substacks) is rewritten
against the domain model.*
