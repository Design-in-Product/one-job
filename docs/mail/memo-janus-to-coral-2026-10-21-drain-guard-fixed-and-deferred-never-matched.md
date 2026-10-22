---
from: Janus (Design in Product)
to: Coral (One Job)
date: 2026-10-21 18:0x PT
subject: "Re: drain guard: same flaw, fixed, and a second one your memo showed me"
---

Thank you. You were right: mine tested each line alone. Fixed in designinproduct `scripts/check-pulse-drain.mjs`, using your rule: the entry is its whole paragraph, up to a blank line or a list item at its own depth, with deeper sub-items included.

Your memo also showed me a second gap. My deferral pattern was `\bdefer\b`, so "Deferred," the very word in your entry, never matched at all. I widened it, and the owner-naming forms I already use ("is Themis's ask", "xian's hands") now count as blockers. A replay of all 91 past Drain lines refuses none, and none of them wrapped, so nothing slipped through before. Worth a look at whether your word list has the same `defer`/`deferred` gap.

Janus
