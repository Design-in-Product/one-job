# One Job — what needs xian · v85 (2026-10-10)

**Cite as "Coral rollup v85".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

**The history scrub (37) is ready but stopped at a permission check.**
You said "do B" (10-10). After the reboot I did the fresh rewrite on a
scratch copy, and then my session's permission check refused the rest
as "Git Destructive". Nothing was pushed, and one-job is untouched. It
needs your OK in my session. The first Pilot tester still hasn't
joined, two days after you re-sent the link (the link works; a nudge
is yours to judge). Build 41 is waiting for your Siri test (36). The
UX session is still unscheduled.

## Open

### 🟢 38. CLAUDE.md still describes a backend-first app: update your methodology text?
I fixed CLAUDE.md's plain errors on 10-10 (the model, retired
integrations, "tasks persist to the backend", the stale status
section). One drift is left in the methodology sections you wrote:
"API-First Architecture: Frontend → Backend API → Database" and "Task
state logic belongs in backend", plus the contract-verification
sections built on them. The app has been local-first since July, and
the backend runs only in `?remote` mode.
**Where to act:** one word, in Coral's session or to Janus. File:
https://github.com/Design-in-Product/one-job/blob/main/CLAUDE.md
**Since:** 2026-10-10
**Ask:** CLAUDE.md's backend-first methodology text: update it to local-first, or leave it?
**Rec:** Update it. I'd keep "verify first" and the contract checks,
scope them to `?remote` mode, and state the local-first rule plainly.
The old text would go to the archive, per the living-doc rule.

### 🟡 37. 🔒 Approve the history scrub in Coral's session
You ruled **option B** on 10-10 (via Janus): remove three confidential
files from all history, and replace every tester name with a role
label. Ready and verified in trial: zero name matches, nothing else
changed, and tests and build pass. The full public history is backed
up in `Design-in-Product/one-job-private` (current to `198e24b`, every
branch and tag verified).

My session's auto-mode check refuses the verification and the
force-push as "Git Destructive". That's a guard on your behalf, so I
didn't route around it. Your "do B" through Janus doesn't count as
approval inside this session.
**🔒 Blocked on xian** since 2026-10-10. Smallest answer: say "run the
scrub" in Coral's session and approve the prompts, or add an allow
rule for it.
**Where to act:** Coral's session (tmux `coral` on Amber). The runbook
is `scrub/PUSH.md` in one-job-private.
**Since:** 2026-10-10
**Ask:** 🔒 Approve the one-job history scrub in Coral's session ("run the scrub").
**Rec:** Approve it there, where I can run all three checks before the
push and the site check after. It takes about 20 minutes, with a short
push freeze for the other agents.

### 🟡 36. Test build 41: Siri with the app open
Build 1.1.1 (41) is in your Internal group (10-08). With One Job open,
add a card by Siri, and it should appear right away in the deck you're
on, with no restart. What to Test lists three checks.
**Where to act:** TestFlight on your phone → One Job → install 41.
**Since:** 2026-10-08
**Ask:** Install 41 and try Siri with the app open. Did the card appear in that deck?
**Rec:** If yes, say "Pilot 41" and I'll attach it to the Pilot group.
If no, tell me exactly what you saw.

### 🟡 22. UX session: screen by screen, you narrate
You want it live and conversational. Prep (walk order plus eight
design questions) is in
https://github.com/Design-in-Product/one-job/blob/main/docs/UX-SESSION-PREP-2026-09.md
**Where to act:** name a time to Janus or in Coral's session. Bring
your usability screenshots.
**Since:** 2026-08-13
**Ask:** Name a time for the UX session.
**Rec:** Do it before any roadmap talk. Your narration is the evidence
that conversation should use.

### 🟡 27. How does answering from the attention deck feel?
You get these items as cards in One Job (download
https://onejob.co/probe/latest.json, then Settings → bring in as a new
deck). Whether a card is a good place to answer an agent is the
question behind the deck.
**Where to act:** one word, in Coral's session or to Janus.
**Since:** 2026-08-31
**Ask:** How did answering from the deck actually feel?
**Rec:** Relief, ceremony, or in between. One word is enough.

### 🟢 10. Retire REQUIREMENTS.md, or rewrite it?
It's a 434-line spec from July that's no longer true. ROADMAP.md and
VISION.md now say what's true, and Themis found nobody reads it.
File: https://github.com/Design-in-Product/one-job/blob/main/docs/REQUIREMENTS.md
**Where to act:** one word, in Coral's session or to Janus.
**Since:** 2026-07-28
**Ask:** REQUIREMENTS.md: retire it or rewrite it?
**Rec:** Retire it. I'd add a "superseded, see ROADMAP/VISION" note at
the top and keep the file, so it's easy to undo.

## Recorded, final (not re-asked)

- 2026-10-08 · **TestFlight clause added** by you. The description now names what TestFlight sends.
- 2026-10-08 · **Pilot link re-sent to the first Pilot tester** (by you). I'll call them "in" when the Pilot tester count shows them.
- 2026-10-08 · **Go for build 41.** Uploaded and VALID, in Internal.
- 2026-10-08 · **Build 40 approved for outside testers** (BETA_APPROVED, 06:10). The Pilot link now works.
- 2026-10-07 · **Test Information filled in** by you. The weekly-question line was cut, to be added back when a program is active. Build 40 submitted for beta review (WAITING_FOR_BETA_REVIEW).
- 2026-10-07 · **Pilot yes** (your 10-06 answer, which arrived via Janus 10-07). Build 40 is attached to Pilot.
- 2026-10-06 · Build 40 rollout: **you test first**, then Pilot. Done; it passed.
- 2026-10-05 · **Ship build 40.** Uploaded as 1.1.1 (1.1 is live and closed to new builds).
- 2026-09-29 · The 8/29 LinkedIn hand-raiser is **identified** (name in one-job-private's roster). They replied 10-05; you hold their contact.
- Full history: [archive](archive/ATTENTION-ROLLUP-ARCHIVE.md).

---
**Verified how (v85):**
- **Pilot group (ASC API, 10-10 17:5x):** builds 40 and 39, 0 testers. Internal: builds 41–37, 3 testers.
- **Scrub state (10-10 17:2x):** one-job origin/main untouched at `198e24b` (no force-push made); private backup refs re-verified against origin after the reboot; fresh scratch rewrite 774 → 771 commits, its verification NOT run (refused).
- **one-job-private:** PRIVATE (gh); main holds 3 confidential files (sha-matched to their one-job originals); pre-scrub refs: 4 branches + 20 tags, each verified against origin.
- **Repo visibility:** `gh repo view` → PUBLIC. Org plan: **free**. Pages: workflow build, cname onejob.co (`gh api`, 10-09 17:5x).
- **Beta App Description:** read through the API after your edit. It's 699 chars, contains the TestFlight clause, and has no weekly-question line.
- **App Store Connect, read through the API at 17:2x PT on 10-08:**
  - Build 41 is VALID, and its What to Test reads back
    ("1.1.1 (41) — Siri cards show up while the app is open").
  - Internal group: builds 41–37, 3 testers.
  - Pilot group: builds 40 and 39, **0 testers**.
  - Cohort group: empty.
- **Build 41:** 250/250 tests and tsc clean before the archive. The
  archive's Info.plist reads 1.1.1 / 41. Delivery cf7f2dd2.
- **Items:** 19 `###` items reconciled across this board and the
  archive (34 and 35 settled; 36 and 37 new).
