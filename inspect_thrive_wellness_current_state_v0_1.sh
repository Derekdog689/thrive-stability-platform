#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src/app ]; then
  echo "Run this from the thrive-stability-platform repository root."
  exit 1
fi

echo "=== CHECKPOINT ==="
git log -1 --oneline

echo
echo "=== STATUS ==="
git status --short

echo
echo "=== WELLNESS-RELATED FILES ==="
find src docs -type f \
  \( -iname '*wellness*' -o -iname '*checkin*' -o -iname '*check_in*' -o -iname '*reflection*' -o -iname '*mood*' \) \
  -print | sort

echo
echo "=== WELLNESS SOURCE REFERENCES ==="
grep -RInE \
  'wellness|check.?in|reflection|mood|stress|sleep|energy|confidence|support needed' \
  src docs \
  --exclude-dir=.next \
  --exclude-dir=node_modules \
  | head -n 500 || true

echo
echo "=== CURRENT WELLNESS PAGE ==="
sed -n '1,260p' src/app/wellness/page.tsx

echo
echo "=== SHARED NAVIGATION ==="
sed -n '1,220p' src/app/ThriveNavigation.tsx

echo
echo "=== AUTH AND PARTICIPANT DATA PATTERNS ==="
sed -n '1,260p' src/app/AuthGate.tsx
sed -n '1,320p' src/app/useParticipantFinancial.ts

echo
echo "=== SUPABASE FILES ==="
find supabase docs -maxdepth 3 -type f \
  \( -name '*.sql' -o -name '*.md' \) \
  -print | sort | head -n 500

echo
echo "=== COMPLETE ==="
echo "No files were changed."
