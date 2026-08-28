# Attention Rollup — things waiting on Xian

**Maintained by:** Coral · **Swept by:** Janus (majordomo)
**Convention:** newest section at the top. Each item states the
decision needed, what I recommend, and — importantly — **what I am
doing meanwhile**, so nothing here is blocking unless it says so.
When an item is answered, it moves to *Settled* at the bottom with the
answer recorded.

**Status key:** 🔴 blocking (I cannot proceed) · 🟡 wants an answer
(I have a working default) · 🟢 FYI (no action needed)

**Xian's working surface (2026-07-30):** this ledger now has an
interactive companion — the **attention briefing artifact**
(`docs/attention-briefing.html`, published private to Xian) with test
checklists, inline decision answers, and a copy-back composer. This
file remains the terse source of truth for the sweep; the briefing is
re-published whenever items open or settle.

---

## Open

### 🟡 25. Roadmap reordering memo (2026-08-26) — big strategic call, his to make
Cowork-agent memo (`docs/mail/memo-xian-to-coral-2026-08-26-roadmap-reordering-after-investment-review.md`)
from a VC-readiness exercise: investment review scored traction 1.0/5,
distribution 1.5/5; recommends R2 (spatial layer) holds in favor of
local opt-in instrumentation before any invitations, a near-zero-cost
"fleet probe" (feed ATTENTION-ROLLUP.md's own open items into a One Job
deck as cards, see if answering-via-card feels better than
file-reading), one scoped read-only Todoist integration, and
recruiting 10 agent-heavy users before 40 ordinary ones.

**Verified independently, not taken on faith**: Question 2 in the memo
asks whether the white-screen bug (item 24) can occur in the native/
TestFlight build — checked `vite.config.ts` directly: `mode !==
'capacitor' && VitePWA(...)` means the ENTIRE PWA plugin (service
worker, precache manifest) is structurally absent from the native
build, not just untriggered. The diagnosed failure mechanism (stale SW
serving a 404'd bundle after a subsequent deploy) cannot exist there —
this isn't probabilistic, it's a build-configuration fact. §0's premise
holds with high confidence.

**Data-safety check: RESOLVED 2026-08-28, verified against Apple's own
published definition** (developer.apple.com/app-store/app-privacy-details):
*"Data that is processed only on device is not 'collected' and does not
need to be disclosed."* Local-only counters are definitively fine —
"Data Not Collected" holds. The opt-in export is mechanically identical
to the existing backup export (app writes a file, hands it to the share
sheet, user owns what happens next — the app never transmits anything),
so it inherits the same standing. **The one line not to cross**: any
in-app "send to developer" that transmits to a server we can read
would flip the label to collection — if that's ever wanted, the
privacy label changes with it, deliberately, not as a surprise.

**A concrete build-path worth noting**: the "fleet probe" may need
zero new app code — a script that reads the rollup and emits a JSON
in the existing v1/v2 backup-import shape, imported via Settings'
existing "add as new deck" path, is the whole mechanism. Matches the
memo's own "no adapter seam" ceiling exactly.

**Answered 2026-08-28, via the briefing artifact's composer:**
1. **R2 holding: "partial/other."** His reasoning, verbatim: hedged
   "because we can probably walk and chew gum at the same time by
   developing solid plans and delegating them to well governed
   subagents, but this should be done only when we are sure we are not
   diverting priority or resources from meeting our primary goals."
   **Resolved concretely, not left abstract**: the memo itself already
   named two R2 exceptions worth doing regardless — R2.3 (the table
   surface) and dark-mode from the fun shelf, both "store-listing
   quality issues and cheap." These are exactly the bounded,
   low-ambiguity candidates his condition describes — delegation cost
   scales with ambiguity/judgment required, not raw effort, so a
   small, clearly-scoped visual task is genuinely cheap to review even
   if built by a subagent, while R2.2 (zoom continuum) or R2.8 (kinetic
   conversation) would cost real review attention regardless of who
   writes the code. **Proposed reading: R2.3 + dark-mode proceed now
   (already scoped, already an exception), the rest of R2 holds until
   the priority items have real evidence.** Awaiting his confirmation
   before starting either.
2. **PWA/native split** — confirmed above independently; no action
   needed from him.
3. **Fleet probe scope: "everything."** Confirmed, matches instinct.
4. **Covenant 7: "yes, amend it."** Done same day — `docs/VISION.md`
   now states explicitly that covenant 7 governs what the deck's UI
   renders, not what the app may privately know about its own use
   (commit 245f981).

**Dan's real feedback (2026-08-26 chat, pasted in full) is the
qualitative evidence sitting behind this memo, not yet formally
triaged**: confusion about web-vs-native being the same app (a real
onboarding-copy gap); "the experience is beautiful," empty state "a
little dry" (his own aside); activated immediately by populating cards
right away (the exact quote item 25's memo already cites); his
instinct was reversed swipe direction (left=complete) though he valued
the intentionality of the current design once he understood it; and
his central, unprompted question — does this replace his existing
to-do apps, or sit as a decision layer on top of them — which
independently validates the memo's Todoist-integration and
layer-not-replacement framing without having seen the memo. Xian's own
reply to Dan already named the real tension: multi-deck utility vs.
the one-card simplicity that's the whole point. This is the live
thread in the ongoing Pro-feedback interview (item 22).

### 🔴 24. rc.32 device pass (2026-08-20): 2 of 5 items surfaced real bugs
1. **White screen of death on the PWA — happening on his phone right
   now as of the report.** Live site independently verified fully
   healthy (all assets 200: index.html, JS bundle, CSS, manifest,
   sw.js) — this is NOT a server-side outage, it's his device stuck on
   a stale service worker (matches the exact failure class
   `pwaUpdateCheck.ts`'s own comment already anticipated: "iOS
   home-screen PWAs only check for service-worker updates at launch...
   users can sit on a stale version for days"). His data is not at
   risk — a render-time crash doesn't touch localStorage, and he has a
   fresh, verified-by-observation backup from today's own test pass
   regardless. Gave him a staged, least-destructive-first recovery
   sequence (restart → force-quit/relaunch → open in Safari directly
   vs. the home-screen icon → TestFlight as a parallel unaffected
   surface) and explicitly told him NOT to clear site data yet.
   **Needs a real fix, not just a workaround** — filed for
   investigation; likely direction is a version-mismatch detector that
   can force-unregister a stuck SW without relying on the user finding
   Safari's site-data settings.
2. **Shake → "undo" fails — DIAGNOSED and REMOVED 2026-08-20, CLOSED.**
   His precise repro nailed it: the dialog he was tapping was titled
   **"Undo Typing" / "Redo Typing"** — iOS's own native system
   shake-to-undo-text-entry feature (same as Notes/Mail), not our app;
   confirmed by contrast against our own dialog's actual copy
   (`"Undo last action?"`). iOS's OS-level gesture recognizer caught
   the shake before our JS ever saw it. No web-exposed API lets a page
   suppress it — not fixable with a patch. Xian's call: drop it
   entirely ("not cross-platform... not an MVP feature"). Removed
   (commit 530fdc0, stamped rc.33): `use-shake.ts` deleted, all wiring
   in `Index.tsx`/`SettingsView.tsx` gone, i18n strings cleaned up,
   reviewer-facing copy in `store/LISTING.md` fixed (was describing a
   feature that no longer exists — needed fixing before submission
   regardless), historical record in `GESTURES.md` annotated not
   silently rewritten. 167/167 tests, tsc clean, build clean. **Fully
   resolves item 12 below**, open since 2026-07-29.

Passed clean: warm-up/daily-use, backup round trip (the actual fix —
he opened the export and confirmed all decks present), rooms sift +
deck switching, iPad pass.

**Submission call, updated**: shake-undo is closed. The white screen
(#1 above) is the one remaining item holding submission — genuinely a
"stranded" case per the R1 trust gate, unlike shake-undo which turned
out to be a silent no-op (confusing, not destructive). Investigating
independently; not asking Xian to keep testing a known-broken instance.

### ✅ 23. Two real bugs found 2026-08-16, both fixed and verified — CLOSED
Xian found this himself: **"multi-deck breaks the export feature —
only a few cards are saved."** Real bug, not user error. Root cause:
`buildBackup()` used `getAllTasks()`, which is scoped to the ACTIVE
deck by design (it's the display API) — every OTHER root deck was
silently missing from every export path (share, download, clipboard).
Even a correctly-shaped backup would have re-imported wrong too:
`importTasks()` flattened everything into whichever deck was active on
restore, discarding deck boundaries. **His live on-device data was
never at risk** — only the exported backup files and the restore path.

Fixed (commit 8271116, stamped rc.32): export now reads `getDecks()`
(all root decks) when available; import does a full document replace
preserving deck boundaries, matching the interface's own documented
contract for the first time. New backup format (v3, `{decks: [...]}`)
alongside full backward-compat for old v1/v2 flat-array backups. Store-
level tests added; 167/167 pass, tsc clean, build clean.

**Investigating this surfaced something bigger**: the web deploy
pipeline had been silently failing for **three days** — every commit
since 08-13's `npm audit fix` (89cdcb0) never actually reached
production, meaning every "rc.31 LIVE, test the PWA" I told Xian since
then was stale and unverified. Root cause (CLAUDE.md's toolchain traps
now has the full writeup): an npm-optional-peer-dependency ambiguity
in vitest's own nested vite made `npm ci` non-deterministic between
npm 10 (CI's Node 22 job) and npm 11 (Amber's default, what I'd tested
with) — a green local check was never actually proof. Fixed properly
(commit 0a84bdc) after reproducing the exact CI npm version locally
(`brew install node@22`, keg-only) — first fix attempt technically
"worked" but broke the real production build by hoisting the wrong
esbuild version, caught only by actually running `npm run build` before
trusting it. **Verified by independent observation**: CI green AND the
live bundle hash checked directly against what my own build produced —
`index-Bom08g_d.js`, matching both sides.

**What this means for Xian's testing**: anything tested on the PWA over
the last few days may not reflect what actually shipped (deploys were
frozen). The pipeline is fixed and verified now — rc.32 (with the
backup fix) is genuinely live. Worth a fresh look if his device pass
covered that window.

**Build 31 superseded**: Xian said go, so build 32 (bumped from 31,
matching rc.32) was cut and uploaded same session — fresh archive/
export/upload, the now-proven pipeline, no new issues. Delivery UUID
`1ede4284-c514-4161-ba40-6f69c95df667`. Build 31 (the buggy one) should
simply not be selected for App Store review; build 32 supersedes it in
TestFlight. Only remaining gate before actual submission: Xian's
device-pass soak (on the PWA, now genuinely current).

### 🟡 22. Pro-feedback — conversational format agreed 2026-08-20, format: I ask, he answers, I log, we triage
Xian's call on how to do this: not a written-up-cold pass — a
conversation where I ask about each feature/use case, he gives
impressions, I log them, then we triage together. Not yet scheduled;
his call on timing.

**Fragments already captured (2026-08-13), feed the first pass:**
opinions forming on how **inchworm view ought to work** (unspecified
yet), and a gap he's hit directly — **no way to delete a deck, or merge
one deck's contents into another** (currently "Move to another deck…"
exists only for TOP-LEVEL cards, one at a time, rc.18; no deck-level
delete or deck-into-deck merge exists at all). His framing: merging
should land the source deck as a new card inside the target deck by
default, "to support the unsupported multi-deck collisions" in our
card-of-cards paradigm.

**Folded in 2026-08-20**: the pro-backup-import-notice question (a
multi-deck backup imported on a non-pro device already fully restores
everything today, no gating — deliberate, per PRICING.md's "import must
never be gated"; what's missing is a friendly notice plus the same
deck-delete gap above). Same underlying gap as the paragraph above, so
same pass rather than a separate item.

### ✅ Native pipeline — CLOSED 2026-08-16 — build 31 uploaded to App Store Connect
*(Build 31 itself was superseded same day by build 32 — see item 23
above; this section is about the pipeline working, which it did.)*
Was item 21's 🔴. Xian signed into Xcode on Amber (Admin role) and
created the missing "Apple Distribution" certificate 08-15 (his first
attempt made a "Mac Installer Distribution" cert by mistake — caught
before it went anywhere, corrected same session). Export still needed
his interactively-authenticated session for the provisioning profile
too (same App-Manager-role limit as the cert, one layer further) — the
API key alone couldn't do either half. Once both existed: build number
bumped 2→31 (matching the tag), fresh archive from current source,
export succeeded, and **08-16 10:50 — uploaded to App Store Connect**
via `xcrun altool` (Delivery UUID `b96a2f65-177a-43ba-981d-659b3c202979`,
10.7MB, upload took 0.63s). `ITSAppUsesNonExemptEncryption=false`
already in Info.plist, so no manual export-compliance step should block
processing. Xian confirmed he's fine with Dan seeing it once Apple
finishes processing (typically minutes, sometimes longer). Full
pipeline (SDK → cert → profile → archive → export → upload) now proven
end to end on Amber for the first time ever — repeatable for future
builds without repeating the one-time interactive steps.

### 🟡 21. Store submission prep — down to your device pass
1. **Which build is 1.0? rc.32** (updated 2026-08-16 — rc.31 carried
   the multi-deck backup bug; rc.32 is the current tag, TestFlight build
   32 supersedes 31, see item 23 above).
2. **Caption copy: APPROVED + APPLIED 2026-08-13.** You rewrote five of
   six directly (more plainspoken, your voice); 06 kept as-is with a
   flag to revisit once accounts exist. Listing description's
   "substacks" line and the review-notes menu list (was still rc.12's)
   both updated too. Live in `scripts/compose-store-shots.mjs` /
   `store/LISTING.md`.
3. **Media Manager dimension check: CLEAR.** You pasted the live ASC
   page — Apple renamed the 6.7" bucket to 6.9" and added several
   smaller legacy buckets, but our three pixel sizes (1290×2796,
   1284×2778, 2064×2752) already land exactly in the current buckets.
   No harness change needed; comment updated for future clarity.

**Device pass RAN 2026-08-20 — see item 24 above.** 4 of 5 items clean;
2 real issues surfaced (white-screen-of-death on stale PWA cache, and
shake→undo dialog failing). Submission holds until both are understood
— superseding the "just needs a device pass" framing below, which is
now stale.

*(Settled 2026-08-13: iPad presentation — honest centered column, no
scaling, decided 2026-08-06 addendum; confirmed still correct.)*

### ✅ 19. Enable Dan — DONE, and now the pitch memo's own primary evidence
Dan's been testing for weeks now (his real chat feedback, 2026-08-26,
is the qualitative signal cited in item 25's roadmap memo — his
activation quote appears verbatim in it). No longer an open item.

### ✅ 20. CLOSED 2026-08-08 — ASC API key live (was: highest-leverage unblock)
Relay's handoff names it plainly: with Amber's Xcode (your one install
command) + an App Store Connect API key (`.p8`), archive AND upload run
unattended forever — no interactive Apple login, for me or any
successor. Runbook: docs/AMBER-XCODE.md §3. It also honestly shrinks
the Relay role to "a physical device in a hand" — which is exactly the
input your migration decision needs.

### ✅ 17. Real-PAT test — SUPERSEDED BY REAL USE (2026-08-19), and the result matters now
This item asked for a two-minute real-token test against the MOCKED-only
GitHub import. That's long since happened via actual daily use, not the
scripted test — and it surfaced exactly the failure a mock couldn't
have shown: on the Ted Nadeau call (08-19) Xian described it in his own
words as *"it pulls in like every single issue, it makes like a
thousand cards... overflow the buffer. Not a really good use case
yet... it's a beta feature."* Confirmed, real, known.
**This item is closed but its finding is now load-bearing**: the
08-26 roadmap memo (item 25) makes fixing or hiding this a hard
precondition before Todoist ships — "shipping a second integration
while the first one is embarrassing is how a product acquires a
reputation for integrations being broken." Repo-scoping is named as a
small adapter change. Rolled into item 25's priority list rather than
tracked separately.

### ✅ 12. Shake-to-undo — REMOVED 2026-08-20 (see item 24 above)
Was "ships blind until a device confirms it" (2026-07-29). A device
confirmed it, and it was broken — a platform collision (iOS's own
native "shake to undo typing" wins the race before our JS ever sees
it), not a code bug, not fixable on the web surface. Xian's call: drop
it entirely, "not cross-platform... not an MVP feature." Removed,
stamped rc.33. Menu Undo remains fully reliable and unaffected —
always was.

### 🟢 13. Purge copy now says less than it could
With session undo, "Delete forever" is technically undoable *within the
session* (the undo stack captures pre-purge state). I left the strong
copy — overstating danger beats understating it — but flag it in case
you'd rather the trash confirm mention the shake-out: "gone for good"
remains true across sessions and in backups.

### 🟢 8. Zapier export toast now claims less
It said "Tasks exported to Zapier webhook" while using `mode: "no-cors"`,
which cannot observe whether the endpoint accepted, 500'd, or exists.
Now: *"Sent to Zapier — the browser can't confirm delivery."* Accurate,
but it is user-facing copy and you may want different words. Tell me and
I will change it.

### 🟢 1. Dependency vulnerabilities — 16 of 20 FIXED 2026-08-13, 4 remain (deliberately held)
Re-checked with fresh advisory data (the original "18 open" count was
stale): 20 total, 4 direct (vite, postcss, uuid, react-router-dom), 16
transitive. Ran plain `npm audit fix` (no `--force`) — every one of the
16 turned out to be a **patch/minor bump, no API surface change**
(vite 5.4.19→5.4.21, postcss 8.5.16→8.5.26, uuid 11.1.0→11.1.1, plus 13
transitive). Verified after: build clean, 164/164 tests green. Committed.

**4 remain, held on purpose:** two newly-disclosed react-router CVEs,
one react-router-dom open-redirect/XSS CVE (all need a 6→7 major bump),
and a vite/esbuild/launch-editor cluster (needs 5→8, the rolldown
bundler swap). Traced each to its actual attack surface (2026-08-13, in
response to Xian asking what the worst case is):

- **vite + esbuild + launch-editor: zero shipped exposure.** All three
  are `devDependencies` — never in `npm run build` output, so no
  end-user reachability at all. The narrowest real scenario is our own
  dev workflow: a malicious webpage open in the same browser while
  `npm run dev` is running could read source files served by the dev
  server (CSRF-shaped — the dev server answers any origin). Requires
  the dev server up + a hostile tab open at the same time; nothing
  we've hit.
- **react-router + react-router-dom: no reachable code path.** Both
  CVEs need attacker-controlled input reaching `<Link to=…>` or
  `useNavigate(...)`, or an SSR `deserializeErrors()` call. Checked:
  this app has **no `<Link>` usage, no `useNavigate` calls, and no
  SSR anywhere** — `App.tsx` just wraps one static catch-all route.
  The vulnerable functions are imported but never invoked with
  untrusted data.

**Practical worst case: none, for users or for us**, as the code
stands today. Mitigation cost if we did it anyway: vite 5→8 is a real
bundler swap (rolldown) needing a full pipeline regression pass — not
free; react-router 6→7 is a bigger API (data routers, framework mode)
but our footprint is thin enough it would likely be low-risk in
practice. Recommendation: no action before 1.0, and no urgency after
either — this is closer to "someday hygiene" than "should fix," but
revisit if we ever add real routing/navigation or SSR, which would
change the calculus.

### 🟡 2. Which Node version is "supported"?
CI pins Node 22. Amber runs Node 26. That gap is exactly what produced
today's 63 red tests, and it will produce another one eventually.

**Recommendation:** declare **Node 22 the floor, 26 the development
reality** — I've added an `engines` field and a CI test job that runs
**both**, so host-dependence gets caught by machines instead of by me
on a Tuesday. (Verified: run 30412029053, `test (22)` and `test (26)`
both green.) No action needed unless you want a single pinned version.

**No `.nvmrc`, deliberately** — an earlier draft of this doc said I'd
added one; I hadn't, and shouldn't. Amber has no nvm, and a file
pinning 22 would misstate the dev reality, which is the exact trap this
item exists to close.

### 🟡 3. Dev server port — 8080 is taken on Amber
`mediajunkie/local_chat.py` holds 8080. Vite auto-falls-back to 8081,
so nothing is broken, but **your phone bookmarks and the docs both say
8080**.

**Update (Pard, this evening):** **8081 is formally ours** in Amber's
port registry, so the fallback is now a claim rather than an accident.

**Recommendation:** still leave `vite.config.ts` alone — auto-fallback
works, and hard-coding 8081 breaks your muscle memory on the day
mediajunkie's 8080 retires (pending your call, per Pard). Documented
instead. Tell me if you'd rather I pin it.

### ✅ 5/5a/5b. Relay migration — SUPERSEDED BY EVENTS, stale since 2026-08-09
These three items tracked an active migration-planning process (unbundle
Relay's three jobs, pick a successor name, delegate git to code agents).
**That process didn't conclude the way these items assumed.** Relay-on-
kindbook was **paused with honors** (`docs/mail/memo-coral-to-relay-2026-08-09-map-closed.md`)
after a full capability map found the git-delegation requirement (5a)
couldn't be met on that surface at all — no standing kindbook agent, task-
scoped sessions on demand only. The ASC API key (item 20) made the actual
build pipeline the App-Store-submission unblock these items were reaching
for, via a different, simpler path than a Relay successor. These three
sat open and unmarked for weeks after being overtaken — caught in this
2026-08-28 rollup refresh, not before. Native build pipeline runbook:
`docs/AMBER-XCODE.md`.

### 🟢 10. REQUIREMENTS.md has drifted (doc debt, not urgent)
It's dated 2026-07-04 and its status line still reads *"concept-model
rebuild (R1) is next"* — but most of R1 shipped (recursive cards,
lifecycle chain, schema v2), and FR2 is still described as the live
substack mechanism it explicitly says is sunset.

I patched the part today's work touched (new **FR1.2b**: whole-subtree
completion, store-level enforcement, the no-false-completion animation
rule, and the known depth gap). I did **not** re-baseline the whole
434-line spec — deciding what is now true across the document is a
product call with a lot of your judgment in it, not a mechanical edit.

**Recommendation:** worth a dedicated pass after beta week, when the R1
gate has actually told us whether the chain is trustworthy. Happy to
draft it and have you correct me, if you'd rather not start from blank.

---

## Settled

*(2026-08-06) Keystore* — backed up to Xian's password manager and
**verified by checksum: hashes identical** (bit-perfect restorable
copy). The single-most-losable-artifact risk is closed; faoilean may
now be repurposed without capability loss.

*(2026-08-01) Trello = next source, Gall-gated* — Xian's call, with the
taxonomy insight recorded in the roadmap first-pass (PM ≠ task
management; GitHub serves work-tasks, his active Trello boards are the
personal/project middle). Gate: his real-use GitHub test first. The
board/list/card ↔ deck/card mapping question is queued for the
planning doc.

*(2026-07-29) R3.2 source = GitHub* — his call ("agreed re github");
shipped same night. Trello noted as the natural second source.

*(2026-07-29) Canvas strip* — approved from screenshots ("the strip is
good"), so the deferred background-drag pan shipped same evening and
the strip is DEFAULT-ON (rc.20); ?canvas=off stays as escape hatch.
Confirmed: leftmost deck has no left peek. R2.1 complete.

*(2026-07-29) Comp mechanism* — fine for now; secure + in-app when the
paid tier faces real users. And recorded: not all new work is pro —
free users keep getting improvements.

*(2026-07-29) Item 7, blocked-completion dead end* — fixed under the
standing default Xian didn't object to: the reveal now follows the same
whole-subtree walk as the block. A refused completion descends the full
path to the nearest open card, through completed intermediates, at any
depth. E2E: the buried "grandchild under a done child" case now lands
you looking at the blocking card itself.

*(2026-07-29) Housekeeping* — Xian: 30 days. Built same day: done cards
over 30 days old are filed to Archive at launch, every depth, witnessed
by a quiet toast ("state is place" — no unwatched room changes). His
note that the threshold could be a paid-tier setting is recorded in the
decision record and PRICING notes — constant until then.

*(2026-07-29) rc.12 heads-up* — Relay was already on rc.12; Xian
confirmed the stamp call was right.

*(2026-07-29) Design questions, all three* — search matches title +
description; covenant 7 = felt in Trash (Done keeps its trophy count);
no action-cards — instead shake-to-undo + Undo in the hold-menu over a
session-deep history stack. Shipped same morning with the rest of the
trash decisions (one-tap swipe delete, Empty trash, backups exclude
trash). Full record: DESIGN-OPTIONS-2026-07-28.md § Decision Record.

*(2026-07-28) Git identity* — Pard: switch to the resident-agent form,
**`Coral (One Job) <coral@onejob.local>`**, repo-local; the network
standardized on named-agent attribution. Visitors to another agent's
repo override per-commit (`git -c user.name=… commit`); global stays
unset forever. Done, and the authorship seam at 2026-07-28 is noted in
CLAUDE.md — which was your condition. Pard also accepted the
provisioning-checklist suggestion and is turning it into an
`amber-agent --identity` flag, so it becomes mechanism rather than
memory.

*(2026-07-28) Port claim* — **8081 is One Job's**, in Amber's registry.
8000 also ours. No need for 5173.

*(2026-07-28) Session shape on Amber* — Pard: one long-lived session,
repo direct, no worktrees; ff-to-main + no-PRs flow unchanged.

*(2026-07-28) Amber environment questions* — Pard: node 26.5 fine,
chromium in `~/Library/Caches/ms-playwright/`, 8000 free for FastAPI,
git identity unaffected by the account re-point. All verified in
practice today.
