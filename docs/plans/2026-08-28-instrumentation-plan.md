# Instrumentation Plan — local-first metrics for the 50-user pilot

**Author:** Coral · 2026-08-28 · **Status:** DRAFT for Xian's review
**Feeds:** roadmap memo item R1.5 (`docs/mail/memo-xian-to-coral-2026-08-26-roadmap-reordering-after-investment-review.md`)
**Covenant basis:** covenant 7 as amended 2026-08-28 (calm-UI principle,
not a privacy commitment — `docs/VISION.md`)

---

## The question this document must answer first

Xian, 2026-08-28: *"I thought the idea is I do need to be able to track
retention and adoption. How do I square that circle?"*

The circle: **the design says nothing leaves the device, but retention
and adoption are aggregate numbers about other people's devices.** If
data never moves, how do the numbers reach you?

### The honest answer: this is a research cohort, not ambient telemetry

The 50-user pilot is a **known, recruited, consenting group** — not
anonymous store traffic. That changes what "collection" has to mean:

1. **Each device computes its own verdict.** The app doesn't export raw
   events for you to analyze — it computes, on-device, the exact
   metrics the memo pre-registered (activated? retained? engaged? plus
   the supporting counters) and holds them in a small, human-readable
   summary. A participant can read everything they'd be sending.

2. **You collect at checkpoints, by asking.** At the end of week 1 and
   week 4, participants get a message (from you — the recruiting
   channel already exists, since you recruited them): "tap Settings →
   Share my usage summary." One tap, share sheet, send it back by
   whatever channel they already talk to you on. At n=50 this is an
   afternoon of collation, not a data pipeline. This is the same
   methodology as a diary study — standard practice for exactly this
   cohort size, and it produces *better* conversations than silent
   telemetry, because every data point arrives attached to a person
   you can ask "what happened in week 3?"

3. **Non-response is signal, not noise.** Someone who abandoned the app
   won't export from it. So the report has honest error bars built in:
   *"Retention: 40% confirmed (12/30 responders retained), bounded
   below by 24% (if every non-responder churned)."* The investment
   review scored traction 1.0/5 partly because there were no numbers at
   all; a bounded, honestly-collected number from a real cohort moves
   that in a way an unauditable dashboard figure would not.

4. **The escalation path exists and is a gate, not a slope.** If
   checkpoint response rates make the data unusable, the deliberate
   next step is an in-app opt-in toggle ("share usage summaries with
   the developer automatically") that actually transmits. That is real
   collection: it flips the App Store privacy label from "Data Not
   Collected," and it gets decided **as its own decision**, with the
   label change named in the decision. Verified against Apple's
   published definition (2026-08-28): on-device-only processing is
   definitively not "collected"; a user-initiated share-sheet export is
   mechanically identical to the existing backup export; an automatic
   transmit path is collection, full stop.

### What we trade away, named honestly

| Hosted analytics gives | This design gives |
|---|---|
| Continuous funnels, real-time dashboards | Checkpoint snapshots, collated by hand |
| Every user counted automatically | Responders counted; non-responders bounded |
| Segment/cohort slicing after the fact | Only what was pre-registered (by design — no post-hoc re-cutting, which the memo names as the failure to avoid) |
| Zero per-user effort | One tap per participant per checkpoint |
| A privacy label that says "Data Collected" | "Data Not Collected," true and load-bearing for a product whose pitch is *your deck never leaves your device* |

For a 50-person pilot deciding lifestyle-vs-venture, the right column
is sufficient and the left column is a liability to the product's own
story. If One Job someday has 10,000 users, this plan does not scale to
them — and it doesn't need to; that future decision arrives with the
escalation gate above.

---

## What gets measured

Pre-registered definitions, from the memo, so results can't be re-cut
post-hoc to flatter the outcome:

| Metric | Definition | Computed as |
|---|---|---|
| **Activated** | Created ≥5 cards AND returned on a second, separate day | `totals.created >= 5 && activeDays.length >= 2` |
| **Retained** | Active on 4+ distinct days during week 4 | count of `activeDays` in days 22–28 since first use ≥ 4 |
| **Engaged** | Completed ≥1 card on 4+ days in a week | per-week count of days with ≥1 completion ≥ 4 |

Supporting counters (running totals + per-day activity):

- Cards created / completed / deferred
- **Deferral depth** — max and distribution of per-card deferral counts
  (the memo: "the honest measure of the failure mode the product
  deliberately hides")
- Decks maintained (count of root decks with ≥1 active card)
- Interiors opened (sub-deck navigations)
- Distinct active days (the day-set that powers every definition above)

**Explicitly never recorded:** card titles, descriptions, or any
content; deck names; anything from the GitHub import's payloads; any
identifier beyond a random install ID generated at first launch (so two
exports from the same person can be linked — necessary for week-1 vs
week-4 comparison — without knowing who they are unless they tell you).

## Storage design

- **Separate localStorage key: `oneJobMetrics`** — never inside the
  task document. Metrics can't touch backup/restore semantics, can't
  enter the schema-migration machinery, can't be affected by
  import-replace, and are excluded from task backups by construction
  rather than by filtering.
- Shape (v1):
  ```json
  {
    "v": 1,
    "installId": "<uuid, generated once>",
    "firstUse": "2026-09-01",
    "activeDays": ["2026-09-01", "2026-09-02"],
    "totals": { "created": 0, "completed": 0, "deferred": 0,
                "interiorsOpened": 0 },
    "deferralDepth": { "max": 0, "histogram": {} }
  }
  ```
- `activeDays` bounded to the last 90 entries (the pilot needs 28;
  90 gives margin without unbounded growth).
- Writes are best-effort: a quota failure or storage error **must
  never break a task operation** — metrics recording wraps in
  try/catch and degrades to silence. The deck always wins.

## Where it hooks in

At the **store layer** (`LocalTaskStore`), not the UI: every mutation
already funnels through a small number of store methods
(`createTask`, `applyCompletion` via `completeTask`, `deferTask`,
sub-deck opens via the UI's one navigation call). One `recordMetric()`
seam, called from those methods, same pattern as `mirrorToNativeStorage`.
Remote/demo modes: demo excluded entirely (a demo session isn't usage);
remote mode out of scope for the pilot.

**TDD zone: YELLOW** (new component, architecture-first with
comprehensive tests) — but with one RED-zone rule inherited from the
covenant of the store: the tests must prove metrics failures cannot
propagate into task operations.

## Surfaces

1. **Settings → a small "Usage" section**: the summary, readable, with
   the *Share my usage summary* button (share sheet, exact same code
   path and observed-outcome-only success messaging as backup export).
   Numbers live here and in the export. **Nothing appears in the deck,
   ever** — covenant 7 as amended.
2. **No onboarding prompt, no toggle at install.** The feature is
   inert-by-default and consent is the export action itself. (Opt-in
   is an action, not a checkbox — the memo's words.)

## Build sequence

1. `metricsStore.ts` + tests (day-set, counters, definitions as pure
   functions — each metric definition is a named, tested function so
   the pre-registration is executable, not prose).
2. Store-layer seam + tests (including the metrics-can't-break-tasks
   guarantee).
3. Settings section + export button (reusing backup-export plumbing).
4. A `scripts/collate-metrics.mjs` that takes N exported JSON files
   and produces the checkpoint report with the bounded ranges above —
   so collation day is one command, not a spreadsheet afternoon.

Estimate: comparable to the backup-fix work (a store module + a
Settings surface + tests), well under an R2 item.

## Relationship to the product-tracking skills

The Accoil skills (installed 2026-08-28, `.claude/skills/`) formalize
this pipeline as model-product → audit → design-tracking-plan →
implement. Their model assumes a hosted analytics destination, which
we are deliberately not using — but their discipline (pre-registered
definitions, minimalism, no-PII hard lines, no post-hoc re-cutting,
snapshot-vs-event distinction) is applied throughout this plan. If we
later hit the escalation gate and add real transmission, running the
full skill pipeline against a hosted destination is the right move at
that point, with this document as its input.

## Open questions for Xian

1. **Checkpoint cadence**: week 1 + week 4 (proposed), or more/fewer?
2. **The install ID**: comfortable with a random UUID for
   linking a person's week-1 and week-4 exports? (Alternative: none,
   and you match exports by who sent them — works at n=50, slightly
   more manual.)
3. **Does the Settings "Usage" section show the person their own
   metrics** (proposed — they can read what they'd share, and it's a
   small trust feature), or stay invisible until export?
4. Sign-off to build, and where it sits relative to the fleet probe in
   order of execution.
