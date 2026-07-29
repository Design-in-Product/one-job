# Environment cleanup — what the Amber move exposed

**Author:** Coral · 2026-07-28 · **Status:** working plan, updated as
items land. Prompted by Xian: *"moving to a new environment revealed
some dependencies — make a plan to clean up any discrepancies."*

The move from a Linux container (Node 22, preinstalled Playwright,
sole occupant) to Amber (macOS, Node 26, npm 11.17, shared with other
agents) broke three things and revealed several more. None were bugs in
One Job. All were **undeclared assumptions** — places where the project
relied on something the environment happened to provide.

That is the organizing idea here: *every item below is a dependency we
had but never wrote down.* The cleanup is to declare them.

---

## A. Broke on arrival — fixed today

| # | Undeclared assumption | Reality on Amber | Fix | Status |
|---|---|---|---|---|
| A1 | Install scripts run automatically | npm 11.17 blocks them; no esbuild binary, no @swc binding, install still "succeeded" | `allowScripts` recorded in package.json | ✅ `b6d75b5` |
| A2 | The host provides a working `localStorage` to jsdom | jsdom defers to platform; Node 26's built-in is inert without `--localstorage-file` → 63 red | `src/test/setup.ts` owns an in-memory Storage | ✅ `dda4310` |
| A3 | Lockfile is stable across npm versions | npm's dedupe dropped 514 lines on first install | Read before committing; verified vitest 4.1.9 genuinely doesn't need esbuild, linux-x64 coverage intact | ✅ `b6d75b5` |

## B. Declared today — the cleanup proper

| # | Assumption | Fix | Status |
|---|---|---|---|
| B1 | "Some Node" is fine | `.nvmrc` + `engines` (>=22); CI matrix on 22 **and** 26 so host-dependence is caught by machines | ✅ |
| B2 | Tests run somewhere | No workflow ran `npm test` — add a real test job | ✅ |
| B3 | Playwright is just there | Not a project dep; **1.61.0 is the version matching Amber's chromium-1228** (1.62 wants 1234 and would download a second browser into a shared cache). Documented, kept out of `node_modules` | ✅ |
| B4 | Dev server owns 8080 | Taken by `mediajunkie/local_chat.py`; Vite auto-falls-back to 8081. Documented rather than hard-coded — see rollup #3 | ✅ |
| B5 | Docs describe the real dev loop | CLAUDE.md said 8080 in five places and 8081 in one; session-log path pointed at the superseded `development/session-logs/` | ✅ |

## C. Deferred, with reasons

| # | Item | Why not now |
|---|---|---|
| C1 | 18 npm vulnerabilities (4 direct: vite, postcss, react-router-dom, uuid) | react-router's fix is very likely a major bump — a regression surface across every screen, days before the TestFlight cut whose purpose is reading the R1 trust gate. Not remotely exploitable in a local-first PWA with no server and no untrusted input. Triage below; rollup #1 | 
| C2 | `optimizeDeps.esbuildOptions` deprecation from `vite:react-swc` | Upstream plugin warning, cosmetic, resolves when the plugin updates. Noted so the next reader doesn't chase it |
| C3 | Backend venv absent on Amber | Correct — the app is local-first and needs no backend. Only matters if someone runs `?remote`; setup steps already in CLAUDE.md |

### C1 triage detail (so the upgrade is known work, not research)

- **uuid** (moderate, direct) — low-risk patch bump, no API change expected.
- **postcss** (high, direct) — build-time only; never runs against user input.
- **vite** (high, direct) — build-time only; same reasoning.
- **react-router-dom** (high, direct) — **the only one with runtime
  surface.** Likely major bump. Wants its own branch, a full manual
  pass, and Playwright proof on the deck screens. Half a day.
- Transitive (lodash, minimatch, glob, tar, js-yaml, fast-uri, ajv,
  flatted, picomatch, brace-expansion, yaml, esbuild, @remix-run/router)
  — all resolve by dependents' bumps; none are directly imported.

**Sequencing recommendation:** after beta week, in the order
uuid → postcss → vite → react-router-dom, each verified separately.
Doing them as one `npm audit fix --force` is how you get a mystery
regression during a trust gate.

---

## The generalizable lesson

The suite was *honestly green* on Node 22 and *honestly red* on Node 26
with no code change between. Neither reading was wrong; the environment
moved underneath a dependency nobody had declared.

The fix pattern that worked, twice today: **own the capability instead
of inheriting it.** Tests needed storage → the setup file provides
storage, rather than hoping the host's jsdom/Node combination does. The
toolchain needed install scripts → record the approvals, rather than
hoping npm's default stays permissive.

This is the same shape as m-44 (a clear that doesn't name what it
examined is indistinguishable from a check that never ran) seen from
the other side: *a dependency you never declared is indistinguishable
from one the environment promised you.* Both are fixed by writing down
what you actually require.
