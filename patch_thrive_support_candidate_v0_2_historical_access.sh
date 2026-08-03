#!/usr/bin/env bash
set -euo pipefail

FILE="docs/supabase/THRIVE_SUPPORT_REQUEST_SCHEMA_RLS_EXECUTABLE_CANDIDATE_v0_2.sql"

if [[ ! -f "$FILE" ]]; then
  echo "Missing candidate: $FILE" >&2
  exit 1
fi

python - "$FILE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
original = text

def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)

replace_once(
"""    new.withdrawn_at := coalesce(new.withdrawn_at, now());
    new.completed_at := null;
    new.archived_at := null;
    return new;""",
"""    new.withdrawn_at := now();
    new.completed_at := null;
    new.archived_at := null;
    return new;""",
"participant withdrawal timestamp",
)

replace_once(
"""  if old.status = 'archived' then
    raise exception 'Archived Support requests are terminal';
  end if;

  if new.status is distinct from old.status then""",
"""  if old.status = 'archived' then
    raise exception 'Archived Support requests are terminal';
  end if;

  if old.status in ('completed', 'withdrawn')
    and new.status <> 'archived'
  then
    raise exception
      'Completed and withdrawn Support requests may only move to archived';
  end if;

  if new.status is distinct from old.status then""",
"terminal lifecycle guard",
)

replace_once(
"""  elsif new.status = 'completed' then
    new.completed_at := coalesce(old.completed_at, new.completed_at, now());
    new.withdrawn_at := null;
    new.archived_at := null;
  elsif new.status = 'archived' then
    new.archived_at := coalesce(new.archived_at, now());
    if old.status = 'completed' then
      new.completed_at := coalesce(old.completed_at, now());
      new.withdrawn_at := null;
    elsif old.status = 'withdrawn' then
      new.withdrawn_at := coalesce(old.withdrawn_at, now());
      new.completed_at := null;""",
"""  elsif new.status = 'completed' then
    new.completed_at := now();
    new.withdrawn_at := null;
    new.archived_at := null;
  elsif new.status = 'archived' then
    new.archived_at := now();
    if old.status = 'completed' then
      new.completed_at := old.completed_at;
      new.withdrawn_at := null;
    elsif old.status = 'withdrawn' then
      new.withdrawn_at := old.withdrawn_at;
      new.completed_at := null;""",
"database lifecycle timestamps",
)

replace_once(
"""create trigger support_request_links_scope_guard
before insert or update on public.support_request_links
for each row
execute function public.validate_support_link_scope();""",
"""create trigger support_request_links_scope_guard
before insert or update of
  workspace_id,
  program_id,
  supported_person_id,
  support_request_id,
  staged_transaction_id,
  budget_category_id,
  budget_period_id,
  wellness_checkin_id,
  goal_id,
  prior_support_request_id
on public.support_request_links
for each row
execute function public.validate_support_link_scope();""",
"link scope trigger",
)

replace_once(
"""using (
  is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

create policy support_requests_select_reviewers""",
"""using (
  is_supported_person_self(supported_person_id)
);

create policy support_requests_select_reviewers""",
"request historical select",
)

replace_once(
"""using (
  status = 'submitted'
  and is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
)
with check (
  status = 'withdrawn'
  and withdrawn_at is not null
  and is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);""",
"""using (
  status = 'submitted'
  and is_supported_person_self(supported_person_id)
)
with check (
  status = 'withdrawn'
  and withdrawn_at is not null
  and is_supported_person_self(supported_person_id)
);""",
"historical withdrawal",
)

replace_once(
"""with check (
  is_support_reviewer(workspace_id)
  and is_program_in_workspace(program_id, workspace_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);""",
"""with check (
  is_support_reviewer(workspace_id)
  and is_program_in_workspace(program_id, workspace_id)
  and is_supported_person_in_workspace(
    supported_person_id,
    workspace_id
  )
);""",
"reviewer historical workflow",
)

replace_once(
"""using (
  entry_type = 'participant_response'
  and archived_at is null
  and is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);""",
"""using (
  entry_type = 'participant_response'
  and archived_at is null
  and is_supported_person_self(supported_person_id)
);""",
"entry historical select",
)

replace_once(
"""using (
  archived_at is null
  and is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);""",
"""using (
  archived_at is null
  and is_supported_person_self(supported_person_id)
);""",
"link historical select",
)

replace_once(
"""using (
  event_type = 'status_changed'
  and is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);""",
"""using (
  event_type = 'status_changed'
  and is_supported_person_self(supported_person_id)
);""",
"event historical select",
)

replace_once(
"""with check (
  created_by = auth.uid()
  and archived_at is null
  and is_supported_person_self(supported_person_id)
  and exists (""",
"""with check (
  created_by = auth.uid()
  and archived_at is null
  and is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
  and exists (""",
"active participation for new links",
)

if text == original:
    raise SystemExit("No changes made.")

path.write_text(text, encoding="utf-8")
print(f"Patched {path}")
PY

echo
echo "Targeted verification:"
grep -nE \
  "Completed and withdrawn|new\.withdrawn_at := now|new\.completed_at := now|new\.archived_at := now|before insert or update of|support_requests_select_self|support_requests_withdraw_self|support_requests_update_reviewers|support_request_entries_select_visible_self|support_request_links_select_self|support_request_status_events_select_visible_self" \
  "$FILE"

echo
echo "Transaction guard:"
grep -nE '^(begin;|commit;|rollback;)$' "$FILE"

echo
echo "No database SQL was executed."
