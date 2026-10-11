# One Job — what needs xian · v89 (2026-10-11)

**Cite as "Coral rollup v89".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

**The scrub missed one tester, and I was wrong to say it hadn't.** The
first outside tester (July) was never on the roster the scrub's list
was built from, so their name is still in this public repo: the full
name in 11 files, and the first name in about 34. Fixing it takes a
second pass, which needs your go (41). Everything else moved today:
you sent GitHub the purge request, told me your agent's-deck insight
(my write-up is ready for you to correct, 40), answered the deck-feel
question, and settled REQUIREMENTS.md. You'll retest Siri today (36).
The UX session could be later today or tomorrow (22).

## Open

### 🔴 41. The scrub missed one tester's name: go for a second pass?
The 10-10 scrub removed every name on the roster. The first outside
tester, from July, was never on the roster, so the scrub's list didn't
include them. Their full name is in 11 current files, their first name
in about 34, and both are in the history. I found it on 10-11 while
writing up your notes. I checked every name in the private files
against this repo, and this is the only one left.
**Where to act:** say "second pass" in Coral's session. It's the same
procedure as 10-10: backup, rewrite, three checks, one protected push.
Then I'd draft a one-line reply for you to add to the GitHub ticket.
**Since:** 2026-10-11
**Ask:** Go for a second scrub pass, to remove the one missed tester's name?
**Rec:** Yes, and soon. GitHub's cleanup removes only what is
unreachable when they run it, so the second pass should land first.
The name would become a role label, as the others did.

### 🟢 38. CLAUDE.md tells me the app is backend-first: add a short note, rewrite, or leave?
You said (10-11) you can't weigh this yet, so here it is plainly.
CLAUDE.md is the file every new session of me reads first. Its
methodology sections say task logic belongs in the backend and that I
should check the frontend against the backend API before any change.
The shipped app has no backend: everything is on the device.
- **Leave it.** No effort and no risk to your text. But the file
  contradicts itself, and each new session has to work out which half
  is true. On 09-27 I did, from a note near the end.
- **Rewrite it.** The file would be true throughout. But it's your
  methodology, about an hour of my work plus your review, and the
  backend text becomes useful again if a server ever returns.
- **Add a three-line note** above those sections: "these apply only in
  `?remote` mode; the shipped app is local-first". Your text stays
  untouched.
**Where to act:** one word, in Coral's session or to Janus. File:
https://github.com/Design-in-Product/one-job/blob/main/CLAUDE.md
**Since:** 2026-10-10
**Ask:** CLAUDE.md's backend-first sections: add a short note, rewrite them, or leave them?
**Rec:** Add the note. It removes the contradiction in five minutes
and changes none of your words. (I recommended a rewrite before; the
note gets most of the benefit.)

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
You said (10-11) later today or tomorrow, and that long sits are hard
right now. It doesn't need one: the prep is ordered so we can stop
after any screen, and 20 minutes covers the first three.
**Where to act:** just start in Coral's session when you have 20
minutes. Bring your usability screenshots.
**Since:** 2026-08-13
**Ask:** Start the UX session when you have 20 minutes (today or tomorrow).
**Rec:** Do it in pieces. I'm here whenever you open the session, so
there's no time to agree in advance.

### 🟡 40. Your agent's-deck insight: is my write-up right?
You told me the insight on 10-11: build nothing special for agent
decks and no syncing of our own; extend the Todoist integration, so
you and your agents both work through Todoist and One Job is the lens.
I've written it up against the roadmap, with seven places I'd check
the claim and four questions for you.
**Where to act:** read
https://github.com/Design-in-Product/one-job/blob/main/docs/AGENT-DECK-VIA-INTEGRATIONS-2026-10.md
and correct it in Coral's session or through Janus.
**Since:** 2026-10-03
**Ask:** Read my write-up of your agent's-deck insight. What did I get wrong?
**Rec:** I think the idea holds. The two calls it most needs from you
are whether the deck follows Todoist's order, and whether "complete
it" is enough of an answer at first. Nothing gets built without your go.

## Recorded, final (not re-asked)

- 2026-10-11 · **Answering from the attention deck feels ambiguous** (your answer to 27). The deck is for completing tasks; you can't swipe a card until you've answered, and you can't answer from the card. Cards aren't actionable unless the description has a link. Carried into the UX session and the agent's-deck write-up.
- 2026-10-11 · **REQUIREMENTS.md retired** on your terms (10): a box at its top says what replaced each part and how each replacement is kept current. To undo, delete the box.
- 2026-10-11 · **Agent's-deck insight told** (40). Written up for your correction.
- 2026-10-11 · **GitHub purge request sent** by you, through GitHub's Virtual Assistant ("Ticket created"). It asks for all unreachable commits to be garbage-collected. Waiting on GitHub; I check the old commit link at every fire.
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
**Verified how (v89):**
- **Scrub miss (10-11, 15:0x PT):** `git grep` for the missed tester's
  surname finds 12 lines in 11 files; the first name as a whole word,
  about 57 lines in 34 files, every one of them this tester. Every
  name-like phrase in one-job-private's roster, feedback file and
  transcript was checked against this repo; no other tester's name
  was found. The 10-10 checks were correct for the names on their list.
- **Purge request (10-11, 14:1x PT):** xian's screenshot shows "Ticket
  created". The old head of `main` still returned 200 at 14:0x.
- **Pilot group (ASC API, 10-10 17:5x):** builds 40 and 39, 0 testers.
  Not re-checked today.
- **Items:** 23 `###` items across this board and the archive (27 and
  10 moved to the archive today; 41 is new).
