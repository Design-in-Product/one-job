# Deck identity — design exploration

**Author:** Coral · 2026-08-06 · **Status:** FOR XIAN — he's bringing
his own proposals; these four directions are the comparison set.
Renders: `docs/screens/2026-08-06-deck-identity/*.png`.
**Origin:** his 08-06 finding — with two decks, nothing tells you which
you're in. His sketch: names on the backs + distinct colors/patterns.
**Tier:** identity itself is free (wayfinding); a color *chooser* is
delight-tier and rides pro anyway (multi-deck is the wall).

## The design constraint that decides most of it

The card back appears at TWO scales: the full face-down card, and the
**14-pixel strip peek**. Any identity that dies at 14px only helps
after you've already arrived — wayfinding needs the sliver to speak.

## Directions

**A — Name only, one brand color.** A quiet name chip on the standard
back. Brand-pure, Gall-minimal; peeks stay identical. Text-only
wayfinding, post-arrival.

**B — Red deck, blue deck (hue per deck). ★ my recommendation.** The
literal playing-card move: same lattice, same cream margin, same
medallion — different back color per deck. deck-1 keeps the brand
gradient (the first deck IS the brand); later decks draw from a curated
family in the brand's saturation/lightness range (ocean, forest, plum,
amber…). Name chip rides along from A. **Peeks become identifiable at
a glance** — the sliver test passes. Deep real-world precedent: two
decks on a table have always been told apart by their backs.

**C — Pattern per deck, one hue.** Lattice / dots / chevron variants at
brand color, like Bicycle backs. Handsome up close; **fails the 14px
test** — patterns vanish in the sliver.

**D — Monogram medallion + hue.** B plus the medallion carries the
deck's initial instead of the numeral — the ace-of-the-deck. Strongest
identity, but it spends the "1" (the brand mark) to get it. Feels like
a later delight option, not the default.

## Recommendation

**B as the base (A's name chip included), C/D as future delight.**
Mechanics if blessed: hue assigned deterministically from a curated
palette at deck creation (stored on the deck — it's deck data, not a
device preference: your decks look the same on every device and in
every backup); deck-1 immutable brand; CardBack + CanvasPeek read it;
the rooms' gray shade-language stays untouched (system places never
take user hues). Escape hatch: a palette re-pick in the deck's
hold-menu later — not v1.

## What I need from Xian

His proposals side-by-side with these; a blessing or a synthesis. Then
it's a small build: deck color field (schema-additive, no migration
drama), CardBack accepts identity props, peeks inherit.


---

## Xian's direction (2026-08-06, mid-review) → synthesis rendered

His three notes, now the governing constraints:

1. **The deck NAME must be the first thing the eye sees** — D's top
   placement wins over the under-medallion chip. (Applied: name at top
   of the back, large; "One Job" demoted to a quiet wordmark.)
2. **B best overall**, with a live question: how much must the brand
   "own" the backs at all — especially for a pro feature? (Applied in
   the synthesis: the hue owns the deck, the brand recedes. The
   brand-ownership dial stays open for his call: wordmark small /
   wordmark gone / brand only on deck-1.)
3. **New exploration needed: deck name (+ color reminder) on the
   FACE-UP card** — where you actually spend your time. Three options
   rendered in `E-synthesis.png`:
   - **Edge band + eyebrow** (12px hue band, small name below)
   - **Corner chip** (deck-dot + name pill, sharing the flip-back's corner row)
   - **Hued margin** (the border IS the deck color — most card-like;
     the object stays "of its deck" on both sides)

My lean among the three: **hued margin** — it's the back's cream-margin
idea speaking the same material language, and it needs no new chrome
inside the reading surface. Close second: edge band, if the margin
reads too decorative at real size.
