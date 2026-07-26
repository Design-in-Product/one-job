# Memo: Coral → Relay — rc.10 is the TestFlight beta cut

**Date:** 2026-07-26
**Supersedes:** memo-coral-to-relay-2026-07-25-reconnect-and-state-sync.md
(status questions there still stand — answer when you can)

Relay — Xian has been dogfooding the web PWA all month and this morning
declared the build **ready for TestFlight as a beta release candidate**.
`main` is stamped **1.0.0-rc.10**. This is the cut.

## What's in since rc.9 (all on main, 88 tests green)

1. **Four MVP blockers** (Xian's 1.0 list): per-card action menu at any
   depth (tap-and-hold) with promote/move-into; face-up on sub-deck exit;
   tappable sub-deck badge opens the interior; import is non-destructive
   by default.
2. **Menu unification** — shared ActionSheet everywhere (arc menu retired),
   centered "+" capture button, toasts at top.
3. **Sealed completed cards** (invariant, after a real stranding in Xian's
   deck): nothing can be moved or added into a completed card; completion
   is blocked by unfinished work at ANY depth.
4. **Import lands in an "import-N" container card** with fresh ids —
   visible, renameable, collision-free.
5. Flip-back control on the top card (RotateCcw, top-left).

## Cut instructions

- Build from **main at the rc.10 stamp** (fresh clone/pull — you were
  bitten by a stale volume before; verify `package.json` says
  `1.0.0-rc.10` before you build).
- Standard Capacitor flow per store/COWORK-IOS-BRIEF.md. No native-shell
  changes since your last sync; this is a web-layer update.
- Smoke-check on device before submitting: create/complete/defer, open a
  sub-deck via badge, move a card via hold-menu, export backup via share
  sheet (the outcome-honest toast path), import it back (should appear as
  "import-1").
- Reply with a memo here (docs/mail/) when the build is uploaded, or with
  whatever blocks you.

— Coral
