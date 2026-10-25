#!/usr/bin/env bash
# Checks scripts/push.sh against two throwaway local remotes in a temp folder: one that accepts pushes, one whose
# hook refuses every push. Nothing touches GitHub. Run by npm run check.
set -euo pipefail
push="$(cd "$(dirname "$0")" && pwd)/push.sh"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/push-test.XXXXXX")"
git init -q --bare "$tmp/ok.git"
git init -q --bare "$tmp/no.git"
printf '#!/bin/sh\necho refused >&2\nexit 1\n' > "$tmp/no.git/hooks/pre-receive"
chmod +x "$tmp/no.git/hooks/pre-receive"
# A stand-in for sleep, so the failure path does not really wait 2 + 4 + 8 seconds.
mkdir -p "$tmp/bin"
printf '#!/bin/sh\nexit 0\n' > "$tmp/bin/sleep"
chmod +x "$tmp/bin/sleep"
git init -q -b main "$tmp/w"
cd "$tmp/w"
git -c user.name=t -c user.email=t@example.invalid commit -q --allow-empty -m probe
git remote add origin "$tmp/ok.git"

if ! out="$("$push" main 2>&1)"; then echo "push.sh failed against an accepting remote: $out"; exit 1; fi
printf '%s\n' "$out" | grep -q '^pushed ' || { echo "no 'pushed' line after a successful push: $out"; exit 1; }

git remote set-url origin "$tmp/no.git"
if out="$(PATH="$tmp/bin:$PATH" "$push" main 2>&1)"; then echo "push.sh exited 0 although every push was refused"; exit 1; fi
if printf '%s\n' "$out" | grep -q '^pushed '; then echo "printed 'pushed' although every push was refused: $out"; exit 1; fi
case "$out" in *"push failed 4 times"*) ;; *) echo "no failure message after 4 refused pushes: $out"; exit 1 ;; esac
echo "push.sh: 'pushed' only after a real push; 4 refused pushes exit 1 and say nothing was published"
