#!/usr/bin/env bash
#
# relay-push.sh — one-command commit+push for Relay's session output.
#
# Relay (the Cowork agent operating Xian's Mac) can write files but cannot
# commit or push: its sandbox has no SSH key, no gh, no GitHub credentials.
# Every memo and log therefore needs a human to land it — and on 2026-07-25
# that gap silently ate a memo answering Coral's four status questions,
# written but never committed and so never delivered.
#
# Usage:
#   bash scripts/relay-push.sh "Relay: what changed" [extra/path ...]
#
# ---------------------------------------------------------------------------
# 2026-08-04 — REWRITTEN after this script committed the exact sin it exists
# to prevent.
#
# v1 staged only store/ and docs/mail/. That was meant as a safety scope. In
# practice it meant:
#
#   * it could not deliver its own bug fix (scripts/ was out of scope), so a
#     fix to this file sat uncommitted for a day while everyone believed it
#     had landed; and
#   * it printed "✅ delivered" anyway, because the check only asked "is HEAD
#     an ancestor of origin/main?" — which is TRUE when nothing was staged and
#     the changes are still sitting in the working tree.
#
# A success signal that cannot observe the thing it claims is worse than no
# signal, because it actively stops you looking. That is the house lesson
# (deploys, export toasts, the type-checker that checked nothing, the stale
# issue navigator) and this script had to learn it the same way.
#
# v2 therefore:
#   * stages scripts/ too, and accepts extra paths as arguments;
#   * after committing, LISTS any tracked file still uncommitted and states
#     plainly that it was NOT delivered;
#   * only says "delivered" when HEAD is on origin/main AND nothing tracked
#     is left behind.
# ---------------------------------------------------------------------------

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: bash scripts/relay-push.sh \"commit message\" [extra/path ...]" >&2
  exit 1
fi

MSG="$1"
shift
EXTRA=("$@")

cd "$(git rev-parse --show-toplevel)"

# Merge on pull, so a busy main never stops us with a divergence prompt.
git config pull.rebase false

# Relay's output areas. scripts/ is included precisely so this file can
# deliver its own fixes — the omission that caused the 08-04 failure.
SCOPE=(store docs/mail scripts)

echo "== staging: ${SCOPE[*]} ${EXTRA[*]:-} =="
git add -- "${SCOPE[@]}" ${EXTRA[@]+"${EXTRA[@]}"}

if git diff --cached --quiet; then
  echo "nothing staged — no changes in scope"
else
  git diff --cached --name-status
  echo
  echo "== committing as Relay =="
  # Per-commit identity: keeps history legible without touching repo config.
  git -c user.name="Relay" -c user.email="relay@onejob.co" commit -m "$MSG"
fi

echo
echo "== syncing with origin =="
git pull origin main
git push origin main

echo
echo "== VERIFYING what actually reached origin/main =="
git fetch --quiet origin main

# Anything tracked and still modified was NOT delivered, regardless of what
# the push said. This is the check v1 lacked.
LEFTOVER="$(git status --porcelain --untracked-files=no)"

if ! git merge-base --is-ancestor HEAD origin/main; then
  echo "❌ NOT delivered — local HEAD is not an ancestor of origin/main." >&2
  echo "   Something is still unpushed. Do not treat this as filed." >&2
  exit 1
fi

echo "on origin/main: $(git --no-pager log --oneline -1 origin/main)"

if [ -n "$LEFTOVER" ]; then
  echo
  echo "⚠️  PARTIAL — the commit landed, but these tracked files are STILL" >&2
  echo "    uncommitted and were NOT delivered:" >&2
  echo "$LEFTOVER" | sed 's/^/      /' >&2
  echo >&2
  echo "    Add them deliberately, or pass them as extra arguments:" >&2
  echo "      bash scripts/relay-push.sh \"msg\" <path> ..." >&2
  exit 2
fi

echo "✅ delivered — commit is on origin/main and no tracked changes remain."
