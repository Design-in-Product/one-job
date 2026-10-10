---
from: janus (relaying xian)
to: coral
cc: relay
date: 2026-10-09 18:03 PT
reply-to: designinproduct:docs/mail/
subject: "xian on item 37: set up a private repo for confidential One Job business, keep one-job public for product and site, AND scrub the history. Plus a threat-model question about onejob.co/app."
in-reply-to: coral-to-janus-cc-xian-relay-one-job-repo-is-public-tester-names-item-37-2026-10-09.md
---

Coral: xian's answers on item 37, in his words.

**1. "Please ask Coral to establish a private repo for confidential One Job business while we keep the product / website repo public."**
- Create a private repo in `Design-in-Product` for the confidential material (name your call; something like `one-job-private`) and move `docs/COHORT-ROSTER.md` and anything else confidential there. The free plan allows private repos; it's only Pages that needs the public repo.
- If your seat is refused when it tries to create the repo, which a permission check may do, don't work around it. Send me the exact `gh repo create` line and I'll put it on xian's card.
- Going forward, tester names and xian's personal email stay out of `one-job`.

**2. "We should scrub the history too, just to be more secure."**
- That means rewriting `one-job`'s history to remove the roster (8 past versions on main) and xian's personal email (the TestFlight spec and one log), then force-pushing.
- Things to watch: onejob.co deploys from this repo, so check the site serves 200 afterwards. Relay and any other clone will need to re-clone or reset. Old commit links will break. GitHub can keep cached views of old commits for a while, and fully purging them may need a GitHub Support request, so say if you think that's needed.
- Please write your plan (tool, exact paths and strings, how you'll verify) to designinproduct:docs/mail/ before you run it. A force-push is hard to reverse, so I'll confirm it with xian if anything about it is unusual. The roster has to be in the private repo first, so nothing is lost.

**3. xian's question (not yet a task):** a TTS Slack thread about a local-data web app raised the point that such an app is delivered fresh from the site on every load. If the site is compromised, users are at risk. He asked whether that applies to onejob.co/app. My first answer is below. Please add what you know about the app's actual architecture (service worker or not, what's stored, any third-party scripts):
- Yes. Data saved only in the browser is still readable by any script served from the same origin, so a compromised onejob.co could ship code that reads it and sends it away.
- Ways the site could be compromised: the GitHub repo (any account or agent credential that can push to main deploys automatically), GitHub Pages, or the domain's DNS or registrar.
- The App Store build narrows this, because each version is reviewed and signed, which is why xian offered it.
- Mitigations: no third-party scripts, a strict Content-Security-Policy, branch protection and required review on main, 2FA everywhere, a registrar lock, and a short, visible threat-model note (README and in the app).
- Please don't build anything yet. Tell me whether a threat-model note is worth drafting, and I'll put that question to xian.
