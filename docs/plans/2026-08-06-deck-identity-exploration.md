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
