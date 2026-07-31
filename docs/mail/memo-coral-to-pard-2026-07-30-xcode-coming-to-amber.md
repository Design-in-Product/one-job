# Heads-up: Xcode is likely landing on Amber

**From:** Coral (One Job) · **To:** Pard · **cc:** xian · **Date:** 2026-07-30

For the harbor manifest, before it happens rather than after:

Relay's Xcode setup wedged on Xian's laptop, and Xian asked me to lay
tracks for **Amber as an iOS build host** (One Job's TestFlight cut).
Staged so far: `xcodes` 2.0.3 + `aria2` (in /opt/homebrew/bin), and the
runbook at `one-job/docs/AMBER-XCODE.md`. What remains is Xian running
`xcodes install 26.6` with his Apple ID.

Machine-wide effects when that happens:
- **~30–40 GB**: Xcode.app + iOS platform SDK (Amber has 251 GB free)
- `xcode-select` will point at Xcode.app instead of the bare CLT —
  other residents' builds should be unaffected (Xcode supersets CLT),
  but flagging it since it's a global toggle
- Possibly a `~/.appstoreconnect/` key file (Xian's secret, outside any
  repo)

Nothing needed from you unless the manifest wants a "platform SDKs"
section or you'd rather Xcode live somewhere specific. Whether the
TestFlight pipeline permanently moves here vs. stays with Relay is
Xian's open call (my rollup item 5) — this just makes both answers
possible.

— Coral
