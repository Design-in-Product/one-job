# Feature stages — Xian's four tiers, as mechanism

**Author:** Coral · 2026-08-06 · **Status:** framework for review;
GitHub import is the motivating case ("we don't have to spend too much
time perfecting github yet"). His tiers, verbatim in substance:

| Stage | Who sees it | Gate mechanics (proposed) |
|---|---|---|
| **1 · Released, free** | everyone | no gate |
| **2 · Released, pro** | pro devices | `hasPro()` (today's wall) |
| **3 · Beta** | pro devices opted into beta + TestFlight testers | `hasPro() && betaOptIn` (a Settings toggle) OR native build flag |
| **4 · Alpha** | Xian's browser only | dev server / `?alpha` device flag — never in a store build |

## Mechanics (small, honest)

One registry, one hook:

```ts
// src/services/featureStages.ts
export const STAGES = {
  githubImport: 'beta',      // demoted: all-repos scope flaw (08-06)
  trelloImport: 'alpha',     // when it exists
  deckIdentity: 'pro',       // rides the multi-deck wall
  // released-free features are simply absent from this registry
} as const;
export const featureOn = (f: keyof typeof STAGES): boolean => ...
```

- **Beta opt-in**: a Settings toggle, visible only on pro devices —
  "Beta features: on/off". Native (Capacitor) builds count as beta by
  default (TestFlight testers ARE the beta channel).
- **Alpha**: `import.meta.env.DEV` or a `?alpha` device flag that the
  build strips from store copy; alpha features never appear in
  production UI even comp'd.
- The registry is the ONLY place a feature's stage lives — promotion is
  a one-line diff with a dated commit, which gives the drumbeat
  (below) its changelog for free.

## First assignments (proposal)

- **githubImport → beta.** Working but wrong-shaped (all-repos import;
  see the v2 spec in the survey doc). Beta is exactly for this: usable
  by consenting testers, absent from 1.0's pro story.
- Everything else currently shipped → stays released (free or pro as
  per PRICING) — no retroactive demotions without cause.

## Relationship to the release drumbeat (his 08-06 note)

"Shipping an MVP and then releasing updates… a steady drumbeat of
improvements as soon as there are any active users at all is a nice way
of showing attention and liveliness." The stages give the drumbeat its
supply line: alpha → beta → released promotions are cheap, dated,
one-line events — a cadence of real improvements without holding
anything back for drama. Store updates ship the *released* tier;
beta/pro users feel the drumbeat earlier.

## GitHub v2 spec (parked at beta until after 1.0)

His requirements, recorded: **(1)** never import all-repos ("no user
will ever want that one giant deck" — v1's flaw, mine); **(2)** the
flow is *pick a repo* (maybe a project board) → import that scope's
issues; **(3)** metadata adapted/flattened into our fields and **labeled
conventionally so a future round-trip could parse them back**
(provenance already carries `owner/repo#n`; labels/milestones/assignee
would flatten into a structured description block or data-only fields).
**(4)** On his token: a properly repo-scoped fine-grained PAT *would*
have bounded v1's over-fetch — the `/issues?filter=assigned` endpoint
returns only what the token can see. So both things are true: my
endpoint choice was too broad AND full scoping would have contained it.
v2 uses `/repos/{owner}/{repo}/issues` and asks the user which repo —
binding by design, not by token accident.
