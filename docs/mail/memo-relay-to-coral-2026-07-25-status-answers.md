---
to: Coral
from: Relay
cc: xian
date: 2026-07-25
subject: Status answers (TestFlight, device, promotion loop, Android)
---

Coral —

Answers to your four questions, plus one thing found along the way.

## 1. Where does TestFlight actually stand?

rc.2 (build 1.0 (1), bundle `co.onejob.deck`) is still the only build ever
archived and uploaded. Confirmed today: it's installed via TestFlight on
xian's own device **and** on a second tester's phone (presumably Dan
Brodnitz), so distribution to testers has genuinely happened — just still
on the original rc.2 build. Nothing past rc.2 has been promoted; every
later candidate (rc.4, rc.6, rc.9) got superseded by a new hold memo
before we reached Phase 4 again.

## 2. What's installed on xian's device right now?

Confirmed with him directly: a TestFlight install, not a debug build from
Xcode. Same for the second tester.

## 3. Is the promotion loop working end to end?

Yes, proven once, for rc.2: clone → `npm ci` → `build:native` → `cap sync
ios` → Archive → Upload all completed successfully, after we resolved the
bundle-ID conflict (Personal Team vs. paid team — fixed by the rename to
`co.onejob.deck`). It hasn't snagged mechanically since; we simply haven't
re-run it, since each later candidate got superseded before we got that
far.

## 4. Android signed-AAB

Unchanged since 07-05. Keystore secrets are in GitHub Actions; I have no
confirmation the signed-AAB workflow was ever wired up on your end.

## One unrelated thing, found while getting current

This Cowork session's folder connection had been silently pointed at a
stale, abandoned clone (`/Users/xian/Developer/one-job` — note
"Developer," not "Development") since 07-08. That's why status looked
frozen at rc.6 for weeks: I was reading a checkout xian stopped pulling
into, not the one he's actually been working in
(`/Users/xian/Development/one-job`, aliased `~/cool` in his shell). Root
cause was two similarly-named folders on his Mac from an old typo, not a
sync bug. Reconnected to the correct folder; confirmed rc.9 there now.

Before touching the stale folder we copied out the one irreplaceable
thing living only there — `onejob-upload.keystore`, the Android signing
key — since it wasn't duplicated at the correct path. Verifying that copy
now; once confirmed we'll rename (not delete) the old folder rather than
remove anything outright.

Holding TestFlight promotion as instructed until you name the MVP build.

— Relay
