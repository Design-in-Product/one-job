# Memo: xian → Coral · 2026-08-26 · README statistical corrections (action required)

**Status:** 🔴 Action required. Two lines in `README.md` cite statistics that
do not survive primary-source checking. One is misattributed, three are
unsourceable. They should come out of the repo regardless of what happens
with the pitch deck.

**Provenance:** produced during a Cowork research session on 2026-08-26 that
was assembling source material for an investor pitch deck. A dedicated
research pass traced each cited statistic to its primary source (or failed
to). This memo carries the findings and the recommended replacements.

---

## The problem, in one line

`README.md` currently asserts four numbers about attention and
single-tasking. **None of them is defensible.** A product whose entire
credibility rests on honest signals — "a success signal that reports an
attempt is a lie waiting for its moment" (FR4.0b.8) — should not be
citing folklore in its own front door.

---

## Line-by-line

### `README.md:20`

```markdown
- **Context switching** kills productivity (studies show 23 minutes to refocus!)
```

**Verdict: MISATTRIBUTED.**

The "23 minutes (15 seconds)" figure appears in **no peer-reviewed paper**.
It exists only in press interviews with Gloria Mark and a *Wall Street
Journal* quote. The paper usually cited for it — Mark, Gudith & Klocke,
*The Cost of Interrupted Work: More Speed and Stress*, CHI 2008 — does not
contain the number 23 anywhere, and found the **opposite** direction on
time: interrupted participants spent *less* time on the original task
(20.31 and 20.60 min) than uninterrupted ones (22.77 min). The cost they
measured was in stress, frustration and effort — not minutes.

The nearest real number comes from a different paper: Mark, González &
Harris, *No Task Left Behind? Examining the Nature of Fragmented Work*,
CHI 2005 — average **25 min 26 sec** elapsed before returning to an
interrupted task. Two cautions that make it a poor slogan:
- Most of that elapsed time is spent **doing other real work** (an average
  of 2.26 other working spheres), so it is not "recovery of focus."
- **SD = 54 min 48 sec**, more than twice the mean — a heavily skewed
  distribution where the mean is a bad summary.
- n=24 information workers, observed in 2005. It is a 21-year-old study.

Primary source: https://ics.uci.edu/~gmark/CHI2005.pdf
Origin tracing of the bogus figure: https://blog.oberien.de/2023/11/05/23-minutes-15-seconds.html

### `README.md:32`

```markdown
- **🧠 Psychology-backed**: Single-tasking improves focus by 40% and reduces errors by 50%
```

**Verdict: UNSOURCEABLE (both halves).**

**"Improves focus by 40%"** — no primary source exists for this claim in
this direction. Its ancestor is the APA's "Multitasking: switching costs"
page, which frames a **loss**: that brief mental blocks from task switching
can cost *as much as 40% of productive time*. That figure is itself an
extrapolation from Rubinstein, Meyer & Evans (2001), which measured
switch costs in **reaction time on rule-switching tasks with college
students** — milliseconds to seconds per switch, in a lab. Inverting a
contested extrapolated loss into a clean gain is folklore.

**"Reduces errors by 50%"** — no primary study found, in any direction.
Every appearance is a blog, listicle, or business-book aside, none
carrying a citation.

Also worth noting: "Psychology-backed" is the load-bearing word in that
bullet, and it is the part that becomes false when the numbers go.

---

## Also unsourceable, in case it is ever reached for

**"41% of to-do items are never completed"** (attributed to iDoneThis,
2014) — traced the full chain: listicles → CUInsight → Kevin Kruse,
Forbes, 2015-07-10 → the iDoneThis blog. **The iDoneThis blog no longer
exists**; `blog.idonethis.com` now redirects to an unrelated commercial
domain and the Wayback Machine has no snapshot at the canonical URL. Even
at its best it was a vendor's self-reported analysis of its own users,
method never described. Unrecoverable. Do not use.

**Task-management app retention/abandonment benchmarks** — every "D1/D7/D30
by category" figure online is an SEO aggregator citing other aggregators.
No obtainable primary source breaks out task management as a category.
Do not put a retention number anywhere.

---

## Recommended replacements

The honest move on `README.md:20` and `:32` is to stop borrowing authority
we do not have. Two options, in order of preference:

### Option A — drop the numbers, keep the argument (recommended)

The philosophy page already makes this case better without a single
statistic ("Forty-seven open items is not information — it's dread,
delivered on schedule"). Suggested rewrites:

```markdown
- **Context switching** kills productivity — every interruption costs you
  the thread, and the list guarantees interruptions
```

```markdown
- **🧠 One thing at a time**: seeing one task removes the anxiety of
  seeing all of them
```

Note the second drops "Psychology-backed" deliberately. The claim it was
backing does not exist.

### Option B — cite something real

If a sourced number is wanted, these survive scrutiny. All are primary,
recent, and about the problem One Job actually addresses:

1. **Microsoft, *Breaking down the infinite workday*, 2025-06-17** — from
   aggregated M365 telemetry plus a 31,000-person, 31-market survey:
   **117 emails and 153 Teams messages received per person per weekday**;
   an interruption every **2 minutes** during core hours; **48% of
   employees say work feels chaotic and fragmented.**
   https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday
   *(Caveat: Microsoft measures Microsoft surfaces and sells a remedy.
   Quote the observed message counts and the two-minute cadence; skip
   their derived "~275 interruptions/day," which is extrapolated.)*

2. **Murty, Dadlani & Das, Harvard Business Review, 2022-08-29** — workers
   toggled between applications **~1,200 times per day**, costing just
   under **4 hours a week** reorienting (~9% of work time). n=137 users,
   20 teams, 3 Fortune 500 companies, up to 5 weeks of logged actions.
   https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications
   *(Caveat: small n, enterprise-only.)*

3. **Gloria Mark's attention-span series** — average attention on a screen
   before switching fell from ~2.5 minutes (2004) to 75 seconds (~2012) to
   **47 seconds** in recent studies, with independent replications at 50s
   and 44s. https://www.universityofcalifornia.edu/news/cant-pay-attention-youre-not-alone
   *(Cite as "Gloria Mark's research," never as "a study found" — it is an
   aggregation across her own studies, not one paper with a stated method.)*

If Option B is chosen, **cite the source inline in the README**. A number
with a link is a different kind of claim than a number without one.

---

## Scope check

Grepped `README.md`, `philosophy.html`, `landing-page.html`, `demo.html`,
`index.html`, `store/LISTING.md`, `src/`, and `docs/` for the four figures.
**The only occurrences are `README.md:20` and `README.md:32`.**
`philosophy.html` is clean — it makes the argument on its own terms and
should not be touched. `store/LISTING.md:46` ("Single-tasking beats
juggling: seeing one task removes the anxiety of seeing all of them")
carries no statistic and is fine as written.

---

## Suggested handling

Green zone (documentation), so no test-first requirement — but the change
should land with the citation discipline the repo applies everywhere else:
if a number stays, its primary source travels with it in the same line.

— filed by xian, 2026-08-26
