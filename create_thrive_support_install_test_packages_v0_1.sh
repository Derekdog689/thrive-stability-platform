#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

SOURCE_SQL="docs/supabase/THRIVE_SUPPORT_REQUEST_SCHEMA_RLS_EXECUTABLE_CANDIDATE_v0_2.sql"
INSTALL_SQL="docs/supabase/THRIVE_SUPPORT_REQUEST_SCHEMA_RLS_INSTALL_CANDIDATE_v0_1.sql"
ROLLBACK_SQL="docs/supabase/THRIVE_SUPPORT_REQUEST_SCHEMA_RLS_ROLLBACK_v0_1.sql"
VERIFY_MD="docs/THRIVE_SUPPORT_REQUEST_POST_INSTALL_VERIFICATION_v0_1.md"
TEST_MD="docs/THRIVE_SUPPORT_REQUEST_AUTHENTICATED_TEST_EXECUTION_PLAN_v0_1.md"

if [[ ! -f "$SOURCE_SQL" ]]; then
  echo "Missing source candidate: $SOURCE_SQL" >&2
  exit 1
fi

python - "$SOURCE_SQL" "$INSTALL_SQL" <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1])
target = Path(sys.argv[2])
text = source.read_text(encoding="utf-8")

if not text.startswith("-- THRIVE Support Request Schema and RLS Executable Candidate v0.2"):
    raise SystemExit("Unexpected source header. Refusing to derive install candidate.")

stripped = text.rstrip()
if not stripped.endswith("rollback;"):
    raise SystemExit("Source does not end with rollback;. Refusing to derive install candidate.")

body = stripped[:-len("rollback;")] + "commit;\n"
body = body.replace(
    "-- THRIVE Support Request Schema and RLS Executable Candidate v0.2",
    "-- THRIVE Support Request Schema and RLS Install Candidate v0.1",
    1,
)
body = body.replace(
    "-- REVIEW ONLY. DO NOT EXECUTE WITHOUT A SEPARATE INSTALL APPROVAL.",
    "-- INSTALL CANDIDATE. DO NOT EXECUTE WITHOUT EXPLICIT INSTALL APPROVAL.",
    1,
)

target.write_text(body, encoding="utf-8")
PY

cat > "$ROLLBACK_SQL" <<'SQL'
-- THRIVE Support Request Schema and RLS Rollback Candidate v0.1
-- DO NOT EXECUTE WITHOUT EXPLICIT ROLLBACK APPROVAL.
--
-- Purpose:
-- Remove only the Support v0.1 schema objects created by the approved install
-- candidate. Existing participant, program, financial, Wellness, and Goals
-- records are not deleted.
--
-- This rollback removes Support records because their tables are removed.
-- Run only before real participant use or under separately approved migration
-- and preservation instructions.

begin;

drop table if exists public.support_request_status_events;
drop table if exists public.support_request_links;
drop table if exists public.support_request_entries;
drop table if exists public.support_requests;

drop function if exists public.prevent_support_hard_delete();
drop function if exists public.prevent_support_status_event_mutation();
drop function if exists public.record_support_child_archive_event();
drop function if exists public.protect_support_link_archive();
drop function if exists public.validate_support_link_scope();
drop function if exists public.protect_support_entry_immutability();
drop function if exists public.record_support_request_events();
drop function if exists public.protect_support_request_scope_and_lifecycle();
drop function if exists public.validate_support_assignment();
drop function if exists public.set_support_request_updated_at();
drop function if exists public.is_support_reviewer(uuid);

alter table public.participant_wellness_checkins
  drop constraint if exists participant_wellness_support_link_scope_unique;

alter table public.participant_goals
  drop constraint if exists participant_goals_support_link_scope_unique;

alter table public.participant_budget_periods
  drop constraint if exists participant_budget_periods_support_link_scope_unique;

alter table public.budget_categories
  drop constraint if exists budget_categories_support_link_scope_unique;

commit;
SQL

cat > "$VERIFY_MD" <<'MD'
# THRIVE Support Request Post-Install Verification v0.1

## Status

Read-only verification package.

Do not run until the Support install candidate has received explicit approval
and has completed successfully.

## Frozen boundaries

This verification does not authorize:

- participant Support use;
- synthetic data creation;
- Johnny activation;
- notifications;
- emergency workflows;
- Trust Engine synchronization;
- deployment;
- service-role client use;
- push or merge.

## 1. Table and RLS verification

```sql
select
  n.nspname as table_schema,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by c.relname;
```

Expected:

- four rows;
- `rls_enabled = true`;
- `rls_forced = true`.

## 2. Column verification

```sql
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by table_name, ordinal_position;
```

## 3. Constraint verification

```sql
select
  conrelid::regclass::text as table_name,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.support_requests'::regclass,
    'public.support_request_entries'::regclass,
    'public.support_request_links'::regclass,
    'public.support_request_status_events'::regclass
  )
order by table_name, constraint_name;
```

Confirm:

- scoped foreign keys;
- category and status checks;
- text-length checks;
- exactly-one-link-target check;
- archive consistency checks;
- no cascade delete.

## 4. Function verification

```sql
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_support_reviewer',
    'set_support_request_updated_at',
    'validate_support_assignment',
    'protect_support_request_scope_and_lifecycle',
    'record_support_request_events',
    'protect_support_entry_immutability',
    'validate_support_link_scope',
    'protect_support_link_archive',
    'record_support_child_archive_event',
    'prevent_support_status_event_mutation',
    'prevent_support_hard_delete'
  )
order by p.proname;
```

Expected: eleven functions.

## 5. Trigger verification

```sql
select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by event_object_table, trigger_name, event_manipulation;
```

Confirm:

- lifecycle and scope protection;
- assignment validation;
- updated-at behavior;
- event recording;
- entry and link archive protection;
- status-event immutability;
- hard-delete prevention.

## 6. Policy verification

```sql
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by tablename, policyname;
```

Confirm:

- participant self-select and insert;
- participant withdrawal only;
- participant-visible entry and event reads;
- reviewer reads and controlled updates;
- no DELETE policy;
- no participant entry insert;
- no direct status-event insert.

## 7. Privilege verification

```sql
select
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by table_name, grantee, privilege_type;
```

Confirm:

- no `anon` privileges;
- `authenticated` has only the intended table privileges.

## 8. Existing-schema preservation

```sql
select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'supported_people',
    'programs',
    'program_participants',
    'participant_goals',
    'participant_wellness_checkins',
    'participant_budget_periods',
    'budget_categories',
    'staged_financial_transactions',
    'financial_source_owners'
  )
order by table_name;
```

Expected: all existing source tables remain.

## 9. Empty-state verification

```sql
select 'support_requests' as object_name, count(*) as row_count
from public.support_requests
union all
select 'support_request_entries', count(*)
from public.support_request_entries
union all
select 'support_request_links', count(*)
from public.support_request_links
union all
select 'support_request_status_events', count(*)
from public.support_request_status_events;
```

Expected immediately after installation: zero rows in all four tables.

## Closeout requirement

Record:

- installation timestamp;
- exact SQL candidate path;
- executing database role;
- verification results;
- any discrepancies;
- confirmation that no synthetic or real participant rows were created.

## Exact next gate

Only after every verification passes may authenticated synthetic testing be
considered for separate execution approval.
MD

cat > "$TEST_MD" <<'MD'
# THRIVE Support Request Authenticated Test Execution Plan v0.1

## Status

Execution-ready planning package, not approved for execution.

The Support schema must first be installed and pass the separate post-install
verification gate.

## Test method

Use normal authenticated Supabase browser clients or the existing application
client. Do not use a service-role client to prove participant or reviewer
access.

Record the exact actor, workspace, program, supported-person ID, request ID,
entry ID, link ID, and resulting error or success for every test.

## Required actors

- Participant D;
- Participant A;
- outsider;
- active same-workspace `support` member;
- active same-workspace admin;
- inactive or removed `support` member.

## Gate 1: identity and reviewer proof

For every actor:

1. authenticate normally;
2. record `auth.uid()`;
3. resolve workspace membership;
4. verify `is_support_reviewer(workspace_id)`:
   - true only for active `admin` or `support`;
   - false for participants, outsiders, viewers, trustees, and inactive members.

## Gate 2: Participant D request creation

Create one synthetic request using Participant D's resolved:

- workspace;
- active program;
- supported-person identity.

Use a clearly synthetic category and message.

Expected:

- insert succeeds;
- status is `submitted`;
- routing and assignment are null;
- one `null -> submitted` status event exists.

Negative tests:

- Participant A ID rejected;
- alternate workspace rejected;
- alternate program rejected;
- inactive participation rejected;
- blank message rejected;
- oversize message rejected;
- participant-supplied routing or assignment rejected.

## Gate 3: participant read isolation

Participant D:

- sees own request;
- sees own participant-visible events;
- cannot see internal notes.

Participant A:

- cannot see Participant D request, entries, links, or events.

Outsider:

- sees no Support records.

## Gate 4: submitted-request link behavior

While Participant D request is `submitted`:

- create a same-scope Goal link;
- create a same-scope Wellness link;
- create a same-scope budget-category or budget-period link;
- create a same-scope staged-transaction link only where active
  `financial_source_owners` proves ownership.

Reject:

- cross-person link;
- cross-program link;
- cross-workspace link;
- two targets in one link row;
- self-referencing prior Support request;
- prior request that is not completed.

Archive one mistaken link:

- participant archive succeeds only while request remains `submitted`;
- archive reason required;
- no hard delete occurs.

## Gate 5: participant withdrawal

Create a second Participant D request.

Expected:

- `submitted -> withdrawn` succeeds;
- `withdrawn_at` populated;
- participant-authored content unchanged;
- status event created;
- request cannot reopen;
- reviewer may later archive it while preserving `withdrawn_at`.

## Gate 6: reviewer workflow

Using active same-workspace `support` member:

- select Participant D submitted request;
- verify direct `submitted -> archived` fails;
- move `submitted -> acknowledged`;
- set routing category without changing participant category;
- assign an active same-workspace `admin` or `support` membership row;
- reject assignment to inactive, outsider, viewer, trustee, individual, or
  cross-workspace member;
- move through `in_progress`;
- move to `waiting_for_participant`;
- return to `in_progress`;
- complete request;
- verify `completed_at`;
- reject reopening;
- archive completed request;
- verify `completed_at` remains and `archived_at` is populated.

## Gate 7: entries

Reviewer creates:

- one `participant_response`;
- one `internal_note`.

Expected:

- Participant D sees participant response only;
- Participant A and outsider see neither;
- reviewer sees both.

Archive a mistaken entry:

- content remains immutable;
- archive reason required;
- participant response disappears from normal participant view;
- reviewer audit history retains it;
- hard delete fails.

## Gate 8: status and audit events

Confirm immutable events for:

- initial submission;
- withdrawal;
- acknowledgment;
- status transitions;
- routing change;
- assignment change;
- entry archive;
- link archive.

Participant sees only participant-facing status events.

Reviewer sees all authorized events.

Direct status-event insert, update, and delete must fail through normal clients.

## Gate 9: inactive reviewer

Change or use a synthetic member whose `member_role = support` but status is not
active.

Expected:

- reviewer helper returns false;
- request select and update denied;
- entry insert denied;
- assignment and archive denied.

Do not modify a real operational member for this test.

## Gate 10: no-delete proof

Through each authenticated actor, attempt DELETE on all four Support tables.

Expected: every DELETE fails.

## Cross-module boundary proof

Verify that Support actions do not mutate:

- participant Goals;
- Wellness check-ins;
- transactions;
- budget periods or categories;
- program participation;
- Trust Engine records.

No link or request establishes intent, responsibility, relapse, incapacity,
misuse, consent for sharing, or external authority.

## Synthetic closeout

After testing:

- archive synthetic requests through approved lifecycle paths;
- do not hard delete;
- preserve synthetic history;
- mark every ID as synthetic in the test record;
- document pass/fail results and screenshots;
- confirm no service-role client was used.

## Stop conditions

Stop immediately if:

- one participant can see another participant's record;
- an outsider receives data;
- internal notes are participant-visible;
- a terminal request reopens;
- source records change through Support;
- DELETE succeeds;
- a reviewer acts outside their workspace;
- any Trust Engine or emergency action occurs.

## Exact next gate

After controlled execution, produce an authenticated Support validation
closeout. General participant activation remains separately gated.
MD

echo "Created:"
printf '  %s\n' "$INSTALL_SQL" "$ROLLBACK_SQL" "$VERIFY_MD" "$TEST_MD"
echo
echo "Safety checks:"

python - "$SOURCE_SQL" "$INSTALL_SQL" <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1]).read_text(encoding="utf-8").rstrip()
install = Path(sys.argv[2]).read_text(encoding="utf-8").rstrip()

normalized_source = source.replace(
    "-- THRIVE Support Request Schema and RLS Executable Candidate v0.2",
    "-- THRIVE Support Request Schema and RLS Install Candidate v0.1",
    1,
).replace(
    "-- REVIEW ONLY. DO NOT EXECUTE WITHOUT A SEPARATE INSTALL APPROVAL.",
    "-- INSTALL CANDIDATE. DO NOT EXECUTE WITHOUT EXPLICIT INSTALL APPROVAL.",
    1,
)

expected = normalized_source[:-len("rollback;")] + "commit;"
if install != expected:
    raise SystemExit("Install candidate differs from validated source beyond approved header and final transaction changes.")

print("  Install candidate matches validated v0.2 body.")
print("  Final install statement:", install.splitlines()[-1])
PY

grep -nE '^(begin;|commit;|rollback;)$' "$INSTALL_SQL"
grep -nE '^(begin;|commit;|rollback;)$' "$ROLLBACK_SQL"

echo
echo "No database SQL was executed."
