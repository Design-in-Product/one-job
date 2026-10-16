# One Job — what needs xian · v114 (2026-10-16)

**Cite as "Coral rollup v114".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

Two things are open for you:

- **Build 44 (36):** on your "go for 44 before the pilot update", 1.1.1 (44)
  is in Internal (16:10): the open card from your 10-16 ideas, Markdown
  (48, answered), the Done view fix, and the deck actions (46, 47). When you've tried it, say "Pilot 44".
- **UX walk (22):** step 3, adding a card. You said on 10-16 you're
  ready; the question is in this item.

How a card shows itself is now written down in one place, rule by
rule, with who decided each and why: [`docs/CARD-DESIGN.md`](CARD-DESIGN.md).

In progress, mine, nothing needed from you:

- **Todoist:** built to the end of the one-way design, at the alpha
  stage (https://onejob.co/app/?alpha=on). Known limits are in the
  design doc; Markdown is no longer one of them. Write-back waits for
  your word after the first week.

Pilot has no testers. Builds 42 and 43 stay out of Pilot; 44 carries
everything in them.

## Open

### 🟡 36. Test build 44: the open card, Markdown, and the deck actions
Build 43 passed in your words on 10-16. On your "go for 44 before the
pilot update", 1.1.1 (44) carries your three open-card ideas with the
fixed-size sub-deck, Markdown (48), the Done view no longer stretching
a long card off the screen, and the deck actions (46, 47). It goes to
your Internal group. What to Test lists the checks.
**Where to act:** TestFlight on your phone → One Job → install 44.
**Since:** 2026-10-08
**Ask:** Install 44. Do the open card, Markdown and deck moves work?
**Rec:** If yes, say "Pilot 44" and I'll attach it to the Pilot group.
I read your "before the pilot update" as Pilot taking 44, not 43. Say
if you meant 43.

### 🟡 22. UX walk, step 3: add a card. What works and what doesn't?
You said on 10-16 you're ready. Step 3 is adding a card. On the phone
(43 or 44), add two cards the way you normally would: one from the
red + button, one from the long-press menu. Watch the form, the
keyboard, and where each card lands. Then tell me what felt right and
what didn't, in any form. Your words so far:
https://github.com/Design-in-Product/one-job/blob/main/docs/UX-WALK-NOTES-2026-10.md
**Where to act:** One Job on your phone, then tell Coral in session.
**Since:** 2026-08-13
**Ask:** UX walk, step 3: add two cards. What feels right and what doesn't?
**Rec:** Start with the + button. If anything makes you hesitate,
that's the thing to tell me.

## Recorded, final (not re-asked)

- 2026-10-16 · **Go for build 44 before the Pilot update.** Your words: "go for 44 before the pilot update".
- 2026-10-16 · **Markdown is rendered** (48). "render it please, just as you say. make sure we are documenting these choice and not just patching them." Built as recommended; the choices are in `docs/CARD-DESIGN.md`.
- 2026-10-16 · **The sub-deck is one fixed size.** "agreed with your take on the fixed-size subdeck and its size."
- 2026-10-16 · **Build 43: the open card passes on the phone.** "I like the card experience much better, thanks… Definitely it already addresses the core goals of the update." Your three ideas (an editable hint; a one-line description; the description filling the card while editing) are built in the web app, point 2 in a modified form. Your words in full: UX walk notes, step 3.
- 2026-10-16 · **Build 43: a Siri card lands on top** (first half of 36). Your words, relayed by Janus: "I confirm Siri adds card to top as expected."
- 2026-10-13 · **A deck is removed only when empty, with a "move all cards" option** (46). Your words, given in Janus's session and relayed: "only when empty with a "move all cards" option". Built the same day.
- 2026-10-13 · **A whole deck can move into a card, from one menu entry** (47). Your words, relayed by Janus: "one menu entry yes". Built as both an existing card and a new card on top; "both" is Janus's reading of your yes, not your word. Say if you meant one.
- 2026-10-13 · **Detaching an integration offers two outcomes:** "an offer to delete the attached deck -or- to leave it detached as an ordinary deck (no ability to re-attach implied)". Built the same day.
- 2026-10-13 · **Why you had three Todoist decks:** you connected the project first to see if it would make a deck per section. It made one deck with every task, so you connected each section too.
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
**Verified how (v114, 10-16; earlier lines from v110, 10-13):**
- **Build 44 (16:10 PT):** delivery `5265ce83`, VALID, in Internal (3
  testers); What to Test set from the release note. Checked inside the
  archive before upload: version 1.1.1 (44), the Markdown, inset-well,
  shape and deck-move code present, the Siri wording in the native
  binary. 337 tests, tsc and build pass. Pilot: builds 40 and 39, 0
  testers.
- **Fixed sub-deck and long text (15:4x):** 317 tests, tsc and build
  pass. Screenshots at phone size: the same sub-deck size on four
  cards; a GitHub-style wall of text (a six-line title, about 3,000
  characters) keeps the card's shape and scrolls; nothing is wider
  than the screen.
- **Open card ideas (15:3x):** 317 tests, tsc and build pass.
  Phone-sized screenshots of four states: a card with a sub-deck, a
  long description, the description while editing, and a card with
  no sub-deck yet. Title saves on leave, description saves on close,
  and a blank title goes back.
- **Build 43 (05:53 PT):** VALID; in Internal (3 testers). Checked
  inside the archive before upload: version 1.1.1 (43), the open-card
  code present, old Siri wording absent, new wording present. 269
  tests, tsc and build pass. What to Test set from the release note.
- **Todoist sync (about 06:35):** 297 tests pass. Walked at phone size
  against the test account: new task on top, closed task to Done,
  nothing removed, disconnect leaves the deck. The app sent Todoist
  no request other than reads.
- **Old commits (05:53):** the pre-rewrite head of the third pass
  returns 404 by direct link, and the API says "No commit found". The
  current head opens (200).
- **Pilot group (ASC API, 05:53):** builds 40 and 39, 0 testers.
- **Private repo (10-12, 17:49):** GitHub lists one account with
  access.
- **Detach (about 07:05):** 304 tests pass. Walked at phone size against
  the test account: cancel changed nothing; delete removed the deck
  and its 7 cards and no other deck; keep left the 5 cards in an
  ordinary deck that a reload did not sync.
- **Deck actions (07:2x):** 316 tests pass. Walked at phone size: a
  deck into an existing card and into a new card on top (every card
  kept, done ones too); all cards moved to another deck, on top and
  in order; the emptied deck deleted; Undo brought it back.
- **Items:** 30 `###` items across this board (2) and the archive
  (28); 48 opened and archived 10-16. 46 and 47 were opened and archived on 10-13.
