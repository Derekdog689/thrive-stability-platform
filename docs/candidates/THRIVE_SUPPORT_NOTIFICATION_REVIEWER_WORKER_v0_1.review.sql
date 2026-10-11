-- REVIEW ONLY, NEVER RUN DIRECTLY. Proposed reviewer-authorized worker RPC.
-- This is a *manual reviewer dispatch* proving gate, not automatic delivery.
-- Requires outbox table/queue trigger and explicit install approval.
-- No service-role key. Prevent participant access using is_support_reviewer.
-- SECURITY DEFINER owner/grants must be inspected in the install review.
create or replace function public.thrive_claim_support_notification()
returns table (job_id uuid, event_kind text, claim_token uuid)
language plpgsql security definer set search_path = ''
as $$
declare
  v_job public.support_notification_outbox%rowtype;
  v_token uuid := gen_random_uuid();
begin
  select q.* into v_job
  from public.support_notification_outbox q
  where q.status in ('pending','failed')
    and (q.last_attempt_at is null or q.last_attempt_at < now() - interval '5 minutes')
    and public.is_support_reviewer(q.workspace_id)
    and q.attempt_count < 3
  order by q.created_at, q.id
  for update skip locked limit 1;

  if not found then return; end if;
  update public.support_notification_outbox q
  set status = 'sending', attempt_count = attempt_count + 1,
      last_attempt_at = now(), claim_token = v_token
  where q.id = v_job.id;
  return query select v_job.id, v_job.event_kind, v_token;
end;
$$;

create or replace function public.thrive_finish_support_notification(
  p_job_id uuid, p_claim_token uuid, p_delivered boolean, p_error text default null)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  if p_error is not null and p_error not in ('transport','configuration') then
    raise exception 'Invalid notification failure category';
  end if;
  update public.support_notification_outbox q
  set status = case when p_delivered then 'sent' else 'failed' end,
      delivered_at = case when p_delivered then now() else null end,
      last_error_code = case when p_delivered then null else coalesce(p_error,'transport') end,
      claim_token = null
  where q.id = p_job_id and q.claim_token = p_claim_token and q.status = 'sending'
    and public.is_support_reviewer(q.workspace_id);
  return found;
end;
$$;

revoke all on function public.thrive_claim_support_notification() from public, anon;
revoke all on function public.thrive_finish_support_notification(uuid,uuid,boolean,text) from public, anon;
grant execute on function public.thrive_claim_support_notification() to authenticated;
grant execute on function public.thrive_finish_support_notification(uuid,uuid,boolean,text) to authenticated;

-- Proposed outbox schema amendment required BEFORE functions can compile:
-- alter table public.support_notification_outbox add column claim_token uuid;
-- Do not permit browser direct writes to outbox or worker secrets.
-- Attention: a stranded 'sending' row must be reconciled manually to prevent
-- duplicate email when SMTP accepted a message before confirmation was recorded.
