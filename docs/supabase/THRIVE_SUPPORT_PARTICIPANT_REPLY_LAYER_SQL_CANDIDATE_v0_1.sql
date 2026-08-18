-- THRIVE Support Participant Reply Layer v0.1
-- REVIEW-ONLY SQL CANDIDATE
--
-- Do not execute until live reconciliation, application candidate,
-- build, and controlled installation preflight are complete.
--
-- Scope:
--   1. permit participant_reply entry type
--   2. partition reviewer/participant INSERT authority by entry type
--   3. allow participant self-read of active participant replies
--   4. require exact matching request status = waiting_for_participant
--
-- Preserves:
--   reviewer SELECT
--   reviewer archive authority
--   entry immutability
--   no-hard-delete
--   composite request-scope FK
--   creation-lineage FK

begin;

-- ============================================================
-- 1. Expand entry-type constraint
-- ============================================================

alter table public.support_request_entries
drop constraint support_request_entries_type_check;

alter table public.support_request_entries
add constraint support_request_entries_type_check
check (
  entry_type in (
    'participant_response',
    'participant_reply',
    'internal_note'
  )
);

-- ============================================================
-- 2. Tighten reviewer INSERT authority
-- ============================================================

drop policy if exists support_request_entries_insert_reviewers
on public.support_request_entries;

create policy support_request_entries_insert_reviewers
on public.support_request_entries
for insert
to authenticated
with check (
  created_by = auth.uid()
  and entry_type in ('participant_response', 'internal_note')
  and public.is_support_reviewer(workspace_id)
);

-- ============================================================
-- 3. Add participant reply INSERT authority
-- ============================================================

drop policy if exists support_request_entries_insert_reply_self
on public.support_request_entries;

create policy support_request_entries_insert_reply_self
on public.support_request_entries
for insert
to authenticated
with check (
 entry_type = 'participant_reply'
and created_by = auth.uid()
and public.is_supported_person_self(supported_person_id)
and public.is_program_participant_active(
  supported_person_id,
  program_id,
  workspace_id
)
and exists (
    select 1
    from public.support_requests sr
    where sr.id = support_request_entries.support_request_id
      and sr.workspace_id = support_request_entries.workspace_id
      and sr.program_id = support_request_entries.program_id
      and sr.supported_person_id = support_request_entries.supported_person_id
      and sr.status = 'waiting_for_participant'
  )
);

-- ============================================================
-- 4. Expand participant self-visible entry types
-- ============================================================

drop policy if exists support_request_entries_select_visible_self
on public.support_request_entries;

create policy support_request_entries_select_visible_self
on public.support_request_entries
for select
to authenticated
using (
  entry_type in ('participant_response', 'participant_reply')
  and archived_at is null
  and public.is_supported_person_self(supported_person_id)
);

commit;
