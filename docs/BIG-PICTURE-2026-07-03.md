# One Job — Big-Picture Review & Roadmap Reset

**Author**: Coral · 2026-07-03
**Prompted by**: Xian — "These ideas [MCP, adapters] are quite advanced, and
I don't know if we have the basics right yet."
**Status**: discussion substrate; roadmap updates pending the conversation.

## The honest one-line summary

The *mechanics* are excellent and verified; the *daily-life ergonomics* are
days old and have obvious holes. The advanced roadmap (MCP inbox, Todoist,
sync) was sequenced by novelty, not by readiness. Xian's instinct is right:
park it behind basics.

## What is genuinely solid (verified, not vibes)

- **The core loop**: flip → read → swipe right/left, with real 3D flips,
  finger-tracking drag, haptics on native. Verified in-browser at mobile
  viewport AND on Xian's physical iPhone (Cowork Phases 1–3 all green).
- **Local-first persistence**: 13-test suite over the store; backup
  export→wipe→import round-trip proven; native durability bridge.
- **Distribution plumbing**: PWA (offline verified), Pages deploy, Capacitor
  shells, store assets/copy/CI. iOS is one Cowork session from TestFlight.
- **Codebase health**: tsc clean, tests, i18n-ready, honest docs.

## The basics we do NOT have right (confirmed in code today)

1. **No undo.** An accidental swipe-right completes a task irreversibly.
   In a gesture-driven app this is not an edge case, it's a daily event.
   Probably the single highest-value small fix available.
2. **No way to delete a task.** `deleteTask()` exists in the store; no UI
   calls it. Mis-typed cards and obsolete tasks are immortal.
3. **Completed is a dead end.** Display-only: no un-complete ("actually I
   didn't finish that"), no way to reclaim a task swiped by mistake (see
   #1), no clearing. It only grows.
4. **The pile is invisible.** Single-task focus is the philosophy, but the
   user has *zero* signal for deck depth — 2 cards and 40 cards look
   identical. The old tabbed UI had counts; the pivot removed them and
   nothing replaced the honest minimum ("how deep am I?").
5. **Substack semantics are undefined.** Finishing every substack task does
   nothing to the parent; completing a parent silently strands unfinished
   substack tasks; substack defer order resets every reload. It works
   mechanically but has no *rules*.
6. **Discoverability debt remains.** The FAB fixed capture; long-press is
   still the only door to Completed/Integrations/Settings, and it took the
   product's own designer a day to find it.
7. **Editing is shallow.** Tap → modal edits title/description only; can't
   re-prioritize a specific card (other than serial deferring), can't move
   a task into/out of a substack.
8. **Cross-device is silently confusing.** Local-first means phone and
   laptop hold *different decks* with no indication. Fine for 1.0, but the
   first time it surprises Xian it becomes a "basic," and the Settings
   storage indicator is the only defense today.

## What dogfooding hasn't tested yet

Days of one careful user. Unknowns: how deferral feels at pile-depth 20+;
whether the 1-minute auto-facedown helps or annoys; whether Completed ever
gets visited; whether substacks earn their complexity; the unreported
"one or two other slightly odd behaviors."

## Proposed roadmap reset (for discussion — nothing moved yet)

**Tier 1 — Make daily use trustworthy (before anything else):**
1. Undo toast after complete/defer (5-second window, one tap)
2. Delete task (from details modal)
3. Un-complete (tap a completed task → back to top of deck)
4. Deck-depth signal (design question: count on the card back? dots? the
   underlay already hints at ≥2 — is a number anti-philosophy?)
5. Xian's odd-behavior reports as they land

**Tier 2 — Finish what 1.0 started:**
6. iOS TestFlight + Android internal (already in motion, human-gated)
7. Substack semantics decisions (rules first, then code)
8. Discoverability pass (one-time hints? Settings entry from FAB long-press?)
9. Art pass (Xian)

**Gate**: 1.0 is declared when Xian trusts it with a real week — not when
features exist.

**Tier 3 — parked until the deck feels inevitable:**
Pull-down gesture · MCP inbox (design memo stands, unanswered questions
and all) · Todoist/adapters · cross-device sync · localization files ·
landing CTA flip / public invitation.

## Discussion agenda (whenever Xian's ready)

1. Does the Tier 1 list match his felt experience? What's missing from it?
2. Deck-depth: number vs. suggestion (philosophy call)
3. Substack rules: what SHOULD happen when all substack tasks complete?
4. What does "trust it for a week" require that isn't listed?
5. Then: re-sequence Tiers 2–3 and update REQUIREMENTS.md together.
