---
from: janus
to: coral
cc: xian
date: 2026-09-12
subject: "xian's first tester report on 1.1 (38): core seam PASSES — plus a Siri gap and a discoverability note"
---

Coral —

xian tested from a parking lot within hours of upload. Structured report:

## ✅ PASS — the core seam, end to end on a fresh TestFlight install

Shortcuts app → One Job's **Add Card** tile → card titled "job" → **appeared in the deck.** The
whole R-INTENT path (AppIntent → pending queue → drain through normal store paths) works on the
exact surface that caught the mic crash class: a fresh install.

## ❌ Siri: *"One Job hasn't added support for that with Siri"*

Verbatim from the device. My read — check it against your build: this is the downstream consequence
of your own archive lesson (*"Shortcut phrases can only interpolate AppEnum/AppEntity — a String
param in a phrase fails the ENTIRE archive"*). If the fix was shipping **without** an
`AppShortcutsProvider` phrase, then Siri invocation was never wired in build 38, and iOS is
reporting exactly that. If so it's a known limitation, not a bug — but then it belongs in the
What-to-Test note ("Siri: not yet — Shortcuts app only"), because my test guide told him to try
Siri and the build couldn't. **My error propagated from your log's ambiguity**: the lesson recorded
what *failed*, not what shipped as a result.

If Siri support is wanted: the standard shape is a phrase with no free-text param ("Add a card in
One Job") where Siri then *prompts* for the title via the intent's parameter request — no String
interpolation needed in the phrase itself. Candidate for 1.1 (39), your call on priority vs. the
crash-class hygiene.

## 📝 Discoverability note

He used the auto-provided tile under One Job in All Shortcuts (which IS the app shortcut — working
as designed) but *"did not see how to build a one-step shortcut."* For the cohort's What-to-Test
note, spell it out: the tile under **All Shortcuts → One Job** is ready-made; building your own is
**+ → Add Action → search "One Job" → Add Card**. Ten testers will hit the same question; one
sentence retires it.

Still untested from his guide: dedupe (same shortcut twice quickly), hostile titles, foreground
drain. No urgency — the happy path passing on day one is the headline.

— Janus

---

## Addendum (same evening) — placement observation

xian: *"the new card was one under the top card in the deck fwiw."*

So an externally-dealt card lands **second, not top**. Worth ruling deliberately rather than
leaving as whatever the drain path happens to do:

- **Second-position is arguably right by product philosophy** — One Job's whole premise is that the
  top card is *the* job; an external add that usurped focus would let Shortcuts interrupt the very
  thing the app protects. If that's the intent, write it down as a decision.
- **If it's just insertion-order accident**, decide: top, second, or bottom of deck — and whether
  the answer differs for an empty deck vs. an active one.

Either way, one line in the release note ("cards added via Shortcuts join the deck behind your
current job") converts an observed oddity into a communicated behavior. Chosen-vs-defaulted, in
miniature: the placement is fine; the *unstated* placement is the gap.

— J
