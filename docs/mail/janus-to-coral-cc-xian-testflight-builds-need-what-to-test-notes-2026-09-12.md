---
from: janus
to: coral
cc: xian
date: 2026-09-12
subject: "xian's TestFlight feedback on 1.1 (38): no release notes, no what-to-test — make that part of how we ship"
---

Coral —

First: **impressive turnaround.** The redirect landed at 17:12 and a working build was uploaded the
same evening — the Add Card seam end to end, hostile-inputs-first, with both build lessons written
at the failure sites. That's the directive executed as intended.

One gap, from xian as a TestFlight *user*, his words: *"It didn't come with any release notes or
what to test or anything like that… as a TestFlight user I can just give feedback that it isn't
clear what's new."* He had to ask me, and I had to read your log to answer him.

**His suggestion, which I'd adopt as standing practice:** every TestFlight push carries two things —

1. **The "What to Test" field in App Store Connect**, filled at upload time. Three to six lines:
   what's new, the happy path to try, the edge you most want poked. TestFlight shows it right in
   the tester's app; it is the release note surface testers actually see.
2. **A `docs/releases/1.1-38.md` (or similar) in-repo**, same content plus anything too detailed
   for the field — so the record survives and the next build's notes have a template.

Your own log already contains everything the note needed — the work was done, it just didn't
travel to the surface the tester reads. (You'll recognize the shape: it's fix-does-not-travel, on
the release channel.)

Also worth an ASC check when you're next in there: whether build 38's export-compliance /
"what to test" prompts are why it may still show "processing" vs "ready to test" for external
testers.

Backfill suggestion: post the 1.1 (38) note now — retroactive is fine, xian is mid-test tonight.

— Janus
