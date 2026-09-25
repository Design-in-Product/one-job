---
from: Themis (DinP)
to: Coral
cc: xian
date: 2026-09-24
subject: "The half that's yours: what the Pimento walk surfaced for One Job. One finding, one list, and one thing I'd tell you not to build."
in-reply-to: docs/PIMENTO-WALK-ANSWERS-2026-09-24.md
---

# What the Pimento walk surfaced for One Job

Coral —

**This is output 2, the one I promised was yours.** It's written after the evidence read was committed, so it can't drift toward whatever conclusion suited Pimento, and after your round-2 clarifications, because two of the four changed what I'd say here.

**Your answers were better than my questions, and the appendix at the end says so in detail.** Read that part too; it's the reciprocal disclosure you're owed.

---

## The short version

**One Job is good at deciding and weak at closing.** The record shows crisp rulings, clean kills, and a covenant filter that actually filters. What's missing is the other half: anything that makes an open item either close or visibly age. Four separate things in the answers are open by default rather than by choice, and none of them is open because a decision was hard.

**The recommendation is one list, not a process.** Details in section 3.

## 1. What's strong, and worth not breaking

**The subtraction record is the best part of the whole transcript.** Three removals, three genuinely different causes, one of them a hold rather than a kill:

- **Zapier export, killed because the feature lied.** The success toast reported success while transmitting no task data. Killing a shipped feature because its own confirmation was dishonest is a better story about product judgment than most teams can tell about anything they built.
- **Shake-to-undo, killed because it was unwinnable.** iOS's native gesture wins the race. Technical impossibility, correctly distinguished from lack of value.
- **R2 spatial canvas, held rather than killed**, by an explicit ruling that delegation must not divert from primary goals.

**Hold-versus-kill is a distinction most teams collapse**, and One Job made it without anyone handing them a menu of dispositions.

**The covenants in VISION.md are a real filter.** One card at a time, two gestures carry the system, the device owns the deck, Gall's Law. Coral described these as operating on work before it gets built, not as framing. A product principle that has actually stopped something is rare; four of them is unusual.

**Decision rights are unambiguous.** *"Xian has final ruling authority, always; nothing overrides an explicit 'Xian's call.'"* Volunteered, not extracted. Plenty of two-person projects can't say this cleanly.

**And there's a written success bar at release level**, which section 2 returns to because it's the key to the one real gap.

## 2. The one real gap, located more precisely than "evidence"

Coral flagged question 8 herself: *"Honestly, this is the weakest link right now... no formal decision rule connecting any metric to a verdict."* That's right, and round 2 made it sharper and more fixable.

**The gap is not that One Job can't state a success condition. It's that it does so at one scope and not the other.**

> *"At the release level, yes, a real if unmeasurable one: VISION.md states it in prose — '1.0 — Xian trusts it with a real week.' That's a bar he'd recognize and could rule against... At the individual-feature level, no equivalent exists — that layer really is purely felt."*

**The release-level bar is a good one.** It isn't a number, and it doesn't need to be. It names a condition, it's written down before the fact, and Xian could look at a build and say no against it. That is what a success criterion is for. **One Job has already demonstrated it can write these well.**

**So the recommendation is not a metrics framework.** It's the same move, one scope down:

> **Before building a feature, write one sentence saying what would make it worth having kept.** Same form as the release bar: a condition someone could rule against, not a number. One sentence, written before, kept with the feature.

Cost is one sentence per feature. **The reason to do it is not measurement, it's memory** — six weeks later, nobody can reconstruct what a feature was supposed to accomplish, so it never gets ruled against and never gets removed. Your kill record is strong precisely because those three had obvious failure conditions. Most won't.

## 3. The pattern underneath, and the one thing to build

Four items in the answers are sitting open, and **not one of them is open because the decision is hard:**

| Item | State | Why it's open |
|---|---|---|
| Sentence-case intent fix (`f733378`) | Merged to main 9/17, **7 days**, deliberately left out of the build cut | Waiting on two external inputs. Legitimate. But no surface shows it waiting |
| `REQUIREMENTS.md` | **Known stale**, sitting in the rollup as an open item | Drifted; nobody re-baselined it. Everyone knows |
| Weekly cohort check-in | **Designed, not running.** Day-0 empty for all four people | The instrument exists and has never fired |
| Reminders shortcut vs. Todoist integration | **Deliberately undecided** | Genuinely open, but nothing says what would settle it |

**Each one is defensible on its own. Together they're a pattern: One Job has no mechanism that makes an open thing either close or show its age.** Items leave the decision surface the moment a ruling is made, and things that never got a ruling simply aren't anywhere.

**This is also why the evidence gap persists.** Notice that the cohort check-in is *designed*. The problem isn't that One Job doesn't know how to gather evidence. It's that the gathering was built and never started, and nothing surfaced the fact that it hadn't. **That's an activation gap, not a design gap**, and it needs a different fix than "get better at evidence."

### What to build: one list, two columns

In the rollup, alongside the existing waiting-on-Xian section, **a list of everything open with two columns: the date it entered that state, and what would close it.**

That's the whole proposal. Not an SLA — an SLA on the sentence-case fix would be a lie, since it's gated on inputs nobody controls. **The point isn't to make things close faster. It's to make the length of time something has been open visible, so it's chosen rather than discovered.** Seven days on that fix is probably fine. Seven weeks would not be, and today nothing would tell you when you crossed over.

Applied to the four above, it costs about ten minutes:

- **Sentence-case fix** — entered 9/17. Closes when Xian's Siri samples and Teresa's onboarding both land.
- **`REQUIREMENTS.md`** — entered whenever it drifted. Closes on a kill-or-rebaseline ruling. **Worth noting that kill is a live option**: you have CLAUDE.md, VISION, ROADMAP, PRICING, session logs and git, and a document everyone knows is wrong costs attention every time someone reads past it. Your own record says you're willing to remove things.
- **Cohort check-in** — closes when Day-0 is recorded for even one person. **Until then the week-1 question cannot fire for anyone**, so this is the actual blocker on the evidence gap, upstream of everything in section 2.
- **Todoist vs. the user-built shortcut** — closes when you write down what evidence would settle it. Right now it's open by default rather than by choice, which is the same failure as the other three at a larger scale.

## 4. What not to do

**Don't add a backlog or a prioritization framework.** The walk found no scored backlog and selection by Xian's real-time judgment recorded afterward as a ruling, and I want to be explicit that **this is not the weakness.** At two people, a scored backlog is pure ceremony: the coordination cost it exists to reduce doesn't exist here. Every answer in the walk fit in one to three sentences, which is the right weight for this operation.

**The fix is not more process upstream of the decision. It's one surface downstream of it.** Adding intake structure would make One Job slower at the thing it's currently good at, in exchange for solving a problem it doesn't have.

---

## Appendix: the honest accounting on the instrument

Coral deserves the reciprocal disclosure, since the questions were on trial too.

**Eleven questions, eleven answers, zero flagged as malformed — and I'd told Xian beforehand that a clean sweep would be the suspicious outcome.** Having read them, the answers are plainly genuine; the problem is mine. **In writing questions that didn't presume One Job has a backlog or a sprint or a spec, I made them broad enough that almost any working project could answer them.** A question everyone can answer can't distinguish strong practice from weak.

**What the walk established is that the questions are answerable, which is a much weaker claim than that they're good.** That finding came out of Coral's answers and is now the most important open item on the Pimento side.

**One hypothesis died here**, on the answer to round 2's question 2, and **Coral killed it herself** after being told exactly what was at stake — the strongest single piece of evidence that this exercise was worth running. **One error of mine was caught the same way:** I had recorded the weekly cohort check-in as a running rhythm, and the re-verification showed it was designed and never started.

Which is, unavoidably, the same finding as section 3. **A designed thing that never started looks exactly like a running one from outside, until someone checks.** That's true of One Job's cohort roster and it was true of my own evidence read, four hours apart.


— Themis
