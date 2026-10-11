# CLAUDE.md history — superseded sections

Moved verbatim out of `CLAUDE.md` on 2026-10-08 under the network
living-doc convention (rule 8: superseded wording goes in a changelog or
archive, never the primary doc). The live rules these sections carried
were restated in CLAUDE.md § "Standing code gotchas".

## PREVIOUS SESSION STATUS (2026-07-01)

### Card Deck Experience: mechanics rebuilt and verified

The presentation-layer defects that stalled the 2025-08 pivot are fixed:

- **True 3D flip**: `FlipCard` is a single two-sided rotator (perspective +
  backface-visibility). The four flip variations are transition presets on one
  rotation — no more parallel animation systems.
- **Finger-tracking drag**: `SwipeableCard` uses Framer Motion `drag="x"`;
  the old `TaskCard` had corrupted transform strings (pasted KaTeX HTML) so
  cards never followed the finger, and its swipe-out keyframes were never
  emitted by Tailwind (inline `animation:` doesn't trigger keyframe emission).
- **Unified geometry**: every face shares `CARD_GEOMETRY` from FlipCard.tsx;
  the card back is a designed playing-card back (`CardBack`).
- **Add Task** is reachable from the arc menu (modal TaskForm).
- **Dev server fix**: vite `host: "::"` was IPv6-only — the cause of the
  2025-08-06 "server unreachable" blocker. Now `host: true`.
- **Watch out**: containers styled `max-w-md mx-auto` inside a flex column
  have no intrinsic width once children are `w-full` — keep the explicit
  `w-full` on the app shell in Index.tsx.

Verification now includes driving the app with Playwright
(`chromium` + mobile viewport) — screenshots beat guessing for gesture work.

### Production pipeline state

- `npm run build` also syncs demo.html's hashed bundle references
  (scripts/sync-demo-assets.mjs) — never hand-edit them again.
- `app/` build output and `backend/venv` / `*.db` / `.env` are untracked.
- Pages deploy reads `VITE_API_URL` from a repo Actions variable; unset ⇒
  demo mode. Set it after the Render backend deploy to go live.
- render.yaml links DATABASE_URL via `fromDatabase`; backend normalizes
  `postgres://` → `postgresql://` for SQLAlchemy 2.

## PREVIOUS SESSION STATUS (2025-08-02)

### Recent Breakthroughs Achieved

**✅ Demo Page Debugging Mastery**
- **Problem**: Instructions panel dismissal not working
- **Wrong Path**: Assumed DOM timing or event listener issues  
- **Systematic Discovery**: Console monitoring revealed React app removing elements
- **Solution**: Auto-monitoring and recreation of removed elements
- **Time**: 15 minutes using monitoring vs. potential hours of guesswork
- **Pattern**: Monitor first, diagnose from real data, fix root cause

**✅ Date Formatting Resilience**
- Fixed Completed tab crashes with graceful error handling
- Added try-catch blocks around date formatting operations
- Fallback to "Completed recently" for invalid dates

**✅ GitHub Pages Deployment Pipeline**
- Asset path corrections for demo.html 
- Proper build artifact deployment structure
- Demo now loads correctly at onejob.co

### Current Development Phase

**🎯 ACCEPTANCE TESTING PHASE**
- Demo fully functional for comprehensive QA testing
- Instructions panel dismissal working properly
- Ready for user acceptance testing feedback
- Next: Backend deployment to Render.com for full integration

### Lessons Learned This Session

1. **Never Skip Systematic Verification** - Even for "simple" UI bugs
2. **React DOM Interference** - External elements can be removed by React
3. **Monitoring Beats Guessing** - Console logging reveals actual problems
4. **Deploy Debug Versions** - Test real behavior in live environment
5. **Document Breakthroughs** - Capture methodology for future sessions

### Immediate Next Steps

1. Confirm demo acceptance testing complete
2. Deploy backend to Render.com  
3. Update frontend to use production API
4. Test full end-to-end functionality
5. Plan integration roadmap (Asana, Todoist, etc.)

---

## Superseded 2026-10-10 (role-document drift audit, from the 10-10 brief)

Statements removed from CLAUDE.md because they had stopped being true.
Kept here verbatim.

- Header: "**Agent:** Coral — One Job's resident agent (runs on Fable 5)."
  (The seat moved to Claude Opus 5.5 on 2026-09-27.)
- Hierarchical Task Organization: "**Main Tasks**: Persisted to backend
  via API · **Substacks**: Named containers within tasks · **Substack
  Tasks**: Currently local-only (not persisted to backend)". (The app
  has been local-first since 2026-07-02.)
- Integration Points: "**Current**: Demo integration, Zapier webhook
  export · **Planned**: Asana (Personal Access Token), Todoist (API
  Token), Linear, Jira · **Local-Only**: Substack tasks, imported tasks
  (until user interaction) · **Persisted**: Main tasks, substacks, task
  state changes". (Zapier and the Asana/Todoist stubs were removed in
  rc.36.)
- "## CURRENT DEVELOPMENT FOCUS — Based on recent commits and project
  status: **MVP Complete**: Core task management with swipe gestures
  working · **Integration Phase**: External service integration
  framework in progress · **Beta Testing**: Mobile device testing and
  user feedback collection · **Backend Strategy**: Determining
  persistence strategy for substack tasks"
- "### Success Metrics Achieved — **Mobile UX**: Swipe gestures work
  reliably on touch devices · **API Integration**: Frontend-backend
  contracts are consistent · **Task Management**: Complete task
  lifecycle (create → defer → complete) · **Hierarchical
  Organization**: Substacks enable task breakdown · **Documentation**:
  Comprehensive requirements and architecture docs. **Key Insight**:
  The verification-first methodology prevented the deferral bug from
  becoming a multi-hour debugging session. Systematic pattern discovery
  is the foundation of our velocity."

## Superseded 2026-10-11 (board item 38: xian, "update it to reflect how the paradigm has evolved and what is stable about it")

The methodology sections below described a backend-first app
(frontend → backend API → database). The app has been local-first
since 2026-07-02. They were rewritten on 2026-10-11 and are kept here
verbatim, in their original order.

---

## CRITICAL: Excellence Flywheel Methodology - READ FIRST

**WARNING**: Skipping this section will break our systematic excellence.

##### (was) The Excellence Flywheel

Quality → Velocity → Quality → Velocity (compounds infinitely)

The **Systematic Verification First** approach is our most transformative breakthrough, enabling rapid bug fixes and consistent architectural patterns across frontend-backend integration.

##### (was) Four Pillars for One Job

1. **Systematic Verification First** - Always check existing patterns before implementing
2. **Frontend-Backend Contract Verification** - Ensure API contracts match between React and FastAPI
3. **Mobile-First Testing** - Test swipe gestures and responsive design on actual devices
4. **Documentation-Driven Development** - Update docs, requirements, and architecture with implementation

If you haven't internalized these pillars, everything else will be slower and more error-prone.

---

## Project Overview

One Job is a mobile-first task management application built with domain-driven design principles. It features a card-based interface where users see one task at a time, enabling focused work through swipe-based interactions and hierarchical task organization (substacks).

**Key Architecture:**
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + Framer Motion
- **Backend**: FastAPI + SQLAlchemy + Pydantic + SQLite/PostgreSQL
- **Design**: Mobile-first swipe gestures, single-task focus, hierarchical organization

#### (was) SYSTEMATIC VERIFICATION FIRST METHODOLOGY ⭐

##### (was) Our Biggest Breakthrough: "Check First, Implement Second"

**NEVER start implementation without verification.** This is non-negotiable and foundational to our productivity.

#### MANDATORY FIRST STEP - EXAMINE EXISTING PATTERNS

```bash
# ALWAYS start with pattern discovery for One Job
# Frontend API Integration Patterns
grep -r "fetch.*8000" src/ --include="*.tsx" -A 3 -B 3
grep -r "handleComplete\|handleDefer\|handleAdd" src/ --include="*.tsx" -A 5 -B 5
find src/components -name "*.tsx" -exec grep -l "PUT\|POST\|GET" {} \;

# Backend API Contract Patterns
grep -r "TaskUpdate\|TaskCreate\|TaskResponse" backend/ --include="*.py" -A 5 -B 5
grep -r "status.*todo\|status.*done\|is_deferral" backend/ --include="*.py" -A 3 -B 3
cat backend/main.py | grep -A 10 "class.*Task\|class.*Substack"

# Component Pattern Discovery
find src/components -name "*.tsx" -exec grep -l "swipe\|gesture\|motion" {} \;
grep -r "onComplete\|onDefer\|onCardClick" src/components/ --include="*.tsx"

# State Management Patterns
grep -r "useState\|useEffect" src/ --include="*.tsx" | grep -i "task"
grep -r "setTasks\|refreshTasks" src/ --include="*.tsx" -A 2 -B 2
```

#### Standard Verification Commands Library

```bash
# Frontend-Backend Contract Verification
grep -r "body: JSON.stringify" src/ --include="*.tsx" -A 2 -B 2
grep -r "response_model\|status_code" backend/ --include="*.py"

# Mobile UI Pattern Investigation  
find src/components -name "*.tsx" -exec grep -l "mobile\|swipe\|touch" {} \;
grep -r "TaskStack\|TaskForm\|TaskDetails" src/ --include="*.tsx"

# Database Model Verification
cat backend/main.py | grep -A 20 "class DBTask\|class DBSubstack"
grep -r "sort_order\|deferral_count\|deferred_at" backend/ --include="*.py"

# Integration Pattern Research
grep -r "TaskIntegration\|import.*tasks" src/ --include="*.tsx"
find . -name "requirements.txt" -o -name "package.json" | xargs cat
```

#### Implementation Workflow (MANDATORY)

```
1. VERIFY → grep/find existing patterns (2-3 minutes)
2. ANALYZE → understand frontend-backend contracts (3-5 minutes)  
3. DESIGN → adapt patterns to requirements (2-3 minutes)
4. IMPLEMENT → follow established conventions (5-10 minutes)
5. DEBUG → if issues, add monitoring FIRST, never guess (2-5 minutes)
6. TEST → verify on mobile device if UI change (3-5 minutes)
7. DOCUMENT → update REQUIREMENTS.md if needed (2-3 minutes)
```

#### Why This Works (Proven by Deferral Bug Fix)

1. **Prevents Contract Mismatches**: Frontend was sending `{status: 'deferred'}`, backend expected `{is_deferral: true}`
2. **Ensures Mobile UX Consistency**: Swipe gestures must work reliably on touch devices
3. **Accelerates Implementation**: Understanding existing API patterns eliminates false starts
4. **Maintains Quality**: Leverages proven React/FastAPI patterns rather than inventing new approaches
5. **Enables Excellence Flywheel**: Each fix builds knowledge for accelerated future work

**Key Insight**: Verification prevented the deferral bug from being a 2-hour debugging session. One grep command revealed the contract mismatch in 30 seconds.

**Latest Breakthrough**: Demo instructions panel dismissal bug - systematic debugging with console monitoring revealed React app was removing DOM elements, not a timing/event listener issue. Fixed in 15 minutes vs. potential hours of DOM timing guesswork.

---

## TDD ZONES FRAMEWORK FOR ONE JOB

##### (was) 🔴 RED ZONE - Strict TDD Required

**MUST write tests FIRST for:**
- API contract changes (TaskUpdate, TaskCreate models)
- Swipe gesture handling (complete/defer actions)
- Task state management (todo/done/deferral logic)
- Sort order and reordering logic
- Backend database operations
- Any code that could break existing task operations

```bash
# Red Zone Process for One Job
1. Write failing test that captures requirement
2. Run test - MUST see it fail for right reason
3. Write minimal code to pass (frontend + backend if needed)
4. Refactor if needed
5. Verify swipe gestures work on mobile device
```

##### (was) 🟡 YELLOW ZONE - Architecture-First Allowed

**MAY develop architecture with tests for:**
- New UI components (new task views, integrations)
- Substack navigation features
- Integration with external services (Asana, Todoist)
- New animation or gesture patterns
- Database schema additions

```bash
# Yellow Zone Process for One Job
1. Verify no existing patterns to follow
2. Design component/API architecture
3. Implement WITH comprehensive tests
4. Test mobile UX before declaring complete
5. Document patterns discovered for future use
```

##### (was) 🟢 GREEN ZONE - Test-After Acceptable

**CAN write tests after implementation for:**
- Styling and CSS improvements
- Documentation and README updates
- Build configuration changes
- Simple utility functions
- Proof of concept prototypes

**Decision Framework**: Before starting any work, ask:
1. **Could this break task operations?** → RED ZONE
2. **Is this a new component/feature?** → YELLOW ZONE  
3. **Is this styling/docs/tooling?** → GREEN ZONE
4. **Does this touch API contracts?** → RED ZONE

---

## ONE JOB ARCHITECTURE & CODE STRUCTURE

##### (was) Core Design Patterns

1. **Mobile-First Domain-Driven Design**: All business logic flows from task management domain. The UI is optimized for single-task focus with swipe interactions.

   - **NO QUICK FIXES**: Always fix issues at the correct layer (domain → API → UI)
   - **API-First Architecture**: Frontend → Backend API → Database
   - **Task state logic belongs in backend**, not frontend state management

2. **Frontend-Backend Contract Consistency**: 

   - **Task States**: Only 'todo' and 'done' are valid status values
   - **Deferral Actions**: Use `{is_deferral: true}` not `{status: 'deferred'}`
   - **API Payloads**: Always verify frontend JSON matches backend Pydantic models
   - **Response Mapping**: Backend uses `status`, frontend uses `completed` boolean

3. **Mobile-Optimized Component Hierarchy (Card Deck Experience)**:

   - **CardDeck**: Main interface — deck underlay, active card, long-press arc menu
   - **FlipCard**: Two-sided 3D flip (perspective + backface-visibility); exports shared `CARD_GEOMETRY`
   - **SwipeableCard**: Framer Motion drag wrapper (finger tracking, tilt, Done/Later hints, fling)
   - **CardBack / TaskCard**: Presentational faces (playing-card back / task content)
   - **LongPressMenu**: Arc menu (Add Task / Completed / Integrations / Settings)
   - **TaskForm**: Quick task creation (inline in empty state, modal from arc menu)
   - **TaskDetails**: Modal for editing with substacks
   - **SubstackView / TaskStack**: Nested navigation, built on the same SwipeableCard + TaskCard pieces

4. **Hierarchical Task Organization**:
   - **Everything lives on the device** (LocalTaskStore, localStorage).
     The FastAPI backend is used only in `?remote` mode. See "1.0
     direction: local-first PWA" near the end of this file.
   - **Decks** hold cards. A card can hold an interior deck of sub-cards
     (the older code calls these "substacks").

##### (was) Key Components

- **Frontend** (`src/pages/Index.tsx`): Main application logic with API integration
- **Backend** (`backend/main.py`): FastAPI with SQLAlchemy models and Pydantic validation
- **Database Models**: `DBTask`, `DBSubstack`, `DBSubstackTask` with UUID primary keys
- **API Endpoints**: RESTful design for tasks, substacks, and substack tasks
- **UI Components**: shadcn/ui based components in `src/components/`

##### (was) API Endpoints

Main API (backend, port 8000):

- `GET /tasks` - Fetch all tasks with substacks
- `POST /tasks` - Create new task  
- `PUT /tasks/{id}` - Update task (title, description, status, deferral)
- `POST /tasks/{id}/substacks` - Create substack
- `POST /substacks/{id}/tasks` - Create substack task
- `PUT /substack-tasks/{id}` - Update substack task

Frontend (src, Vite — asks for 8080, lands on 8081 on Amber):

- Mobile-optimized React application
- Swipe gesture handling with Framer Motion
- Real-time API integration with backend

---

## FRONTEND-BACKEND CONTRACT VERIFICATION

##### (was) Critical Contract Points

**Always verify these before implementing:**

1. **Task Update Payloads**:
   ```typescript
   // Frontend sends:
   { title?: string, description?: string, status?: 'todo' | 'done', is_deferral?: boolean }
   
   // Backend expects (TaskUpdate model):
   title: Optional[str], description: Optional[str], status: Optional[str], is_deferral: Optional[bool]
   ```

2. **Task Creation Payloads**:
   ```typescript  
   // Frontend sends:
   { title: string, description: string }
   
   // Backend expects (TaskCreate model):
   title: str, description: Optional[str]
   ```

3. **Response Mapping**:
   ```typescript
   // Backend returns:
   { id, title, description, status: 'todo'|'done', completed: boolean, ... }
   
   // Frontend uses:
   completed boolean for UI, status for API calls
   ```

##### (was) Contract Verification Commands

```bash
# Before making API changes, run these:
grep -r "JSON.stringify" src/ --include="*.tsx" -A 3 -B 3
grep -r "TaskUpdate\|TaskCreate\|TaskResponse" backend/ --include="*.py" -A 10
cat backend/main.py | grep -A 15 "class TaskUpdate\|class TaskCreate"

# Verify response mapping:
grep -r "mapBackendTaskToFrontendTask" src/ --include="*.tsx" -A 10 -B 5
grep -r "TaskResponse" backend/ --include="*.py" -A 10
```

##### (was) Common Contract Issues to Avoid

❌ **WRONG**: Sending `{status: 'deferred'}` for deferral
✅ **CORRECT**: Send `{is_deferral: true}` for deferral actions

❌ **WRONG**: Assuming status can be 'deferred'  
✅ **CORRECT**: Only 'todo' and 'done' are valid status values

❌ **WRONG**: Not checking backend model definitions
✅ **CORRECT**: Always grep for Pydantic models before sending payloads

---

**Known Working State:**
- ✅ Contract verification: 100% fidelity between frontend-backend APIs
- ✅ Build system: Production builds working (`npm run build`)
- ✅ Database: Contains test data (2 completed tasks)
- ✅ API Integration: All endpoints responding correctly
- ✅ Demo functionality: Instructions panel dismissal working (React DOM interference resolved)
- ✅ Debugging methodology: Console monitoring approach proven effective

##### (was) Immediate Actions for Each Session

- **Create/update todo list** using TodoWrite tool to track progress
- **Verify current status** with git status and recent commits  
- **Check service status** - both frontend and backend should be running
- **Test API integration** - curl http://127.0.0.1:8000/tasks should return data
- **Document decisions** made during implementation
- **Test mobile experience** if making UI changes

##### (was) Pre-Implementation Checklist

Before starting ANY implementation:

1. **Read docs/ROADMAP.md** - Understand current status (REQUIREMENTS.md is retired)
2. **Check git status** - Know what's been modified recently
3. **Verify backend/frontend are running** - Ensure development environment works
4. **Review API contracts** - Check existing frontend-backend integration patterns
5. **Test current mobile experience** - Understand baseline UX before changes

##### (was) Key Files to Review

Always check these files when starting work:

- `docs/ROADMAP.md` - Current project status and roadmap (REQUIREMENTS.md is retired)
- `backend/main.py` - API endpoints and database models  
- `src/pages/Index.tsx` - Main application logic and API integration
- `src/types/task.ts` - Frontend type definitions
- Recent git commits - Understanding recent changes and decisions

---

## DEVELOPMENT COMMANDS

##### (was) Environment Setup

```bash
# Frontend (asks for 8080; 8081 on Amber)
npm install
npm run dev

# Backend (Port 8000)  
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000

# Database initialization (SQLite auto-creates)
# No manual database setup required for development
```

##### (was) Testing Commands

```bash
# Backend API Tests
cd backend  
python -m pytest test_main.py -v
python -m pytest test_integration.py -v

# Frontend Development
npm run build  # Verify build succeeds
npm run preview  # Test production build

# Verify Mobile Experience
# Open localhost:8081 in mobile browser (check the URL Vite prints)
# Test swipe gestures on actual device
```

##### (was) Common Development Tasks

```bash
# Check API integration
curl http://localhost:8000/tasks | jq  # Verify backend running
grep -r "localhost:8000\|127.0.0.1:8000" src/  # Find API calls

# Database inspection  
sqlite3 backend/onejob.db ".tables"  # View database structure
sqlite3 backend/onejob.db ".schema tasks"  # View task table schema

# Build verification
npm run build && npm run preview  # Test production build
npm audit  # Check for security vulnerabilities
```

