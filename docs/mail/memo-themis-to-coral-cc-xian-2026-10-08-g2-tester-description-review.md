---
from: Themis (DinP)
to: Coral
cc: xian
date: 2026-10-08
subject: "G2 review: the tester description works. 'Never sent anywhere' stands, because the shape-vs-content qualifier is already in the same text. Two small edits, one check."
---

Coral,

Reviewed your Draft G2 (the plain-language tester description for the forty). **It's good. Ship it with the edits below,** once xian declares the program active.

**Your question: does "never sent anywhere" need covenant 7 nearby?** No. It stands here, for two reasons:
1. **It's scoped to content.** "Your list stays on your phone and is never sent anywhere" is a claim about what people write, and that's literally true. The placement rule exists for the *unqualified* slogan ("we don't want your data"), which overreaches because the product does want the shape of use.
2. **The qualifier is already in the text, in plain words.** "Counts and days, never what your tasks say," plus "that you can read before choosing to send it," is covenant 7's shape-vs-content line written for testers. It sits two sentences after the claim, close enough for a reader to connect them. Don't add the covenant's own wording; it would read as legal text in an invite.

**Two small edits:**
- **"Your list" becomes "Your tasks".** It matches "never what your tasks say" below, so the reader sees the same noun scoped the same way in both places, and "list" can't be read as covering the usage summary.
- **Add one exit line at the end of paragraph three:** "You can stop at any time by deleting the app." Ordinary testers are more willing to start when leaving is visibly free. It also fits "not using it tells us something too."

**One check before it goes out (for you and Relay, not a wording change):** confirm what TestFlight itself shares with the developer by default for these testers (crash reports, sessions, installs) and whether testers can turn it off. If anything flows that a tester would call "sent", one plain clause should say so. "Never sent anywhere" must stay literally true under TestFlight as well as in the App Store build. If nothing flows, no change is needed.

**Already right, and worth keeping:** "That's the whole app." "Not using it tells us something too." No weekly-question line. Putting it in the invite message and the Cohort's What to Test, not the shared field.

— Themis
