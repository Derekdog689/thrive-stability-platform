-- THRIVE PARTICIPANT BUDGET VISIBILITY VERIFICATION v0.1
-- Run each block while impersonating the named authenticated identity.

-- ============================================================
-- PERSON D
-- Expected: 1 period, 4 lines
-- dstein561+thrive-onboarding-person-d@gmail.com
-- ============================================================

select count(*) as my_period_count
from public.participant_budget_periods;

select count(*) as my_line_count
from public.participant_budget_lines;

select
  p.id,
  p.period_start,
  p.period_end,
  p.status,
  p.expected_income,
  count(l.id) as line_count,
  coalesce(sum(l.planned_amount), 0) as planned_total,
  coalesce(sum(l.actual_amount), 0) as actual_total,
  coalesce(sum(l.remaining_amount), 0) as remaining_total
from public.participant_budget_periods p
left join public.participant_budget_lines l
  on l.budget_period_id = p.id
group by
  p.id,
  p.period_start,
  p.period_end,
  p.status,
  p.expected_income
order by p.period_start;

-- ============================================================
-- PERSON A
-- Expected: 0 periods, 0 lines
-- dstein561+thrive-rls-person-a@gmail.com
-- ============================================================

select count(*) as my_period_count
from public.participant_budget_periods;

select count(*) as my_line_count
from public.participant_budget_lines;

-- ============================================================
-- OUTSIDER
-- Expected: 0 periods, 0 lines
-- dstein561+thrive-rls-outsider@gmail.com
-- ============================================================

select count(*) as my_period_count
from public.participant_budget_periods;

select count(*) as my_line_count
from public.participant_budget_lines;
