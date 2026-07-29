#!/usr/bin/env bash
set -euo pipefail

echo "THRIVE PERSON D WELLNESS CREATE-PATH READ-ONLY PREFLIGHT"
echo "========================================================"

if [ ! -f package.json ] || [ ! -f src/app/wellness/useWellnessCheckinCandidate.ts ]; then
  echo "FAIL: run this from the thrive-stability-platform repository root."
  exit 1
fi

echo
echo "=== CHECKPOINT ==="
git log -1 --oneline
git status -sb

echo
echo "=== WORKING TREE ==="
if [ -n "$(git status --porcelain)" ]; then
  echo "NOTICE: working tree is not clean."
  git status --short
else
  echo "PASS: working tree clean."
fi

echo
echo "=== PERSON D ACTIVATION ENVIRONMENT ==="
printf 'Shell value: <%s>\n' \
  "${NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST-UNSET}"

if grep -q '^NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST=true$' .env.local 2>/dev/null; then
  echo "FAIL: Person D activation is already enabled in .env.local."
  exit 1
elif grep -q '^NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST=' .env.local 2>/dev/null; then
  grep -n '^NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST=' .env.local
  echo "PASS: Person D activation is not true."
else
  echo "PASS: Person D activation variable is absent."
fi

echo
echo "=== CONTROLLED IDENTITIES ==="
grep -n -A 8 'PERSON_D_AUTH_USER_ID' \
  src/app/wellness/useWellnessCheckinCandidate.ts | head -20

echo
echo "=== WRITE GATES ==="
grep -n -C 4 'WRITE_EXECUTION_ENABLED' \
  src/app/wellness/useWellnessCheckinCandidate.ts

echo
echo "=== DISABLED BUTTON ==="
grep -n -F 'disabled={!writeEnabled}' \
  src/app/wellness/WellnessCheckinPreview.tsx

echo
echo "=== WRITE OPERATORS PRESENT BEHIND GATE ==="
grep -nE '\.(insert|update)\(' \
  src/app/wellness/useWellnessCheckinCandidate.ts

echo
echo "=== TARGETED LINT ==="
npx eslint \
  src/app/wellness/page.tsx \
  src/app/wellness/WellnessCheckinCandidate.tsx \
  src/app/wellness/WellnessCheckinPreview.tsx \
  src/app/wellness/useWellnessCheckinCandidate.ts \
  src/app/AuthGate.tsx \
  src/app/ThriveSidebar.tsx

echo
echo "=== PRODUCTION BUILD ==="
npm run build

echo
echo "=== DIFF CHECK ==="
git diff --check

echo
echo "=== FINAL STATUS ==="
git status --short

echo
echo "PREFLIGHT COMPLETE"
echo "No environment variable was changed."
echo "No Wellness record was inserted, updated, archived, or deleted."
echo "Separate explicit approval is required before activation."
