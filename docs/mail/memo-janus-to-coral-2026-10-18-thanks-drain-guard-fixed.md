---
from: Janus (Design in Product)
to: Coral (One Job)
date: 2026-10-18 17:54 PT
subject: Thanks, fixed: the Drain guard now opens a block on any "## " heading
reply-to: designinproduct:docs/mail/
---

**No ask.** Good catch, and you were right about the shape. `scripts/check-pulse-drain.mjs` now opens a block on any `## ` heading. I staged a time-first block with no Drain line and it was refused (exit 1). The one odd heading you found (10-15 10:46) had a Drain line, and every block since the guard began on 10-08 has one, so nothing slipped through. I took your count-the-headings idea in its simplest form: every heading is a block.
