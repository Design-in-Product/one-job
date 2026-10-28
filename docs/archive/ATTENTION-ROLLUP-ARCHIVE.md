# Attention rollup — archive of Settled and Carrying entries

Moved here verbatim from `docs/ATTENTION-ROLLUP.md` on 2026-09-27 (pre-trim
rev `e1d514e`), applying xian's lean-board advice relayed by Janus the same
day: *"the board only include current active information that actually
requires my attention. If there's any fear of losing context, make sure
that the information is stored elsewhere."* This file is that elsewhere.
Nothing below was edited; newer settlements are appended at the top of the
Settled section.

## What I'm carrying (no ask — here so nothing is invisible)

### Watching: 1.1 (38) processing on TestFlight — the Add Card intent
Uploaded 2026-09-12 evening (UUID cd530600). When it's testable, the
device check becomes an ask: install 38, open Shortcuts, confirm "Add
Card" appears, run a quick add. Then the Pilot tester A reply gets its "it
exists" follow-up.


### Settled by ruling (2026-09-12): developer name stays personal — sole proprietor for now
Xian ruled sole-proprietor-for-now, so the DUNS/entity question
resolves to "no change until an S-corp decision later." Historical
detail below kept for when that day comes.

### (was) Parked: App Store developer name → "Design in Product"
Listing shows "Christian Crumlish" (individual enrollment). Converting
to an org account needs a D-U-N-S for the enrolling entity. Xian's EU
trader (DSA) signup appears to have generated a DUNS — 2026-09-09:
DUNS numbers are entity-scoped, not purpose-scoped, so it's reusable
ONLY for the same entity/address it was registered to; a future S corp
would get its own. Deliberately sequenced BEHIND the S corp decision
(Xian, 2026-09-09) so the right entity enrolls once. Check what the
existing number is attached to via dnb.com or
developer.apple.com/enroll/duns-lookup when the time comes.




### 🟢 1. Dependency vulnerabilities — recomputed 2026-08-29, 7 current
Recount prompted by the Rule-14 brief (the old "4 remain" was computed
against a tree the 08-16 lockfile surgery had since changed). Current:
7 total, 6 moderate + 1 high. The original 4 (vite, esbuild,
react-router ×2) are held deliberately — all need major bumps with real
regression surface, and none is reachable in shipped code (traced
2026-08-13: no `<Link>`, no `useNavigate`, no SSR anywhere). The 3 new
are one dev-only chain, `@capacitor/cli → xcode → nested old uuid`,
which runs on Amber during native builds and never ships.

No ask — held posture: revisit as routine hygiene now that 1.0 has
shipped; becomes an Open item only if the posture should change.
(Its old line read "**Ask:** FYI only — nothing needed," which is an
ask-shaped absence of one; the fourth guard caught it, correctly.)

---

## Settled

### ✅ 40. The agent's deck, through Todoist (design settled 2026-10-12)
Opened 10-03 as the agent's-deck question. xian's insight (10-11): no
special agent deck; the agent's deck is a second list in a back-end
service, and One Job is the lens on both. Settled on 10-12, all in
Coral's session:
- When adding an integration the user is asked whether the service
  updates the deck's order or the deck's order is maintained. Default:
  One Job's order. No general "don't ask me again".
- The GitHub import stays behind its beta flag. Todoist is the first
  real integration.
- Mapping is "loose but simple": a deck is one project or one
  section; sub-tasks go inside their card.
- A new task lands on top. A task closed in Todoist goes to Done.
- One-way for the first week; write-back after that.
- The token stays on the device for now; OAuth likely later.
- Tier: not decided ("let's not decide this yet").
- Coral may write to the One Job project in his Todoist test account.
Design and build log: `docs/TODOIST-INTEGRATION-DESIGN-2026-10.md`.
Still open in the write-up, not asked now: answering from a card, and
whether this replaces R4.1 and R4.3.

### ✅ 46. Removing a deck: what happens to its cards? (answered and built 2026-10-13)
xian raised it in session with three options. Coral recommended the
third with a helper. His answer, given in Janus's session and relayed
the same morning: "only when empty with a "move all cards" option".
Built: "Delete this empty deck" and "Move all cards to another
deck…" in the long-press menu. Every card moves, finished ones too;
the open ones land on top of the chosen deck in their order. No card
is deleted by removing a deck. The one exception stays a Todoist
detach, which can delete an attached deck with its cards after a
confirmation.

### ✅ 36. Test the Siri change and the open card; then Pilot (closed 2026-10-16)
Opened 10-08 for build 41's Siri retest; carried through 42 (skipped)
and 43. On 43, xian confirmed "Siri adds card to top as expected" and
liked the open card "much better", with three ideas. Those, Markdown
(48) and the deck actions (46, 47) went into 44 on his "go for 44
before the pilot update". He then said "Pilot 44, yes" (relayed by
Janus). Build 44 was attached to Pilot and submitted for Beta App
Review on 10-16; Apple approved it within minutes. Builds 41–43 never
went to Pilot.

### ✅ 49. Todoist write-back: turn it on? (answered and built 2026-10-28)
Asked 10-27: the one-way week xian set on 10-12 had ended 10-20 with
nothing asking him. His answer, relayed by Janus on 10-28: "Please let
Coral know they are approved to work on the Todoist write-back." No
conditions. Built the same morning, tests first: a card done here
closes its task at the next sync, and one undone here reopens it. Only
for a card both sides had agreed on, so nothing done during the
one-way week is closed now, and a task reopened in Todoist is not
closed again. Alpha only. Detail: `docs/TODOIST-INTEGRATION-DESIGN-2026-10.md`.

### ✅ 48. Markdown in a description: render it (answered and built 2026-10-16)
Text from GitHub and Todoist showed Markdown marks as typed. xian:
"render it please, just as you say. make sure we are documenting these
choice and not just patching them." Built as recommended: plain text
on the card face and in the Done list; headings, bold, lists, code,
quotes and tappable links in the open card; the text as typed while
editing. Nothing is treated as HTML; links only to the web or mail;
images never load. The rules: `docs/CARD-DESIGN.md` § 4. In build 44.

### ✅ 47. Move a whole deck into a card (answered and built 2026-10-13)
xian asked for it so decks don't pile up. His answer, relayed by
Janus: "one menu entry yes". Built: "Move this deck into a card…":
pick a deck, then one of its open cards or "a new card on top". The
deck keeps its name and every card. A deck attached to a service
must be detached first. Janus noted that xian did not separately say
"both" (existing card and new card); both were built as recommended.

### ✅ 44. Send GitHub a second cleanup request, for the third rewrite (sent 2026-10-12, done 10-13)
xian sent it at about 17:40 PT through GitHub's Virtual Assistant:
option 2 ("help removing cached commits"), the old head of `main` as
the example link, not in a pull request (the repo has none), and the
prepared text. The assistant answered "Ticket created". It was his
second request; the first covered the first two rewrites. Waiting on
GitHub: the example link returned 200 at 17:18 on 10-12.
**GitHub acted by 2026-10-13:** at 05:53 PT the link returned 404 and
the API answered "No commit found". Nothing further is owed.

### ✅ 45. One other person could read the private repo (closed 2026-10-12)
The organisation's default permission for members is "read", so its
one other human member could read all 12 private repos, including
the private repo with the tester roster. Nobody had added them.
xian's ruling in session, 17:26 PT: make that member an outside
collaborator. Coral did it at 17:26. Checked afterwards: xian's is
the only member account; the private repo lists one account (xian's,
admin); the five private repos sampled list only xian's; the former
member keeps the one direct grant they already had, on a public
repo. Before the change they had no direct or team access to any
private repo and no commits in one. This stops future access; it
cannot undo anything already read. The organisation's default stays
"read", so any future member would get the same access.

### ✅ 43. Non-tester people named in this public repo: third pass (done 2026-10-12)
Both earlier scrubs covered testers only. Janus's independent sweep
(10-11) found other private people named here, and Coral's pattern
sweep of all history added clients and details about xian. The list
went to xian in the private repo. He marked it on 10-12 and said in
Coral's session: "I marked the third pass list. Please proceed."
Asked about three more organisations in the same files, he chose
"Remove all three".
- Replaced with role labels: two outside contacts, four client
  organisations, two client contacts, one first name, xian's phone's
  device name, a holiday town, one local address. One mail file was
  renamed.
- Left public by xian's choice (unmarked): one of his deck names, a
  company name and domain, his work addresses, a D&B reference, commit
  author fields, and one phrase beside a tester's label.
- One listed row was a false alarm: an address that looked like a
  username was a database library's documentation example.
- The old daily briefs stay (xian, 10-12, via Janus), apart from one
  label each in two of them.
- Freeze mailed first. Backup: 24 of 24 refs in one-job-private under
  `pre-scrub-3/`. Rewrite on a fresh mirror; nothing deleted; 798
  commits before and after.
- Checks: every file on the old main compared with the new by a
  second tool (805 files, 14 changed, 0 mismatches); 0 matches for
  every marked term in all history, messages and paths, on the mirror
  and on a fresh clone from GitHub; the earlier passes' checks still
  pass; 250 tests, typecheck and build pass. Coral looked at all 134
  screenshots in history: demo data only.
- Push 15:28 PT, all-or-nothing and lease-protected. `main` `7bd0be8`
  → `5ec87fd`. 24 of 24 remote refs equal the mirror.
- Not covered: a match against xian's calendar and call notes (he
  didn't say yes); names with no capital letter or only initials;
  what remains around the labels (job titles, one proposal amount).
- Follow-up: item 44, a new cleanup request to GitHub.

### ✅ 42. Tell GitHub about the second rewrite (not needed; GitHub cleaned up, seen 2026-10-12)
The ask was to add a note to xian's ticket, because the second pass
left 624 more old commits than the ticket described. On 10-12 at
11:45 PT Coral found GitHub had already removed them.
- Checked: seven old commit links (the five ref heads sampled from
  before the first pass, and `main`'s head from before the second
  pass) return 404 on the website; the API says "No commit found".
  The current head returns 200.
- They returned 200 at 17:49 PT on 10-11, so the cleanup ran between
  those two checks.
- Not known: whether xian added the note before GitHub acted. Not
  checked: every one of the old commits, only the seven.
- A third pass, if xian orders one (43), would need a new request.

### ✅ 41. The scrub missed one tester: second pass (done 2026-10-11)
The 10-10 scrub's list was built from the roster. The first outside
tester (July) was never on the roster, so their name stayed: 11
current files by full name, about 34 by first name, and the history.
Coral found it on 10-11 when xian named them and no role label
existed. xian: "Second pass, yes."
- Backup first, verified: 24 refs in one-job-private, `pre-scrub-2/`.
- The name became "Tester H" in contents and commit messages.
- A first trial showed the first-name rule would also have relabelled
  four unrelated library authors in old vendored files. The rule was
  tightened before anything was pushed.
- Verified: zero matches (also in a fresh clone from GitHub); 795 of
  795 files, 0 mismatches; 250 tests, tsc and build pass.
- Push 15:10 PT, atomic and lease-protected. `main` went from
  `a8e94ec` to `ada8298`. Deploy run 38179394441 green.
- **Lesson:** zero matches for your own list proves the tool worked,
  not that the list was complete. `verify.sh` now also sweeps the
  public tree for every name-like phrase in the private files.
- What's left is item 42: telling GitHub about the second rewrite.

### ✅ 38. CLAUDE.md's backend-first methodology (rewritten 2026-10-11)
xian: "update it to reflect how the paradigm has evolved and what is
stable about it."
- Stable, and kept: verify first, fix at the right layer, mobile-first
  testing, docs with the change, the three TDD zones, monitor-first
  debugging.
- Evolved, and rewritten: the layers are domain → store → UI; the
  contract to verify is the `TaskStore` interface and the saved-data
  schema; the FastAPI contract is a short `?remote`-only section.
- Seven replaced sections are in `CLAUDE-MD-HISTORY.md`, verbatim.
- Open since 2026-10-10.

### ✅ 27. How does answering from the attention deck feel? (answered 2026-10-11)
xian, in Coral's session: "Answering from the deck feels ambiguous.
The deck is for me completing tasks. I can't swipe it till I answer
and I can't answer directly from the deck. Cards tell me what to do
but are not currently actionable unless the description contains a
link or affordance."
- Neither relief nor ceremony: the card is a good reminder and a poor
  place to reply.
- Carried into `UX-SESSION-PREP-2026-09.md` and into
  `AGENT-DECK-VIA-INTEGRATIONS-2026-10.md` (point 3, answering).
- Open since 2026-08-31.

### ✅ 10. Retire REQUIREMENTS.md, or rewrite it? (retired 2026-10-11)
xian, in Coral's session: "let's revise it, or if we retire it let's
be clear about what has superseded it and how we will maintain that in
the future." Coral retired it on those terms.
- A box at the top of `docs/REQUIREMENTS.md` maps each part to its
  replacement (VISION, DOMAIN-MODEL, ROADMAP, release notes, the test
  suite, CLAUDE.md, the board) and says how each is kept current.
- CLAUDE.md now says ROADMAP.md is updated in the same commit as each
  release note.
- The file is kept. To undo, delete the box.
- Open since 2026-07-28.

### ✅ 39. Send GitHub the purge request (sent by xian 2026-10-11)
The ask was to send GitHub Support the request to remove the old,
unreachable commits after the scrub. xian sent it on 10-11 in Coral's
session, through GitHub's Virtual Assistant ("Clear cached views").
- He gave the old head of `main` as the example link, answered "not in
  a pull request", and wrote that about 780 old commits are unreachable
  and all of them should be garbage-collected.
- The assistant replied "Ticket created". The general support form was
  not sent, because the ticket carries the whole-repository request.
- Lesson: the form's "Deletes" category deletes a whole repository. I
  suggested it first and withdrew it when the next screen showed that.
- What's left is GitHub's action. Coral checks the old commit link at
  every fire; a 404 means it's done.

### ✅ 37. One-job is public: private repo, confidential files moved, history scrubbed (done 2026-10-10)
xian's rulings (via Janus, 10-09 and 10-10): set up a private repo for
confidential One Job business; keep one-job public for the product and
site; scrub the history with **option B**. He approved the scrub
directly in Coral's session on 10-10 ("yes, please go ahead" / "run the
scrub"), after the session's permission check had refused it on relayed
approvals.
- `Design-in-Product/one-job-private` holds the roster, the tester
  feedback file, one call transcript, the scrub kit, and the complete
  pre-scrub history (`pre-scrub/*`: 4 branches and 20 tags).
- The scrub removed three files from all history, and replaced every
  tester and candidate name with a role label, in contents, commit
  messages and file paths. It replaced xian's personal email with the
  tester-facing address.
- Verified before the push: zero matches; 790 of 790 files identical
  to expected; npm ci, 250 tests, tsc and build pass.
- The push was atomic and lease-protected: 24 refs. `main` went from
  `af334df` to `9a50a7a`. Deploy run 38104798466 was green, and
  onejob.co returns 200.
- TestFlight's live notes for builds 39 and 40 were also made name-free.
- What's left is item 39: GitHub Support's purge of cached old commits.
- **Correction, 2026-10-11:** the scrub missed one tester, the first
  outside tester, who was never on the roster its list was built
  from. "Every tester name" above is true only of the names on that
  list. A second pass is board item 41.

### ✅ 35. TestFlight clause in the Beta App Description (done by xian 2026-10-08)
xian added: "(TestFlight itself sends us Apple's standard beta
information: crash reports, installs and sessions, and your name and
email. None of it includes your tasks.)" I verified it through the API
(the description is 699 chars and contains the clause). "Never sent
anywhere" is now literally true under TestFlight, per Themis's G2 check.

### ✅ 34. Re-send Pilot tester A the Pilot link (done by xian 2026-10-08)
xian re-sent it after build 40's beta approval. "Pilot tester A is in" is
claimed only when the Pilot group's tester count, read via the API,
shows her. At settlement it read 0.

### ✅ 33. Siri sentence case → build 40 → Pilot (closed on the board 2026-10-07)
The decision chain: "ship 40" (10-05) → "me first" (10-06; sentence
case PASS on device) → "Pilot yes" (10-06, arrived via Janus 10-07) →
Test Information filled in by xian (10-07). Build 40 was submitted for
Beta App Review on 10-07 (WAITING_FOR_BETA_REVIEW). What's left is
Coral's watch: Apple's approval, then xian re-sends Pilot tester A the link,
then I confirm a non-zero tester count via the API.

*(2026-10-07) 33: "Pilot yes."* xian gave it on 10-06. It sat unsent in
Coral's session composer and only arrived via Janus's mail on 10-07
(`xian-via-janus-to-coral-pilot-yes-build-40-to-pilot-tester-a-2026-10-07.md`),
which is the record. Build 40 was attached to the Pilot group the same
day (API 204).

*(2026-10-07) CORRECTION to ✅ 28 below. Withdrawn: "Pilot tester A is in" and
"cohort mechanism proven end to end on a real outside tester."* App
Store Connect shows the Pilot group has had **0 testers**, and no build
was ever submitted for outside testing (37, 38 and 39 are all
READY_FOR_BETA_SUBMISSION). The required Test Information (Beta App
Description, review contact) was never filled in. The link was sent;
the mechanism was never proven. Her "On it!" was intent, not a join.

*(2026-10-06) Build 40 rollout order: "me first."* xian tests 40 from
Internal before it goes to the Pilot group. That cleared the 🔒 on the
Pilot-attach decision.

*(2026-10-05) 33's decision: "ship 40."* xian, via Janus (mail
2026-10-05 15:4x): "Please tell Coral yes, to ship 40." The fix gets
tested on 40 itself instead of waiting for Siri samples. That cleared
the 🔒 on the decision. The item stays open on the board only for the
upload approval.

### ✅ 32. The 8/29 LinkedIn hand-raiser is Candidate D (answered 2026-09-29, closed 2026-10-03)
xian answered via Janus on 09-29, from a screenshot of the post. The
person is Candidate D, a 2nd-degree connection ("AI-Native Lead Design
Engineer…"), who commented "*raises hand*". xian replied the same day
asking for the best way to reach him, so we're now waiting on Candidate D.
He's the only LinkedIn hand-raiser (355 impressions, 7 reactions,
1 comment). The item closed four days late because no Coral session
ran between 09-27 and 10-03. The duty cycle armed on 10-03 is the
fix. The waiting item is in the roster, not on the board, because it
isn't waiting on xian.

### ✅ 31. Post the 1.1 LinkedIn draft — POSTED 2026-09-14 (closed 2026-09-23, three sessions late)
Xian posted it the day it was asked, with minor edits and the Pilot tester A
tag — 2,076 post impressions, 460 profile views. The rollup entry
never moved because no Coral session touched it between the post and
now. Janus caught the staleness (2026-09-20 mail) and held it six days
on the theory that xian should be the one to correct his own board —
his own retraction: "the wrong call... it is a plain fact, it is mine
to relay." Closed on arrival at the next real session (this one,
2026-09-23), per the standing rule that an item answered elsewhere
does not close itself.

### ✅ 28. Pilot link sent — Pilot tester A is in (2026-09-17)
Sent 09-14 via LinkedIn. First attempt failed: the link carried
backticks in from my formatting and gave her a not-found error;
resent bare on 09-16 and she was "On it!" the same day. Cohort
mechanism proven end to end on a real outside tester. Remaining
recruiting is names, not mechanism — roster at docs/COHORT-ROSTER.md.


### ✅ Briefing answers 2026-09-10 (memo questions from the artifact)
1. **R2 hold**: partial — "OK but wants the nuanced timing discussion."
   His note: walk-and-chew-gum via well-governed subagent delegation is
   allowed, but ONLY when demonstrably not diverting priority/resources
   from primary goals. Feeds the next-steps conversation.
2. All set. 3. **Probe scope: everything** — all three open colors deal
   as cards (current behavior, now ratified; carrying-section items stay
   un-dealt because a card without an Ask is the failure the format
   exists to prevent). 4. **Covenant 7 amended** in VISION.md: spirit
   kept, ethos articulated — "measure the shape of use, never the
   content; we would not parse people's content even where we had
   access."
Also confirmed: device-pass checklist all green (that checklist was the
pre-submission soak card from the roadmap's P0 era — moot since 1.0
shipped, pleasant to have its confirmation on record).


### ✅ 30. 1.0 RELEASED — live on the App Store 2026-09-09
Xian pressed Release ~15:30; the listing went live ~18:30 (direct link;
search indexing lags 24-48h and needs nothing from us). onejob.co front
door deployed and verified: App Store primary CTA, web app as on-ramp,
Android teaser dropped. Watchdog (rc.39) verified serving. Announcement
cleared to post — draft with Themis's review applied is in
docs/RELEASE-NOTE-1.0-draft.md.


### ✅ 26. Ship 1.0 — SUBMITTED TO APP REVIEW 2026-09-05
Xian completed every ASC step the same day: screenshots (composed set,
all three profiles), full listing copy (his wording recorded in
store/LISTING.md), build 37 selected, content rights + age rating +
category, manual release, submitted. 🍾 Five days in Open, closed in
one sitting. What remains — watching the review outcome — is my watch,
not his ask; it lives in "What I'm carrying."


### ✅ 29. Tester B TestFlight invite — SENT 2026-09-05
Xian sent it during the submission session, and also added **Tester C** (developer, ex-OptiListen team) to the test group as a geeky
hello. Two native-build testers now exist where there were zero — and
Tester B is the iPad user, the surface verified least. Watch for first
native-build feedback; both are recorded in docs/USER-FEEDBACK.md.


*(2026-09-04) Purge copy — keep it.* Xian's call: "Delete forever"
stays as written. Across sessions and in backups it is simply true, and
overstating danger beats understating it.

*(2026-09-04) Zapier export — removed, not reworded.* The open item
asked whether to change the toast's wording. Xian asked what Zapier
even was, which surfaced the real defect: the button said "Export
Tasks", the toast said "Sent to Zapier", and the payload carried no
task data. The July fix had made the message honest about transmission
while the feature underneath still misrepresented itself. Removed in
rc.36 along with the Asana and Todoist stubs (both collected real API
tokens with no handler at all). Roadmap already listed push-export as
Explicitly Retired; Todoist returns as a real 1.1 feature.

*(2026-09-04) Pilot framing — the roadmap is authoritative.* Themis
flagged two numbers circulating: "a pilot of 50 people who'd pay" (as
Xian described it to Tester B) vs. the ratified **10 agent-heavy users
first, then 40 ordinary**. Xian: *"the roadmap is accurate… my
paraphrase was sloppy."* No change to the plan; the sequencing stands,
and the two-audience design is the point — the ten test whether the
agentic thesis holds, the forty test whether ordinary people retain.

*(2026-09-02) Reconciliation audit — seven closures restored to the
record.* Applying the day's cross-pollination brief ("restructuring a
tracker silently drops items, and the cleaner output is why nobody
re-audits it"), I diffed every `###` item across the 08-31/09-01
restructures. Twelve items left the Open section; five had Settled
entries, **seven did not** — their closures existed only in coral-logs
and commit messages, so the rollup no longer recorded that they were
ever decided. Restored below as terse entries. The full stories stay in
the logs; what belongs here is that the decision happened.

*(2026-08-20) Shake-to-undo removed* (was item 12) — iOS's own native
"Undo Typing" shake gesture wins the race before our JS sees it; no
web-exposed API can suppress it. Xian: "not cross-platform… not an MVP
feature." Removed entirely in rc.33; menu Undo unaffected.

*(2026-08-16) Multi-deck backup bug + the three-day deploy freeze* (was
item 23) — export read `getAllTasks()` (active deck only), so
multi-deck users' backups silently omitted every other deck; import
flattened decks on restore. Both fixed in rc.32 with a v3 backup format
and full v1/v2 back-compat. Investigating it surfaced that CI had been
failing silently for three days (an npm optional-peer nondeterminism);
fixed and verified by live bundle hash. Full account:
`development/coral-logs/2026-08-16-coral-log.md`.

*(2026-08-16) Native build pipeline proven* — first archive → export →
upload ever completed on Amber. The ASC API key (App Manager role)
could auto-create a Development cert/profile but NOT a Distribution
one; that needed Xian's interactively-authenticated Admin Xcode
session, separately for cert and profile. Now one-time; runbook in
`docs/AMBER-XCODE.md`.

*(2026-08-19) Real-PAT GitHub test* (was item 17) — superseded by real
use rather than a scripted test. Result, in Xian's words: "it pulls in
like every single issue… overflow the buffer. Not a really good use
case yet." Repo-scoping or a beta flag is now a precondition for
shipping any second source.

*(2026-08-09) Relay migration* (was items 5/5a/5b) — superseded by
events, not completed. Relay-on-kindbook was paused with honors after a
capability map showed the git-delegation requirement couldn't be met on
that surface at all. The ASC API key made the build pipeline the actual
unblock these items had been reaching for.

*(2026-08-08) ASC API key live* (was item 20) — `.p8` at the
tool-canonical path, 700/600, verified by signed `GET /v1/apps` → 200.
Made unattended archive+upload possible.

*(2026-08-02) Tester H enabled as tester* (was item 19) — device pass green
on the real TestFlight artifact. His 2026-08-26 feedback later became
the primary qualitative evidence in the investment-readiness memo.


*(2026-08-31) Rollup staleness audit* — five items closed as overtaken
by events, caught when Xian reported the probe deck "seemed possibly
stale": **24** (rc.32 device pass — he called it settled; shake-undo
removed, submission reframed), **25** (roadmap memo — all four
questions answered 08-28/29, covenant amended, R1.5 built),
**21** (store submission prep — device pass done, now item 26),
**2** (Node version — `engines` declares >=22, CI runs 22 and 26, no
live ask remains), **3** (dev-server port — 8081 is formally ours in
Amber's registry, documented, auto-fallback works).

*(2026-08-29) Instrumentation questions, all four* — week 1 + week 4
cadence; random install UUID; Settings shows the user their own numbers
("give value of data to users," now a recorded standing principle);
build immediately. Shipped same day as rc.34.

*(2026-08-28) Covenant 7 scope* — amended in VISION.md: a calm-UI
principle governing what the interface renders, not a privacy
commitment about what the app may know locally.

*(2026-08-28) R2 holding* — "partial/other": R2 holds except R2.3
(table surface) and dark mode, both approved to proceed via
well-governed delegation once R1.5 was building cleanly (it shipped
08-29, so the condition is met).


*(2026-08-06) Keystore* — backed up to Xian's password manager and
**verified by checksum: hashes identical** (bit-perfect restorable
copy). The single-most-losable-artifact risk is closed; faoilean may
now be repurposed without capability loss.

*(2026-08-01) Trello = next source, Gall-gated* — Xian's call, with the
taxonomy insight recorded in the roadmap first-pass (PM ≠ task
management; GitHub serves work-tasks, his active Trello boards are the
personal/project middle). Gate: his real-use GitHub test first. The
board/list/card ↔ deck/card mapping question is queued for the
planning doc.

*(2026-07-29) R3.2 source = GitHub* — his call ("agreed re github");
shipped same night. Trello noted as the natural second source.

*(2026-07-29) Canvas strip* — approved from screenshots ("the strip is
good"), so the deferred background-drag pan shipped same evening and
the strip is DEFAULT-ON (rc.20); ?canvas=off stays as escape hatch.
Confirmed: leftmost deck has no left peek. R2.1 complete.

*(2026-07-29) Comp mechanism* — fine for now; secure + in-app when the
paid tier faces real users. And recorded: not all new work is pro —
free users keep getting improvements.

*(2026-07-29) Item 7, blocked-completion dead end* — fixed under the
standing default Xian didn't object to: the reveal now follows the same
whole-subtree walk as the block. A refused completion descends the full
path to the nearest open card, through completed intermediates, at any
depth. E2E: the buried "grandchild under a done child" case now lands
you looking at the blocking card itself.

*(2026-07-29) Housekeeping* — Xian: 30 days. Built same day: done cards
over 30 days old are filed to Archive at launch, every depth, witnessed
by a quiet toast ("state is place" — no unwatched room changes). His
note that the threshold could be a paid-tier setting is recorded in the
decision record and PRICING notes — constant until then.

*(2026-07-29) rc.12 heads-up* — Relay was already on rc.12; Xian
confirmed the stamp call was right.

*(2026-07-29) Design questions, all three* — search matches title +
description; covenant 7 = felt in Trash (Done keeps its trophy count);
no action-cards — instead shake-to-undo + Undo in the hold-menu over a
session-deep history stack. Shipped same morning with the rest of the
trash decisions (one-tap swipe delete, Empty trash, backups exclude
trash). Full record: DESIGN-OPTIONS-2026-07-28.md § Decision Record.

*(2026-07-28) Git identity* — Pard: switch to the resident-agent form,
**`Coral (One Job) <coral@onejob.local>`**, repo-local; the network
standardized on named-agent attribution. Visitors to another agent's
repo override per-commit (`git -c user.name=… commit`); global stays
unset forever. Done, and the authorship seam at 2026-07-28 is noted in
CLAUDE.md — which was your condition. Pard also accepted the
provisioning-checklist suggestion and is turning it into an
`amber-agent --identity` flag, so it becomes mechanism rather than
memory.

*(2026-07-28) Port claim* — **8081 is One Job's**, in Amber's registry.
8000 also ours. No need for 5173.

*(2026-07-28) Session shape on Amber* — Pard: one long-lived session,
repo direct, no worktrees; ff-to-main + no-PRs flow unchanged.

*(2026-07-28) Amber environment questions* — Pard: node 26.5 fine,
chromium in `~/Library/Caches/ms-playwright/`, 8000 free for FastAPI,
git identity unaffected by the account re-point. All verified in
practice today.

## Recorded, final: older lines moved from the board on 2026-10-12

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
