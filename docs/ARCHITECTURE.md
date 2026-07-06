# One Job — Architecture

**Rewritten**: 2026-07-03 (Coral) to match the shipped local-first 1.0
and the target domain model. The previous version of this file described
the pre-1.0 backend-centric three-tier design; see git history if you
need it. Companions: DOMAIN-MODEL.md (concepts), ROADMAP.md (sequence),
DEPENDENCIES.md (why that sequence).

## Architecture in one paragraph

One Job is a **local-first React PWA** (also shipped as Capacitor
iOS/Android shells) whose entire persistence story passes through one
seam: the **TaskStore interface**. The device owns the data; a backend
is an opt-in adapter, not a requirement. Everything on the roadmap —
recursive cards, lifecycle decks, source federation, agent inboxes —
lands as either a domain-layer change *behind* that seam or a new
adapter *implementing* it.

## Current layers (shipped, 1.0-rc)

```
┌───────────────────────────────────────────────────────────┐
│ Presentation (React 18 + TS + Tailwind + Framer Motion)   │
│  CardDeck → FlipCard → SwipeableCard → TaskCard/CardBack  │
│  LongPressMenu · TaskForm · TaskDetails · SettingsView    │
│  SubstackView/TaskStack · CompletedTasksView              │
│  i18n: all strings via i18next (src/i18n/locales/en.json) │
├───────────────────────────────────────────────────────────┤
│ Store seam (src/services/taskStore.ts)                    │
│  getTaskStore() selects by storageMode (src/config.ts):   │
│   • LocalTaskStore   – default; localStorage 'oneJobTasks'│
│   • DemoService      – LocalTaskStore + seeds + messages  │
│   • ApiTaskStore     – FastAPI backend (VITE_API_URL /    │
│                        ?remote only)                      │
├───────────────────────────────────────────────────────────┤
│ Platform                                                  │
│  PWA: vite-plugin-pwa (autoUpdate), offline-verified      │
│  Native: Capacitor (co.onejob.deck), dist-native build,   │
│   nativeStorageBridge mirrors localStorage → Preferences, │
│   haptics on swipe commit                                 │
│  Backend (optional): FastAPI + SQLAlchemy (backend/),     │
│   Render-ready; unused in local mode                      │
└───────────────────────────────────────────────────────────┘
```

Key invariants already enforced:

- **UI never touches storage directly** — every mutation goes through
  `getTaskStore()`.
- **Dates are revived recursively** on load and import (shared
  `reviveTask`; regression-tested).
- **Backup round-trip** (Settings export/import) is the migration and
  disaster story; any schema change must survive it.
- **Verification is behavioral**: UI changes are driven in Chromium at
  mobile viewport (Playwright) before shipping; store logic is covered
  by the vitest suite.

## Known divergences from the domain model

Today's shapes predate the vision conversation (2026-07-03). They work,
and they are wrong in these specific ways (details in DOMAIN-MODEL.md
§7):

1. Nesting is `Substack { name, tasks[] }` — one level, named,
   mandatory — instead of recursive card interiors.
2. State is `completed: boolean` instead of deck membership; Done is a
   read-only view, not a place with gestures.
3. There is one deck; no canvas, no multiple top-level decks.
4. `source`/`externalId` exist but nothing consumes them — provenance
   is not yet a concept.

## Target seams (where roadmap stages attach)

### 1. Domain layer (R1) — new module, pure TypeScript

Extract the rules from components into `src/domain/`: card/deck/canvas
types, the operations (`complete`, `defer`, `advance`, `regress`,
`promote`, `addCard`), and the lifecycle-chain logic — no React, no
storage, fully unit-testable. Components become thin: gesture →
domain operation → store persist → re-render.

**Schema v2** (R1.3) lives here: a versioned document
(`{ schemaVersion, canvases/decks/cards }`) with a one-way migration
from v1 (flat tasks + substacks). Migration rules: v1 substack tasks
become interior cards of the parent; `completed: true` cards move to
the Done system deck; every card gains a provenance path. The store
seam keeps the same interface; only the document shape changes.

### 2. View state machine (R2)

The zoom continuum (canvas ⇄ deck ⇄ card) is a small explicit state
machine, not routing: `{ focus: canvasPath, zoom: level }`. Pinch and
pan mutate it; system decks and settings live at canvas coordinates.
The long-press menu becomes a shortcut layer over spatial locations
rather than the only door.

### 3. Source adapters (R3)

```
interface SourceAdapter {
  service: string;                          // 'asana' | 'trello' | ...
  pull(): Promise<ExternalCard[]>;          // R3.2 import (read-only)
  push?(change: CardChange): Promise<void>; // R3.4 sync (earned later)
}
```

Adapters *feed* the local store; they never replace it. The **mapping
store** (R3.3) — `oneJobId ⇄ {service, externalId, fieldMap,
lastSyncedHash}` — is a first-class, user-inspectable artifact,
persisted next to the deck document. Normalization happens at the
adapter edge; the One Job overlay (deck order, interiors, history,
lifecycle placement) is never written back to sources.

ApiTaskStore's future is *inside* this seam: the FastAPI backend
becomes one more source ("your One Job server"), not a privileged mode.

### 4. Agent inbox (R4)

The MCP server (design memo: docs/MCP-DESIGN.md) is architecturally a
`SourceAdapter` whose service is an agent inbox: agents deal cards into
a server-side mail slot; the app *pulls* them like any import; status
events flow back on complete/defer. Local-first authority is preserved
— agents never write into the authoritative store, and (invariant) no
agent can reorder a deck. Piper Morgan is the intended first client.

## Build & delivery pipeline (unchanged by the above)

- `npm run dev` — local mode (append `?remote` for a local FastAPI).
- `npm run build` — web/PWA to `app/`, then syncs demo.html hashed
  bundle refs (scripts/sync-demo-assets.mjs).
- `npm run build:native` — capacitor mode (base './', HashRouter) to
  `dist-native/`, then `npx cap sync`.
- GitHub Pages deploy on push to main (VITE_API_URL repo var: unset ⇒
  local/demo; set ⇒ remote mode baked in).
- Android CI: debug APK + signed AAB workflows (secrets pending
  keystore).

## Testing architecture

- **Store/domain**: vitest + jsdom (`src/services/__tests__/`, 13 tests
  today; the domain layer lands with its own suite — RED ZONE for
  schema v2 and lifecycle logic).
- **Backend**: pytest with per-test in-memory SQLite (conftest.py).
- **Behavioral**: Playwright at 390×844 against the dev server — the
  standard of proof for every UI change ("screenshots beat guessing").
- **Migration** (upcoming, R1.3): fixture v1 documents → migrate →
  assert v2 shape → export → import → assert round-trip.
