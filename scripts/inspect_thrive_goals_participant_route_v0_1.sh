#!/usr/bin/env bash
set -euo pipefail

echo "THRIVE GOALS PARTICIPANT-ROUTE READ-ONLY INSPECTION"
echo "==================================================="

if [ ! -f package.json ] || [ ! -f src/app/goals/page.tsx ]; then
  echo "FAIL: run from the thrive-stability-platform repository root."
  exit 1
fi

echo
echo "=== CHECKPOINT ==="
git log -1 --oneline
git status -sb

echo
echo "=== CURRENT GOALS ROUTE ==="
sed -n '1,240p' src/app/goals/page.tsx

echo
echo "=== GOAL-RELATED REPOSITORY FILES ==="
find docs scripts src -type f \
  \( -iname '*goal*' -o -iname '*goals*' \) \
  -print | sort

echo
echo "=== GOAL-RELATED SYMBOLS AND SQL ==="
grep -RniE \
  "participant_goal|participant goals|goal_owner|goal area|goal_area|chosen goal|staff-suggested|staff suggested|create table.*goal|policy.*goal" \
  docs scripts src \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  || true

echo
echo "=== HARD-DELETE CHECK IN GOALS MATERIAL ==="
grep -RniE \
  "delete from|\.delete\(" \
  src/app/goals docs scripts \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  || echo "PASS: no goal-related hard-delete operator found in inspected files"

echo
echo "=== ROUTE TECHNICAL-LANGUAGE CHECK ==="
grep -nEi \
  "future|shell|RLS|workflow|participant-written|creation is not available" \
  src/app/goals/page.tsx \
  || true

echo
echo "=== DIFF CHECK ==="
git diff --check

echo
echo "=== STATUS ==="
git status --short

echo
echo "INSPECTION COMPLETE"
echo "No code, SQL, database record, environment variable, or route behavior was changed."
