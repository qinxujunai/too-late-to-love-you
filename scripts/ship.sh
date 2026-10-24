#!/usr/bin/env bash
# One command from a finished change to live: build, check, commit as the owner, rebase on GitHub, push.
# Usage: npm run ship -- "what changed"
set -euo pipefail
msg="${1:?usage: npm run ship -- \"what changed\"}"
who=(-c user.name=qinxujunai -c user.email=266454737+qinxujunai@users.noreply.github.com)
branch="$(git branch --show-current)"
npm run -s build >/dev/null
npm run -s check
git add -A
git "${who[@]}" commit -q -m "$msg"
git pull -q --rebase origin "$branch"
# Someone else (a scheduled data update) may have landed first: rebuild so the pages match the merged data.
npm run -s build >/dev/null
if ! git diff --quiet; then git add -A; git "${who[@]}" commit -q -m "Rebuild after rebase"; fi
for i in 1 2 3 4; do git push -q origin "HEAD:$branch" && break; sleep $((2**i)); done
git log -1 --format='pushed %h %s'
