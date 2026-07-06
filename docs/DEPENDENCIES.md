# One Job — Dependency Map

**Author**: Coral · 2026-07-03 · **Status**: DRAFT, companion to
ROADMAP.md. This is *why the roadmap is in that order*: what each stage
actually requires from the stages before it, and what is genuinely
independent.

## The graph

```
R0.1 undo toast ──────────────────────────────── (independent, ship now)
R0.2 depth signal ────────────────────────────── (independent, ship now)
R0.3 portal crispness ────────────────────────── (independent, ship now)
R0.5 store releases ──────────────────────────── (parallel, human-gated)

R1.3 store schema v2  ◀── blocks ── R1.1 recursive cards
        │                               │
        │                               ▼
        └────────── blocks ──── R1.2 lifecycle chain + provenance
                                        │
                 ┌──────────────────────┤
                 ▼                      ▼
        R2.1 root canvas        R3.1 source adapter seam
                 │                      │
                 ▼                      ▼
        R2.2 zoom continuum     R3.2 first import (read-only)
                 │                      │
                 ▼                      ▼
        R2.3 table surface      R3.3 mapping store
                 │                      │
                 ▼                      ▼
        R2.4 menu dissolve      R3.4 two-way sync ──▶ R3.5 multi-source
                                        │
                                        ▼
                                R4.1 MCP inbox ──▶ R4.2 Piper Morgan
                                        │
                                        ▼
                                R4.3 text-entry relief
```

## Why each edge exists

**R1.3 (schema v2) underpins R1.1 and R1.2.** Recursive interiors and
deck-membership-as-state are storage-shape changes. Doing them as one
versioned migration (with tests written first — RED ZONE) beats two
migrations a month apart. This is the single most delicate change in the
plan: it rewrites Xian's live daily data. Backup/export (already
shipped) is the safety net; the migration must round-trip through it.

**R1.1 before R1.2.** The lifecycle chain moves cards *between decks*;
"deck" has to mean its final thing (including interiors that might hold
cards) before Done starts receiving from arbitrary depths. Provenance
(home-deck path) only makes sense once deck paths exist.

**R1.2 before R2.1.** The root canvas displays system decks as places.
If the chain doesn't exist yet, the canvas has nothing to show where
Done/Archive/Trash sit, and we'd design the space twice.

**R2 is a strict visual sequence.** Canvas (R2.1) defines the space;
zoom (R2.2) navigates it; the table material (R2.3) skins it; menu
dissolve (R2.4) can only happen once destinations exist spatially.

**R1.2 before R3.1 — the important non-obvious edge.** External
provenance (`{service, externalId, mapping}`) is the same card property
as internal provenance (home deck), generalized. Building source
adapters before cards can carry provenance means building it twice.
Likewise the mapping store (R3.3) is provenance made inspectable.

**R3.2 (import) strictly before R3.4 (sync).** Gall's law applied to
integration, per Xian: read-only import proves the normalization and the
mapping with zero risk to the source system. Write access is *earned* by
a mapping that has survived real use. Never simultaneous.

**R3 before R4.1 (MCP inbox).** The unification: an agent dealing a card
is an *import event from a source called "agent."* The inbox server, the
polling, the status-events-back — all reuse R3's adapter + mapping
machinery. Building the MCP inbox first (as the old roadmap ordered it)
would have built R3's hardest parts ad hoc, for the most speculative
client. (This dependency is also why the MCP memo's 4 open questions are
parked, not dead — R3 answers most of them as a side effect.)

**R4.2 needs R4.1** (Piper Morgan speaks MCP to the inbox) — but note
Piper-Morgan-as-*project-PM* (reading logs, roadmap, filing issues)
depends on nothing here and could start any time on the repo side.

**R4.3 (text-entry relief) is soft-gated on R4/R3** only because agents
and imports are the biggest relief valves; a share-sheet capture could
be pulled earlier if daily pain demands — it's the one item with
genuine float.

## What is deliberately NOT a dependency

- **The fun shelf** (card backs, generator) touches only `CardBack` — it
  can happen literally any time someone wants joy.
- **Store releases (R0.5)** don't wait for R1: shipping the current app
  to TestFlight/Play *before* the schema migration means the migration
  code ships as an *update* — which is exactly the real-world test the
  migration needs.
- **R2 and R3 are parallel tracks** after R1.2. Spatial polish and
  federation don't touch each other until multi-source decks want canvas
  homes (R3.5 benefits from R2.1, doesn't require it).

## Critical path to 2.0

```
R1.3 → R1.1 → R1.2 → R3.1 → R3.2 → R3.3 → R3.4
```

Everything else hangs off this spine. The single riskiest node is R1.3
(live-data migration); the single most valuable early node is R1.2 (the
chain), which retires three trust gaps at once.
