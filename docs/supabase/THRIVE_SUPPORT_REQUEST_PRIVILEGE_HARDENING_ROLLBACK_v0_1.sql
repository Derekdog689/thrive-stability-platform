-- THRIVE Support Request Privilege Hardening Rollback v0.1
-- REVIEW ONLY. DO NOT EXECUTE WITHOUT SEPARATE APPROVAL.

begin;

grant delete, truncate, references, trigger
on public.support_requests
to authenticated;

grant delete, truncate, references, trigger
on public.support_request_entries
to authenticated;

grant delete, truncate, references, trigger
on public.support_request_links
to authenticated;

grant insert, update, delete, truncate, references, trigger
on public.support_request_status_events
to authenticated;

commit;
