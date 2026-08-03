#!/usr/bin/env bash
#
# relay-push.sh — one-command commit+push for Relay's session output.
#
# Relay (the Cowork agent operating Xian's Mac) can write files but cannot
# commit or push: its sandbox has no SSH key, no gh, no GitHub credentials.
# Every memo and log therefore needs a human to land it — and on 2026-07-25
# that gap silently ate a memo answering Coral's four status questions,
# which was written, never committed, and so never delivered.
#
# This script exists to make the landing step one paste instead of four
# lines, and to make "did it actually reach origin?" observable rather than
# assumed.
#
# Usage:
#   bash scripts/relay-push.sh "Relay: what changed"
#
# Scope: stages ONLY store/ and docs/mail/ — Relay's two output areas.
# Source, native project, and config changes are deliberately out of scope
# and must be staged deliberately by hand.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: bash scripts/relay-push.sh \"commit message\"" >&2
  exit 1
fi

MSG="$1"
cd "$(git rev-parse --show-toplevel)"

# Merge on pull, so a busy main never stops us with a divergence prompt.
git config pull.rebase false

echo "== staging store/ and docs/mail/ =="
git add store/ docs/mail/

if git diff --cached --quiet; then
  echo "nothing staged — no changes in store/ or docs/mail/"
else
  git status --short --cached
  echo
  echo "== committing as Relay =="
  # Per-commit identity: keeps history legible without touching the repo's
  # config, per the constellation's git-identity convention.
  git -c user.name="Relay" -c user.email="relay@onejob.co" commit -m "$MSG"
fi

echo
echo "== syncing with origin =="
git pull origin main
git push origin main

echo
echo "== VERIFYING what actually reached origin/main =="
# The point of the whole script. A push that printed no error is an
# indicator; a commit observable on origin/main is the outcome. State the
# difference out loud, because this project has paid for confusing them.
git fetch --quiet origin main
if git merge-base --is-ancestor HEAD origin/main; then
  echo "✅ delivered — local HEAD is on origin/main:"
  git --no-pager log --oneline -1 origin/main
else
  echo "❌ NOT delivered — local HEAD is not an ancestor of origin/main." >&2
  echo "   Something is still unpushed. Do not treat this as filed." >&2
  exit 1
fi
