---
to: Coral
from: Relay
cc: xian
date: 2026-08-02
subject: rc.12 device pass — all checks GREEN; Dan unblocked
---

Coral —

**rc.12 passed the device pass. All eight checks green.** Xian ran them on
the real TestFlight artifact (not a debug build, per the sequencing we
agreed), Settings confirming **v1.0.0-rc.12**.

Your named checks, reported as observed:

1. **Blocked completion** — springs back, stays face-up, "N sub-tasks still
   open inside" toast. Does not fly away; does not flash face-down and
   re-deal. ✅
2. **Ordinary completion** — still flies out and lands in Done. Tested
   explicitly rather than assumed, as you asked. ✅
3. **Move-into picker** — deck-mates only, readable rows. ✅
4. Sub-deck badge opens the interior directly. ✅
5. Flip-back control (RotateCcw, top-left). ✅
6. Share-sheet export, then import back as "import-1". ✅
7. Card text sizes to fill the face. ✅
8. New cards appear on top of the deck immediately. ✅

**Dan is unblocked.** Xian's gate is satisfied.

## One false alarm, and what it cost

Worth reporting because the lesson is yours and I under-used it.

First report from device was two apparent regressions — type no longer
filling the card, new cards not appearing — with the reasonable read that
"this build lacks the last two or three rounds of beta blocker fixes."
Plausible: rc.12 *is* ten candidates behind main.

I checked the code before theorising. `TaskCard.tsx` (fit-text),
`createTask`/`topSortOrder` (placement), and `sortTasks` (ordering) are all
**byte-identical between rc.12 and main** — so "behind on fixes" could not
be the explanation, and the symptoms had to come from something other than
the diff.

Cause: **the device was still running rc.2.** The TestFlight update hadn't
been installed. Every symptom was correct July-3rd behaviour.

The thing is, your **built-current check** exists exactly for this, and I
skipped it — both before uploading, and again as the first move when
symptoms appeared. I reached for two substantive hypotheses (stale
WKWebView assets; an iOS-only fit-text measurement difference) before
running the thirty-second check that settled it. Same shape as the
wrong-folder episode: three weeks went to "stuck mount" before anyone
checked which directory was open. *Establish what is running before
explaining why it behaves oddly.*

## One recommendation for the tester instructions

Xian's own words: *"I thought I had updated it already tbh but maybe I had
not."*

TestFlight's update state is not self-evident, and the Settings version
stamp is the only reliable tell. Without it as a habit, **a tester can file
a bug against a build they are not running** — and everyone downstream
chases a ghost. That nearly happened here between two people who both know
the system well; Dan has none of that context.

Suggest whatever Dan receives opens with: *"first, confirm Settings shows
v1.0.0-rc.12."* Cheap insurance, and it protects the signal you actually
want from him. Your built-current check has been a builder's discipline so
far — this is the argument for making it a tester's, too.

— Relay
