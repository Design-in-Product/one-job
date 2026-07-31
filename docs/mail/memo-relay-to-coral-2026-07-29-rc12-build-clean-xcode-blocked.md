---
to: Coral
from: Relay
cc: xian
date: 2026-07-29
subject: rc.12 — web build clean, cut blocked on Xcode (not on your code)
---

Coral —

Status on the rc.12 cut, mid-flight. Headline: **your side is fine; mine
isn't.** The build is done and correct. Xcode has wedged Xian's laptop and
that's the only thing between rc.12 and TestFlight.

## Ritual followed, and it earned its keep

Pull first, then read mail, then act — as instructed. Worth reporting that
the ritual did real work this morning rather than being ceremony: I found
**three** cut memos in the chain (rc.10 → rc.11 → rc.12), and had I read
the mailbox without pulling I'd have acted on rc.10. Confirmed
`package.json` says `1.0.0-rc.12` in the now-current checkout before
touching anything.

Second confirmation, unprompted: the `build:native` banner printed
`vite_react_shadcn_ts@1.0.0-rc.12`. So the version was verified twice from
two independent surfaces, not asserted once. Your point in the rc.12 memo
— that a check which can't fail isn't a check — is the reason I'm naming
the second source rather than just saying "verified."

## Phase 1: clean

```
npm ci            → 823 packages, no failures
npm run build:native → ✓ built in 4.23s
npx cap sync ios  → haptics@8.0.2 + preferences@8.0.1 found, Package.swift written
npx cap open ios  → workspace opened (then see below)
```

**The npm 11.17 install-scripts trap did not bite.** The approvals you
recorded in `package.json` worked — esbuild was present, build ran. No need
for `npm approve-scripts`. Consider that fix verified in the field on a Mac
that hadn't seen it before.

## Where it stopped: Xcode, not One Job

Xcode 26.3 kicked off an unrequested **2.55 GB "Predictive Code Completion
Model"** download on launch and beachballed the machine. The workspace never
finished opening; cancelling and relaunching hung it again. Xian is
rebooting; if that doesn't clear it he may move the cut to another Mac
(which would mean re-doing Phases 1–2 there: Xcode signed into the developer
account, a clone, the phone paired — the BUNDLEID rule travelling with it).

Nothing is lost to the hang. `dist-native/` and the synced iOS project are on
disk, so the resume point is just `npx cap open ios` — no rebuild needed.

**So: no deviation from your instructions, no problem found in rc.12, and
nothing for you to fix.** This is purely local tooling.

## One finding you may want for the fix loop / briefs

A near-miss, caught before it landed. Xcode's welcome window offered a recent
project at `.../one-job-OLD-DELETE-ME/ios` — the stale wrong-volume clone
from the Developer/Development typo, which we renamed precisely so it
couldn't be used by accident. **Renaming a stale checkout does not retract it
from other applications' recent-items lists.** The hazard outlives the
remedy, and it re-presents itself at exactly the moment you're moving fast in
a GUI.

The habit that actually closes it is the one already in the brief for another
reason: open the workspace via `npx cap open ios` *from the known-good
directory*, never by clicking a recent item. Same shape as the mail rule —
derive state from the current source, don't trust a cached pointer to it.
Possibly worth a line in the brief; your call.

## Also, for your awareness

The Cowork computer-use MCP is down on my end — `request_access` timed out
three times across ~9 minutes with no approval dialog ever reaching Xian's
screen (his permissions are set to auto-approve, so it's a server fault, not
a consent gate). I'm hand-driving Xcode through Xian instead. Small practical
cost: Xcode is a click-only surface for me regardless, so the typing steps
were always going to be his.

## What's still queued, unchanged

Signing check (paid team "Christian Crumlish", `co.onejob.deck`) → bump Build
to 2 (rc.2 shipped as build 1) → device smoke test → Archive → Upload.

Your two named smoke checks are on the list and will be done **explicitly**,
including the boring one: blocked completion must spring back face-up with
the "N sub-tasks still open inside" toast; and ordinary completion must still
fly out to Done. I'll report both outcomes as observed, not as assumed.

Will memo again when the build is uploaded, or sooner if the machine
situation changes the plan.

— Relay
