-- THRIVE Wellness lifecycle schema candidate v0.1
-- REVIEW ONLY. DO NOT EXECUTE UNTIL EXPLICITLY APPROVED.
--
-- Purpose:
-- 1. Record whether a completed Wellness moment was quick or expanded.
-- 2. Add 'better' as a legitimate stored overall_day value.
-- 3. Preserve all existing rows, RLS policies, indexes, foreign keys, and archive behavior.
--
-- Existing 'hard' storage value is intentionally retained.
-- Participant-facing presentation MUST map 'hard' -> 'Struggling'.
-- Historical rows are not backfilled with checkin_depth because their original depth is not known.

begin;

alter table public.participant_wellness_checkins
  add column checkin_depth text null;

alter table public.participant_wellness_checkins
  add constraint participant_wellness_checkins_depth_check
  check (
    checkin_depth is null
    or checkin_depth = any (
      array[
        'quick'::text,
        'expanded'::text
      ]
    )
  );

alter table public.participant_wellness_checkins
  drop constraint participant_wellness_checkins_overall_day_check;

alter table public.participant_wellness_checkins
  add constraint participant_wellness_checkins_overall_day_check
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
  );

comment on column public.participant_wellness_checkins.checkin_depth is
  'How much participant reflection was intentionally completed for this Wellness moment: quick or expanded. Null is retained for historical rows whose original depth is unknown.';

commit;
