# Session Log: 2026-07-01

## Session Start: (remote Claude Code session)

### Context
- Environment: Claude Code (remote, Fable)
- Project: One Job
- Git Status: clean at start (branch claude/one-job-project-assessment-jo96x2)
- Recent Commits: 8186a06 "Fix card back design and layout issues" (2025-08-16) was HEAD
- Current Phase: resuming after ~10-month pause, mid Card Deck Experience pivot

### Session Objectives
1. Assess project state and produce a report (PROJECT_ASSESSMENT_2026-07-01.md)
2. Execute the finishing plan: hygiene → card mechanics → production readiness → pipeline/docs

### Session Activities
- Assessment: diagnosed the four card-presentation defects that stalled the pivot
  (corrupted TaskCard transforms, never-emitted swipe keyframes, fake two-element
  flip, mismatched front/back geometry), plus test isolation failure and deploy gaps
- Phase 0: untracked backend/venv + *.db + .env; conftest.py with per-test in-memory
  DB (full suite green in one run); deleted stray .txt source copies
- Phase 1: new FlipCard / SwipeableCard / CardBack components; TaskCard and
  TaskStack rebuilt as presentational + composed pieces; CardDeck rewritten
  (deck underlay, per-deal remount, movement-cancelled long-press, Add Task modal
  from arc menu); fixed w-full container collapse and vite IPv6-only host binding
  (the 2025-08-06 "server unreachable" mystery); cleared all pre-existing tsc errors
- Phase 1 verification: Playwright drive on 390x844 — flip frames show true 3D
  perspective; drag hints, complete, defer, auto-reveal, arc menu, Add Task all pass
- Phase 2: handleUpdateTask/handleCreateSubstack routed through API_BASE_URL with
  demo branches; render.yaml fromDatabase wiring; postgres:// URL normalization;
  end-to-end verified against a live local backend
- Phase 3: scripts/sync-demo-assets.mjs wired into npm run build (no more hand-synced
  bundle hashes); app/ build output untracked; favicon single-sourced in public/;
  Pages workflow reads VITE_API_URL from a repo Actions variable; REQUIREMENTS.md,
  CLAUDE.md, and ui-ux-issues.md brought in line with the card-deck architecture

### Notes & Insights
- The "design problems" were code bugs: pasted KaTeX HTML inside template literals,
  and Tailwind keyframes referenced only from inline styles are never emitted
- `max-w-md mx-auto` in a flex column has zero intrinsic width once children are
  w-full — the old fixed-width card was silently propping the layout open
- Playwright screenshots during animation are the fastest way to verify gesture work

### Session End Summary
- Completed: assessment + Phases 0–3 of the finishing plan, all verified and committed
- Pending (user actions): deploy backend via render.yaml Blueprint, set VITE_API_URL
  repo variable, real-device QA pass, decide fate of Railway leftovers
  (Procfile/railway.json/nixpacks.toml)
- Next Session: production cutover + mobile QA checklist; Phase 2 spec features
  (expanded detail view) if desired

---
## Session #2 (2026-07-02): Local-first 1.0 + PWA

- Direction set: 1.0 = works for one person (Xian) on a phone, no backend
  unless a third-party task source is configured
- TaskStore seam: LocalTaskStore (default) / DemoService (seeded local) /
  ApiTaskStore (VITE_API_URL or ?remote); Index.tsx fully rewired, all
  fetch branches gone
- Substack tasks now persist (local + remote via existing endpoints)
- PWA: vite-plugin-pwa autoUpdate, card-medallion icons, offline verified
- Also: website refresh (coral, Inter, hero logo, TYPO-001 flex fix),
  og-image.png social banner, dead code sweep, merged to main
- Verified via Playwright: local empty-start, persistence across reload,
  SW + manifest, offline reload, demo isolation, remote round-trip
- Gotcha discovered: merging the untracking commit deleted working-tree
  copies of formerly tracked files (backend/onejob.db) — dev data only
