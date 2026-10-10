# One Job — what needs xian · v82 (2026-10-09)

**Cite as "Coral rollup v82".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

You re-sent Pilot tester A the Pilot link (10-08). The Pilot group doesn't
show her yet, and I'll confirm when it does. **Build 41** (the fix for
Siri cards while the app is open) is on TestFlight in your Internal
group, ready for you to test. The TestFlight description is now literally true
(you added the clause, 10-08). The UX session is still unscheduled.

## Open

### 🟡 37. This repo is public: keep tester names and your email here, or move them?
`Design-in-Product/one-job` is **PUBLIC** (checked 10-09). The
cross-pollination brief moved to a private repo for that reason. What
here is publicly readable:
- `docs/COHORT-ROSTER.md` names real testers and candidates (Pilot tester A, Candidate D, Tester B, Tester C, Candidate E, Candidate F,
  Candidate G) and where each raised a hand.
- Your personal address appears in `docs/TESTFLIGHT-COHORT-SPEC.md`
  and the 10-07 coral-log.

Nobody's contact details are stored (no tester emails or phones, by
design). Moving files out wouldn't erase git history; only a history
rewrite or making the repo private would.
**Where to act:** reply in Coral's session or to Janus. Or change
visibility at https://github.com/Design-in-Product/one-job/settings
(Danger Zone).
**Since:** 2026-10-09
**Ask:** Repo is public: leave tester names and your email, move them to a private repo, or make one-job private?
**Rec:** Move the roster to a private repo, and keep tester names out
of this one from now on. **Don't make one-job private as a quick fix.**
The org is on GitHub's free plan, and onejob.co is served by GitHub
Pages from this repo, so going private would take the live site down
unless the org upgrades. Your email: your call; it's your address.

### 🟡 36. Test build 41: Siri with the app open
Build 1.1.1 (41) is in your Internal group (10-08). With One Job open,
add a card by Siri, and it should appear right away in the deck you're
on, with no restart. What to Test lists three checks.
**Where to act:** TestFlight on your phone → One Job → install 41.
**Since:** 2026-10-08
**Ask:** Install 41 and try Siri with the app open. Did the card appear in that deck?
**Rec:** If yes, say "Pilot 41" and I'll attach it to Pilot tester A's group.
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
- 2026-10-08 · **Pilot tester A re-sent the Pilot link** (by you). I'll call her "in" when the Pilot tester count shows her.
- 2026-10-08 · **Go for build 41.** Uploaded and VALID, in Internal.
- 2026-10-08 · **Build 40 approved for outside testers** (BETA_APPROVED, 06:10). The Pilot link now works.
- 2026-10-07 · **Test Information filled in** by you. The weekly-question line was cut, to be added back when a program is active. Build 40 submitted for beta review (WAITING_FOR_BETA_REVIEW).
- 2026-10-07 · **Pilot yes** (your 10-06 answer, which arrived via Janus 10-07). Build 40 is attached to Pilot.
- 2026-10-06 · Build 40 rollout: **you test first**, then Pilot. Done; it passed.
- 2026-10-05 · **Ship build 40.** Uploaded as 1.1.1 (1.1 is live and closed to new builds).
- 2026-09-29 · The 8/29 LinkedIn hand-raiser is **Candidate D**. He replied 10-05; you hold his contact.
- Full history: [archive](archive/ATTENTION-ROLLUP-ARCHIVE.md).

---
**Verified how (v82):**
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
