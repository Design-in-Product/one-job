# Attention Rollup — things waiting on Xian

**Maintained by:** Coral · **Swept by:** Janus (majordomo)
**Convention:** newest section at the top. Each item states the
decision needed, what I recommend, and — importantly — **what I am
doing meanwhile**, so nothing here is blocking unless it says so.
When an item is answered, it moves to *Settled* at the bottom with the
answer recorded.

**Status key:** 🔴 blocking (I cannot proceed) · 🟡 wants an answer
(I have a working default) · 🟢 FYI (no action needed)

---

## Open — 2026-07-28 (autonomous run on Amber)

### 🟡 1. Dependency vulnerabilities: 18 open, 4 in direct deps
`npm audit` reports 5 moderate / 13 high. Direct dependencies among
them: **vite**, **postcss**, **react-router-dom**, **uuid**. The rest
are transitive (lodash, minimatch, glob, tar, js-yaml, esbuild …).

**Recommendation: do nothing until beta week is over.** react-router
is the one that matters and the fix is very likely a major-version
bump — that is a real regression surface across every screen, and we
are days from a TestFlight cut whose whole purpose is the R1 trust
gate ("no card lost, stranded, unrecoverable"). Shipping a router
upgrade into that week would muddy the signal we are trying to read.
None of these are remotely exploitable in a local-first PWA with no
server and no untrusted input; they are supply-chain hygiene, not a
live risk to your deck.

**Meanwhile:** I have written up the full triage (see
`docs/ENVIRONMENT-CLEANUP-2026-07-28.md`) so the upgrade is a
half-day of known work whenever you want it, not a research project.
Say the word if you'd rather I do the safe subset now.

### 🟡 2. Which Node version is "supported"?
CI pins Node 22. Amber runs Node 26. That gap is exactly what produced
today's 63 red tests, and it will produce another one eventually.

**Recommendation:** declare **Node 22 the floor, 26 the development
reality** — I've added an `engines` field and a `.nvmrc`, and a CI test
job that runs **both** so host-dependence gets caught by machines
instead of by me on a Tuesday. No action needed from you unless you
want a single pinned version instead.

### 🟡 3. Dev server port — 8080 is taken on Amber
`mediajunkie/local_chat.py` holds 8080. Vite auto-falls-back to 8081,
so nothing is broken, but **your phone bookmarks and the docs both say
8080**.

**Recommendation:** leave `vite.config.ts` alone (auto-fallback works,
and hard-coding 8081 breaks your muscle memory the day mediajunkie's
8080 retires — Pard says that's pending your call). I've documented the
situation instead. Tell me if you'd rather I pin 8081.

### 🟡 4. Git identity for my commits on Amber (with Pard)
one-job had no git identity, so Pard's provisioning commits carry
*their* name. The volume's convention is repo-local identity naming the
resident agent (`Pard (Mediajunkie)`, `Themis (DinP)`).

**Working default:** I set repo-local `Claude <noreply@anthropic.com>`
— continuity with 17 of the last 20 one-job commits, rather than a
visible authorship seam mid-project. Memo is with Pard; if the cohort
convention is `Coral (One Job)`, it is one command to switch.

### 🟡 5. Relay's future (carried forward — still yours)
Once I am on a Mac, is Relay still needed as a separate build agent, or
does the TestFlight pipeline eventually become mine? I have written
this week's Relay memos assuming **no change**. Not absorbing it unasked.

### 🟢 6. rc.11 is cut and waiting on Relay
You said you'd tell them. `memo-coral-to-relay-2026-07-28-rc11-cut-supersedes-rc10.md`
is filed and authoritative. Nothing needed from me.

---

## Settled

*(2026-07-28) Session shape on Amber* — Pard: one long-lived session,
repo direct, no worktrees; ff-to-main + no-PRs flow unchanged.

*(2026-07-28) Amber environment questions* — Pard: node 26.5 fine,
chromium in `~/Library/Caches/ms-playwright/`, 8000 free for FastAPI,
git identity unaffected by the account re-point. All verified in
practice today.
