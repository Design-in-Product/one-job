# One Job — what needs xian · v86 (2026-10-10)

**Cite as "Coral rollup v86".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

**The history scrub is done (10-10).** No tester's name or your
personal email is anywhere in one-job's history now, and onejob.co is
up. One step is left for you: send GitHub the purge request (39; the
text is ready). The first Pilot tester still hasn't
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

### 🟡 39. Send GitHub the purge request, so old commits can't be opened by link
The scrub is done (10-10). One gap only GitHub can close: until it
garbage-collects, an old commit can still be opened by anyone who has
its exact URL. The request is written and filled in.
**Where to act:** https://support.github.com/contact, signed in as an
owner of Design-in-Product. Paste the text from
https://github.com/Design-in-Product/one-job-private/blob/main/scrub/GITHUB-SUPPORT-REQUEST-draft.md
(everything below its line).
**Since:** 2026-10-10
**Ask:** Send the GitHub Support purge request (text is ready to paste).
**Rec:** Send it this week. The exposure is small, since someone would
need an old commit URL, and those appear only in private repos. But
it's the last step of "scrub the history".

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

- 2026-10-10 · **History scrub done** (option B, on your go in Coral's session). main is `9a50a7a`. The old history lives only in one-job-private.
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
**Verified how (v86):**
- **Scrub (10-10, 19:2x–19:4x PT):**
  - `verify.sh` exit 0: 0 matches in contents, messages and paths, and
    the removed files are gone.
  - Independent tree check: 790 of 790 files, 0 mismatches.
  - npm ci, 250/250 tests, tsc and build pass on the rewritten main.
  - After the push: 24 of 24 remote refs equal the rewritten mirror;
    deploy run 38104798466 succeeded, including its verify job;
    onejob.co, /app/ and /probe/latest.json return 200.
- **TestFlight notes (ASC API):** builds 38–41 and the Beta App
  Description contain no tester names.
- **Pilot group (ASC API, 10-10 17:5x):** builds 40 and 39, 0 testers.
- **Items:** 21 `###` items across this board and the archive (37
  settled; 39 new).
