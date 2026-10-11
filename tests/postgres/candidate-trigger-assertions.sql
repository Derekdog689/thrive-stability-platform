\set ON_ERROR_STOP on
-- All fixture rows synthetic and created AFTER actual candidate trigger installation.
INSERT INTO public.support_requests VALUES
('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666666','22222222-2222-4222-8222-222222222222');
INSERT INTO public.support_request_entries VALUES
('77777777-7777-4777-8777-777777777777','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','participant_reply'),
('88888888-8888-4888-8888-888888888888','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','internal_note');
DO $test$
BEGIN
 IF (SELECT count(*) FROM public.support_notification_outbox) <> 3 THEN RAISE EXCEPTION 'Expected 2 requests + 1 reply'; END IF;
 IF (SELECT count(*) FROM public.support_notification_outbox WHERE workspace_id='11111111-1111-4111-8111-111111111111') <> 2 THEN RAISE EXCEPTION 'Wrong scope count'; END IF;
 IF EXISTS (SELECT 1 FROM public.support_notification_outbox WHERE source_id='88888888-8888-4888-8888-888888888888') THEN RAISE EXCEPTION 'Internal note enqueued'; END IF;
 IF has_function_privilege('anon','public.thrive_worker_claim_support_notification()','EXECUTE') THEN RAISE EXCEPTION 'anon claim access'; END IF;
 IF has_function_privilege('authenticated','public.thrive_worker_finish_support_notification(uuid,uuid,boolean,text)','EXECUTE') THEN RAISE EXCEPTION 'authenticated finish access'; END IF;
 IF has_table_privilege('thrive_support_notifier','public.support_notification_outbox','SELECT') THEN RAISE EXCEPTION 'Worker direct read'; END IF;
 IF has_schema_privilege('thrive_support_notification_owner','public','CREATE') THEN RAISE EXCEPTION 'Owner retained CREATE'; END IF;
END $test$;
-- Transaction rollback must remove notification and its source atomically.
BEGIN;
INSERT INTO public.support_requests VALUES ('99999999-9999-4999-8999-999999999999','11111111-1111-4111-8111-111111111111');
DO $test$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.support_notification_outbox WHERE source_id='99999999-9999-4999-8999-999999999999') THEN RAISE EXCEPTION 'Missing transactional queue entry'; END IF;
END $test$;
ROLLBACK;
DO $test$ BEGIN
 IF EXISTS(SELECT 1 FROM public.support_notification_outbox WHERE source_id='99999999-9999-4999-8999-999999999999') THEN RAISE EXCEPTION 'Rollback left queue event'; END IF;
END $test$;
