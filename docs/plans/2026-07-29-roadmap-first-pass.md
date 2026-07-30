# Roadmap first pass — every upcoming step, refined

**Author:** Coral · 2026-07-29 · **Status:** FOR DISCUSSION (Xian's ask:
"initial plans for each upcoming step — first pass is a refinement of
what is in each step"). Companion: the R2.1 deep dive, same folder.
ROADMAP.md itself is untouched pending our discussion.

## Standing discipline added 2026-07-29: tier evaluation per step

Every step below now gets a tier lean when planned in depth; the full
first-pass earmark table is in **PRICING.md (2026-07-29 addendum)**,
with one open question flagged loudly: whether multiple root decks are
themselves the pro wall. Quiet mode shipped free the same day.

## Status corrections first (the week moved things)

- **R0.1 undo toast** — shipped long ago, now *superseded upward*: the
  2026-07-29 session-deep undo (shake + hold-menu over a history stack)
  makes the 5s toast one surface of a deeper mechanism.
- **Item 16 quiet mode is UNBLOCKED** — its blocker was "undo lives only
  in the toast." It no longer does. Quiet mode is now a fun-shelf pull,
  genuinely small.
- **Rooms search + sift, multi-step undo** — the two "first post-beta
  items" shipped 2026-07-29 (rc.13) after Xian's design calls.
- **Done→Archive housekeeping (30d)** — shipped 2026-07-29; threshold is
  a premium-shelf setting candidate.
- **R0.2 deck-depth signal** — *partially arrived sideways*: the felt
  trash pile (capped edge bars) is the first shipped instance of the
  depth-is-felt material language. Main-deck thickening remains open and
  should reuse this exact material.
- **R1 gate** — in flight: beta week on rc.12 is the gate.

---

## R0 remnants (trust for daily use)

### R0.0 Data durability — remaining slice
**What's left:** on-device proof of the share-sheet export path (Xian's
hands, not simulatable) and an export-location hint in Settings copy.
**Plan:** fold the hint into the next copy pass; the proof rides beta
week. Nothing to build until his report.

### R0.2 Deck-depth signal + Item 22 card aging (one material language)
**Third strand added 2026-07-29 (Xian's "shades" whim, shipped as
placeholder):** cards in the rooms are *shades* — progressively washed
out the further from the living deck (Done barely, Archive paler, Trash
near-gray). So the language is now: **volume** = thickness (felt pile),
**time** = patina (aging, unbuilt), **state** = vitality/saturation
(shades, placeholder values shipped rc.15). The aging design pass tunes
all three together. Note from building it: the card face is
white-on-near-black, so saturation alone is invisible — a shade loses
VITALITY (opacity + contrast), not color.
**Refined:** the deck visibly thickens as it grows (asymptote, no
number); cards age visually when long-untended. Design the two together
— time and volume in one tactile vocabulary. The trash pile's edge bars
(shipped) are the seed: same bars under the main deck, thickness from
active count, plus a gentle patina channel on card faces.
**Open design q:** what does "thicker" look like on the main deck where
a deck underlay already exists? (Extend the underlay's visible edges vs.
the bars.) Does aging read on white card faces without looking like
dirt?
**Effort:** 1–2 days incl. Playwright screenshot comparisons.
**When:** R2-era per roadmap; could pull earlier as fit-and-finish with
dark mode.

### R0.3 Portal crispness
**Refined:** kill the "app swimming in an ill-fitting frame" feel.
Suspects already listed in Vision Item 9: background/theme-color
mismatch, overscroll bounce, `dvh` vs `vh`, safe-area insets.
**Plan:** one systematic pass on a real device — enumerate the suspects,
fix each with a before/after screenshot, verify installed-PWA and
native WebView separately (they frame differently).
**Effort:** half a day, device in hand. Pairs naturally with dark mode
(same surfaces).

---

## R2 — the spatial layer

### R2.1 Root canvas → **deep dive in companion doc**
Multiple top-level decks side by side; system decks get a place; pan
between decks. The next build step. See
`2026-07-29-R2.1-root-canvas-deep-dive.md`.

### R2.2 Zoom continuum
**Refined:** canvas ⇄ deck ⇄ card as one continuous zoom; pinch
navigates; "deck-is-the-UI" mode at the middle altitude.
**Dependency:** R2.1's model AND its gesture decisions — if R2.1 ships
pan-between-decks, zoom must rhyme with it (pinch = altitude, pan =
neighbors at same altitude).
**Risk:** the single biggest animation-engineering item on the map;
Framer Motion shared-layout transitions at three altitudes. Prototype
before promising.
**Effort:** 1–2 weeks done properly. Do not start during beta week.

### R2.3 Table surface
**Refined:** design the dead space — the material the canvas sits on.
**Plan:** design exploration, not engineering: 3–4 mocked directions
(felt table, void, paper, abstract) reviewed with Xian before any code.
Cheap to explore once R2.1 exists to mock against.

### R2.4 Discoverability dissolve
**Refined:** arc-menu destinations (Settings/Integrations) find homes ON
the canvas; menu stays as shortcut.
**Dependency:** hard-gated on R2.1 (needs places to exist).
**Note:** the R2 gate ("a new user finds Completed by looking around")
is scored here.

### R2.5 Details-as-expansion
**Refined:** tap face-up card → full-viewport expansion replaces the
modal, once the zoom continuum exists (it's the "card" end of the zoom).
**Dependency:** R2.2. Breadcrumbs/place-trail design input lands here.

### R2.6 Per-deck afterlife
**Refined:** each interior deck keeps its own visible Done pile inside
the deck, complementing the flattened rooms.
**Open design q:** where does it live spatially — under the deck? A
flip-side? This is a zoom-grammar question; design with R2.2.

### R2.7 Inchworm mode — ✅ SHIPPED rc.22, 2026-07-30
Built on its own walk, not flattenWithParent: **post-order, leaves
first** — Item 15 forbids completing a parent over open children, so
the inchworm eats the tree bottom-up and by the time a parent surfaces
its interior is done. Grammar and invariant agree; blocked completions
become nearly impossible in the walk instead of needing a reveal.
Toggle in the deck hold-menu (device preference); breadcrumb trail
("in Ship it › sub") above the card; scoped to the ACTIVE deck's tree
(decks are places — inchworm flattens depth, not place). Tier: free.

### R2.8 Kinetic conversation
**Refined:** one design pass over riffle-to-jump, exploded-view reorder,
vertical gesture grammar. **Gated on Xian's real play with sifting** —
now genuinely testable since search+sift shipped. Not before his report.

---

## R3 — federation (import first, then sync)

### R3.1 SourceAdapter seam
**Refined:** formalize `SourceAdapter` atop the TaskStore seam;
provenance = `{service, externalId, mapping}`. The Task type already
carries `source`/`externalId` — the seam is half-latent.
**Plan:** define the interface + a `DemoAdapter` proving it, before any
real service. Small, pure-code, autonomous-friendly.

### R3.2 First import (read-only) — ✅ SHIPPED rc.21, 2026-07-29
**Answered same day: GitHub** (his real work's home; Asana deliberately
avoided; Trello the natural second). Shipped that night: read-only
import of open assigned issues into a `github` root deck on the strip,
provenance `owner/repo#number`, idempotent re-import, PAT device-local,
pro-walled panel in Integrations. Proven against a mocked API;
real-token verification is Xian's morning item. Also filed (fun shelf):
AI-read ad hoc backends — Notes/stickies/email as cards — the R4
agent-as-source thesis in pajamas; the seam already fits it.

### R3.3 Mapping store → **R3.4 two-way sync → R3.5 federation → R3.6 import-as-merge**
**Refined sequence stands.** One note: R3.6 (merge with per-conflict
keep-both/replace/skip) supersedes the import-N container and needs
real provenance to compare on — so it slots *after* R3.2, not before.
The undo stack now covers bad imports session-deep, which lowers the
stakes of every step here.

---

## R4 — agentic (unchanged, correctly gated on R3)

One refinement worth recording now: **R4.1's MCP inbox should treat "an
agent" as literally another SourceAdapter** (MCP-DESIGN.md's open
questions collapse into R3.1's answers). No planning debt beyond that
until R3 is real.

---

## Shelf notes

- **Dark mode** — Xian-endorsed first pull when fit-and-finish resumes
  post-cut. Pairs with R0.3 portal crispness (same surfaces, one
  device pass). Store-listing expectation, so it front-runs the shelf.
- **Toast quiet mode** — unblocked (see corrections). Small.
- **Premium shelf** — housekeeping threshold (30d default) added
  2026-07-29 as a settings candidate.

## Suggested working order (for discussion)

1. **Beta week** (in flight) — R1 gate; my hands stay off rc.12.
2. **R2.1 root canvas** staged per deep dive (model first, invisible).
3. **Dark mode + R0.3** as one fit-and-finish device pass.
4. **R3.1 seam + R3.2** once the service is named.
5. R2.2 zoom prototype only after R2.1's gestures settle.
