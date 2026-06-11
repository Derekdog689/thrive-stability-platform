# THRIVE Database Decision

## Decision Date

2026-06-10

## Decision

THRIVE will not use the existing Supabase project that was initially inventoried.

A new clean Supabase project will be created for THRIVE.

## Reason

The existing Supabase project contains legacy tables, trust-system structures, import pipelines, transaction records, RLS warnings, and data that appear to belong to prior DSS/trust-related work rather than the THRIVE platform.

Although the existing project confirmed that Supabase connectivity and table structures were previously explored, it is not the correct foundation for THRIVE.

## Legal and Ethical Reasoning

THRIVE may eventually handle sensitive financial, behavioral, support, and beneficiary-related data. Building it on top of a database containing unrelated legacy trust records increases the risk of:

- Data exposure
- Role confusion
- Project boundary confusion
- Accidental use of unrelated records
- Poor audit separation
- Mixing trust administration data with platform prototype data

The safer approach is to preserve separation.

## Legacy Supabase Project Status

The existing Supabase project should be treated as:

- Legacy
- Not approved for THRIVE app connection
- Not part of the active THRIVE schema
- Not to be modified for THRIVE purposes without a separate decision

No deletion is authorized from this THRIVE project decision alone.

If legacy data is later deleted, that should be handled as a separate trust/project cleanup decision with appropriate backup, ownership review, and audit notes.

## New THRIVE Supabase Project Direction

A fresh Supabase project should be created for THRIVE.

Recommended name:

`thrive-stability-platform`

Initial rule:

The new database starts empty and receives only intentional THRIVE tables.

## Updated Build Rule

THRIVE will use:

- Clean repo
- Clean Supabase project
- Mock data first
- Designed schema second
- RLS from the beginning
- Real data only after security review

## Impact on Prior Inventory

The prior Supabase inventory remains useful as historical evidence showing why the old database should not be used.

However, those tables are not the THRIVE target schema.

## Next Steps

1. Commit this database decision.
2. Create a new Supabase project for THRIVE.
3. Record the new project name and URL in local `.env.local` only.
4. Design the THRIVE schema from scratch.
5. Enable RLS from the beginning.
6. Use mock/test records only during early development.

## Active THRIVE Supabase Project

Active project name:

`thrive-stewardship-stability-platform`

Project purpose:

Clean Supabase foundation for the THRIVE Stewardship & Stability Platform.

Status:

Created after the legacy database decision. This project should receive only intentional THRIVE schema objects.

Secret handling:

Project URL and anon key may be stored locally in `.env.local`. Service role keys, database passwords, JWT secrets, and other private credentials must never be committed to GitHub.
