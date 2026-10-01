-- THRIVE Wellness lifecycle controlled install candidate v0.1
-- REVIEW ONLY. DO NOT EXECUTE WITHOUT EXPLICIT APPROVAL.
--
-- Contract:
-- - One persisted row = one completed Wellness moment.
-- - checkin_depth records quick vs expanded completion.
-- - stored 'hard' remains canonical and is rendered participant-facing as 'Struggling'.
-- - 'better' becomes a distinct stored overall_day value.
-- - historical checkin_depth is not fabricated.
-- - existing RLS, archive semantics, indexes, FKs, and historical rows remain unchanged.

begin;

do $$
declare
  v_overall_def text;
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public'
      and table_name='participant_wellness_checkins'
      and column_name='checkin_depth'
  ) then
    raise exception 'Preflight failed: checkin_depth already exists.';
  end if;

  select pg_get_constraintdef(c.oid)
    into v_overall_def
  from pg_constraint c
  where c.conrelid='public.participant_wellness_checkins'::regclass
    and c.conname='participant_wellness_checkins_overall_day_check';

  if v_overall_def is null
     or v_overall_def not like '%good%'
     or v_overall_def not like '%okay%'
     or v_overall_def not like '%hard%'
     or v_overall_def not like '%not_sure%' then
    raise exception 'Preflight failed: unexpected overall_day constraint: %', v_overall_def;
  end if;
end
$$;

alter table public.participant_wellness_checkins
  add column checkin_depth text null;

alter table public.participant_wellness_checkins
  add constraint participant_wellness_checkins_depth_check
  check (
    checkin_depth is null
    or checkin_depth = any (
      array['quick'::text,'expanded'::text]
    )
  );

comment on column public.participant_wellness_checkins.checkin_depth is
  'Completed Wellness reflection depth: quick or expanded. Historical rows may remain null when original depth is unknown.';

alter table public.participant_wellness_checkins
  add constraint participant_wellness_checkins_overall_day_check_v2
  check (
    overall_day = any (
      array[
        'good'::text,
        'better'::text,
        'okay'::text,
        'hard'::text,
        'not_sure'::text
      ]
    )
  ) not valid;

alter table public.participant_wellness_checkins
  validate constraint participant_wellness_checkins_overall_day_check_v2;

alter table public.participant_wellness_checkins
  drop constraint participant_wellness_checkins_overall_day_check;

alter table public.participant_wellness_checkins
  rename constraint participant_wellness_checkins_overall_day_check_v2
  to participant_wellness_checkins_overall_day_check;

commit;

-- Post-commit read-only verification:
-- 1. checkin_depth exists and is nullable.
-- 2. depth constraint permits null|quick|expanded.
-- 3. overall_day permits good|better|okay|hard|not_sure.
-- 4. RLS policies, indexes, FKs, archive semantics, and historical rows are unchanged.
