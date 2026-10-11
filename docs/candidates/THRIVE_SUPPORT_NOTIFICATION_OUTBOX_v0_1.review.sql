-- REVIEW ONLY. DO NOT APPLY. Support notification outbox v0.1 candidate.
-- Requires separate review of RLS, trigger privileges, and server worker design.
-- Existing request/entry records remain authoritative. No deletes of any kind.
create table if not exists public.support_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_kind text not null check (event_kind in ('request_created','participant_replied')),
  source_id uuid not null,
  support_request_id uuid not null references public.support_requests(id),
  workspace_id uuid not null references public.workspaces(id),
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','paused')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  delivered_at timestamptz,
  last_error_code text,
  claim_token uuid,
  created_at timestamptz not null default now(),
  unique (event_kind, source_id)
);
alter table public.support_notification_outbox enable row level security;
-- Intentionally no client SELECT/INSERT/UPDATE/DELETE policy.
-- No worker privileges granted by this candidate.

create or replace function public.thrive_enqueue_support_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'support_requests' then
    insert into public.support_notification_outbox
      (event_kind, source_id, support_request_id, workspace_id)
    values ('request_created', new.id, new.id, new.workspace_id)
    on conflict (event_kind, source_id) do nothing;
  elsif tg_table_name = 'support_request_entries' and new.entry_type = 'participant_reply' then
    insert into public.support_notification_outbox
      (event_kind, source_id, support_request_id, workspace_id)
    values ('participant_replied', new.id, new.support_request_id, new.workspace_id)
    on conflict (event_kind, source_id) do nothing;
  end if;
  return new;
end;
$$;
-- Triggers not created in this review candidate until privileges and existing
-- triggers are reconciled. No mail is sent by this function.
-- Proposed install after review:
-- create trigger ... AFTER INSERT ON public.support_requests ...
-- create trigger ... AFTER INSERT ON public.support_request_entries ...

-- Proposed trigger bindings, reviewed separately against existing triggers.
-- CREATE TRIGGER thrive_enqueue_support_request_v01
-- AFTER INSERT ON public.support_requests
-- FOR EACH ROW EXECUTE FUNCTION public.thrive_enqueue_support_notification();
-- CREATE TRIGGER thrive_enqueue_support_reply_v01
-- AFTER INSERT ON public.support_request_entries
-- FOR EACH ROW EXECUTE FUNCTION public.thrive_enqueue_support_notification();
-- An install must explicitly revoke execute on security-definer trigger
-- function from API roles after confirming trigger execution continues.
