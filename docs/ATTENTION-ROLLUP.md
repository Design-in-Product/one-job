# One Job — what needs xian · v96 (2026-10-12)

**Cite as "Coral rollup v99".** One file, one URL:
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

You answered all three open items on 10-12, and each has one
question left: whether Siri cards land on top (36), the face-down
deck in the UX walk (22), and the default for deck order with an
integration (40). Pilot had no testers at the last check (10-12).

## Open

### 🟡 36. Siri cards: on top, like the ones you add by hand?
You retested build 41 on 10-12. The card appeared at once, under the
current card, as designed. Two things are wrong. The Siri action's
description and its spoken reply still say the card appears the next
time you open the app; both are corrected in the source and need a
native build to reach the phone. And you said a card added by hand
lands on top while this one is "hidden", and that the reasoning
"fails in reality as an experience". Changing that reverses part of
your 2026-09-12 ruling (cards from outside join behind the top card).
**Where to act:** Coral's session or through Janus.
**Since:** 2026-10-08
**Ask:** Should a card added by Siri land on top, like one you add by hand?
**Rec:** Yes for Siri and Shortcuts: you added that card yourself, so
it should behave like typing it. Keep "behind the top card" for
arrivals in bulk (imports, a synced list), where thirty cards landing
on top would bury your one job. The cost: several Siri cards added
while the app is closed will sit above the card you left on top. On
your yes I change it with tests and make build 42, which also carries
the wording fix. Build 41 stays out of the Pilot group meanwhile,
because its wording is wrong; say "Pilot 41" if you'd rather not wait.

### 🟡 22. UX walk: step 1 of 11, one follow-up out (the face-down deck)
You gave step 1 on 10-12: returning to the last deck, its colour, and
knowing the other decks are there all work for you and match your
design vision. Your words are in
https://github.com/Design-in-Product/one-job/blob/main/docs/UX-WALK-NOTES-2026-10.md
**Where to act:** Coral's session, a sentence or a screenshot at a
time.
**Since:** 2026-08-13
**Ask:** UX walk, step 1: the face-down deck and the tap to reveal. How does that moment feel?
**Rec:** No hurry. If there's nothing to say about it, say "step 1
is done" and I'll open step 2 (the active card).

### 🟡 40. Deck order with an integration: which choice is the default?
You ruled on 10-12: when the user adds an integration, One Job asks
whether the service updates the deck's order during sync or the
deck's order is maintained. Either way One Job keeps its own sense of
the order. Two things are left to settle, and nothing is built until
you say go. Write-up:
https://github.com/Design-in-Product/one-job/blob/main/docs/AGENT-DECK-VIA-INTEGRATIONS-2026-10.md
**Where to act:** Coral's session or through Janus.
**Since:** 2026-10-03
**Ask:** Deck order default: keep One Job's order? And is there a "don't ask again"?
**Rec:** Default to One Job's order, your lean and mine: the top card
is what the app protects, and "Later" has to mean something. Skip a
general "don't ask me again" for now. Ask once per integration with
the default already selected, and let the user change it later in
that integration's settings. A general preference only earns its
place when there are several integrations (R3.5). Two smaller
questions remain in the write-up (answering from a card; whether this
replaces R4.1 and R4.3).

## Recorded, final (not re-asked)

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
