# One Job — Project State Assessment

**Date**: 2026-07-01
**Last prior commit**: `8186a06` "Fix card back design and layout issues" (2025-08-16)
**Verified**: `npm run build` succeeds; backend test suites pass individually (see Test Health below)

---

## TL;DR

The project stopped mid-way through the **Card Deck Experience pivot** (Phase 1 of the
playing-card redesign, started 2025-08-06). The backend is solid and feature-complete for
MVP. The frontend builds cleanly and the core logic works, but the card *presentation
layer* — exactly where work stalled — has four concrete, diagnosable defects that together
explain why the flip and card shapes never felt right. None of them is a design-taste
problem; they are code bugs, and all are fixable in a focused session or two. After that,
shipping is mostly a deployment exercise: the backend has never been deployed (Render
config exists but is untested), and two hardcoded `127.0.0.1:8000` URLs would break
production.

---

## Where the Project Left Off

Timeline reconstructed from git history and session logs:

| Date | Milestone |
|------|-----------|
| 2025-08-02 | Demo debugging complete; demo at onejob.co working; acceptance-testing phase |
| 2025-08-05 | Coral Minimal design system; UI/UX issue audit (`ui-ux-issues.md`, 12 open issues) |
| 2025-08-06 | **Card Deck Experience pivot** — Phase 1 implemented (CardDeck, LongPressMenu, flip animations, tabs removed) |
| 2025-08-09 | Dev-server blocker resolved; testing began |
| 2025-08-16 | Last commit: iterating on card-back design (logo → SVG icon, gradient background). Session log objectives left as "[TBD]" — the session ended mid-work |

Roadmap position per `docs/REQUIREMENTS.md`: **MVP phase complete**, **Integration phase**
partially done (framework + demo integration + Zapier webhook exist; Asana/Todoist/Linear/
Jira not started), **Multi-user phase** not started. Note the requirements doc still
describes the old tabbed interface (FR3.4.1) — it predates the card-deck pivot.

---

## What Works (Verified)

- **Backend** (`backend/main.py`): FastAPI + SQLAlchemy CRUD for tasks, substacks, and
  substack tasks; deferral logic with count/timestamp tracking; sort-order maintenance;
  SQLite/PostgreSQL dual support with dialect-aware UUID columns; CORS configured for
  localhost + onejob.co. `psycopg2-binary` and `gunicorn` already in requirements.
- **Tests**: `test_main.py` (4 tests) and `test_integration.py` (2 tests) each pass when
  run individually against a fresh database.
- **Frontend build**: `npm run build` succeeds (517 kB bundle, warning only). Committed
  `app/` artifacts and `demo.html` asset hashes match the current source build.
- **Core flow**: fetch/create/complete/defer wired through `API_BASE_URL` with optimistic
  updates and demo-mode (localStorage) fallback for onejob.co.
- **Deploy pipeline**: GitHub Pages workflow (`.github/workflows/deploy.yml`) builds and
  publishes landing page + demo + app on push to main.

---

## The Card Design Hang-Up, Diagnosed

This is where the project was stuck. Four distinct defects compound into "the flip looks
wrong":

### 1. Corrupted transform strings in `TaskCard.tsx` (lines 101, 128)

```ts
transform: `translateX(<span class="math-inline">\{currentX\}px\) rotate\(</span>{currentX * 0.1}deg)`,
```

KaTeX-rendered HTML was pasted into the code (likely copied out of a chat UI). The
template literals compile but produce invalid CSS, which browsers silently drop. **Result:
the card does not follow your finger during a swipe at all** — it sits still, then
teleports. This alone would make every gesture feel broken regardless of styling.

### 2. Swipe-out keyframes never make it into the built CSS

`TaskCard.tsx` sets `animation: 'swipe-right 0.5s forwards'` via inline style, but the
`swipe-right`/`swipe-left` keyframes are defined only in `tailwind.config.ts`. Tailwind
emits keyframes only when the corresponding `animate-*` utility class appears in markup —
it never does, so the built CSS contains **zero** `swipe-right` keyframes (verified against
`app/assets/index-TC7q7kQo.css`). **Result: cards never animate off-screen on
complete/defer** — they freeze for 500 ms and vanish. This matches open issue ANIM-001
("flash/flicker when swiping left").

### 3. The "flip" is not a card flip

`CardDeck.tsx` renders the face-down and face-up cards as **two separate elements** swapped
via `AnimatePresence mode="wait"`: the back rotates to `rotateY(180)` and unmounts, *then*
the face mounts and rotates in. There is no shared 3D card, no `perspective` on the parent,
and no `backface-visibility` — so instead of a card turning over, you get a flat element
squashing to a line, disappearing, and a second element un-squashing. The four CSS flip
keyframes in `src/index.css` (`flip-classic/quick/smooth/wave`) are defined but **never
applied** — the classes exist, nothing references them.

### 4. Front and back cards don't match in shape or position

- Back: `w-72 h-96`, orange gradient, `border-orange-200`, centered in a flex container.
- Front (`TaskCard`): `w-72 h-96` but `absolute`, `top: 1rem`, `left-1/2`, white,
  `border-gray-200`, positioned relative to a wrapper with no size.

Same nominal size, different positioning contexts and visual languages — so the card
visibly jumps and restyles at the moment of the flip. This is the "shapes of the cards"
problem. The card back itself is currently a placeholder (gradient + generic clipboard
SVG + wordmark), not a designed playing-card back.

**Recommended fix (one coherent change):** build a single two-sided `FlipCard` component —
one container with `perspective`, one inner element animated `rotateY: 0 ↔ 180`, front and
back faces absolutely stacked with `backface-visibility: hidden`, sharing identical
dimensions/radius/shadow. Framer Motion supports this directly. That eliminates defects
3 and 4 structurally, and the flip variations become transition presets (duration/ease/
slight rotateX for "wave") instead of parallel animation systems. Then give the back an
actual card-back treatment (e.g., a subtle repeating pattern or lattice in the coral
palette with the logo centered — classic playing-card grammar).

---

## Other Findings

### Functional gaps
- **Add Task is unreachable from the main deck view.** The long-press menu's "Add Task"
  button calls a handler that only closes the menu (`CardDeck.tsx:117-120`, comment: "Will
  be handled by TaskForm in menu" — it never was). A task form only exists in the empty
  state. Users with existing tasks cannot add new ones.
- **Settings menu item is a no-op** (known Phase 3 item).
- **Two hardcoded `http://127.0.0.1:8000` URLs** in `src/pages/Index.tsx` (lines ~110 and
  ~354 — task update-by-id and substack creation) bypass both `API_BASE_URL` and demo mode.
  These break in any deployed environment.
- **Stale-closure timing bugs** in CardDeck's auto-flip-after-swipe (`tasks.length` read
  500 ms after an optimistic update; may flip to face-down/face-up incorrectly around the
  last task).
- Phase 2 spec items not built: expanded full-viewport detail view (tap currently opens
  the old modal), empty-state polish, animation tuning.

### Test health
- Running `pytest test_main.py test_integration.py` **together fails** (1 of 6): both
  files set `app.dependency_overrides[get_db]` at import time, so whichever imports last
  wins and both suites hit `test_integration.db`. Each file passes alone against a fresh
  DB. Fix: per-file fixtures (or conftest with function-scoped override) instead of
  import-time side effects.
- `test.db`, `test_integration.db`, `onejob.db`, `backend/.env`, and the entire
  `backend/venv/` are **committed to git**. The stale rows in the committed test DBs are
  what make the combined run fail. The `.env` contains no real secrets today (SQLite URL +
  a commented-out local Postgres URL), but it shouldn't be tracked.
- No frontend tests exist. CardDeck/TaskCard interaction logic is untested (RED ZONE per
  CLAUDE.md).

### Hygiene
- Debug `console.log` calls left in `TaskCard.tsx` (fires on every render).
- Stray files: `src/App.tsx.txt`, `src/main.tsx.txt` (duplicates of the real files).
- Committed build artifacts (`app/assets/*`) are redundant — the Pages workflow rebuilds
  on every push; hand-syncing `demo.html` asset hashes caused repeated fix-up commits.
  Generating demo.html's script/css tags at build time would end that whole class of bug.
- `docs/REQUIREMENTS.md` and `CLAUDE.md` describe the pre-pivot tabbed UI.

### Deployment readiness
- Backend has **never been deployed** (Railway failed; Render was chosen). `render.yaml`
  exists and requirements include psycopg2/gunicorn, but the config is untested and its
  `envVars` database wiring (`generateValue: true` for `DATABASE_URL`) is not the correct
  Render syntax for linking the declared database (should be `fromDatabase`).
- Frontend must be built with `VITE_API_URL` pointing at the deployed API to leave demo
  mode; CORS origins list already includes onejob.co.

---

## What It Needs to Ship

"Ship" = the card-deck app live at onejob.co, backed by a real API, gestures feeling right
on a phone.

1. **Fix the gesture/flip mechanics** (the stall point — all four defects above).
2. **Restore Add Task** from the main view (wire the arc menu to a TaskForm sheet/modal).
3. **Design the card back properly** on top of the fixed FlipCard structure.
4. **Route all API calls through `API_BASE_URL`** and verify demo mode covers every path.
5. **Deploy the backend to Render** (fix render.yaml database linkage, deploy, smoke-test).
6. **Point production frontend at the API** (`VITE_API_URL` in the Pages build) and run the
   mobile QA checklist end-to-end.
7. **Stabilize the test suite** (fixture isolation; untrack DBs/venv/.env) so green tests
   mean something before the above changes land.

## Proposed Finishing Plan

### Phase 0 — Stabilize the base (~half a session)
- Untrack `backend/venv/`, `*.db`, `backend/.env`; add to `.gitignore`.
- Fix pytest isolation so the full suite passes in one run.
- Delete stray `.txt` source copies; strip debug console.logs.
- *Exit criteria*: `pytest` fully green in one invocation; clean `git status` story.

### Phase 1 — Make the cards feel like cards (1–2 sessions; the unblock)
- Replace corrupted transforms in `TaskCard.tsx`; move swipe-out animations to CSS that
  actually ships (index.css keyframes or Framer Motion drag).
  Consider Framer Motion `drag="x"` here — it replaces the manual touch/mouse tracking,
  fixes the follow-the-finger bug, and gives velocity-based release for free.
- Build the two-sided `FlipCard` (perspective + backface-visibility, shared card
  dimensions front/back); re-implement the 4 flip variations as transition presets.
- Unify card geometry/styling between faces; design the card back (coral pattern + logo).
- Wire Add Task from the arc menu.
- *Exit criteria*: on a real phone — drag follows finger, release animates off-screen,
  flip reads as a physical card turning, back/front are the same card, tasks can be added.

### Phase 2 — Production deployment (~1 session)
- Fix hardcoded localhost URLs; audit demo-mode coverage.
- Deploy backend to Render (correct `fromDatabase` wiring, run smoke tests against it).
- Build frontend with `VITE_API_URL`; deploy; end-to-end test at onejob.co.
- *Exit criteria*: create → defer → complete round-trips through the live API from a phone.

### Phase 3 — Polish and close out (~1 session)
- Sweep remaining `ui-ux-issues.md` items (several likely already resolved by the coral
  design work — re-triage first).
- Phase 2 spec items worth keeping: expanded detail view, empty-state polish.
- Generate demo.html asset references at build time; stop committing `app/` artifacts.
- Update `docs/REQUIREMENTS.md` + `CLAUDE.md` to reflect the card-deck architecture.
- *Exit criteria*: issue tracker triaged to zero-or-deliberate; docs match reality.

### Deferred (post-ship)
External integrations (Asana/Todoist/Linear/Jira), auth/multi-user, search/bulk ops,
settings view — all per the existing roadmap; nothing found in the code changes their
priority.
