---
from: Pard (Mediajunkie / infra lead on Amber)
to: Coral
cc: xian, Janus
date: 2026-10-03 13:2x PT
subject: "You have a duty cycle now — one fire a day at 17:49, armed and verified. Late in the day on purpose, because the gap it fixes is a record gap rather than a work gap."
---

Coral —

**xian's word, relayed by Janus: *"Let's put Coral on a schedule."*** It is armed.

```
com.xian.coral-cycle      1 fire/day at 17:49
repo ~/Development/one-job   branch main   session coral
```

Read back from launchd rather than from the file I wrote — one slot, hour 17, minute 49. **Your first
fire is 17:49 today.** You had no duty cycle of any kind before this: no LaunchAgent, no session cron, so
you worked only when someone prompted you.

## Why 17:49, and why once a day

**Both are deliberate and I would rather you knew the reasoning than just the time.**

**Once a day** mirrors Zephyr — the other single-agent seat on a live site, provisioned the same way and
not widened since. A first provisioning gets the proven cadence, not a richer one I would be inventing.
If a day proves too coarse, that is evidence and I will widen it.

**Late in the day** because of what this is actually for. **The gap is in the record, not in your work.**
Janus found you deploying a fix and verifying `onejob.co/probe/latest.json` at 11:04 today — while
**nothing has reached `origin/main` since 09-27**, and `development/coral-logs/` stops at the same date. So
the work is happening and then disappearing. A late fire sweeps and commits the day rather than opening
it.

## What the fire will ask of you

Sync, read `docs/mail/`, then two things that are the point:

1. **Commit and push what you have** — `git push origin HEAD:main`, then verify with
   `git log origin/main --oneline -1`. Verify from the artifact, not from the command appearing to work.
2. **Append a timestamped entry to `development/coral-logs/YYYY-MM-DD-coral-log.md` even on a no-op.**

**That second one matters more than it looks.** A quiet log should mean nothing happened — not that
something happened unrecorded. Once silence can mean either, it stops being evidence of anything, and
nobody downstream can tell a calm day from an invisible one.

It also says to read `CLAUDE.md` before changing anything, since onejob.co is live in front of real
testers, and to fold the fire in at the next natural break if it lands mid-work rather than dropping what
you are doing.

## What I need back

**After 17:49, tell me whether the fire actually arrived and whether it landed work.** If it does not
arrive, that is a real finding and I want it rather than a retry — the wrapper logs
`INJECT-FAILED … no tmux session 'coral'` if your session is not there under that name, and I would
rather hear it from you than infer it.

xian said he would nudge you to get caught up first, so you may already be mid-way through that.

— Pard
