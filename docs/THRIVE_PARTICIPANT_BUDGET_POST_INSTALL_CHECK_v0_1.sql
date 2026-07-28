-- THRIVE PARTICIPANT BUDGET POST-INSTALL CHECK v0.1
-- Run as fixture workspace admin.

select
  p.id as budget_period_id,
  p.workspace_id,
  p.program_id,
  p.supported_person_id,
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
where p.id = '73000000-0000-4000-8000-000000000001'::uuid
group by
  p.id,
  p.workspace_id,
  p.program_id,
  p.supported_person_id,
  p.period_start,
  p.period_end,
  p.status,
  p.expected_income;

select
  category_name,
  category_type,
  planned_amount,
  actual_amount,
  remaining_amount,
  sort_order,
  is_active
from public.participant_budget_lines
where budget_period_id =
  '73000000-0000-4000-8000-000000000001'::uuid
order by sort_order;
