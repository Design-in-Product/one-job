*Lean board (2026-09-27): only what needs xian. Everything settled or
carried, including the full decision history, is in
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.*

*What changed 2026-09-27: 33 rewritten (the problem is Title Case, not
ALL CAPS; the fix is merged; the samples gate build 40). 10 rewritten
(1.0 shipped, so "after 1.0" is stale; Themis puts "kill it" on the
table). 22's Rec now carries the one-sitting ask set I sent Janus.*

## Open

### 🟡 22. Pro-feedback session — conversational, screen by screen, when you're ready
You want this live: "if we go screen by screen, flow by flow, I will
remember and be able to narrate the key things easily." Bring your
usability screenshots. I'll have the walk order ready.
**Since:** 2026-08-13
**Ask:** Name a time for the screen-by-screen pro-feedback session (bring your usability screenshots).
**Rec:** This is the only thing One Job's turn needs from you (as I
told Janus on 09-27). The test plan needs no yes/no beforehand. Read
Themis's Pimento give-back *after* the session, together with 10.

### 🟡 33. Siri cards come out Title Case: two samples, or just ship build 40
You reported that a Siri-made card came out Title Case. The fix is
merged (`f733378`, 2026-09-17): the intent now declares sentence-case
input, and dictation handles the capitals, so "Call Pilot tester A"
stays right. There's no post-processing. It's in build 40, which I
have deliberately not cut: I was waiting on your samples and on
Pilot tester A's first days on 39.
**Since:** 2026-09-17
**Ask:** Two Siri samples (what you said and what appeared), or say "ship 40."
**Rec:** Ship 40. Its build has been held 10 days, and Pilot tester A joined
on 09-16. Testing the fix on 40 answers the same question the samples
would. I'll tell Pilot tester A when it lands.

### 🟢 32. Who raised their hand on LinkedIn on 8/29? Thirty seconds for you, impossible for us
Themis's records note "one hand already raised on LinkedIn (8/29)"
but never name the person. The name is in the reactions and comments
on your 8/29 post.
**Since:** 2026-09-15
**Ask:** Check your 8/29 LinkedIn post and name the hand-raiser for the roster.
**Rec:** Do it next time you're in LinkedIn. They volunteered before
the app was public, which makes them a good early Pilot invite.

### 🟡 27. Probe feedback — you are living in it now
You answer from the attention deck. Whether a card is a good place to
answer an agent is the R4.2-lite question.
**Since:** 2026-08-31
**Ask:** How did answering from the deck actually feel?
**Rec:** Relief, ceremony, or somewhere in between. One word is enough.
Friction noted as it happens beats a saved-up verdict.

### 🟢 10. REQUIREMENTS.md is stale — kill it or rebaseline it?
It's dated 2026-07-04. It still says R1 is next and still describes
substacks as live. ROADMAP.md and VISION.md now say what's true.
Themis's Pimento give-back names killing it as a real option.
**Since:** 2026-07-28
**Ask:** REQUIREMENTS.md: kill it (mark it superseded) or rebaseline it?
**Rec:** Kill it. Put a "superseded, see ROADMAP/VISION" header on it
and leave the file in place, which can be undone. Rebaselining 434
lines would duplicate the two docs that are already kept current.
