# One Job — what needs xian · v107 (2026-10-13)

**Cite as "Coral rollup v107".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

Two things are open for you:

- **Build 43 (36):** 1.1.1 (43) is in your Internal group, on your
  "go for build 43". It has the Siri change and the rebuilt open
  card. You test it, then say "Pilot 43".
- **UX walk (22):** step 3, adding a card. You said the rebuilt open
  card "feels good" on 10-13, which closed step 2.

In progress, mine, nothing needed from you:

- **Todoist:** the design is settled (40, archived). The read-only
  adapter is built and checked against your test account. Next are
  the Integrations screen and sync. Your asks are also tasks on your
  list in the Todoist test project, as an experiment beside this
  board.

Closed on 10-13: GitHub removed the old commits from the third scrub
pass (44). The old link no longer opens.

Pilot has no testers. Build 42 was skipped; 43 carries everything in
it.

## Open

### 🟡 36. Test build 43: Siri card on top, and the open card
You reversed the 2026-09-12 ruling on 10-12: a card added by Siri or
a Shortcut now lands on top, like one typed in. Build 1.1.1 (43) has
that, the corrected Siri wording, and the open card rebuilt from your
step 2 feedback. It is in your Internal group. What to Test lists
five checks.
**Where to act:** TestFlight on your phone → One Job → install 43.
**Since:** 2026-10-08
**Ask:** Install 43. Is a Siri card on top, and does the open card work on the phone?
**Rec:** If yes, say "Pilot 43" and I'll attach it to the Pilot group.
If no, tell me exactly what you saw. Builds 41 and 42 stay out of
Pilot.

### 🟡 22. UX walk, step 3: add a card. What works and what doesn't?
Step 2 closed on 10-13 with your "rebuild card feels good". Step 3 is
adding a card: the long press, the arc menu, the form, and where the
new card lands. Use it as you normally would and tell me what you
notice, in any form. Your words so far:
https://github.com/Design-in-Product/one-job/blob/main/docs/UX-WALK-NOTES-2026-10.md
**Where to act:** One Job on your phone (build 43), then tell Coral in
session.
**Since:** 2026-08-13
**Ask:** UX walk, step 3: add a card or two. What feels right and what doesn't?
**Rec:** Do it while you test build 43, since you'll have the app open.
Anything more on tap and edit from the phone goes here too.

## Recorded, final (not re-asked)

- 2026-10-13 · **GitHub removed the old commits** (44). The pre-rewrite head of the third pass returns 404 by direct link and "No commit found" from the API (checked 05:53 PT).
- 2026-10-13 · **UX walk step 2 closed:** "rebuild card feels good". Build 43 made on your "go for build 43"; you'll test the Siri change there. Build 42 skipped.
- 2026-10-12 · **Todoist stays one-way for the first week** ("gall's law approach"): One Job reads; a Done swipe does not close the task in Todoist until after that.
- 2026-10-12 · **The open card is card-shaped**, not a sheet and not the whole screen. Remove Status and Created; a much bigger sub-deck in its parent deck's colour; no Edit button, tap any element to edit it.
- 2026-10-12 · **Todoist design answered:** a new task lands on top; a task closed in Todoist goes to Done here, and the reverse on sync; tier not decided; the token stays on the device for now, OAuth likely later; mapping is "loose but simple".
- 2026-10-12 · **Coral may write to the One Job project in Todoist** (your words in session). Coral closes only its own tasks.
- 2026-10-12 · **GitHub import stays hidden behind its flag; Todoist is the first real integration.** The model may be extended back to GitHub later. (The flag is the existing beta stage; no change was needed.)
- 2026-10-12 · **Swipe right and swipe left are release-ready** (your words, UX walk step 2).
- 2026-10-12 · **Ruling reversed: a new card takes the top, whoever adds it.** Siri and Shortcut cards land on top like typed ones ("optional complexity"; "now that it's instant there is no need"). Supersedes 2026-09-12. In build 42.
- 2026-10-12 · **Bulk arrivals, your idea, not decided:** they come in as a deck inside one new card that sits on top until sorted. Today an import lands in a deck of its own, named for the service.
- 2026-10-12 · **Deck order default: One Job's order. No general "don't ask me again"** (your "40 - go").
- 2026-10-12 · **Build 41 retest passed on its one job:** a Siri card appears at once, with the app open, in the deck you are on. The wording and the placement are item 36.
- 2026-10-12 · **Deck order with an integration:** the user is asked when adding it (service updates the order, or the deck's order is maintained). One Job keeps its own sense of the order either way.
- 2026-10-12 · **Second GitHub cleanup request sent** by you (44), through the Virtual Assistant ("Ticket created"), for the 492 old commits the third pass left. GitHub acted by 10-13.
- 2026-10-12 · **Private repo access closed** (45), on your word: the organisation's other member is now an outside collaborator.
- 2026-10-11 · **Second scrub pass done** (41), on your "second pass, yes". main went from `a8e94ec` to `ada8298`. The missed tester is "Tester H" throughout.
- 2026-10-11 · **CLAUDE.md methodology rewritten** (38), on your "update it to reflect how the paradigm has evolved and what is stable about it". The old text is in the archive, verbatim.
- 2026-10-11 · **Sync, corrected by you:** the only sync is the planned two-way sync to an existing back end. One Job hosts no sync of its own and doesn't distinguish an agent from a person.
- 2026-10-11 · **UX session form:** a conversational walk, one step at a time, alongside other work.
- 2026-10-11 · **Answering from the attention deck feels ambiguous** (your answer to 27). The deck is for completing tasks; you can't swipe a card until you've answered, and you can't answer from the card. Cards aren't actionable unless the description has a link. Carried into the UX session and the agent's-deck write-up.
- 2026-10-11 · **REQUIREMENTS.md retired** on your terms (10): a box at its top says what replaced each part and how each replacement is kept current. To undo, delete the box.
- 2026-10-11 · **Agent's-deck insight told** (40). Written up for your correction.
- 2026-10-11 · **GitHub purge request sent** by you, through GitHub's Virtual Assistant ("Ticket created"). It asks for all unreachable commits to be garbage-collected. Waiting on GitHub; I check the old commit link at every fire.
- Full history: [archive](archive/ATTENTION-ROLLUP-ARCHIVE.md).

---
**Verified how (v107, 10-13):**
- **Build 43 (05:5x PT):** VALID; in Internal (3 testers). Checked
  inside the archive before upload: version 1.1.1 (43), the open-card
  code present, old Siri wording absent, new wording present. 269
  tests, tsc and build pass. What to Test set from the release note.
- **Old commits (05:53):** the pre-rewrite head of the third pass
  returns 404 by direct link, and the API says "No commit found". The
  current head opens (200).
- **Pilot group (ASC API, 05:53):** builds 40 and 39, 0 testers.
- **Private repo (10-12, 17:49):** GitHub lists one account with
  access.
- **Items:** 27 `###` items across this board (2) and the archive
  (25).
