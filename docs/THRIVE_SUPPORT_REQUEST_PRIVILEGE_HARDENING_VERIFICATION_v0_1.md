# THRIVE Support Request Privilege Hardening Verification v0.1

## Status

Review-only verification package.

Do not execute the hardening candidate without separate explicit approval.

## Expected authenticated privileges

### `support_requests`

- `SELECT`
- `INSERT`
- `UPDATE`

### `support_request_entries`

- `SELECT`
- `INSERT`
- `UPDATE`

### `support_request_links`

- `SELECT`
- `INSERT`
- `UPDATE`

### `support_request_status_events`

- `SELECT` only

## Verification query

```sql
select
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
  and grantee = 'authenticated'
order by table_name, privilege_type;
Failure conditions

Stop if authenticated retains any of:

DELETE
TRUNCATE
REFERENCES
TRIGGER

Also stop if support_request_status_events retains:

INSERT
UPDATE
Frozen boundaries
no synthetic testing;
no participant activation;
no Johnny data;
no service-role client use;
no notifications;
no emergency workflow;
no Trust Engine synchronization;
no deployment or push.
Exact next gate

After this package is reviewed and committed, request separate approval before
permanently executing the privilege-hardening candidate.

Do not execute the rollback unless separately approved.
