# THRIVE Supabase Security Plan

## Purpose

This file defines the security posture for the THRIVE Supabase project before the application connects to real data.

The purpose is to prevent accidental exposure of sensitive financial, trust, beneficiary, behavioral, recovery-related, or personally identifiable information.

This file must be updated before any major database, authentication, Row Level Security, storage, or role-access change.

## Current Security Status

Current phase: Supabase inventory and security planning

Current rule:

No real sensitive data should be connected to the THRIVE application until the Supabase security model is reviewed, documented, and tested.

Existing concern:

The Supabase dashboard has shown multiple public tables with Row Level Security disabled or unrestricted access warnings.

Existing sensitive data concern:

The database appears to contain real-looking transaction records, import records, merchant descriptions, profile review records, audit records, and provenance records. These records must be treated as sensitive.

## Security North Star

THRIVE must protect dignity, privacy, and stewardship.

The platform should help support decision-making without exposing private financial or behavioral information to people who do not have a clear, documented reason to access it.

Privacy is not a feature added later. It is part of the foundation.

## Protected Data Categories

The following data categories are sensitive and must be protected:

- Trust records
- Beneficiary financial records
- Bank transactions
- Merchant descriptions
- Account source names
- Receipts
- Uploaded documents
- Import batches
- Transaction review notes
- Spending categories and timing tags
- Behavioral check-ins
- Recovery-related indicators
- Support notes
- Audit logs
- User identity data
- Consent and permission records
- Trustee-facing reports
- Beneficiary-facing reports
- DSS administrative notes

## High-Risk Tables

The following tables should be treated as high-risk until proven otherwise:

| Table | Risk Reason |
|---|---|
| `transactions_snapshot` | Contains raw transaction descriptions, dates, and amounts |
| `transactions_profile` | Contains review status, categories, notes, and documentation status |
| `transactions_audit_log` | Contains change history and actor activity |
| `transactions_provenance` | Contains import source history and account/source labels |
| `transaction_receipts` | Stores receipt metadata and file references |
| `truist_import_staging` | Contains raw bank-import rows |
| `trust_documents` | Links trust documents to storage objects |
| `trust_ledger` | Designed for committed trust ledger transactions |
| `trust_ledger_transactions` | Designed for imported trust transactions |
| `import_batches` | Contains balances, reconciliation, and approval workflow |
| `import_events` | Contains import source metadata |
| `system_anchors` | May reveal internal architecture and security posture |

## Public Access Rule

No table containing financial, trust, beneficiary, behavioral, recovery-related, or user-identifying information should be publicly readable or publicly writable.

Public access should be limited to truly public marketing or informational content only.

At this stage, THRIVE has no approved public data tables.

## Role Categories

Future access design should use role-based boundaries.

### Admin

Full operational configuration access.

Examples:

- DSS owner/admin
- System maintainer

Potential permissions:

- Manage workspaces
- Manage support roles
- View audit logs
- Review security status
- Manage reports
- Manage mock/test data
- Approve schema-level actions

### Trustee / Fiduciary Role

Limited trust-specific oversight access.

Examples:

- Trustee
- Authorized fiduciary representative

Potential permissions:

- View trust ledger summaries
- View beneficiary disbursement summaries
- View documents related to assigned trust/workspace
- View trustee-facing reports
- Review distribution status
- Approve or reject administrative actions if later implemented

Important boundary:

The system may support trustee review, but it must not replace trustee judgment.

### DSS Support / Case Support Role

Support and documentation role.

Examples:

- DSS Enterprises administrator
- Case-management support
- Financial stability support

Potential permissions:

- View assigned workspace summaries
- Add administrative notes
- Generate draft reports
- Review transaction documentation status
- Track receipts and missing documentation

Important boundary:

This role should not receive unrestricted global database access.

### Supported Individual

Person receiving financial stability support.

Examples:

- Trust beneficiary
- Recovery community member
- Supported resident
- Reentry or financial-stability client

Potential permissions:

- View their own dashboard
- View safe-to-spend estimate
- View approved beneficiary-facing summaries
- Complete check-ins
- Upload receipts if enabled
- View their own consent settings

Important boundary:

A supported individual should not see trustee-only notes, DSS internal notes, or unrelated records.

### Support Circle

Optional approved support viewers.

Examples:

- Sponsor
- Peer support
- Family support
- Approved external support person

Potential permissions:

- View limited summaries only after consent
- Receive weekly support snapshot if enabled
- View non-sensitive support prompts

Important boundary:

Support-circle access must be consent-based and limited.

## Minimum RLS Design Direction

Before app connection, each table must be assigned one of these security categories:

| Security Category | Meaning |
|---|---|
| Admin-only | Only admin/service role should access |
| Workspace-scoped | Access limited by assigned workspace |
| User-owned | Access limited to records owned by authenticated user |
| Role-scoped | Access depends on role assignment |
| Public-safe | Can be read publicly because it contains no sensitive data |
| Deprecated / archive | Not used by app; retained for migration/audit only |

## Preliminary Table Security Categories

These are planning classifications only and are not yet implemented.

| Table | Preliminary Category |
|---|---|
| `projects` | Admin-only or workspace-scoped |
| `system_anchors` | Admin-only |
| `trust_documents` | Workspace-scoped and role-scoped |
| `trust_ledger` | Workspace-scoped and role-scoped |
| `trust_ledger_transactions` | Admin-only import staging or workspace-scoped |
| `import_batches` | Admin-only or trustee/admin workflow |
| `import_events` | Admin-only |
| `transaction_receipts` | Workspace-scoped and role-scoped |
| `transactions_snapshot` | Workspace-scoped and role-scoped |
| `transactions_profile` | Workspace-scoped and role-scoped |
| `transactions_audit_log` | Admin-only or workspace-scoped audit viewer |
| `transactions_provenance` | Admin-only |
| `truist_import_staging` | Admin-only import staging |

## Storage Security

Supabase Storage must be reviewed separately from table RLS.

Protecting metadata tables is not enough if files are exposed through bucket policies.

Current storage observation:

No bucket was observed during initial dashboard review.

Before document upload is enabled:

1. Create a private bucket.
2. Define upload permissions.
3. Define download/view permissions.
4. Avoid public file URLs for sensitive documents.
5. Prefer signed URLs for temporary access.
6. Link files to workspace and role permissions.
7. Log document upload and access activity where practical.

## Application Connection Rule

The Next.js app should not connect to live Supabase tables until:

1. Environment variables are configured safely.
2. Public anon key is used only for client-safe operations.
3. Service role key is never exposed client-side.
4. RLS is enabled where needed.
5. Policies are tested with authenticated and unauthenticated users.
6. Mock/test records are clearly separated from real records.
7. Real sensitive records are not displayed in early UI testing.

## Secret Handling

Never commit the following to GitHub:

- Supabase service role key
- Supabase JWT secret
- Database password
- Personal access tokens
- Bank API keys
- Plaid/MX/Finicity/Teller secrets
- OAuth secrets
- Private document URLs
- Real account identifiers
- Real beneficiary financial exports

Use `.env.local` for local development secrets.

Use deployment provider environment variables for hosted deployments.

## RLS Design Order

RLS must be designed in this order:

1. Inventory all current tables.
2. Identify sensitive tables.
3. Identify ownership fields.
4. Identify missing ownership fields.
5. Define role model.
6. Define workspace model.
7. Create test users.
8. Enable RLS on one low-risk table first.
9. Write select policy.
10. Write insert/update/delete policies only if needed.
11. Test unauthenticated access.
12. Test wrong-user access.
13. Test correct-role access.
14. Document policy results.
15. Repeat table by table.

Do not mass-enable RLS without testing application behavior and policy expectations.

## Known Security Gaps

Current known gaps:

- Multiple public tables show RLS disabled or unrestricted warnings.
- Some sensitive tables contain real-looking records.
- Several tables use text IDs rather than UUIDs.
- Several tables do not visibly include `workspace_id`.
- Some relationships are implied but not enforced by foreign keys.
- Storage policy structure is not yet established.
- Role model is not yet implemented.
- Consent model is not yet implemented.
- App is currently mock-only and should remain mock-only until security is resolved.

## Immediate Security Priorities

1. Finish inventory of all existing tables.
2. Inspect RLS status and existing policies.
3. Identify which existing tables contain real sensitive data.
4. Decide whether current tables are active, staging, archive, or replace.
5. Design workspace and role model.
6. Create security-safe mock data strategy.
7. Only then connect the Next.js app to Supabase.

## Decision Log

### Decision 001: Mock-Only App Until Security Review

Decision:
The THRIVE app will remain mock-only until Supabase security has been reviewed and documented.

Reason:
The database already appears to contain sensitive transaction-style information. Connecting the UI before RLS and role boundaries are verified could expose private information.

### Decision 002: No Public Sensitive Tables

Decision:
No financial, trust, beneficiary, behavioral, recovery-related, or personally identifying data should be public.

Reason:
THRIVE is designed around stewardship, dignity, and support. Public exposure of this data would violate the core purpose of the project.

### Decision 003: Storage Requires Separate Policy Review

Decision:
Supabase Storage must be secured separately from database RLS.

Reason:
Document metadata security does not protect uploaded files if bucket policies or URLs are exposed.

## Session Notes

### Security Session 001

Created initial Supabase security plan after inventory revealed existing sensitive transaction-style tables and RLS warnings.

No database changes made.
No RLS policies changed.
No storage buckets created.
No application connection made.