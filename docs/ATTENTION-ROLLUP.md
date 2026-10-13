# One Job — what needs xian · v96 (2026-10-12)

**Cite as "Coral rollup v100".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

**The third scrub pass is done (10-12, 15:28).** You marked the list
and said "please proceed" in my session. The outside people, the
client names and the two details about you that you marked are now
role labels in one-job's files and history, and onejob.co is up.
You sent GitHub the cleanup request for this pass on 10-12 at about
17:40 ("Ticket created"). Until GitHub acts, the old commits still
open by exact link; I check at each fire.
GitHub already cleaned up after the first two passes.

Closed on 10-12: one other organisation member could read the
private repo. On your word they are now an outside collaborator and
yours is the only account with access (45, archived).

Build 1.1.1 (42) is in your Internal group (10-12): a Siri card now
lands on top, on your reversal of the 09-12 ruling, and Siri's wording
is corrected (36). The UX walk's step 1 is narrated (22). You said go
on the integration order prompt, and Todoist needs two things from
you before I build it (40). Pilot had no testers at the last check
(10-12).

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

### 🟡 22. UX walk: is step 1 (the cold open) done?
You gave step 1 on 10-12: returning to the last deck, its colour, and
knowing the other decks are there all work for you, and revealing the
first card "feels fun". Your words are in
https://github.com/Design-in-Product/one-job/blob/main/docs/UX-WALK-NOTES-2026-10.md
**Where to act:** Coral's session, a sentence or a screenshot at a
time.
**Since:** 2026-08-13
**Ask:** UX walk: anything more on the cold open, or is step 1 done?
**Rec:** Say "step 1 is done" and I'll open step 2, the active card:
swipes, tap and edit.

### 🟡 40. Todoist: scope the GitHub import or hide it first? And a test token
You said go on 10-12. Decided: the user is asked about deck order
when adding an integration, the default is One Job's order, and there
is no general "don't ask me again". Building Todoist (read-only, one
designated list) needs two things from you first. The roadmap makes
fixing the GitHub import a precondition, because it takes in every
issue assigned to you. And I can't check the adapter against the
real service without a Todoist API token.
**Where to act:** Coral's session. Give the token there, not in mail
or on the board.
**Since:** 2026-10-03
**Ask:** Before Todoist: scope GitHub's import to one repo, or hide it? And a test token.
**Rec:** Scope it to one repo the user picks. Todoist needs the same
"pick one list" step, so the two share a screen, and hiding would
take a feature away from people who have 1.1. The token: Todoist →
Settings → Integrations → Developer. It stays on this machine,
outside the repo. Two smaller questions remain in the write-up
(answering from a card; whether this replaces R4.1 and R4.3):
https://github.com/Design-in-Product/one-job/blob/main/docs/AGENT-DECK-VIA-INTEGRATIONS-2026-10.md

## Recorded, final (not re-asked)

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
**Verified how (v91):**
- **Second pass (10-11, 15:10 PT):**
  - Backup first: 24 of 24 refs verified in one-job-private under
    `pre-scrub-2/`.
  - `verify.sh` exit 0 on the rewritten copy, and again on a fresh
    copy cloned from GitHub after the push: 0 matches in contents,
    messages and paths. The new independent sweep found nothing.
  - Independent file check: 795 of 795 files, 34 changed, 0 mismatches.
  - The surname in any letter case, across all history: 0.
  - Four unrelated library authors who share the first name were left
    alone (14 lines kept, 0 relabelled).
  - npm ci, 250/250 tests, tsc and build pass on the rewritten main.
  - Push: all-or-nothing and lease-protected; 24 of 24 remote refs
    equal the rewritten copy. Deploy run 38179394441 succeeded;
    onejob.co, /app/ and /probe/latest.json return 200.
  - The pre-rewrite head still opens by direct link (200), which is
    what item 42 is for.
- **Pilot group (ASC API, 10-10 17:5x):** builds 40 and 39, 0 testers.
  Not re-checked today.
- **Non-tester names (10-11, 15:3x PT):** Janus's sweep (80 first
  names across the tree, and all commit messages) plus mine (the
  system's list of given names against docs, logs, store and source).
  Neither found a tester's name. Old file versions in history were
  not swept for non-testers.
- **Items:** 25 `###` items across this board and the archive (41 and
  38 moved to the archive; 42 and 43 are new).
