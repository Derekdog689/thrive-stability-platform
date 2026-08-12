-- THRIVE Wellness Multi-Check-In v0.2
-- REVIEW-ONLY SCHEMA CANDIDATE
--
-- Purpose:
-- Allow a supported person to save multiple independent Wellness
-- reflections during the same THRIVE business date.
--
-- This candidate does NOT:
-- - modify existing Wellness rows;
-- - archive or delete any Wellness row;
-- - change Wellness RLS policies;
-- - change participant identity or program scope;
-- - change support_request_links;
-- - change the Wellness check-in table columns;
-- - change the participant update policy;
-- - change the America/New_York business-date convention;
-- - create analytics or conclusions;
-- - synchronize with the Trust Engine.
--
-- Behavioral model:
-- - a change in state is represented by a NEW check-in;
-- - an existing check-in may be corrected only under the existing
--   same-day participant update rules;
-- - each check-in remains independently identified by its UUID
--   and created_at timestamp;
-- - checkin_date remains the THRIVE business-date grouping field.

begin;

-- -------------------------------------------------------------------
-- 1. PRECONDITION
-- Confirm that the currently installed single-active-check-in-per-day
-- index is the expected index before removing it.
-- -------------------------------------------------------------------

do $$
declare
  v_indexdef text;
begin
  select indexdef
    into v_indexdef
  from pg_indexes
  where schemaname = 'public'
    and indexname = 'participant_wellness_checkins_one_active_day_idx';

  if v_indexdef is null then
    raise exception
      'Expected Wellness single-active-day index was not found';
  end if;

  if v_indexdef not ilike
       '%participant_wellness_checkins%supported_person_id, checkin_date%'
     or v_indexdef not ilike
       '%status = ''active''%'
  then
    raise exception
      'Wellness single-active-day index does not match the reviewed definition';
  end if;
end;
$$;

-- -------------------------------------------------------------------
-- 2. PERFORMANCE GUARD
-- The existing descending person/date index should remain available
-- for recent-history reads after uniqueness is removed.
-- -------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'participant_wellness_checkins_person_date_idx'
  ) then
    raise exception
      'Expected Wellness person/date history index was not found';
  end if;
end;
$$;

-- -------------------------------------------------------------------
-- 3. SCHEMA CHANGE
-- Remove ONLY the rule that limits a supported person to one active
-- Wellness reflection per calendar/business date.
-- -------------------------------------------------------------------

drop index public.participant_wellness_checkins_one_active_day_idx;

-- -------------------------------------------------------------------
-- 4. POSTCONDITION
-- Confirm the single-active-day uniqueness rule is gone while the
-- history lookup index remains.
-- -------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'participant_wellness_checkins_one_active_day_idx'
  ) then
    raise exception
      'Wellness single-active-day index still exists after candidate migration';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'participant_wellness_checkins_person_date_idx'
  ) then
    raise exception
      'Wellness history lookup index is missing after candidate migration';
  end if;
end;
$$;

commit;