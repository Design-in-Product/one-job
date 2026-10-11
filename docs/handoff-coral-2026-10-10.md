# Handoff — Coral (One Job) — 2026-10-10, before the ~15:00 fleet reboot

**For:** the Coral session after today's Amber reboot. Read CLAUDE.md
first. This file carries only what's mid-flight. The previous full
handoff is `docs/handoff-coral-2026-09-27.md`; everything since then is
in `development/coral-logs/` and on the board (`docs/ATTENTION-ROLLUP.md`).

**This repo is PUBLIC.** No tester names or personal emails go here,
ever. Refer to testers by role. Confidential material lives in
`Design-in-Product/one-job-private`.

## UPDATE 2026-10-10 19:4x PT: THE SCRUB IS DONE
It was pushed and verified on xian's in-session go. main is `9a50a7a`.
The section below is history. What's left is board item 39 (xian
sends the GitHub Support purge request).

## (was) THE ONE MID-FLIGHT THING: the history scrub (item 37, option B)

xian ruled "do B" on 2026-10-10 (mail
`xian-via-janus-to-coral-scrub-option-b-go-2026-10-10.md`). The status:

- **Done:** the private repo exists. The confidential files are moved
  and verified. The **full pre-scrub backup** is in one-job-private:
  branch `one-job-pre-scrub-2026-10-09` and `pre-scrub/*` for all 4
  branches and 20 tags, each verified.
- **Done:** a **trial** rewrite on a scratchpad mirror passed all
  three checks (zero matches, an independent tree check of 784 files
  with 0 mismatches, and npm ci + 250 tests + build).
- **Done:** a freeze notice was mailed to Janus and Themis: the freeze
  starts when Pard reports all seats back, and ends when Coral mails
  "clear".
- **NOT done: the push.** It waits on **Pard's "all seats back"**
  report.

**To finish it:**
1. Clone one-job-private into the scratchpad. The kit is in `scrub/`:
   `expressions.txt`, `run-scrub.sh`, `verify.sh`, `PUSH.md`.
2. The scratchpad was wiped by the reboot, so reinstall the tool:
   `python3 -m venv fr-venv && fr-venv/bin/pip install git-filter-repo`.
3. Follow `scrub/PUSH.md` exactly: a **fresh** run, verify exits 0, the
   tree check, and npm ci + test + build, then the `--atomic
   --force-with-lease` push, then verify the site (onejob.co 200, and
   the deploy run green including its verify job).
4. Then **re-clone this working repo** (and set
   `git config core.hooksPath .githooks`), mail "clear" to Janus and
   Themis, tell them everyone must re-clone, and draft the GitHub
   Support purge request for xian (cached views of old SHAs).

## Everything else (not mid-flight)
- Board v83. Open: 37 (this), 36 (xian tests build 41, then "Pilot
  41"), 22 (UX session time), 27 (deck feel), 10 (REQUIREMENTS.md).
- The first Pilot tester hasn't joined yet. The link is verified live.
  Confirm only from the API tester count.
- Threat-model note: waits on xian's answer. Don't build it.
- Duty fire is 17:49 daily; drain rule; a `Drain:` line in every fire
  entry (the pre-commit hook enforces it).
