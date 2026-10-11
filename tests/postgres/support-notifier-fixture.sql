\set ON_ERROR_STOP on
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE TABLE public.workspaces(id uuid PRIMARY KEY);
CREATE TABLE public.support_requests(id uuid PRIMARY KEY,workspace_id uuid NOT NULL REFERENCES public.workspaces(id), UNIQUE(id,workspace_id));
CREATE TABLE public.support_request_entries(id uuid PRIMARY KEY, support_request_id uuid NOT NULL,workspace_id uuid NOT NULL,entry_type text NOT NULL, FOREIGN KEY(support_request_id,workspace_id) REFERENCES public.support_requests(id,workspace_id));
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.support_request_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_request_entries FORCE ROW LEVEL SECURITY;
INSERT INTO public.workspaces VALUES ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
INSERT INTO public.support_requests VALUES ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111');
CREATE ROLE thrive_support_notification_owner NOLOGIN NOINHERIT NOBYPASSRLS;
CREATE ROLE thrive_support_notifier LOGIN NOINHERIT NOBYPASSRLS;
GRANT CONNECT ON DATABASE postgres TO thrive_support_notifier;
GRANT USAGE ON SCHEMA public TO thrive_support_notifier,thrive_support_notification_owner;
GRANT CREATE ON SCHEMA public TO thrive_support_notification_owner;
CREATE TABLE public.support_notification_outbox (
 id uuid primary key default gen_random_uuid(),
 event_kind text not null check(event_kind in ('request_created','participant_replied')),
 source_id uuid not null,
 support_request_id uuid not null references public.support_requests(id) ON DELETE RESTRICT,
 workspace_id uuid not null references public.workspaces(id) ON DELETE RESTRICT,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed','paused')),
 attempt_count integer not null default 0,
 last_attempt_at timestamptz,
 delivered_at timestamptz,
 last_error_code text,
 claim_token uuid,
 created_at timestamptz not null default now(),
 unique(event_kind,source_id)
);
ALTER TABLE public.support_notification_outbox OWNER TO thrive_support_notification_owner;
ALTER TABLE public.support_notification_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_notification_outbox FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION public.thrive_worker_claim_support_notification()
RETURNS TABLE(job_id uuid,event_kind text,claim_token uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_token uuid := gen_random_uuid();
BEGIN
 IF session_user <> 'thrive_support_notifier' THEN RAISE EXCEPTION 'Unauthorized worker' USING ERRCODE='42501'; END IF;
 RETURN QUERY
 WITH picked AS (
 SELECT q.id FROM public.support_notification_outbox q
 WHERE q.workspace_id='11111111-1111-4111-8111-111111111111'::uuid
 AND q.status IN ('pending','failed') AND q.attempt_count < 3
 AND (q.last_attempt_at IS NULL OR q.last_attempt_at <= pg_catalog.now()-interval '5 minutes')
 ORDER BY q.created_at,q.id FOR UPDATE SKIP LOCKED LIMIT 1)
 UPDATE public.support_notification_outbox q
 SET status='sending',attempt_count=q.attempt_count+1,last_attempt_at=pg_catalog.now(),claim_token=v_token
 FROM picked WHERE q.id=picked.id RETURNING q.id,q.event_kind,q.claim_token;
END;
$fn$;
ALTER FUNCTION public.thrive_worker_claim_support_notification() OWNER TO thrive_support_notification_owner;
REVOKE ALL ON FUNCTION public.thrive_worker_claim_support_notification() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.thrive_worker_claim_support_notification() TO thrive_support_notifier;
CREATE FUNCTION public.thrive_worker_finish_support_notification(p_job_id uuid,p_claim_token uuid,p_delivered boolean,p_error text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_count integer;
BEGIN
 IF session_user <> 'thrive_support_notifier' THEN RAISE EXCEPTION 'Unauthorized worker' USING ERRCODE='42501'; END IF;
 IF p_delivered IS NULL OR (NOT p_delivered AND (p_error IS NULL OR p_error NOT IN ('transport','configuration'))) OR (p_delivered AND p_error IS NOT NULL) THEN RAISE EXCEPTION 'Invalid completion'; END IF;
 UPDATE public.support_notification_outbox q SET status=CASE WHEN p_delivered THEN 'sent' ELSE 'failed' END,
 delivered_at=CASE WHEN p_delivered THEN pg_catalog.now() ELSE NULL END,
 last_error_code=CASE WHEN p_delivered THEN NULL ELSE p_error END,claim_token=NULL
 WHERE q.id=p_job_id AND q.claim_token=p_claim_token AND q.status='sending'
 AND q.workspace_id='11111111-1111-4111-8111-111111111111'::uuid;
 GET DIAGNOSTICS v_count=ROW_COUNT;
 RETURN v_count=1;
END;
$fn$;
ALTER FUNCTION public.thrive_worker_finish_support_notification(uuid,uuid,boolean,text) OWNER TO thrive_support_notification_owner;
REVOKE ALL ON FUNCTION public.thrive_worker_finish_support_notification(uuid,uuid,boolean,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.thrive_worker_finish_support_notification(uuid,uuid,boolean,text) TO thrive_support_notifier;
REVOKE CREATE ON SCHEMA public FROM thrive_support_notification_owner;
INSERT INTO public.support_notification_outbox(event_kind,source_id,support_request_id,workspace_id) VALUES
('request_created','44444444-4444-4444-8444-444444444444','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111'),
('request_created','55555555-5555-4555-8555-555555555555','33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222');
