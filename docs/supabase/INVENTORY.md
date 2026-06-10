# THRIVE Supabase Inventory

## Purpose

This file documents the current Supabase project before the THRIVE application connects to it.

The goal is to understand the existing database truth before making schema changes, applying Row Level Security policies, or connecting the Next.js app.

## Supabase Project

Project name: thrive  
Status: Healthy  
Use status: Inventory only  
Real sensitive data allowed: No

## Current Rule

Do not enter or connect real trust, beneficiary, financial, behavioral, recovery-related, or personally identifiable data until:

1. Existing tables are inventoried.
2. RLS status is reviewed.
3. Roles are defined.
4. Policies are designed.
5. Policies are tested.
6. Mock/test data is separated from real data.

## Observed Existing Tables

Initial observed tables from Supabase dashboard:

- projects
- system_anchors
- trust_documents
- trust_ledger
- trust_ledger_transactions
- transaction_receipts
- transactions_profile
- transactions_snapshot
- import_batches
- import_events

## Table Classification Key

Each table should be classified as one of the following:

- Active THRIVE core
- Johnny / trust module
- Import utility
- Archive / legacy
- Replace later
- Unknown pending review

## Table Inventory

| Table | Classification | Purpose | RLS Status | Notes |
|---|---|---|---|---|
| projects | Unknown pending review | Needs inspection | Unknown | Existing table |
| system_anchors | Unknown pending review | Needs inspection | Unknown | Existing table |
| trust_documents | Johnny / trust module candidate | Needs inspection | Unknown | Potential trust document table |
| trust_ledger | Johnny / trust module candidate | Needs inspection | Unknown | Potential trust ledger table |
| trust_ledger_transactions | Johnny / trust module candidate | Needs inspection | Unknown | Potential trust transaction table |
| transaction_receipts | Johnny / trust module candidate | Needs inspection | Unknown | Potential receipt tracking table |
| transactions_profile | Unknown pending review | Needs inspection | Unknown | Existing table |
| transactions_snapshot | Import utility candidate | Needs inspection | Unknown | Existing table |
| import_batches | Import utility candidate | Needs inspection | Unknown | Existing table |
| import_events | Import utility candidate | Needs inspection | Unknown | Existing table |

## Security Concerns

Supabase Advisor previously showed multiple RLS disabled warnings for public tables.

This must be resolved before production or real sensitive use.

## Next Inventory Tasks

1. Export or screenshot table list.
2. Inspect each table's columns.
3. Inspect primary keys.
4. Inspect foreign keys.
5. Inspect RLS status.
6. Inspect policies.
7. Identify which tables are safe to keep.
8. Identify which tables should be archived or replaced.
9. Design THRIVE MVP schema only after inventory is complete.

## Session Notes

### Inventory Session 001

Started Supabase inventory documentation after successful build and clean Git checkpoint.

No schema changes made.
No RLS changes made.
No application connection made.