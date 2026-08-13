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

### 🟢 22. Pro-feedback fragments captured 2026-08-13 — full writeup pending
From chat, ahead of a fuller pass Xian will do "when he can" (may want
prompting feature-by-feature): opinions forming on how **inchworm view
ought to work** (unspecified yet — ask him to unpack this when he
writes it up), and a gap he's hit directly — **no way to delete a deck,
or merge one deck's contents into another** (currently "Move to another
deck…" exists only for TOP-LEVEL cards, one at a time, rc.18; there's
no deck-level delete or deck-into-deck merge). His framing: merging
should land the source deck as a new card inside the target deck by
default, "to support the unsupported multi-deck collisions" in our
card-of-cards paradigm. Not scoped or estimated — waiting on his fuller
writeup before this becomes a build item.

### 🟡 21. Store submission prep — down to two small calls
The asset pipeline is built (one-command capture, 3 device profiles,
6-shot list; staging set committed).
1. **Which build is 1.0? CONFIRMED 2026-08-13: rc.31.** Final shutter
   (re-capture + re-compose against the tag, review-notes regen, Amber
   cut memo, submit) waits on your device-pass soak clearing — that's
   the one open condition on my own recommendation, not a new ask.
2. **Caption copy approval** — put in front of you as an interactive
   artifact 2026-08-13 (checkboxes + edit fields per shot, plus the
   one lingering listing-copy delta) since a bare file-path reference
   didn't render as a link in your client. Awaiting your pass.
3. **Media Manager dimension check** (1 min, your ASC login) — walkthrough
   steps in the same artifact.

*(Settled 2026-08-13: iPad presentation — honest centered column, no
scaling, decided 2026-08-06 addendum; confirmed still correct.)*

### 🟡 19. Enable Dan — with one line at the top of his instructions
Device pass is GREEN (all 8 checks, on the real TestFlight artifact,
Settings confirming rc.12). Dan is unblocked. Relay's hard-won ask —
after a false alarm where symptoms were filed against a build that
wasn't running: **Dan's instructions must open with "first, confirm
Settings shows v1.0.0-rc.12."** A tester filing bugs against a build
they aren't running sends everyone chasing ghosts.

### ✅ 20. CLOSED 2026-08-08 — ASC API key live (was: highest-leverage unblock)
Relay's handoff names it plainly: with Amber's Xcode (your one install
command) + an App Store Connect API key (`.p8`), archive AND upload run
unattended forever — no interactive Apple login, for me or any
successor. Runbook: docs/AMBER-XCODE.md §3. It also honestly shrinks
the Relay role to "a physical device in a hand" — which is exactly the
input your migration decision needs.

### 🟡 17. Morning item: paste a real PAT and watch your issues become cards
R3.2 shipped tonight (rc.21) — read-only GitHub import, proven against
a MOCKED API end to end (import, PR filtering, provenance dedupe,
idempotent re-import, the github deck on the strip). The one thing a
mock cannot prove is GitHub itself accepting a real token.

**Your two minutes:** make a fine-grained PAT with read-only Issues
access → open the app (a ?pro=comp device) → hold background →
Integrations → paste → "Import my open issues." Your open assigned
issues land in a `github` deck on the strip; re-import any time, dupes
skip by provenance. The token stays on the device. Nothing writes
upstream — closing issues from One Job is R3.4 and must be earned.

### 🟡 12. Shake-to-undo ships blind until a device confirms it
Shake + menu undo + session-deep history shipped this morning (see log).
The shake path uses devicemotion, which iOS gates behind a permission
that can only be requested from a user gesture — I wired the request to
the first tap, but **only a real iPhone can prove it**. Added to the
rc.13 Relay smoke memo. The menu Undo path is device-independent and
Playwright-verified.

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

**4 remain, held on purpose:** two newly-disclosed react-router CVEs
that only a 6→7 major bump fixes, and a vite fix that means 5→8
(pulling in the rolldown-based bundler — a pipeline swap, not a patch).
Both are real regression surface across every screen, days from
submission. Recommendation unchanged for these four: hold until after
beta week / 1.0 ships. Not exploitable in a local-first PWA with no
server and no untrusted input either way — supply-chain hygiene, not a
live risk to your deck.

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

### 🟡 5b. Migration plan DRAFTED (08-04) — one small new call inside
`docs/plans/2026-08-04-relay-migration-plan.md`: unbundles Relay's
three jobs (git → code agents; build/upload → Amber unattended;
physical-device duties → kindbook successor), sequences the steps with
the two auth gates you already hold (keystore 18, Amber 20), and asks
ONE new question: does the successor keep the name Relay? (My lean:
yes — same thread, smaller role.)

### 🟡 5a. NEW REQUIREMENT for the Relay migration (Xian, 08-02)
The kindbook-successor Relay must **delegate GitHub work to code
agents** — the current Relay relies on Xian's hands for all git
operations ("really not a great process," his words; the 07-25
undelivered-mail incident is the proof). This goes into the migration
plan as a hard requirement and into the successor's brief. My draft
plan lands after your rc.12 smoke test (pipeline stays untouched
mid-promotion).

### 🟡 5. Relay's future — DIRECTION SET 07-31; migration plan pending
Xian: "Amber seems like a natural home. Relay is a cowork agent so as
to operate the computer more readily. I am open to how to migrate those
functionalities." Pard's infra read concurs (always-on, one Xcode, the
wedge as evidence), with the cost named: submission-forced macOS updates
become fleet reboot events. **Remaining decision is the migration plan's
shape** — I'll draft one after the rc.12 cut lands (not during: never
change the pipeline mid-cut). Relay keeps the current cut unchanged.

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
