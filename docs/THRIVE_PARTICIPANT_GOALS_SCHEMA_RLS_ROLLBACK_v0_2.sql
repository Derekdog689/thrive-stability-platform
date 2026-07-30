begin;

drop policy if exists participant_goals_update_workspace_admins
  on public.participant_goals;

drop policy if exists participant_goals_select_workspace_admins
  on public.participant_goals;

drop policy if exists participant_goals_update_self
  on public.participant_goals;

drop policy if exists participant_goals_insert_self
  on public.participant_goals;

drop policy if exists participant_goals_select_self
  on public.participant_goals;

drop trigger if exists participant_goals_scope_guard
  on public.participant_goals;

drop function if exists public.protect_participant_goal_scope();

drop table if exists public.participant_goals;

rollback;
