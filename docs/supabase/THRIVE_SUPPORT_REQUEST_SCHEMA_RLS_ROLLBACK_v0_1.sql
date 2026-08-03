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
