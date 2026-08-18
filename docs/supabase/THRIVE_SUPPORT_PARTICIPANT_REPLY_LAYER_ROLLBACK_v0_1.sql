-- THRIVE Support Participant Reply Layer v0.1
-- REVIEW-ONLY ROLLBACK CANDIDATE
--
-- No hard delete is permitted.
--
-- IMPORTANT:
-- The original two-type constraint can only be restored when
-- no participant_reply rows exist.
--
-- If participant_reply rows already exist, this rollback must stop
-- rather than erase or rewrite historical participant-authored data.

begin;

-- ============================================================
-- 1. Remove participant reply INSERT authority
-- ============================================================

drop policy if exists support_request_entries_insert_reply_self
on public.support_request_entries;

-- ============================================================
-- 2. Restore original reviewer INSERT authority
-- ============================================================

drop policy if exists support_request_entries_insert_reviewers
on public.support_request_entries;

create policy support_request_entries_insert_reviewers
on public.support_request_entries
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_support_reviewer(workspace_id)
);

-- ============================================================
-- 3. Restore original participant self visibility
-- ============================================================

drop policy if exists support_request_entries_select_visible_self
on public.support_request_entries;

create policy support_request_entries_select_visible_self
on public.support_request_entries
for select
to authenticated
using (
  entry_type = 'participant_response'
  and archived_at is null
  and public.is_supported_person_self(supported_person_id)
);

-- ============================================================
-- 4. Refuse unsafe constraint rollback if replies exist
-- ============================================================

do $$
begin
  if exists (
    select 1
    from public.support_request_entries
    where entry_type = 'participant_reply'
  ) then
    raise exception
      'Rollback stopped: participant_reply rows exist and may not be hard-deleted or rewritten';
  end if;
end;
$$;

alter table public.support_request_entries
drop constraint support_request_entries_type_check;

alter table public.support_request_entries
add constraint support_request_entries_type_check
check (
  entry_type in (
    'participant_response',
    'internal_note'
  )
);

commit;
