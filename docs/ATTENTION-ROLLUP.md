# One Job — what needs xian · v78 (2026-10-08)

**Cite as "Coral rollup v78".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

**Apple approved build 40 for outside testers this morning (10-08,
06:10).** It's the first One Job build ever approved for outside
testing, so the Pilot link works for the first time. One small step
from you: re-send Pilot tester A the link (item 34; a message is drafted
below). The fix for Siri cards not appearing while the app is open
goes in build 41. The UX session is still unscheduled, and the prep is
ready.

## Open

### 🟡 34. Re-send Pilot tester A the Pilot link: it works now
Your 09-14 and 09-16 links reached her, but nothing could be installed:
no build had ever been approved for outside testers. Build 40 is now
approved (10-08) and attached to the Pilot group.
**Where to act:** your LinkedIn thread with Pilot tester A. Paste as plain
text. Last time, formatting around the link broke it. Draft:

Good news: the TestFlight link works now (sorry, it couldn't have
worked before; that was on our side). https://testflight.apple.com/join/dZ1DdUhJ
This build makes Siri cards come out in sentence case.

**Since:** 2026-10-08
**Ask:** Re-send Pilot tester A the Pilot link (draft on the board), then tell me it's sent.
**Rec:** Send it today, while she still remembers the shortcut she
built. I'll confirm she's in by checking the group's tester count, not
by her reply.

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

- 2026-10-08 · **Build 40 approved for outside testers** (BETA_APPROVED, 06:10). The Pilot link now works.
- 2026-10-07 · **Test Information filled in** by you. The weekly-question line was cut, to be added back when a program is active. Build 40 submitted for beta review (WAITING_FOR_BETA_REVIEW).
- 2026-10-07 · **Pilot yes** (your 10-06 answer, which arrived via Janus 10-07). Build 40 is attached to Pilot.
- 2026-10-06 · Build 40 rollout: **you test first**, then Pilot. Done; it passed.
- 2026-10-05 · **Ship build 40.** Uploaded as 1.1.1 (1.1 is live and closed to new builds).
- 2026-09-29 · The 8/29 LinkedIn hand-raiser is **Candidate D**. He replied 10-05; you hold his contact.
- Full history: [archive](archive/ATTENTION-ROLLUP-ARCHIVE.md).

---
**Verified how (v78):**
- **App Store Connect, read through the API at 06:10 PT on 10-08:**
  build 40's externalBuildState is BETA_APPROVED (the background
  poller saw it change, and a direct read confirmed it). The Pilot
  group has builds 40 and 39, 0 testers so far, and the public link is
  enabled.
- **Items:** 16 `###` items reconciled across this board and the
  archive (new: 34).
