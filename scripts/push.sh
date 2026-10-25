#!/usr/bin/env bash
# Push HEAD to origin/<branch>, up to four tries (2, 4, 8 s apart). Prints "pushed <sha> <subject>" only after
# git push itself succeeded; after the last failed try it says so and exits 1, leaving the commit local.
# Usage: scripts/push.sh <branch>     (tested by scripts/test-push.sh with a remote that refuses pushes)
set -uo pipefail
branch="${1:?usage: scripts/push.sh <branch>}"
for i in 1 2 3 4; do
  if git push -q origin "HEAD:$branch"; then
    git log -1 --format='pushed %h %s'
    exit 0
  fi
  if [ "$i" -lt 4 ]; then echo "push failed (try $i of 4), retrying in $((2 ** i)) s" >&2; sleep $((2 ** i)); fi
done
echo "push failed 4 times: nothing was published, the commit is only local" >&2
exit 1
