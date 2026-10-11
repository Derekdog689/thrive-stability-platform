#!/usr/bin/env bash
set -euo pipefail
# Synthetic two-session claim proof on disposable CI database.
export PGUSER=postgres PGPASSWORD=synthetic_ci_only
psql -v ON_ERROR_STOP=1 -c "INSERT INTO public.support_request_entries VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','participant_reply'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','participant_reply');"
export PGUSER=thrive_support_notifier PGPASSWORD=worker_ci_only
(psql -X -v ON_ERROR_STOP=1 -Atc "BEGIN; SELECT job_id FROM public.thrive_worker_claim_support_notification(); SELECT pg_sleep(4); COMMIT;" > /tmp/claim-a.txt) &
a=$!
sleep 1
psql -X -v ON_ERROR_STOP=1 -Atc "SELECT job_id FROM public.thrive_worker_claim_support_notification();" > /tmp/claim-b.txt
wait "$a"
id_a=$(grep -E '^[0-9a-f-]{36}$' /tmp/claim-a.txt | head -1)
id_b=$(grep -E '^[0-9a-f-]{36}$' /tmp/claim-b.txt | head -1)
test -n "$id_a" && test -n "$id_b" && test "$id_a" != "$id_b"
echo "Distinct concurrent claims verified; no duplicate job id."
