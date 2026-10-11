\set ON_ERROR_STOP on
DO $test$
BEGIN
 IF has_table_privilege(current_user,'public.support_notification_outbox','SELECT') THEN RAISE EXCEPTION 'Worker can SELECT outbox'; END IF;
 IF has_table_privilege(current_user,'public.support_requests','SELECT') THEN RAISE EXCEPTION 'Worker can SELECT support requests'; END IF;
 IF NOT has_function_privilege(current_user,'public.thrive_worker_claim_support_notification()','EXECUTE') THEN RAISE EXCEPTION 'Missing claim permission'; END IF;
 IF has_schema_privilege(current_user,'public','CREATE') THEN RAISE EXCEPTION 'Worker can CREATE in public'; END IF;
END $test$;
CREATE TEMP TABLE claimed_test (job_id uuid, event_kind text, claim_token uuid);
INSERT INTO claimed_test SELECT * FROM public.thrive_worker_claim_support_notification();
DO $test$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM claimed_test;
 IF n <> 1 THEN RAISE EXCEPTION 'Expected one claim, found %',n; END IF;
 IF (SELECT job_id FROM claimed_test) IS NULL THEN RAISE EXCEPTION 'No claim'; END IF;
END $test$;
SELECT public.thrive_worker_finish_support_notification(job_id,claim_token,true,NULL) AS finished FROM claimed_test;
DO $test$
BEGIN
 IF EXISTS(SELECT 1 FROM public.thrive_worker_claim_support_notification()) THEN RAISE EXCEPTION 'Unexpected second workspace or completed claim'; END IF;
END $test$;
