# One Job — what needs xian · v75 (2026-10-06)

**Cite as "Coral rollup v75".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

Build 40 (version 1.1.1) is on TestFlight, and you've tested it: Siri
cards now come out in sentence case. Pilot tester A doesn't have it yet. Giving
it to her is the one decision waiting on you (🔒). Your test also found
that cards added by Siri while the app is open don't show up until a
restart, and that's also why they landed in the "wrong" deck. Half of
the fix is done; the other half goes in build 41. Your UX session is
still unscheduled, and the prep is ready.

## Open

### 🟡 33. 🔒 Give build 40 to Pilot tester A (the Pilot tester group)?
Sentence case passed on your phone (10-06). 40 is strictly better than
the 39 Pilot tester A has: the Siri pickup problem you found exists in 39 too,
and its full fix comes in 41.
**🔒 Blocked on xian** since 2026-10-06. The choice: Pilot now, or hold
Pilot tester A on 39 until 41. Smallest answer: "Pilot yes" or "wait for 41".
**Where to act:** reply in Coral's session (tmux `coral` on Amber), or
add the build yourself in App Store Connect:
https://appstoreconnect.apple.com/apps/6787158379/testflight/groups/0b3170ff-f2cd-4d62-a68a-707ec93be0aa
(Builds → + → 40). After that I submit it for Beta App Review and tell
Pilot tester A.
**Since:** 2026-10-06
**Ask:** 🔒 Give build 40 to Pilot tester A now? ("Pilot yes" / "wait for 41")
**Rec:** Pilot yes. It only adds a fix she'd notice, and holding it
gains nothing.

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

- 2026-10-06 · Build 40 rollout: **you test first**, then Pilot. Done; it passed.
- 2026-10-05 · **Ship build 40.** Uploaded as 1.1.1 (1.1 is live and closed to new builds).
- 2026-09-29 · The 8/29 LinkedIn hand-raiser is **Candidate D**. He replied 10-05; you hold his contact.
- Full history: [archive](archive/ATTENTION-ROLLUP-ARCHIVE.md).

---
**Verified how (v75):**
- **Build 40:** read from the App Store Connect API at 17:5x PT on 10-06.
  It's VALID, in the Internal group; the Pilot group holds build 39 only.
- **Items:** 15 `###` items are reconciled across this board and the
  archive (4 open here).
- **Mail:** 3 mails from 10-03 to 10-06, all read in full.
- **CI:** deploy run 37531710207 succeeded.
