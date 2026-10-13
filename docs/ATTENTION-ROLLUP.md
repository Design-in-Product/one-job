# One Job — what needs xian · v104 (2026-10-12)

**Cite as "Coral rollup v104".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

Three things are open, and each has a next step that is yours:

- **Siri (36):** build 1.1.1 (42) is in your Internal group. A Siri
  card now lands on top and Siri's wording is corrected. You test it,
  then say "Pilot 42".
- **UX walk (22):** step 2. You gave five changes to the open card.
  One question: a card shape, or the whole screen?
- **Todoist (40):** you answered the design and I am building it,
  read-only first. One question on when write-back starts. Your asks
  are now also tasks on your list in the Todoist test project.

Waiting on others, not on you: GitHub has your second cleanup request
(sent 10-12, about 17:40). Until they act, the old commits from the
third scrub pass still open by exact link.

Closed on 10-12: the third scrub pass; the private repo is readable
by your account only. Pilot has no testers.

## Open

### 🟡 36. Test build 42: does a Siri card land on top?
You reversed the 2026-09-12 ruling on 10-12: a card added by Siri or
a Shortcut now lands on top, like one typed in. Build 1.1.1 (42) has
that and the corrected wording, and it is in your Internal group.
What to Test lists three checks.
**Where to act:** TestFlight on your phone → One Job → install 42.
**Since:** 2026-10-08
**Ask:** Install 42 and add a card by Siri. Is it on top, and is Siri's reply right?
**Rec:** If yes, say "Pilot 42" and I'll attach it to the Pilot group.
If no, tell me exactly what you saw. Build 41 stays out of Pilot.

### 🟡 22. UX walk, step 2: open card as a card, or the whole screen?
On 10-12 you called the open card too fussy: remove Status and
Created, make the sub-deck much bigger and in its parent deck's
colour, drop the Edit button so tapping any element edits it, and
make it either a real card shape or the whole screen. Your words:
https://github.com/Design-in-Product/one-job/blob/main/docs/UX-WALK-NOTES-2026-10.md
**Where to act:** Coral's session, a sentence or a screenshot at a
time.
**Since:** 2026-08-13
**Ask:** UX walk, step 2: should an open card be card-shaped, or take the whole screen?
**Rec:** Card-shaped. Tapping a card would then turn it over and
bring it forward, and the deck stays the only place you are. A whole
screen is a second place. Say which, and whether to build it now or
after the walk.

### 🟡 40. Todoist: is completion write-back after a proven week, or from the start?
You answered the design on 10-12 and I have started building, at
alpha. One answer needs a check. You said a task closed in Todoist
goes to Done here "and vice versa on sync". The roadmap puts that
second half (a Done swipe closes the task in Todoist) after a proven
week of read-only.
**Where to act:** Coral's session. Design:
https://github.com/Design-in-Product/one-job/blob/main/docs/TODOIST-INTEGRATION-DESIGN-2026-10.md
**Since:** 2026-10-03
**Ask:** Todoist: does a Done swipe close the task from day one, or after a read-only week?
**Rec:** After the week, as the roadmap says. Reading can't damage
your list; writing can. I build reading first either way, so this
doesn't hold anything up yet. Tier stays undecided, as you asked.

## Recorded, final (not re-asked)

- 2026-10-12 · **Todoist design answered:** a new task lands on top; a task closed in Todoist goes to Done here, and the reverse on sync; tier not decided; the token stays on the device for now, OAuth likely later; mapping is "loose but simple".
- 2026-10-12 · **Coral may write to the One Job project in Todoist** (your words in session). Coral closes only its own tasks.
- 2026-10-12 · **GitHub import stays hidden behind its flag; Todoist is the first real integration.** The model may be extended back to GitHub later. (The flag is the existing beta stage; no change was needed.)
- 2026-10-12 · **Swipe right and swipe left are release-ready** (your words, UX walk step 2).
- 2026-10-12 · **Ruling reversed: a new card takes the top, whoever adds it.** Siri and Shortcut cards land on top like typed ones ("optional complexity"; "now that it's instant there is no need"). Supersedes 2026-09-12. In build 42.
- 2026-10-12 · **Bulk arrivals, your idea, not decided:** they come in as a deck inside one new card that sits on top until sorted. Today an import lands in a deck of its own, named for the service.
- 2026-10-12 · **Deck order default: One Job's order. No general "don't ask me again"** (your "40 - go").
- 2026-10-12 · **Build 41 retest passed on its one job:** a Siri card appears at once, with the app open, in the deck you are on. The wording and the placement are item 36.
- 2026-10-12 · **Deck order with an integration:** the user is asked when adding it (service updates the order, or the deck's order is maintained). One Job keeps its own sense of the order either way.
- 2026-10-12 · **Second GitHub cleanup request sent** by you (44), through the Virtual Assistant ("Ticket created"), for the 492 old commits the third pass left. Waiting on GitHub; I check the old commit link at every fire.
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
**Verified how (v103, 10-12):**
- **Third pass (15:28 PT):** backup 24 of 24 refs in one-job-private
  under `pre-scrub-3/`; 798 commits before and after; 805 files
  checked, 14 changed, 0 mismatches; 0 matches for every marked term
  in contents, messages and paths, on the rewritten copy and on a
  fresh clone from GitHub; 250 tests, tsc and build pass.
- **Old commits (20:03):** the pre-rewrite head still opens by direct
  link (200). Expected until GitHub acts on the ticket.
- **Private repo (17:49):** GitHub lists one account with access.
- **Build 42 (18:2x):** VALID; in Internal (3 testers). Checked inside
  the archive before upload: version 1.1.1 (42), old Siri wording
  absent, new wording present. 251 tests pass.
- **Pilot group (ASC API, 18:2x):** builds 40 and 39, 0 testers.
- **Todoist (20:2x):** on your word in session, 7 tasks added (3 on
  your list, 4 on mine) and 6 of mine closed. Read back: 4 open on
  your list, 4 on mine.
- **Items:** 27 `###` items across this board (3) and the archive
  (24). Recorded lines from 10-10 and earlier moved to the archive
  on 10-12 (10 lines).
