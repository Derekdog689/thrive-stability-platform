#!/usr/bin/env bash
set -euo pipefail

echo "THRIVE PARTICIPANT GOALS SCHEMA/RLS CANDIDATE v0.1 INSPECTION"
echo "================================================================"

if [ ! -f package.json ]; then
  echo "FAIL: run from the thrive-stability-platform repository root."
  exit 1
fi

echo
echo "=== CHECKPOINT ==="
git log -1 --oneline
git status -sb

echo
echo "=== REVIEW-ONLY SAFETY CHECK ==="
grep -n -E \
  "Review-only candidate|does not authorize SQL execution|No SQL has been authorized" \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.md \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_EXPECTED_RESULTS_v0_1.md

echo
echo "=== TABLE AND COLUMN CHECK ==="
grep -n -E \
  "create table|workspace_id|program_id|supported_person_id|title text|why_it_matters|next_step|goal_area|progress_status|ownership_source|created_by|archived_at" \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.sql

echo
echo "=== OWNERSHIP BOUNDARY CHECK ==="
grep -n -E \
  "staff_suggestion|participant commitment|ownership_source = 'participant'|Goal identity, ownership" \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.sql \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.md

echo
echo "=== RLS POLICY CHECK ==="
grep -n -E \
  "create policy participant_goals_(select_self|insert_self|update_self|select_workspace_admins|update_workspace_admins)" \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.sql

echo
echo "=== NO DELETE POLICY CHECK ==="
if grep -nEi "create policy .*delete|for delete" \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.sql; then
  echo "FAIL: DELETE policy found."
  exit 1
else
  echo "PASS: no DELETE policy proposed."
fi

echo
echo "=== ROLLBACK CHECK ==="
grep -n -E \
  "drop policy|drop trigger|drop function|drop table|rollback;" \
  docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_ROLLBACK_v0_1.sql

echo
echo "=== CANDIDATE ENDING CHECK ==="
tail -n 4 docs/THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.sql

echo
echo "=== DIFF CHECK ==="
git diff --check

echo
echo "=== STATUS ==="
git status --short

echo
echo "INSPECTION COMPLETE"
echo "No SQL, schema, policy, trigger, data, environment variable, or UI behavior was changed."
