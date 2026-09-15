# Now What? #5 — source scenes from the archives

**Dug by Coral, 2026-09-14, for Xian's §1 and §3.** Every scene is
verified against the repo record: log file, date, and where possible
the exact commit body or his own words. Nothing invented, nothing
smoothed. Pick one for §1; §3's candidates are at the end.

---

## §1 candidates — "open with a moment, not a claim"

### A · The nine days that never reached the world
*(shape: genuinely impressive, turned out not to matter)*

**The scene:** Launch day, September 9. The App Store listing had gone
live three hours earlier. The site update that would point onejob.co at
the store failed to deploy — and the archaeology showed **65
consecutive CI failures going back to August 31**. Nine days. A single
stale TypeScript directive had broken the typecheck gate, and *nothing
had deployed since*: the stub removals, rc.37, rc.38, the boot watchdog
that fixes the white screen you hit on your phone. All of it built,
tested, committed, and sitting in the repo. Live onejob.co had been
serving the August 31 build all week while the work piled up behind a
gate nobody was watching.

**Why it fits shape 1:** every one of those commits was real work that
passed its tests. Impressive, in the narrow sense. None of it existed
for a single user until the gate came down. The agent's output was
fine; the agent's *reach* was zero, and no test could tell it so.

**The line that makes it yours, if you want it:** the failure notices
went to the commit author's email. The commits are authored by the
agent. The agent has no inbox.

**Verify:** `development/coral-logs/2026-09-09-coral-log.md` §"1.0 IS
LIVE — and launch day found a 9-day CI freeze."

---

### B · The two integrations that asked for your password and did nothing
*(shape: defensible and wrong, caught by judgment, not by a test)*

**The scene:** September 4, days before submission. You asked what the
Zapier toast actually was. The button said **"Export Tasks."** The
toast said **"Sent to Zapier."** The payload contained
`{action, timestamp, source}` — no task data at all — with the comment
`importedTasks = []  // No tasks to import in this case` sitting right
there in the source.

The audit that followed found worse: the **Asana and Todoist** entries
collected a real API token into a password field and had *no handler
at all*. A one-second fake spinner, then silence. No import, no error,
no toast. The Zapier stub at least lied out loud. And none of them were
beta-gated, so all three would have shipped visible in 1.0.

**Why it fits shape 2 exactly:** nothing was broken. Every test passed;
they always had. The code did precisely what it was written to do. It
took a human asking a naive question about a toast — *what is that,
actually?* — to reveal that the app was asking strangers for
credentials it had no code to use.

**Verify:** commits `62064fe` ("it claimed to send tasks and sent a
ping") and `7de048f` ("collected a real API token… and had NO branch in
handleImport"). Both commit bodies are quotable verbatim.

---

### C · "They look stale to me"
*(shape: defensible omission, caught only by an eye)*

**The scene:** The morning after launch, with traffic arriving. You
looked at onejob.co and said the screenshots looked stale. They were
from **July 23** — two UI eras old, showing button placements that no
longer existed. In the ten days prior I had re-shot the *App Store*
screenshot set three times, caught a metrics panel leaking into a
privacy shot, and byte-verified the uploads. I never once asked whether
the pictures on the website still matched the app.

**Why it fits:** nothing was failing. There is no test for "this image
is from a previous version of the product." The images were "done" in
July and stayed done. Noticing required someone who had *seen the app
recently* to look at the website with the same eyes.

**Verify:** `development/coral-logs/2026-09-10-coral-log.md`, and the
file dates on `site/screen-*.png` before the 09-10 commit.

---

## §3 candidates — "what I got wrong"

These are yours to claim or reject; I can only supply what the record
shows, and the record shows your reframes more clearly than your
expectations.

**1 · "Some items seemed stale" — you diagnosed a missing signal; I
heard a missing effort.** When you first used the attention deck you
said some items seemed stale. I read that as *audit more carefully* and
answered with diligence. It took a brief from another project to make
me hear what you had actually said: the card didn't tell you *how
long*. The fix was a date on every item, not more care. One item had
been waiting 39 days and looked identical to one waiting three.
(*Shape: something expected to be a discipline problem that was a
design problem.*) — `coral-logs/2026-09-05`, §"the pattern."

**2 · The alignment you offered as a design question.** You said some
screens were top-aligned and some bottom-aligned, and asked whether the
app needed center alignment. You offered it as taste. It was a bug: a
wrapper div missing three CSS classes, so an entire view collapsed to
content height. **The app already wanted what you asked for.** (*Shape:
something you expected to be a decision that was a defect.*) —
`coral-logs/2026-09-05`.

**3 · Shake-to-undo.** Expected to be our bug; it was iOS's own system
gesture winning the race. Not fixable from web content, and the honest
answer was to remove the feature rather than explain it. (*Shape:
expected hard/fixable, was neither.*)

**4 · The one where I was wrong out loud, if you want the agent's
version:** I told you the usage panel was "cut off below the fold" on
iPhone. The evidence contradicted me within minutes — it was
*displacing* the backup section, not hidden. I had also called that
screenshot "the weakest of the six" a few minutes earlier. Both
retracted. It was weak *because of the bug*, and I had explained the
symptom instead of investigating it.

---

## §2 — the "what stayed expensive" list, checked against the record

Your five candidates all hold. Two notes from the archives:

- **"Deciding what done meant"** has a concrete instance: 1.0 waited on
  your *device-pass soak*, and the record shows it waiting across
  multiple sessions (08-13, 08-16, 08-19: "everything else upstream is
  verified; only Xian's soak remains"). The agent had nothing left to
  do and could not do the one thing that mattered.
- **"Killing things"** also has one: the three integration stubs above
  were removed on your question, not on any plan. Deletion had no
  advocate until a human asked.

If you want a sixth: **noticing what isn't there.** Every failure in
§1 is an absence — a deploy that didn't happen, a handler that didn't
exist, a screenshot nobody re-took. Tests verify what is; people notice
what isn't.

---

## Verifications you flagged

- ✅ **App Store link resolves**: `resultCount: 1`, version **1.1**,
  store page HTTP 200 (checked 2026-09-14). Safe for the email.
- ⚠️ **Podcast show notes** ("What Now" vs "Now What?") — not in my
  archives; that correction lives on Rosenfeld's side.
- ⚠️ **#3 archive link** — still the `[link]` placeholder from #4;
  needs the Buttondown archive URL when you write.

## The P.P.P.S. decision, with the ruling already made

You ruled this on 09-13: **the agent-oversight framing stays
cohort-specific to the ten; the app's primary messaging stays focus,
calm, clarity.** #5 goes to a list that is mostly *not* the ten, so the
cleanest version is Themis's option A — keep the agent hook in the
P.P.P.S. (it is a recruiting ask aimed at agent-heavy readers, and the
deets doc is written for exactly them), while the body of the issue
describes One Job the way you ruled: a to-do app about focus, whose
agentic application is an unproven and interesting frontier.

**And the link has changed since the deets were written:** recruits no
longer need to send you an email address. The TestFlight public link is
live and self-serve — **https://testflight.apple.com/join/dZ1DdUhJ**
(cap 10). One tap, they install TestFlight, they're in.
