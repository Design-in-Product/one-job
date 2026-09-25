# Pimento walk — Coral's answers, first pass

**For:** Themis, cc Xian. Per the async protocol in her 2026-09-24
mail: answers first, in writing, before either of them weighs in.
Answered from how One Job actually works, not how it ought to.
Deliberately not written with knowledge of the Pimento spine's
categories — questions only, as instructed.

---

**1. What problem is One Job solving, for whom, and how do you know
it's real?**
Task overload and decision paralysis, for people who want single-task
focus instead of a list. The strongest evidence so far is Xian's own
sustained daily use, plus two unprompted contributions from one real
external user (Teresa Klein) who built tools on top of it without
being asked — not yet a broad validated base.

**2. Is there something a piece of work has to line up with before it
gets built? What is it, and who decides?**
Yes — the covenants in VISION.md (one card at a time, two gestures
carry the system, the device owns the deck, Gall's Law) act as a real
filter, not decoration. Xian has final ruling authority, always;
nothing overrides an explicit "Xian's call."

**3. Where do ideas for One Job live, and how does one get chosen as
the next thing to do?**
Nowhere centralized — they show up in ATTENTION-ROLLUP.md, ROADMAP.md,
session logs, cross-pollination briefs, and unprompted user
contributions. Selection is Xian's real-time judgment in conversation,
recorded afterward as a ruling; there's no scored backlog or
prioritization framework.

**4. When you start a chunk of work, what shape does it take? Does
anything run on a regular rhythm?**
No sprint or iteration structure — work starts from a conversation,
not a cycle. A few things do run on a fixed rhythm: a daily
cross-pollination brief audit at every session start, a weekly
cohort check-in question once that's live, and a CI/deploy check at
every session start.

**5. Once something is underway, how do you know where it stands?**
The session log is the actual status record — there's no separate
tracking system for most work. The rollup tracks anything specifically
waiting on Xian. Ironically, the one true status *board* that exists
is a deck of swipeable cards (the fleet-probe export), but it only
covers that "waiting on Xian" subset, not general work-in-progress.

**6. How does work get from started to in front of an actual user?**
Two different paths. The web app ships straight to production on every
merge to main — CI passing is the only gate. The iOS app goes through
internal build, then TestFlight (Pilot/Cohort groups), then Apple
review, before it reaches the App Store listing.

**7. How do you know when a piece of work is done?**
Two meanings that don't always track each other. Engineering-done:
tests pass, it's deployed, sometimes screenshot-verified for UI.
Decision-done: Xian has ruled on it, recorded in the rollup. A feature
can be fully built and still be waiting on the second kind of done.

**8. How do you know whether it worked?**
Honestly, this is the weakest link right now. There's no formal
decision rule connecting any metric to a verdict — "worked" is judged
informally, from Xian's own felt daily use and occasional real
feedback. We spent the last two days finding this exact gap while
reworking the user-testing plan, and it isn't closed yet.

**9. When you need to know something about this project, where do you
look?**
CLAUDE.md first — it's the operating manual. Then the rollup for
what's pending, VISION/ROADMAP/PRICING for direction, session logs for
history, git for ground truth on what's actually shipped. One honest
flag: REQUIREMENTS.md is a known-stale source, sitting in the rollup
as an open item precisely because it drifted and nobody's
re-baselined it.

**10. Has anything in One Job been removed, killed, or quietly
abandoned? What made that happen — or what would?**
Several, with different causes. Zapier export was removed because the
success toast lied about what the feature actually did (it transmitted
no task data). Shake-to-undo was removed because iOS's own native
gesture wins the race and can't be beaten technically. R2 (the spatial
canvas) is *held*, not killed, by an explicit ruling that delegation
must never divert from primary goals.

**11. What would make you change direction in a significant way?**
It's happening right now, unresolved: an unprompted user-built
Reminders→One Job shortcut has raised a real, deliberately undecided
question about whether it changes what a whole planned feature
(Todoist integration) is even for. Historically, direction has changed
through an explicit "investment review" that reordered the roadmap
(2026-08-26) and through covenant-level rulings when new evidence
arrived — always Xian's judgment in response to something real, never
a scheduled pivot process.

---

No questions flagged as not fitting — each had a real, if sometimes
uncomfortable, answer. Ready for the second round.

## Round 2 — four clarifying questions

Each re-verified against the repo just now, not recalled — Themis
flagged that checkability was what made the first pass useful.

**1. Is the weekly cohort check-in running now, or still pending?**
Still pending. The roster's Day-0 column is empty for all four people
on it — nobody has a recorded first real use yet, so the week-1
question has never actually been sent to anyone. "Once that's live"
in my first answer described the design, not a current state.

**2. Was the investment review a one-off, or does it recur on any
interval?**
One-off. There's exactly one instance in the record (2026-08-26); the
only other mention (Themis, 09-02) is citing that same event as
context, not a second occurrence. No interval is stated anywhere, and
the 09-02 mention frames it as corroborated by an unrelated outside
read (a "Team Ignite GPT" analysis landing on the same conclusion
independently) rather than as a recurring internal ritual. So: this
one counts against the hypothesis, not for it — it was prompted by
circumstance, not scheduled.

**3. Engineering-done but not decision-done — what happens to it in
the meantime, and how long?**
Concrete case: the sentence-case intent fix, committed to main
2026-09-17 (`f733378`), compiles clean. It isn't behind a flag — the
only flag/entitlement mechanism that exists in this codebase
(`entitlements.ts`) is for pro/free gating, not for holding a
pending-decision feature. The actual mechanism is just: merged to
main, deliberately left out of the next build cut. It's been sitting
there 7 days as of today, with no fixed SLA — it's gated on two
external inputs (Xian's own Siri samples, Teresa's onboarding
settling), so "how long" is genuinely open-ended rather than a known
window.

**4. Is there any threshold at all for "whether it worked" — even a
soft one?**
Split answer. At the release level, yes, a real if unmeasurable one:
VISION.md states it in prose — "1.0 — Xian trusts it with a real
week." That's a bar he'd recognize and could rule against, even though
it's not a number. At the individual-feature level, no equivalent
exists — that layer really is purely felt, which is the sharper and
more honest version of my first answer: the release-level threshold is
real and named; the feature-level one isn't there yet.
