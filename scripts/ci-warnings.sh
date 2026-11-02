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
found=0
for job in $(gh run view "$run" --json jobs -q '.jobs[].databaseId'); do
  out=$(gh api "repos/{owner}/{repo}/check-runs/$job/annotations" \
    --jq '.[] | "  \(.annotation_level): \(.message | split("\n")[0])"')
  if [ -n "$out" ]; then
    echo "job $job:"; echo "$out"; found=1
  fi
done
[ "$found" = 0 ] && echo "  no warnings or notices"
exit 0
