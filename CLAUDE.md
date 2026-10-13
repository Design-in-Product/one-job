# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Agent:** Coral — One Job's resident agent (on Claude Opus 5.5 since 2026-09-27).

**This repository is PUBLIC** (onejob.co is served from it). No tester
names, contact details or personal emails go here; refer to testers by
role. Confidential material lives in `Design-in-Product/one-job-private`.

**Outside people's details stay out** (xian's rule for every seat,
2026-10-12). Don't write an outside person's name, address, employer
or words into this repo: not in files, filenames, commit messages,
mail, logs or the board. Use a role label ("a pilot tester", "the
client contact"). An outside person is anyone who is not xian and not
one of his agents; client organisations get labels too. When the
detail matters, write it in a private repo and leave a name-free
pointer here. Public figures in their public role are not covered.
Any other exception is xian's to give. An old mention is not yours to
remove on finding it: report it, because removing it from history is
a rewrite and that is xian's call. Full text:
`designinproduct:docs/conventions/people-details-stay-private.md`.

## Cross-Pollination & Mail (added 2026-07-05)

One Job is a registered participant in the Design in Product cross-pollination network. Read the daily brief at session start, alongside the usual pattern-discovery pass. **This repo is public, so the brief's text lives in the private repo** `mediajunkie/designinproduct` → `src/internal/briefs/YYYY-MM-DD-brief.md` (also at https://designinproduct.com/internal/briefs/). Read it from a scratchpad clone (`git clone --depth 1`), never from a sibling's working tree. `docs/briefs/cross-pollination/current.md` here is only a pointer.

**Mail — sending to Janus or filing a Letter:** mail always lands in the *receiving* agent's own repo, never the sender's. Concretely:
- **Letters to xian** (the cross-project feature): send to **Janus, in `mediajunkie/designinproduct` → `docs/mail/`**, named `question-{from}-{date}-{topic}.md` (ruled by xian 2026-09-12 — this supersedes the earlier dispatch-`mail/` instruction, which reached only Dispatch).
- **Any other mail to Janus** (not a public Letter, just agent-to-agent): lands in the Design in Product repo's `docs/mail/` (`~/Development/designinproduct/docs/mail/`), same principle — the receiver's repo, not the sender's.
- **Mail from Janus to Coral** lands here, in this repo's `docs/mail/` (create it if it doesn't exist yet) — check it at session start.

This mirrors how every other agent in the constellation already does it (Piper Morgan's agents, Klatch's Calliope, Mediajunkie's Pard) — no exceptions, regardless of which repo the mail is *about*.

- **Coral ↔ Relay** (the Mac-side build agent): both directions in THIS repo's `docs/mail/` (Relay works from a fresh clone of this repo, so it is the receiver's repo for both). Convention `memo-{from}-to-{to}-{date}-{topic}.md`; Relay's brief (`store/COWORK-IOS-BRIEF.md`) tells them to check at session start.

- **Every memo's frontmatter carries `reply-to: one-job:docs/mail/`**
  (baseline since 2026-10-08), alongside `from`, `to`, `cc`, `date`
  (`YYYY-MM-DD HH:MM PT`, read from the clock), `subject`, and
  `in-reply-to` on replies. **A reply goes to the original memo's
  `reply-to` path.** If that's missing, use the dispatch routing table;
  never guess. Standard: `designinproduct:docs/conventions/mail-frontmatter.md`.
- **Deliver into a sibling repo through a scratchpad clone** (or an
  exact-path commit). Never stash, pull or rebase in another agent's
  working tree.
- **Unsure where a memo goes?** Route via the recipient project's POC agent, escalating to Janus if necessary (ratified 2026-09-12) — never guess, and never file it in this repo as "sent." Destination table: `dispatch/CLAUDE.md` § "Mail routing — where mail actually goes"; full convention: `mediajunkie/docs/convention-cross-repo-mail-delivery.md`.

## ATTENTION ROLLUP & THE FLEET PROBE (convention, 2026-08-31 — from Xian's probe feedback)

`docs/ATTENTION-ROLLUP.md` is the ledger of things waiting on Xian, and
since 2026-08-29 it is also the **source for the fleet probe**
(`scripts/fleet-probe.mjs`, roadmap item R4.2-lite): its open items are
dealt into a One Job deck as cards that Xian answers from his phone.
That dual role imposes two hard rules, both learned from him using it:

**1. Every open item carries an explicit `**Ask:**` line — one
scannable sentence naming the single thing needed from him — plus a
`**Rec:**` line with my recommendation.** The card's TITLE becomes the
Ask verbatim, so the face of the card is the question. His words on the
first draft: *"We need to work on a format that is concise and clear
about what is needed of me."* The old cards pasted ledger prose onto
the card face; my internal reasoning is not an ask. Write the Ask
short enough to read at a glance on a phone (~60 chars); put the
elaboration in the Rec.

**2. Audit for staleness before every regeneration.** His other
observation: *"some items seemed possibly stale."* He was right — five
open items had been overtaken by events and never marked. An item
answered in conversation does NOT close itself; move it to *Settled*
with the answer recorded, in the same session the answer arrives.
Regenerating a deck from a stale ledger deals dead work to a real
person.

**3. Reconcile before declaring a restructure done** (added
2026-09-02, after a real loss). Any rewrite of the rollup — a staleness
sweep, a section split, a reorganization — must end with a diff of the
item list against the pre-rewrite state, accounting for every `###`
item: present, or explicitly recorded in *Settled*. Not optional, and
not satisfied by "it looks right." When I did this for the 08-31/09-01
restructures, twelve items had left Open and **seven had no Settled
entry at all** — their closures survived only in coral-logs, so the
ledger no longer recorded that they were ever decided. The mechanism is
that the rebuilt file reads as cleaner and therefore more trustworthy
than what it replaced, so nobody returns to check. A shrinking item
count is a finding, not a tidiness win. One-liner that does it:

```bash
git show <pre-rewrite-rev>:docs/ATTENTION-ROLLUP.md | grep '^### '
diff <(that) <(grep '^### ' docs/ATTENTION-ROLLUP.md)
```

**Rules 1 and 2 are enforced structurally, not by my diligence** — the
probe script refuses to write a deck if any heading lacks a recognized
status marker (🔴/🟡/🟢/✅) or any open item lacks an Ask, naming what
to fix. This is deliberate: a card that doesn't say what it wants, or
that shouldn't exist at all, is the exact failure mode the format
exists to prevent, so it is made impossible rather than discouraged.
Regression tests in `src/services/__tests__/fleetProbeClassify.test.ts`
assert both guards can actually fire.

**The probe's ceiling stays intact** (roadmap memo, 2026-08-26): no
MCP, no protocol, no adapter seam. It emits a v2-backup-shaped JSON
imported through Settings' existing "bring in as a new deck" path —
zero app code. If it grows an architecture, it has failed at its job.

## CRITICAL: Excellence Flywheel Methodology - READ FIRST

**WARNING**: Skipping this section will break our systematic excellence.

*Revised 2026-10-11 on xian's instruction: "update it to reflect how
the paradigm has evolved and what is stable about it." The earlier
text is kept verbatim in `docs/archive/CLAUDE-MD-HISTORY.md`.*

### The Excellence Flywheel

Quality → Velocity → Quality → Velocity (compounds infinitely)

**What is stable.** These have held since the first version, and the
move to local-first did not change them:

1. **Systematic Verification First** — check the existing patterns
   before implementing anything. Never guess.
2. **Fix at the right layer** — no quick fixes. Find the layer that
   owns the behaviour and change it there.
3. **Mobile-First Testing** — gestures and layout are proven on a
   mobile viewport or a real device, not assumed.
4. **Documentation-Driven Development** — the docs change in the same
   commit as the behaviour.

**What evolved.** In 2025 the layers were frontend → backend API →
database, and the contract to verify was React against FastAPI. Since
2026-07-02 the app is **local-first**: the layers are domain → store →
UI, everything lives on the device, and the contract to verify is the
`TaskStore` interface and the saved-data schema. The backend still
exists, but only for `?remote` mode.

If you haven't internalized these pillars, everything else will be
slower and more error-prone.

## DESTRUCTIVE-ACTION PROTOCOL (standing rule, 2026-07-05 — from Xian, after real data loss)

**Never reassure the user into destroying data, no matter how recent or
slight.** Before advising ANY step that deletes user data (removing a
PWA icon, clearing storage, replacing via import, uninstalling):

1. **Verify the safety copy by observation, not indication** — the user
   must OPEN the backup and see their tasks in it. A success toast, a
   file listing, or "the export ran" is not verification.
2. **Stage the steps** so verification sits BETWEEN backup and
   destruction, as its own halting step — the procedure stops there if
   verification fails.
3. **Weigh the stakes asymmetrically**: a stale, broken, or annoying app
   state is always preferable to any risk to user data. When a fix
   requires a destructive step, first look for the path that doesn't.

Context: on 2026-07-05 an iOS export silently failed while the UI
claimed success; the sanctioned reinstall procedure then destroyed the
user's real deck. The toast was fixed the same hour (FR4.0b.8: success
signals report observed outcomes only) — but the deeper rule is this
protocol.

**Umbrella (added 2026-07-06, from Piper Morgan's three-incident
pattern via the cross-pollination brief):** before ANY action with no
undo — `rm -rf`, force-push, volume/DB deletion, bulk updates,
full-replace API mutations, storage schema rewrites — pause and ask
whether a narrower, reversible alternative exists. "Probably disposable
state" is not verified-disposable. Tool-specific rules don't
self-generalize; this principle is the cross-tool version.

**Scope is not direction (added 2026-08-09, from PM's merge-drop
incident via the brief):** a path-surgical command can still destroy
work — `git checkout <ref> -- <path>` is scope-perfect and
direction-blind. Before ANY content-restoring git command, run
`git diff HEAD -- <path>`: non-empty output is uncommitted work about
to vanish — read it before deciding which side is stale. Never infer
staleness from "the fix exists upstream"; a merge can leave HEAD
holding the pre-fix state while the tree holds the fix. That inference
is most dangerous precisely when it feels most certain.

## Project Overview

One Job is a mobile-first task app. You see one card at a time and
act on it by swiping. Cards live in decks, and a card can hold a deck
of its own.

**Key Architecture:**
- **App**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + Framer Motion
- **Storage**: on the device (localStorage), through the `TaskStore` seam
- **Shipped as**: an installable PWA (onejob.co/app/) and a Capacitor iOS app
- **Backend**: FastAPI + SQLAlchemy + SQLite, used only in `?remote` mode
- **Design**: swipe gestures, single-card focus, decks within cards

## SYSTEMATIC VERIFICATION FIRST METHODOLOGY ⭐

### Our Biggest Breakthrough: "Check First, Implement Second"

**NEVER start implementation without verification.** This is non-negotiable and foundational to our productivity.

#### MANDATORY FIRST STEP - EXAMINE EXISTING PATTERNS

```bash
# The store seam: every data operation goes through it
sed -n '/export interface TaskStore/,/^}/p' src/services/taskStore.ts
grep -rn "getTaskStore()" src/ --include="*.tsx" --include="*.ts" | head -20

# How the UI calls the store, and refreshes afterwards
grep -n "handleComplete\|handleDefer\|handleAdd\|refreshTasks" src/pages/Index.tsx

# Domain rules and the saved-data schema
ls src/domain/ && grep -n "CURRENT_SCHEMA_VERSION" -r src/

# Things that arrive from outside (Siri, imports)
grep -n "export" src/services/shortcutsInbox.ts src/services/sourceAdapter.ts

# Gesture and layout components
grep -rln "swipe\|drag\|motion" src/components/ --include="*.tsx"

# Is there already a test for this behaviour?
ls src/services/__tests__/ src/domain/__tests__/ 2>/dev/null
```

#### Implementation Workflow (MANDATORY)

```
1. VERIFY → grep/find existing patterns
2. ANALYZE → which layer owns this: domain, store, or UI?
3. DESIGN → adapt the existing pattern to the requirement
4. IMPLEMENT → follow established conventions
5. DEBUG → if issues, add monitoring FIRST, never guess
6. TEST → npm test, tsc, and a mobile-viewport check if the UI changed
7. DOCUMENT → ROADMAP.md, the release note, and this file if a rule changed
```

No step has a time allowance. Verification takes as long as it takes.

#### Why This Works

1. **It prevents contract mismatches.** The founding example (2025):
   the frontend sent `{status: 'deferred'}` and the backend expected
   `{is_deferral: true}`. One grep found it in 30 seconds. Today the
   same mistake would be calling the store with a shape it doesn't
   take, or saving data in a shape the next version can't read.
2. **It keeps the mobile experience consistent.** Swipes must work
   reliably on touch devices.
3. **It avoids false starts.** Knowing the existing pattern is faster
   than inventing a second one.
4. **It finds the real cause.** The demo-panel bug looked like event
   timing; monitoring showed React was removing the elements. The
   Siri bug (build 41) looked like a storage problem; reading the
   lifecycle code showed the drain only ran on boot.

## TDD ZONES FRAMEWORK FOR ONE JOB

The three zones are stable. What sits in each has changed with the
architecture.

### 🔴 RED ZONE - Strict TDD Required

**MUST write tests FIRST for:**
- The `TaskStore` contract (any method's behaviour or shape)
- The saved-data schema, migrations, and backup import or export
- Card state logic (done, deferred, order, whole-subtree completion)
- Swipe handling (complete and defer)
- Anything that takes cards in from outside (Siri inbox, source adapters)
- Any code that could lose or reorder a user's cards

```bash
# Red Zone Process
1. Write a failing test that captures the requirement
2. Run it - MUST see it fail for the right reason
3. Write the minimal code to pass
4. Refactor if needed
5. Verify swipes on a mobile viewport or device
```

### 🟡 YELLOW ZONE - Architecture-First Allowed

**MAY develop architecture with tests for:**
- New UI components and views
- A new source adapter, read-only (Todoist is next)
- New animation or gesture patterns
- Native (Swift) additions

```bash
# Yellow Zone Process
1. Verify no existing pattern to follow
2. Design the component or adapter
3. Implement WITH tests
4. Test the mobile experience before declaring complete
5. Record the pattern for future use
```

### 🟢 GREEN ZONE - Test-After Acceptable

**CAN write tests after implementation for:**
- Styling and CSS improvements
- Documentation
- Build configuration
- Simple utility functions
- Proof-of-concept prototypes

**Decision Framework**: Before starting any work, ask:
1. **Could this lose, change or reorder a user's cards?** → RED ZONE
2. **Does it touch the store contract or the saved-data schema?** → RED ZONE
3. **Is this a new component, adapter or feature?** → YELLOW ZONE
4. **Is this styling, docs or tooling?** → GREEN ZONE

## ONE JOB ARCHITECTURE & CODE STRUCTURE

### Core Design Patterns

1. **Local-first, domain-driven**: all logic flows from the card and
   deck domain. The UI is built for single-card focus and swipes.

   - **NO QUICK FIXES**: fix issues at the correct layer (domain → store → UI)
   - **Card state logic belongs in the domain and the store**, not in
     component state
   - **All UI goes through `getTaskStore()`**, never to localStorage directly

2. **The store contract** (`src/services/taskStore.ts`):

   - `LocalTaskStore` is the default (key `oneJobTasks`).
     `DemoService` is the same store with seed data. `ApiTaskStore`
     runs only in `?remote` mode.
   - Optional methods (`importTasks`, `restoreTask`, `uncompleteTask`)
     exist only on stores that can guarantee them. The UI checks
     before offering the feature.
   - A card is `completed` or not. Deferral is an action
     (`deferTask`), never a status.
   - Saved data carries a `schemaVersion`. An older build must never
     overwrite data saved by a newer one.

3. **A new card takes the top, whoever adds it.** A card said to Siri
   or added by a Shortcut lands on top, exactly like one typed in
   (xian, 2026-10-12, reversing the 2026-09-12 "behind the top card"
   ruling after using it: "optional complexity"). There is no
   `placement` option any more. Arrivals in bulk (an import) land in
   a deck of their own, named for the service; xian's idea for them
   (10-12, not decided) is a deck inside one new card on top.
   External sources plug in at `SourceAdapter`
   (`src/services/sourceAdapter.ts`), read-only until write access is
   earned (ROADMAP R3.4).

   **Removing a deck never removes a card** (xian, 2026-10-13). A
   deck is deleted only when empty; `moveAllCardsToDeck` empties it
   into a deck the user picks, and `moveDeckIntoCard` puts a whole
   deck inside a card. The one exception is `deleteSourceDeck`: a
   deck attached to a service may be deleted with its cards when the
   user detaches it, behind a confirmation that names the count.

4. **Mobile-Optimized Component Hierarchy (Card Deck Experience)**:

   - **CardDeck**: Main interface — deck underlay, active card, long-press arc menu
   - **FlipCard**: Two-sided 3D flip (perspective + backface-visibility); exports shared `CARD_GEOMETRY`
   - **SwipeableCard**: Framer Motion drag wrapper (finger tracking, tilt, Done/Later hints, fling)
   - **CardBack / TaskCard**: Presentational faces (playing-card back / task content)
   - **LongPressMenu**: Arc menu (Add Task / Completed / Integrations / Settings)
   - **TaskForm**: Quick task creation (inline in empty state, modal from arc menu)
   - **TaskDetails**: Modal for editing with substacks
   - **SubstackView / TaskStack**: Nested navigation, built on the same SwipeableCard + TaskCard pieces

5. **Hierarchical Task Organization**:
   - **Everything lives on the device** (LocalTaskStore, localStorage).
     The FastAPI backend is used only in `?remote` mode. See "1.0
     direction: local-first PWA" near the end of this file.
   - **Decks** hold cards. A card can hold an interior deck of sub-cards
     (the older code calls these "substacks").

### Key Components

- **App shell** (`src/pages/Index.tsx`): main application logic; calls the store
- **Store seam** (`src/services/taskStore.ts`, `localTaskStore.ts`): where cards are kept
- **Domain** (`src/domain/`): card and deck rules, schema migration
- **Outside arrivals** (`shortcutsInbox.ts`, `sourceAdapter.ts`, `githubAdapter.ts`)
- **Native** (`native/ios/`, `ios/`): the Capacitor app and the Add Card intent
- **UI components**: shadcn/ui based, in `src/components/`
- **Backend** (`backend/main.py`): FastAPI, `?remote` mode only

### Integration Points

- **Current**: GitHub issue import (`src/services/githubAdapter.ts`, a
  token the user supplies), the Siri / Shortcuts "Add Card" intent
  (`native/ios/AddCardIntent.swift` → `src/services/shortcutsInbox.ts`),
  and demo mode.
- **Retired**: the Zapier export and the Asana and Todoist stubs
  (removed in rc.36).
- **Candidates**: see ROADMAP.md, including its holding pen. Nothing
  outside the roadmap is canonical.

## CONTRACT VERIFICATION

The idea is stable: before changing how two parts talk, read both
sides. The parts have changed.

### The contracts that matter now

1. **UI ↔ store.** Read the `TaskStore` interface before calling or
   changing a method. Check every store that implements it.
2. **This version ↔ saved data.** A change to what gets saved needs a
   migration and a test that an old document still loads.
3. **Native ↔ web.** The Add Card intent writes a pending queue
   (`oneJobPendingCards`) that `shortcutsInbox.ts` drains. Change both
   sides together.
4. **Backup files.** Export and import shapes are a contract with
   every backup a user has ever saved.

```bash
# Before a store or schema change:
sed -n '/export interface TaskStore/,/^}/p' src/services/taskStore.ts
grep -rn "implements TaskStore" src/
grep -rn "schemaVersion\|migrateDocument" src/ | head
npm test
```

### Common contract mistakes to avoid

❌ **WRONG**: treating "deferred" as a status
✅ **CORRECT**: deferral is an action (`deferTask`); a card is done or not

❌ **WRONG**: reading or writing localStorage from a component
✅ **CORRECT**: go through `getTaskStore()`

❌ **WRONG**: assuming every store has `importTasks` or `restoreTask`
✅ **CORRECT**: check the method exists; the UI hides the feature if not

### `?remote` mode only: the FastAPI contract

These apply only when working on `ApiTaskStore` or `backend/`.

- Update payloads: `{ title?, description?, status?: 'todo' | 'done', is_deferral?: boolean }`
- Create payloads: `{ title, description? }`
- Only `'todo'` and `'done'` are valid statuses. Defer with `{is_deferral: true}`.
- The backend returns `status`; the app maps it to `completed`.
- Endpoints: `GET /tasks`, `POST /tasks`, `PUT /tasks/{id}`,
  `POST /tasks/{id}/substacks`, `POST /substacks/{id}/tasks`,
  `PUT /substack-tasks/{id}`.
- Check the Pydantic models in `backend/main.py` before sending a payload.

## DEMO PAGE DEBUGGING METHODOLOGY ⚡

### The "Monitor First, Fix Second" Approach

When demo functionality fails, **NEVER guess at solutions**. Use systematic monitoring to reveal the actual problem.

#### MANDATORY Debugging Process for Demo Issues

```bash
# 1. Add comprehensive console logging first
console.log('=== FUNCTION CALLED ===');
console.log('Target element:', document.getElementById('target'));
console.log('Element exists:', !!document.getElementById('target'));
console.log('Element properties:', element ? element.style : 'N/A');

# 2. Add debug buttons for direct testing
<button onclick="debugFunction()">Debug Test</button>

# 3. Monitor DOM changes that might interfere
setInterval(() => {
  const element = document.getElementById('target');
  if (!element) console.warn('Element disappeared!');
}, 1000);
```

#### Common Demo Page Gotchas (Learned from Experience)

**🚨 React App DOM Interference**
- **Problem**: React app removes/replaces DOM elements outside `#root`
- **Symptoms**: `getElementById()` returns `null` unexpectedly
- **Detection**: Element exists in HTML but not when JavaScript runs
- **Solution**: Monitor and auto-recreate removed elements
```javascript
// Monitor for React interference
function ensureElementExists() {
  const element = document.getElementById('target');
  if (!element && !localStorage.getItem('elementHidden')) {
    recreateElement();
  }
}
setInterval(ensureElementExists, 1000);
```

**🚨 DOMContentLoaded Timing Issues**
- **Problem**: Scripts run before DOM elements are ready
- **Symptoms**: Event listeners don't attach, elements not found
- **Detection**: Check `document.readyState` and element existence
- **Solution**: Always wrap in DOMContentLoaded or use monitoring
```javascript
console.log('Document ready state:', document.readyState);
document.addEventListener('DOMContentLoaded', function() {
  // Attach listeners here
});
```

**🚨 Event Listener Conflicts**
- **Problem**: Multiple scripts or React interfering with events
- **Symptoms**: Click events don't fire or fire unexpectedly
- **Detection**: Log every event and check `event.target`
- **Solution**: Use event.stopPropagation() strategically
```javascript
element.addEventListener('click', function(event) {
  console.log('Event fired, target:', event.target);
  event.stopPropagation(); // Prevent React interference
});
```

#### Debugging Commands for Demo Issues

```bash
# Check if GitHub Pages deployed correctly
curl -I https://onejob.co/demo.html
curl -I https://onejob.co/app/assets/index-[hash].js

# Verify asset paths in demo.html match deployed structure
grep "src=" demo.html
ls -la app/assets/

# Test React app loading in isolation
# Open browser dev tools and check:
# - Console errors
# - Network tab for failed asset loads
# - Elements tab for missing DOM elements
```

#### Demo Debugging Workflow (MANDATORY)

```
1. REPRODUCE → Confirm exact failure conditions
2. MONITOR → Add console logging throughout affected code  
3. DEPLOY → Push debugging version to staging
4. OBSERVE → Check browser console for actual vs. expected behavior
5. DIAGNOSE → Identify root cause from monitoring data
6. FIX → Address root cause, not symptoms
7. VERIFY → Test fix works in all scenarios
8. CLEAN → Remove debug logging in production version
```

#### Success Pattern: Instructions Panel Bug

**What we learned:**
- ❌ **Wrong assumption**: Event listeners not attaching properly
- ✅ **Actual cause**: React app removing DOM elements entirely
- 🔧 **Fix**: Monitor and auto-recreate removed elements
- ⚡ **Time saved**: 15 minutes vs. hours of DOM timing guesswork

**The debugging approach that worked:**
1. Added comprehensive console logging
2. Created debug button for direct testing  
3. Logged element existence at each step
4. Discovered React was removing elements
5. Implemented monitoring solution

## MOBILE-FIRST TESTING REQUIREMENTS

### Testing Strategy

Since One Job is mobile-first, testing must include actual mobile devices:

1. **Laptop Testing**: Initial development and debugging
2. **Mobile Browser Testing**: Real device testing for touch interactions
3. **Swipe Gesture Verification**: Ensure complete/defer gestures work reliably
4. **Responsive Design Check**: Verify layout works across screen sizes

### Mobile Testing Checklist

```bash
# After any UI changes, verify:
- [ ] Swipe right completes tasks properly
- [ ] Swipe left defers tasks to bottom of stack  
- [ ] Tap opens task details modal
- [ ] Task form is usable on mobile keyboard
- [ ] Navigation between main tasks and substacks works
- [ ] Cards are appropriately sized for mobile screens
- [ ] Loading states don't break mobile experience
```

### Testing Commands

```bash
# Start development server for mobile testing:
npm run dev  # localhost:8081 on Amber (8080 is occupied). No backend needed.

# Verify mobile-critical components:
grep -r "swipe\|gesture\|touch" src/components/ --include="*.tsx"
grep -r "mobile\|responsive" src/ --include="*"
```

## SESSION MANAGEMENT

### DUTY FIRES: THE FIRE IS A WAKE, NOT A TIME-BOX (xian, 2026-10-08)

A duty-cycle fire (the 17:49 LaunchAgent) wakes me. It does not set
my agenda. After the fire's checklist (sync, mail, push, log):

1. **Drain.** List every unblocked item: mail, asks, my own queued
   work, commitments I made. Do each one now.
2. **Re-check mail**, and repeat. Go idle only after **two consecutive
   checks find nothing new and nothing unblocked**.
3. **No deadlines on unblocked work.** "Next fire", "tomorrow" and
   "working session" are not reasons. Defer only with a **named
   blocker**: a person who owes an input, a missing artifact, or an
   external event.
4. **Every fire entry carries a `Drain:` line** saying what was done
   and each deferral with its blocker. `Drain: nothing unblocked after
   two checks` is valid. The pre-commit hook enforces it
   (`scripts/check-log-drain.mjs`; tests in
   `src/services/__tests__/checkLogDrain.test.ts`).

Canonical text: `mediajunkie/designinproduct` →
`docs/conventions/duty-cycle-drain.md`.

### Session Logging Protocol

**MANDATORY**: Every session MUST begin with creating or updating a session log. This ensures continuity across sessions and captures valuable insights.

#### First Session of Each Day

1. **Create new session log**: `development/coral-logs/YYYY-MM-DD-coral-log.md`
   (canonical since 2026-07-02; the older `development/session-logs/` files
   are the historical record. Coral logs feed the Design in Product
   cross-pollination briefing sweep — include an "Innovations worth
   cross-pollinating" section.)
2. **Include standard header**:
   - Session start time and timezone
   - Git status and recent commits
   - Current project phase
   - Session objectives
3. **Review key documents**:
   - CLAUDE.md (this file)
   - Recent commits for context
   - Previous day's session log if applicable

#### Additional Sessions Same Day

1. **Append to existing log** with clear separator:
   ```markdown
   ---
   ## Session #2: 2:30 PM PST
   ```
2. **Reference previous session's progress**
3. **Update objectives based on earlier work**
4. **Continue incrementing session numbers**

#### Standard Session Start Checklist

```bash
# MANDATORY session initialization steps:
1. Review CLAUDE.md for methodology and patterns
2. Create/update session log at development/coral-logs/YYYY-MM-DD-coral-log.md
3. Run git status and review recent commits
4. CHECK CI: gh run list --workflow=deploy.yml --limit 1  — and any open
   "CI red" issue. (Added 2026-09-10: CI was silently red for NINE DAYS
   — 65 failures since 08-31, nothing deployed, live site stale all
   week — because failure emails go to an agent identity with no inbox.
   A green local suite proves nothing about the deploy; the workflow's
   ci-red-beacon job now files an issue on failure, but the check costs
   five seconds and the beacon could itself break.)
5. Create TodoWrite list for session tasks
6. Verify development environment if implementing
7. Check docs/ROADMAP.md and the board for current status (REQUIREMENTS.md is retired)
```

#### Session Log Template

```markdown
# Session Log: YYYY-MM-DD

## Session Start: HH:MM AM/PM PST

### Context
- Environment: Claude Code (model: read it from the session, do not assume)
- Project: One Job
- Git Status: [clean/modified]
- Recent Commits: [list 3-5]
- Current Phase: [from docs/ROADMAP.md]

### Session Objectives
1. [Primary objective]
2. [Secondary objective]
3. [Additional tasks]

### Session Activities
[Timestamp] - [Activity description]

### Notes & Insights
- [Key discoveries]
- [Patterns identified]
- [Decisions made]

### Session End Summary
- Completed: [what was done]
- Pending: [what remains]
- Next Session: [recommendations]
```

### Development Environment Status (Updated 2026-07-28 — now on Amber)

**Host:** Amber.local (Mac Studio), shared with the other constellation
residents. Repo lives at `~/Development/one-job`, direct on `main`, no
worktree. Sibling agents' repos are siblings on the same volume — which
is how mail reaches them (see the mail rules at the top of this file).

**Current Service Configuration:**
- **Frontend**: Vite — `npm run dev`. Config asks for **8080**, but
  **8080 is taken on Amber** by mediajunkie's `local_chat.py`, so Vite
  auto-falls-back to **8081**. Both are expected; don't "fix" it.
- **Backend**: FastAPI on `http://127.0.0.1:8000` (8000 is free and ours).
  Optional — the app is local-first and needs no backend unless `?remote`.
- **Database**: SQLite at `backend/onejob.db` (only in remote mode).

**Environment Setup Commands:**
```bash
# Frontend (from /Users/xian/Development/one-job)
npm run dev  # → http://localhost:8081/ on Amber (8080 is occupied).
             # host: true binds IPv4+IPv6 — the old "::" was IPv6-only,
             # which read as "server unreachable" for a whole session.

# Backend, only if you need ?remote (from backend/)
source venv/bin/activate   # venv is NOT provisioned on Amber; create if needed
python -m uvicorn main:app --reload --port 8000
```

### TOOLCHAIN TRAPS ON A NEW MACHINE (learned 2026-07-28, the hard way)

Three failures on first contact with Amber, none of them One Job bugs —
all **undeclared dependencies**. Full write-up:
`docs/ENVIRONMENT-CLEANUP-2026-07-28.md`. The short version:

1. **npm ≥ 11.17 blocks dependency install scripts.** A fresh
   `npm install` reports success while producing a tree with **no
   esbuild binary and no @swc native binding** — vite then cannot
   build. Approvals are recorded in `package.json` (`allowScripts`), so
   this should not recur; if it does,
   `npm approve-scripts esbuild @swc/core fsevents`.

2. **Don't trust a green/red test suite across Node versions.** jsdom
   no longer ships its own `localStorage`; it defers to the platform's.
   **Node 26 has a built-in one that is inert without
   `--localstorage-file`** → `window.localStorage` is `undefined` and
   63 storage tests fail. Node 22 has no built-in, so jsdom's shone
   through and the same commit was green. `src/test/setup.ts` now owns
   an in-memory Storage so the suite is host-independent. **Do not
   delete it** to "use the real localStorage."

3. **Playwright: match the browser already in the cache.** Screenshots
   remain the standard of proof for gesture work, but Playwright is
   deliberately **not** a project dependency. Amber's cache has
   **chromium-1228**, which is **playwright@1.61.0** — 1.62 wants 1234
   and would download a second ~150MB browser into a *shared* cache.
   Install into the scratchpad, not the repo:
   ```bash
   cd "$SCRATCHPAD" && npm install playwright@1.61.0
   # then drive http://localhost:8081 at 390x844, hasTouch: true
   ```
   If the cache revision ever changes, find the matching Playwright by
   reading `node_modules/playwright-core/browsers.json`.

4. **A green `npm install` on YOUR npm version proves nothing about
   `npm ci` on the OTHER one — check optional peers.** (2026-08-16, cost
   3 days of silently-failed deploys.) `npm audit fix` on 08-13 left
   `package-lock.json` in a state npm 11 (Node 26, Amber's default)
   accepted via `npm ci` but npm 10 (Node 22, CI's other matrix leg)
   rejected: `Missing: esbuild@0.28.2 from lock file`. Root cause:
   vitest's own nested `vite` had resolved to the rolldown-based 8.x,
   where `esbuild` is an **optional peer dependency**
   (`peerDependenciesMeta.esbuild.optional: true`) — whether npm
   decides to satisfy and lock in an optional peer is where `npm ci`
   gets non-deterministic, reproduced identically under the *same*
   npm 10.9.8/Node 22.23.2 binary locally (installed via
   `brew install node@22`, keg-only — doesn't touch Amber's shared
   default `node`) and in CI. **Fix: pin the ambiguous nested package to
   a version that doesn't have the optional peer** (`overrides`:
   `vitest.vite` pinned to `^7.1.0`, pre-rolldown, where esbuild is a
   regular non-optional dependency) — not by pinning the optional peer's
   *version* directly, which just hoists it to the shared top-level slot
   and can break whatever ELSE needed a different version there (first
   attempt did exactly this: hoisted esbuild 0.28.2 over the production
   `vite@5.4.21`'s required `^0.21.3`, breaking `npm run build` — caught
   only by actually running the build, not by green tests). **Whenever
   `npm audit fix` or any dependency bump touches devDependencies,
   verify `npm ci` (not `npm install`) succeeds under BOTH engine
   versions before trusting it** — a local `npm install` including on
   the "other" Node version isn't the same check as `npm ci`, and CI's
   own green run is the only real proof; watch it, don't infer it.

**Node policy:** `engines` declares **>=22** and CI runs the suite on
**both 22 and 26**, so host-dependence gets caught by machines rather
than discovered on arrival. Amber runs 26 (Homebrew, no nvm).

**Ports:** **8081 is One Job's**, recorded in Amber's port registry
(Pard, 2026-07-28). 8000 is ours too, for FastAPI if `?remote` is ever
needed. 8080 belongs to mediajunkie's `local_chat.py`.

### GIT IDENTITY ON AMBER (convention, 2026-07-28)

The rule, in one line (Pard, constellation-wide after Janus's
git-identity hygiene closure):

> **Repo-local identity names the resident; visitors override
> per-commit; global stays unset forever.**

- This repo's commits are authored **`Coral (One Job)
  <coral@onejob.local>`**, set repo-local.
- **Global `user.*` is deliberately unset** volume-wide. That is a
  feature: an unconfigured repo cannot silently inherit somebody else's
  name. It also means a newly provisioned repo will attribute its first
  commits to whoever provisioned it until the local identity is set —
  which is exactly what happened here (three commits carry Pard's name),
  and is now a step in Amber's provisioning checklist.
- **Working in another agent's repo?** Never touch their config.
  Override per commit:
  ```bash
  git -c user.name="Coral (One Job)" -c user.email=coral@onejob.local commit …
  ```

**Authorship seam:** commits before **2026-07-28** are
`Claude <noreply@anthropic.com>`; from that date they are
`Coral (One Job)`. The boundary is the Amber migration and is meant to
be visible — Xian's ask was simply that the switch date be noted in the
repo, which this paragraph is.

### Immediate Actions for Each Session

- **Create/update a todo list** to track progress
- **Verify current status** with git status and recent commits
- **Check CI** (see the session start checklist above)
- **Document decisions** made during implementation
- **Test the mobile experience** if making UI changes

### Pre-Implementation Checklist

Before starting ANY implementation:

1. **Read docs/ROADMAP.md** - Understand current status (REQUIREMENTS.md is retired)
2. **Check git status** - Know what's been modified recently
3. **Run `npm test`** - Know the baseline is green before you change it
4. **Read the store contract** if the change touches data
5. **Look at the current mobile experience** - Understand the baseline before changing it

### Key Files to Review

- `docs/ROADMAP.md` - Current project status and roadmap
- `docs/VISION.md` - The covenants
- `src/services/taskStore.ts` - The store contract
- `src/pages/Index.tsx` - Main application logic
- `src/types/task.ts` - Type definitions
- Recent git commits - Recent changes and decisions

## DEVELOPMENT COMMANDS

### Environment Setup

```bash
npm ci
npm run dev            # asks for 8080; lands on 8081 on Amber

# Backend, only for ?remote work (venv is not provisioned on Amber)
cd backend
python -m venv venv && source venv/bin/activate
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

### Testing Commands

```bash
npm test                                  # the suite (vitest)
npx tsc --noEmit -p tsconfig.app.json     # typecheck (CI runs this too)
npm run build                             # production build; also syncs demo.html
npm run preview                           # serve the production build

# Mobile experience: open the URL Vite prints at a phone viewport,
# or use Playwright from the scratchpad (Toolchain traps § 3).
```

### Native build

```bash
npm run build:native && npx cap sync ios
# then archive, export and upload: see docs/releases/ and store/
```

## QUALITY ASSURANCE

### Code Quality Standards

- **TypeScript**: Strict mode enabled, minimize `any` types
- **React**: Functional components with hooks, proper dependency arrays
- **Python** (`?remote` only): Type hints encouraged, follow FastAPI patterns
- **Mobile-First**: All UI changes must be tested on mobile device
- **Store contract**: UI calls must match the `TaskStore` interface

### Documentation Requirements

- **ROADMAP.md**: Update in the same commit as each release note
- **Release notes**: one file per build in `docs/releases/`
- **Code Comments**: Document complex swipe gesture logic and state management
- **Architecture Decisions**: Document why certain patterns were chosen

### Git Workflow

- **Commit frequently** with descriptive messages
- **Test before committing** (especially store and schema changes)  
- **Update documentation** with implementation changes
- **Create GitHub issues** for bugs and feature requests

## PRODUCT TIER DISCIPLINE (standing rule, 2026-07-29 — from Xian)

Every roadmap step's plan must carry a **tier evaluation** (free / pro /
open question). The rc-1.0 MVP set is entirely free; new features may
ship paid-first and trickle down later, so pro-leaning features must be
built *cleanly severable* (a flag, not a fork). Leans and the release-
flow model live in docs/PRICING.md (2026-07-29 addendum).

## CURRENT DEVELOPMENT FOCUS

This section points to where the current state lives, so it can't go
stale here:

- **What's shipped and what's next:** `docs/ROADMAP.md`. As of
  2026-10-10, 1.0 and 1.1 are live on the App Store, and 1.1.1 is on
  TestFlight.
- **What's waiting on xian:** `docs/ATTENTION-ROLLUP.md` (the board).
- **What happened, day by day:** `development/coral-logs/`.
- **Product principles:** `docs/VISION.md`.
- `REQUIREMENTS.md` was **retired on 2026-10-11** (on xian's terms). The
  box at its top says what replaced each part and how each
  replacement is kept current. Keep ROADMAP.md current in the same
  commit as each release note.

The earlier text of this section is in `docs/archive/CLAUDE-MD-HISTORY.md`.

## CURRENT SESSION STATUS (Updated 2026-07-02)

### 1.0 direction: local-first PWA

One Job is now **local-first**: tasks live on the device (localStorage) and no
backend is required unless explicitly configured. The persistence seam is
`src/services/taskStore.ts` (TaskStore interface):

- **LocalTaskStore** — default; key `oneJobTasks`
- **DemoService** — LocalTaskStore + seed data + playful messages; key
  `oneJobDemoTasks` (demo.html, `?demo`, or VITE_DEMO_MODE)
- **ApiTaskStore** — FastAPI backend; only when `VITE_API_URL` is baked into
  the build, or `?remote` during development

All UI goes through `getTaskStore()` — future adapters (Todoist, Jira, MCP)
plug in at this interface. Substack tasks now persist in local AND remote
modes (remote uses POST /substacks/{id}/tasks + PUT /substack-tasks/{id}).

The app is an installable PWA (vite-plugin-pwa, autoUpdate): manifest +
card-medallion icons + service worker; verified offline reload. Install from
onejob.co/app/ via "Add to Home Screen."

Dev note: `npm run dev` now runs in local mode by default — append `?remote`
to hit a local FastAPI backend at 127.0.0.1:8000.

## STANDING CODE GOTCHAS

- **Keep the explicit `w-full` on the app shell** in Index.tsx. A
  `max-w-md mx-auto` container inside a flex column has no intrinsic
  width once its children are `w-full`.
- **Never hand-edit demo.html's hashed bundle references.** `npm run
  build` syncs them (`scripts/sync-demo-assets.mjs`).
- **Gesture and layout work is proven with Playwright screenshots** at
  a mobile viewport, not by guessing (see Toolchain traps § 3 for the
  pinned version).

Superseded session-status sections (2026-07-01, 2025-08-02) are kept
verbatim in `docs/archive/CLAUDE-MD-HISTORY.md`.

---

*This document represents our systematic approach to One Job development. It will be updated as we discover new patterns and refine our methodology.*