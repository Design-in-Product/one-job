# One Job — what needs xian · v76 (2026-10-07)

**Cite as "Coral rollup v76".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

Your "Pilot yes" arrived via Janus today, and build 40 is now in the
Pilot group. But Apple won't review it for outside testers because
TestFlight's **Test Information** page was never filled in. Checking
that turned up a bigger correction: **the Pilot group has never had a
tester.** No build was ever approved for outside testing, so Pilot tester A
never actually joined. She's most likely on 1.1 from the App Store.
One form from you fixes it (🔒 33). Separately, the fix for Siri cards
not appearing while the app is open is half done and goes in build 41.

## Open

### 🟡 33. 🔒 Fill in TestFlight's Test Information so Pilot tester A can actually join
Build 40 is in the Pilot group (done 10-07, on your "Pilot yes"). Apple
refuses to review it for outside testers because **Beta App
Description** and the **review contact** are empty. They have never
been set, which is why no outside tester has ever been able to join.
It's a one-time form. The contact (name, phone, email) is yours to
give, and I won't guess it.
**🔒 Blocked on xian** since 2026-10-07. The choice: fill the form
yourself, or send me the contact details and I'll set everything via
the API. Smallest answer: "done" after filling it in.
**Where to act:** App Store Connect → One Job → TestFlight → Test
Information:
https://appstoreconnect.apple.com/apps/6787158379/testflight/test-info
Paste the Beta App Description from
https://github.com/Design-in-Product/one-job/blob/main/docs/TESTFLIGHT-COHORT-SPEC.md
(step 5; the feedback email there is onejob@designinproduct.com), then add your
contact under Beta App Review Information. Then I submit build 40 for
review, tell you when it's approved, and re-send Pilot tester A the link.
**Since:** 2026-10-07
**Ask:** 🔒 Fill in TestFlight Test Information (description + your contact), then say "done."
**Rec:** Do it yourself in ASC. It takes two minutes, and your phone
number never passes through me.

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

- 2026-10-07 · **Pilot yes** (your 10-06 answer, which arrived via Janus 10-07). Build 40 is attached to Pilot.
- 2026-10-06 · Build 40 rollout: **you test first**, then Pilot. Done; it passed.
- 2026-10-05 · **Ship build 40.** Uploaded as 1.1.1 (1.1 is live and closed to new builds).
- 2026-09-29 · The 8/29 LinkedIn hand-raiser is **Candidate D**. He replied 10-05; you hold his contact.
- Full history: [archive](archive/ATTENTION-ROLLUP-ARCHIVE.md).

---
**Verified how (v76):**
- **App Store Connect, read through the API at about 11:xx PT on 10-07:**
  - Pilot group: builds 40 and 39, **0 testers**, public link enabled (limit 10).
  - Cohort group: 0 testers.
  - Internal group: 3 testers, all invited by email.
  - Builds 37, 38 and 39: externalBuildState READY_FOR_BETA_SUBMISSION, so never submitted.
  - betaAppLocalizations: **none**. betaAppReviewDetail: all fields null.
  - The review submission for 40 was rejected: MISSING_BETA_APP_DESCRIPTION.
- **Items:** 15 `###` items reconciled across this board and the archive.
- **Mail:** 1 new (Janus, 10-07), read in full.
