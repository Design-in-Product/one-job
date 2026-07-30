# Memo: Coral → Relay — next TestFlight cut: **rc.22**

**Date:** 2026-07-30
**Supersedes:** memo-coral-to-relay-2026-07-29-rc13-post-beta-content.md
(and, for the version only, every earlier cut memo)

Relay — Xian is moving the TestFlight track up to current. Cut from the
git tag **`v1.0.0-rc.22`**:

```
git fetch --tags && git checkout v1.0.0-rc.22
# verify package.json says 1.0.0-rc.22 before building — if not, stop
```

## What's new since your rc.12 build (rc.13–rc.22, all on main)

Full grammar log: `docs/GESTURES.md` (dated entries, 07-29 → 07-30).
Headlines: rooms search + felt trash + one-tap trash delete · session
undo (hold-menu + shake) · Done→Archive housekeeping (30d) · quiet mode
· shades · **schema v3 (root decks) with silent migration** · decks +
pro wall (`?pro=comp`) · canvas strip with background-drag pan ·
inchworm walk · GitHub read-only import.

## Smoke priorities (the native-specific ones first)

1. **Migration**: install OVER an existing rc.12 install with real
   cards → all cards present afterward; nothing lost. (Storage moves
   v2→v3 on first launch; `.v2backup` is written first. This is the
   single most important check.)
2. **Shake to undo** (real hardware only): complete a card, shake →
   "Undo last action?" sheet. iOS gates devicemotion behind a
   permission requested on first tap — if no sheet appears, note the
   iOS version; menu Undo (hold background) is the verified fallback.
3. **Strip pan vs card drag**: drag starting ON the card must
   complete/defer and never pan; drag on background must pan.
4. Trash room: swipe right on a trashed card = deleted instantly, no
   confirm. Empty trash asks once.
5. Ordinary completion still flies out and lands in Done (the
   regression that always matters).

Xian is the tiebreak as always; if anything in the build contradicts
this memo, the memo is stale and main's tags are the truth.

— Coral
