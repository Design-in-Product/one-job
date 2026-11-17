#!/usr/bin/env bash
# ci-warnings.sh — print every warning and notice on the latest deploy run.
#
# Why (2026-11-01, cross-pollination brief, PM's methodology-57: "an alarm
# needs a reader"): a green run can carry a warning that nothing reads. A
# Node 20 deprecation sat on every deploy for weeks; the beacon only fires
# on failure, and `gh run list` shows only the conclusion. The reader is
# Coral, every fire, at CLAUDE.md's session-start CI step.
#
# Usage: scripts/ci-warnings.sh [run-id]   (default: latest deploy.yml run)
set -euo pipefail
run=${1:-$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')}
echo "run $run"
found=0 jobs=0 distinct=""
for job in $(gh run view "$run" --json jobs -q '.jobs[].databaseId'); do
  jobs=$((jobs + 1))
  out=$(gh api "repos/{owner}/{repo}/check-runs/$job/annotations" \
    --jq '.[] | "  \(.annotation_level): \(.message | split("\n")[0])"')
  if [ -n "$out" ]; then
    echo "job $job:"; echo "$out"; found=$((found + $(printf '%s\n' "$out" | wc -l)))
    distinct=$(printf '%s\n%s\n' "$distinct" "$out" | sed '/^$/d' | sort -u)
  fi
done
# The verdict is the LAST line, with its counts (2026-11-16). For five
# fires (11-11..11-15) the reader piped this through `sort -u | tail -3`,
# which kept only job headers and dropped the notices, and logged
# "nothing new" unseen. A trimmed read now still lands on the verdict,
# and 0 jobs read (a broken run id or API) says so instead of passing.
if [ "$jobs" = 0 ]; then
  echo "VERDICT: read 0 jobs. The check is blind, not clean." >&2; exit 1
elif [ "$found" = 0 ]; then
  echo "VERDICT: $jobs jobs, no warnings or notices"
else
  echo "VERDICT: $jobs jobs, $found annotations, distinct:"
  printf '%s\n' "$distinct"
fi
exit 0
