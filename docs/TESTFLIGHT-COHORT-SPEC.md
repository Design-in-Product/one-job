# TestFlight external cohort — the exact spec

**By:** Coral, 2026-09-10, on Xian's go (via Themis, same day).
**What this is:** every ASC click and every text field for the 50-user
research cohort, so Xian's part is ~10 minutes of clicking and pasting.
**Measurement side already live:** R1.5 on-device metrics + the
user-initiated usage export in Settings. Nothing here adds tracking;
the covenant-7 ethos holds (shape of use, never content).

---

## Design: two groups, not one

| | Group 1 · "Pilot" | Group 2 · "Cohort" |
|---|---|---|
| Who | The first ten — agent-heavy, hand-recruited | The forty — recruited later, plainer framing |
| Link | Public link, **tester cap 10** | Public link, **tester cap 40**, created now but **shared later** |
| Trial doc | Themis's current draft (agent-framed, per their 09-10 memo) | The plainer revision, when that motion starts |

Why two: the two motions have different copy, different timing, and
different people — one group would force one message to both. Separate
caps also mean the first-ten link can circulate in DM without any risk
of it filling with strangers before the ten land.

Rolling starts are the design (per-install day-0 anchoring — each
tester's 28 days run on their own clock), so neither group waits for
the other or for a cohort date.

## Xian's ASC steps (App Store Connect → One Job → TestFlight)

1. **External Testing → ⊕ next to "External Groups"** → name: `Pilot`.
2. In the group: **Builds → add build 1.0 (37)**.
   - First external build triggers **Beta App Review** — usually fast
     (hours, not days) after a store approval, and it's the same build
     Apple already approved. The submission form asks for review notes:
     paste the same review notes from the store submission
     (store/LISTING.md → "Review notes").
3. **Public Link → Enable**, set **tester limit: 10**.
4. Repeat 1–3 for group `Cohort`, tester limit **40** — but do NOT
   share that link anywhere yet. Creating it now means zero ASC steps
   later when recruiting scales.
5. **Test Information** (TestFlight tab, applies app-wide) — paste:

   **Beta App Description:**
   > One Job is a to-do app with one idea: your tasks are a deck of
   > cards, and you see one at a time. Do it, swipe it away, and the
   > next card is waiting. It's free, offline, and account-less — your
   > deck lives on your device and is never sent anywhere.
   >
   > You're joining a small four-week pilot. There's nothing special
   > you have to do — just use it (or don't; that's data too). Once a
   > week we'll ask you one question. If you choose to, you can share
   > your usage summary from Settings — it's a file you can read
   > yourself before sending, and it contains counts and days, never
   > the text of your tasks.

   **Feedback Email:** `xian@pobox.com` (or switch to a dedicated
   address if you'd rather keep pilot mail separate — your call, one
   field).

   **What to Test** (for build 37):
   > Daily use, honestly — add real tasks, swipe them, defer freely.
   > If you hit anything confusing, screenshot it in the moment; the
   > weekly question will ask for whatever you noticed.

6. Send the `Pilot` link to the first ten alongside the trial-details
   doc (Themis's side has that ready).

## What I watch once it's live

- Tester count per group (ASC shows joins) — I'll ask you for the
  numbers at the weekly mark rather than build any automation; a
  10-person pilot doesn't need instrumentation, it needs attention.
- First-session feedback via the weekly question (Themis's cadence:
  weekly, light, one question).
- The 90-day build-expiry clock: build 37 expires ~2026-12-08, far
  beyond the 28-day trial of anyone joining this quarter. New builds
  auto-offer to existing testers; only NEW external builds re-trigger
  beta review.

## What this deliberately does not include

- No cohort recruiting inside the launch announcement (sequenced:
  announce first, recruit into the warmth — running as planned).
- No new app code, no new metrics, no MCP, no adapter — the probe
  ceiling discipline applies to research instruments too.
- No synchronized start date — rolling by design.
