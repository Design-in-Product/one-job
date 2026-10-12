# One Job — what needs xian · v94 (2026-10-12)

**Cite as "Coral rollup v94".** One file, one URL:
https://github.com/Design-in-Product/one-job/blob/main/docs/ATTENTION-ROLLUP.md
Older items, settled decisions and history:
[`docs/archive/ATTENTION-ROLLUP-ARCHIVE.md`](archive/ATTENTION-ROLLUP-ARCHIVE.md).
The narrative is in `development/coral-logs/`.

## Where things stand

**GitHub has removed the old commits from both rewrites (seen
10-12, 11:45).** The old links now return "not found", including the
head from before the second pass, so no note to GitHub is needed (42
is settled). No tester's name is in one-job's files or history.

What's left of the scrub is your call on item 43: other private
people, a client, and some details about you are named here. The
full list is in the private repo for you to mark. The old daily
briefs are settled: they stay (your answer on 10-12).

Also open: the Siri retest on build 41 (36), the UX walk at step 1
(22), and the deck-order question (40). Pilot had no testers at the
last check (10-11).

## Open

### 🟡 43. Non-tester people are named in this public repo: remove them too?
Both scrubs covered testers only. Janus swept the repo without my
list (10-11) and found people who aren't testers, and I confirmed it
and found more with a name-dictionary sweep:
- Two people from a private call of yours in August (one surname is
  in a mail filename), in a Janus memo and one of my logs.
- A client company and two named contacts there, from your calendar,
  in a LinkedIn draft and a Themis memo.
- A client contact by first name, in a Janus memo and a brief.
- Smaller: the name of one of your own decks, in a log of mine.
Authors you cite and a musician in the vision docs are public
figures, and I'd leave them.

**The full list is ready (10-11, 17:49 fire).** I swept every file
version in all history by pattern (anything name-shaped, plus emails,
handles and domains), not by a list of known names. It added:
- Details about you: your phone's device name, a holiday location, a
  company name and domain that appears about 40 times, and a few of
  your own addresses.
- One phrase beside a tester's label that could point back to them.
- The old daily briefs (about 95, public in full) were a question on
  10-11. **Closed 10-12: they stay as they are** (your answer, relayed
  by Janus: the one outside person named in them is fine with being
  named). Not part of this pass.
- Old history holds no new names beyond these.
Not covered: 177 images and screenshots (they need eyes), and a match
against your calendar and call notes (needs your yes).
**Where to act:** mark the list at
https://github.com/Design-in-Product/one-job-private/blob/main/scrub/THIRD-PASS-CANDIDATES-2026-10-11.md
(remove or keep, and add what's missing). Then one word in Coral's
session: "third pass", or "leave them".
**Since:** 2026-10-11
**Ask:** Mark the third-pass list, then say "third pass" or "leave them".
**Rec:** Third pass, once, after you've marked the list. Section A
(private people and a client) I'd remove. Section B (details about you) is yours to judge. Say yes to the
calendar match if you want the strongest check against a fourth pass.
One mail filename would change, so Pard would hear first. A third
pass would leave a new set of old commits, so it would need one more
request to GitHub afterwards.

### 🟡 36. Test build 41: Siri with the app open
Build 1.1.1 (41) is in your Internal group (10-08). With One Job open,
add a card by Siri, and it should appear right away in the deck you're
on, with no restart. What to Test lists three checks.
**Where to act:** TestFlight on your phone → One Job → install 41.
**Since:** 2026-10-08
**Ask:** Install 41 and try Siri with the app open. Did the card appear in that deck?
**Rec:** If yes, say "Pilot 41" and I'll attach it to the Pilot group.
If no, tell me exactly what you saw.

### 🟡 22. UX walk: step 1 of 11 is open (the cold open)
You chose the form on 10-11: a conversational walk, the B-topic of
whatever else is going on, one step at a time until it's exhausted.
Notes are kept in
https://github.com/Design-in-Product/one-job/blob/main/docs/UX-WALK-NOTES-2026-10.md
**Where to act:** Coral's session, a sentence or a screenshot at a
time.
**Since:** 2026-08-13
**Ask:** UX walk, step 1: open One Job cold. What do you see, and what do you make of it?
**Rec:** No hurry and no order within a step. Say what you notice,
and I'll record your words and ask one follow-up at a time.

### 🟡 40. Agent's deck: does the deck follow the list's order, or keep its own?
Your insight is written up, with your 10-11 correction in: the only
sync is the planned two-way sync with the back end, and One Job has
no concept of "agent". That leaves one thing the model can't settle
by itself. Anyone with access to the Todoist list can reorder it, and
One Job can't tell an agent from you. The roadmap says no agent can
ever reorder your deck.
**Where to act:** Coral's session or through Janus. Write-up:
https://github.com/Design-in-Product/one-job/blob/main/docs/AGENT-DECK-VIA-INTEGRATIONS-2026-10.md
**Since:** 2026-10-03
**Ask:** In the Todoist model, does your deck follow the list's order, or keep its own?
**Rec:** Keep its own. The top card is what the app protects, and
"Later" has to mean something. New tasks would join behind the top
card, as Siri's do. Two smaller questions are in the write-up
(answering from a card; whether this replaces R4.1 and R4.3).

## Recorded, final (not re-asked)

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
