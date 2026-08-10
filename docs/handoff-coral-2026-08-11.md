# Handoff: Coral — Amber reboot 2026-08-11 ~11:00 PT

*The belt, not the plan (Pard's gate reads this by name). If `claude
--resume` works, none of this is needed. If I come back cold, this is
enough to stand up.*

## Who/where
Coral, One Job's resident agent. Pre-reboot config:
`CLAUDE_CONFIG_DIR=~/.claude-kindsys` (kindsys.us account, closed
2026-07-30). Post-reboot: **default partition, xian@designinproduct.com**.
Pard copies `~/.claude-kindsys/projects/-Users-xian-Development-one-job`
(memory AND transcript — both, that's the point of the copy) to
`~/.claude/projects/`. Belt #2: memory tarball
`~/coral-memory-backup-2026-08-10.tar.gz` + `.sha256` beside it.

## State at handoff (2026-08-10)
- **rc.31 live** at onejob.co/app, verified by served-bundle stamp.
  rc.12 is the TestFlight artifact (Dan). 1.0 floor is rc.23
  (data-safety guard); decision doc:
  `docs/plans/2026-08-06-release-1.0-decision.md`.
- **ASC API key LIVE**: `~/.appstoreconnect/private_keys/AuthKey_D96QY6RRB3.p8`
  (700/600), Issuer `4d7298e0-7bf2-4f1f-a541-cccfe6281485`, verified by
  signed GET /v1/apps → 200 (One Job + OptiListen). Harbor-registered
  (Pard confirmed active). Details in `docs/AMBER-XCODE.md`.
- **Relay (kindbook) paused with honors.** Full capability map in
  `docs/mail/memo-coral-to-relay-2026-08-09-map-closed.md` (2×2 table:
  cloud reads work, everything else walled). Slack bridge
  `#onejob-agent-mail` (C0BNK04PLDD) stood up, UNTESTED from Relay's
  side. No standing kindbook agent; task-scoped sessions on demand.
- **Waiting on Xian (no schedule)**: rc.31 device pass (incl. Settings
  shake-state reading), Pro-feature feedback (Janus flagged 08-08),
  1.0 build call.

## Post-resume checklist
1. Confirm memory visible (read `MEMORY.md` + one memory file) —
   report to Pard, it's the one thing they can't verify from outside.
2. Re-arm the origin/main monitor (non-Coral commits; it dies with the
   session).
3. Check the briefing artifact
   (claude.ai/code/artifact/84885330-3ded-40c8-9271-eff2451a312a):
   artifacts are ACCOUNT-SCOPED and this one was published under the
   kindsys-era session — it may not survive the account move. Source
   of truth is `docs/attention-briefing.html` in-repo; if the URL is
   dead or unreachable from the new account, republish and give Xian
   the new URL.
4. Session logs: `development/coral-logs/YYYY-MM-DD-coral-log.md`;
   read the latest two for immediate context; CLAUDE.md for standing
   rules (destructive-action protocol, mail conventions, port 8081).

## Timing
11:00 works — nothing mid-flight: no builds scheduled, rc.31 shipped,
Relay paused. Confirmed to Pard by memo.
