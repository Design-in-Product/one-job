# One Job — Roadmap

**Author**: Coral · 2026-07-03 · **Status**: BASELINE — converged with
Xian 2026-07-04 ("I'm ready for convergence if you are!"). Supersedes
the tier sketch in BIG-PICTURE-2026-07-03.md. Companion docs: VISION.md
(the distillation), DOMAIN-MODEL.md (what we're building toward),
DEPENDENCIES.md (why this order), VISION-2026-07.md (capture record).

**Ordering principle** (Xian): Gall's law, Cunningham-style — a complex
system that works evolves from a simple system that works; do the
easiest thing that could possibly work first. Applied here: every release
must leave the app *more* trustworthy for daily use than the last, and
no stage builds on an unproven stage.

**Release gate discipline** (unchanged from the big-picture review):
1.0 is declared when **Xian trusts it with a real week** — and each
later stage has an equivalent felt-trust gate, not a feature count.

**HARD GATE (added 2026-07-05 after the first real data loss):** no
public invitation, store listing activation, or landing-page CTA while
the backup story is unproven on a real device. A backup path counts as
proven only when its success signal reports an OBSERVED outcome (share
sheet resolved, clipboard write resolved, download event seen) and the
restore half has been exercised on-device. Losing a user's deck once is
a bug; inviting users before the backup story is trustworthy would be a
choice.

---

## R0 — Trust for daily use (finish 1.0) — NOW

The app is Xian's daily driver as of 07-03; these are the holes real use
has already found. All are small, none touch the concept model, all pay
off immediately.

| # | Item | Source |
|---|---|---|
| R0.0 | **Data durability** — ✅ safety net (snapshots/quarantine/restore, 07-04); ✅ backup-age nudge (07-04); ✅ honest export: share-sheet + clipboard copy/paste paths, outcome-verified toasts (07-05, after real data loss); remaining: on-device proof of the share-sheet path (Xian), export-location hint | Item 13 🔴 |
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
| R1.2 | **Lifecycle chain** — Done/Archive/Trash as system decks with advance/regress gestures; provenance (home-deck memory); un-complete and delete arrive here for free. *Amended 2026-07-07 (Xian-approved, shipped in rc.7): rooms gather cards from EVERY depth with a parent breadcrumb — completed interior work was invisible everywhere, the "nothing shows up in Done anymore" trust bug* | Items 2, 10 |
| R1.3 | **Store schema v2** — versioned envelope, substacks become named interior decks holding full recursive cards, migration from v1 (fixture-corpus tests first — RED ZONE; deck-membership-as-state deferred to the R1.2 chain) | domain §7, Item 17 |
| R1.4 | **Card-face ergonomics** — details open read-first like a baseball card, second tap edits (create still opens in edit); line breaks render in descriptions | Items 18, 20 |

Gate: the chain feels *safe* — a week of real use where no card is ever
lost, stranded, or unrecoverable.

## R2 — The spatial layer (the app becomes the vision)

| # | Item | What changes |
|---|---|---|
| R2.1 | **Root canvas** — multiple top-level decks side by side; system decks have a place; pan between decks | Item 3 |
| R2.2 | **Zoom continuum** — canvas ⇄ deck ⇄ card-fills-the-phone; pinch navigation; deck-is-the-UI mode | Item 6 |
| R2.3 | **The table surface** — design the dead space (empty/black/white/reflection/abstract); same material as the canvas | Item 9b |
| R2.4 | **Discoverability dissolve** — arc menu items find homes on the canvas (Settings/Integrations); menu may remain as shortcut | audit gap 6 |
| R2.5 | **Details-as-expansion** — the founding spec's "tap face-up → full-viewport expansion" replaces the modal once the zoom continuum exists; breadcrumbs/place-trail and the search-vs-philosophy question are design inputs here | archaeology |
| R2.6 | **Per-deck afterlife** — each interior deck keeps its own visible Done pile inside the deck (Xian agreed 2026-07-07; complements the flattened rooms, doesn't replace them). Design with the zoom grammar | option 2 of the Done-room fix |
| R2.7 | **"Inchworm" mode** — view toggle that flattens the whole tree into one walkable stack, unflattenable at any time; `flattenWithParent` is the ready seam | Item 27 |

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
| R4.3 | **Dispatch: deal a card to an agent** — assign from the card ("Pard could do this"); the card lands on the agent's deck, stays visible on yours with its fate in their hands; completion flows back. The outbound twin of R4.1 | Item 14 |
| R4.4 | **Text-entry relief** — capture via share-sheet/voice/agent so typing on cards stops being the bottleneck | Item 4 |

Gate: an agent-dealt card is indistinguishable in feel from a
hand-written one, and no agent can ever reorder your deck.

## The fun shelf (no stage, pull when joy demands)

- Custom card backs: upload-your-own (discreet watermark) + playing-card
  generator (Item 7)
- Flip-preset settings, deck themes, haptic tuning
- Localization files (i18n plumbing already done)
- Flip-back gesture (Item 19 — timer is acceptable meanwhile; design
  with the zoom grammar)
- Toast quiet mode (Item 16 — needs an undo surface decision first)
- **Card aging** (Item 22 — cards yellow like library stock; design
  together with the deck-depth material language, R2-era)
- **Recovered from the Nov-2025 stratum** (archaeology, 2026-07-06):
  sparkle empty state · skeleton shimmer loader · designed error state ·
  M-for-menu keyboard shortcut · swipe tint overlays (A/B vs. pills) ·
  pulsing dot on live-source badges (R3-era)
- **Dark mode — dark background by default** (existed Nov 2025, lost in
  the rebuild — also a store expectation). Xian endorsed dark-by-default
  on 2026-07-07: first pull from this shelf when fit-and-finish work
  resumes after the TestFlight cut. Explicitly does NOT block letting
  testers in.

## The premium shelf (post-launch, candidates)

- Multiple named sub-decks per card (Item 17 — model supports it today)
- Bold/italic and image attachments in descriptions (Item 20 upper tier)
- Advanced card metadata riding the federation mapping — due dates,
  assignees, labels arriving WITH connected sources (Item 21, R3-era)

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

## The build sequence (converged 2026-07-04 — the next ten moves)

The stages above are strategy; this is the order work actually leaves
the shop. Each move is small, shippable, and verified before the next
starts (tests + Playwright; real device where gestures are involved).

1. ✅ **Data safety net** (R0.0) — shipped 07-04, test-first.
2. **Undo toast** (R0.1) — the biggest daily-trust win still open.
3. **Backup-age nudge** (R0.0 tail) — Settings shows "last export N
   days ago"; gentle prompt past a week. Small, pairs with 1.
4. **Portal crispness pass** (R0.3) — background/theme-color/
   overscroll/dvh audit with before/after screenshots on device.
5. **Deck-depth signal** (R0.2) — needs Xian's design call first
   (number vs. suggestion); implementation is small once called.
6. **Domain layer extraction** (R1 prep) — pure-TS `src/domain/` with
   today's *exact* behavior, fully tested, zero visible change. The
   safe stepping stone the migration stands on.
7. **Schema v2 + migration** (R1.3) — RED ZONE, test-first, must
   round-trip through backup export/import. The riskiest single move
   on the map; nothing else ships alongside it.
8. **Recursive cards** (R1.1) — interiors replace substacks in the UI;
   migrated data already fits.
9. **Lifecycle chain** (R1.2) — Done/Archive/Trash decks, advance/
   regress gestures, provenance return. Un-complete and delete arrive
   here.
10. **R1 gate week** — Xian runs a real week on the new model; odd
    behaviors fixed as they surface; then R2 (canvas) planning begins.

Store track (R0.5) proceeds in parallel throughout, human-gated:
Cowork Phase 4 → TestFlight; keystore → Play internal. Fun-shelf items
may jump the queue whenever morale wants them.

*REQUIREMENTS.md re-baselined against this document 2026-07-04.*
