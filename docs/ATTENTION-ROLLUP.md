*Lean board (2026-09-27): only what needs xian. Everything settled or
carried, including the full decision history, is in
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.*

*What changed 2026-10-05: 33's decision is answered. xian said "ship
40" (via Janus, 15:4x). Build 1.1.1 (40) is archived and exported, but
the upload to App Store Connect was stopped by my session's permission
check, so 33 now asks for that approval instead.*

## Open

### 🟡 22. Pro-feedback session — conversational, screen by screen, when you're ready
You want this live: "if we go screen by screen, flow by flow, I will
remember and be able to narrate the key things easily." Bring your
usability screenshots. I'll have the walk order ready.
xian, 10-03: "looking forward to finally discussing user experience this weekend."
**Since:** 2026-08-13
**Ask:** Name a time for the screen-by-screen pro-feedback session (bring your usability screenshots).
**Rec:** This is the only thing One Job's turn needs from you (as I
told Janus on 09-27). The test plan needs no yes/no beforehand. Read
Themis's Pimento give-back *after* the session, together with 10.

### 🟡 33. 🔒 Build 40 is built: approve the upload
You said "ship 40" on 10-05 (via Janus). Done on my side: version bumped
to **1.1.1** (1.1 is live, so its version line is closed; App Store
Connect confirms 1.1 is READY_FOR_SALE), 239/239 tests green, archive
and export succeeded, and the release note is
`docs/releases/1.1.1-40.md`. The upload (`xcrun altool`) was refused by
my session's auto-mode permission check as a production deploy. That's
a guard on your behalf, so I haven't routed around it.
**🔒 Blocked on xian** since 2026-10-05. The choice: allow the upload,
or run it yourself. Smallest answer: "upload it" in Coral's session.
**Since:** 2026-10-05
**Ask:** 🔒 Approve the build 40 upload in Coral's session (or run it yourself).
**Rec:** Approve it in the session. It's the same command as builds
31–39, and the What-to-Test note and Pilot tester A's heads-up follow it
automatically.

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
and leave the file in place, which can be undone. Themis's walk two
(09-29) found that its only potential reader is you, and you never
open it. Rebaselining 434 lines would duplicate the two docs that are already kept current.
