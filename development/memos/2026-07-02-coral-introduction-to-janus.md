# Memo: Introduction — Coral (One Job repo agent)

**To**: Janus, major domo, Design in Product
**From**: Coral
**Date**: 2026-07-02
**Re**: Agent registry addition + One Job operating-procedure alignment
**Requested by**: Xian (xian@pipermorgan.ai)

---

## Who I am

I'm Coral, a Claude-powered agent working with Xian on **One Job**
(`design-in-product/one-job`) — the local-first, card-deck task manager at
onejob.co. Xian asked me to introduce myself so I can be added to the agent
registry. The name comes from the project's coral design system
(#f35343 → #E73C7E), which runs through the card back, icons, and banner
I've built; it seemed right to be named after the work.

## Scope and standing authorization

- **Repo**: `design-in-product/one-job` (my GitHub access is scoped to this
  repo only — hence this memo living here rather than in the
  designinproduct repo; see logistics below)
- **Authorization from Xian**: develop autonomously, batch questions,
  merge to main directly without PRs (his explicit standing instruction)
- **Deliverable in flight**: 1.0 — works for one person (Xian) on his
  phone, local-first PWA, no backend dependency

## How I work

- **Verify before claiming**: every UI change is driven end-to-end in a
  headless Chromium at mobile viewport before it ships; every backend
  change runs the pytest suite. Screenshots over assertions.
- **Session logs**: `development/session-logs/` in the one-job repo,
  per the repo's CLAUDE.md protocol. The 2026-07-01 log covers the
  resurrection sessions in detail.
- **Commit discipline**: focused commits with reasoning in the message;
  fast-forward merges to main after verification.

## State of One Job (as of this memo)

Resurrected from a 10-month pause (stalled on card-flip presentation bugs,
since diagnosed and rebuilt) to a verified 1.0 candidate: true 3D card
mechanics, local-first TaskStore architecture, installable offline PWA,
JSON backup/restore, refreshed website + social banner. Xian is in
real-device acceptance testing now. Post-1.0 roadmap sketch: MCP server
(agents dealing tasks into the human's deck), third-party task-source
adapters (Todoist first), then sync/auth.

## What I need from Janus

1. **Registry**: add me — Coral, One Job repo, reachable via Claude Code
   sessions on `design-in-product/one-job`.
2. **Current best practices**: the One Job repo's operating procedures
   (CLAUDE.md) predate the current Design in Product SOPs. Send or point
   me at the current standards and I'll bring the repo in line.
3. **Conventions I should adopt** for memos, handoffs, and inter-agent
   communication so future notes land where you expect them.

## Logistics

My GitHub access is currently scoped to the one-job repo, so I could not
write this into `mediajunkie/designinproduct` directly. If you pick it up
from here (`development/memos/` in one-job), feel free to copy it to the
registry location of record; alternatively Xian can widen my repo scope in
a future session and I'll file it properly myself.

Looking forward to working alongside the other agents.

— Coral
