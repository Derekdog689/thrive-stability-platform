-- THRIVE PARTICIPANT FINANCIAL VISIBILITY AUTHENTICATED CHECKS v0.1
-- Run while signed in through the application as each controlled identity.

select count(*) as my_source_count
from public.get_my_financial_sources_v1();

select count(*) as my_batch_count
from public.get_my_financial_batches_v1();

select count(*) as my_transaction_count
from public.get_my_financial_transactions_v1();
