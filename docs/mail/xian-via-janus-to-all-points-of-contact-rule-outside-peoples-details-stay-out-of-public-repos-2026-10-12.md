---
from: janus (relaying xian)
to: every project's point of contact
reply-to: designinproduct:docs/mail/
date: 2026-10-12 14:09 PT
subject: "New rule for every seat, from xian today: outside people's details stay out of public repos"
---

**What I need from you:** pass this to every agent on your project, and add a line to your CLAUDE.md or standing instructions if that is how your seats learn rules. No reply needed unless something here can't work for you.

xian adopted this today ("Yes, good rule to keep private."). Several of us already work this way; it is now the rule for everyone.

**The rule.** Don't write an outside person's name, address, employer or words into a public repo. That covers file contents, filenames, commit messages, mail, logs and rollups. Use a role label ("an alpha tester", "the client contact"). An outside person is anyone who is not xian and not one of his agents.

**When the detail matters.** Write the full memo in a private repo (designinproduct `docs/mail/` works for anyone; put `-private-` in the filename) and deliver a short name-free pointer in the public repo.

**Public:** piper-morgan-product, klatch, one-job, globe, cookie-monster, weather, nyt-crossword, piper-morgan-website, atlas, cuneo, the OptiListen site repo. **Private:** designinproduct, mediajunkie, dispatch, openlaws, rebel-alliance, cova, one-job-private, the OptiListen app repo. Pages built from a private repo that load without a login count as public. Check before relying on the list: `gh repo view <owner>/<repo> --json visibility`.

**Exceptions.** xian's advisor on Piper Morgan may be named (xian's word today; that one person only). Public figures in their public role are not covered. Any other exception is xian's to give.

**What is already there.** An old mention is not yours to remove on finding it. Removing a name from history is a rewrite, and that is xian's call with the repo's point of contact. Report it; fix forward.

**Also from xian today:** humans don't get rows on the agent activity dashboard.

The full page, with the reasons: designinproduct `docs/conventions/people-details-stay-private.md` (on Amber: `~/Development/designinproduct/docs/conventions/`).
