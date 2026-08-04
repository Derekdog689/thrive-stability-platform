-- THRIVE Support Request Privilege Hardening Candidate v0.1
-- REVIEW ONLY. DO NOT EXECUTE WITHOUT SEPARATE APPROVAL.

begin;

revoke delete, truncate, references, trigger
on public.support_requests
from authenticated;

revoke delete, truncate, references, trigger
on public.support_request_entries
from authenticated;

revoke delete, truncate, references, trigger
on public.support_request_links
from authenticated;

revoke insert, update, delete, truncate, references, trigger
on public.support_request_status_events
from authenticated;

grant select, insert, update
on public.support_requests
to authenticated;

grant select, insert, update
on public.support_request_entries
to authenticated;

grant select, insert, update
on public.support_request_links
to authenticated;

grant select
on public.support_request_status_events
to authenticated;

commit;
