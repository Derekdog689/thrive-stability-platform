# THRIVE Wellness Check-In Controlled Installation Validation Checklist v0.1

## Status

Review-only checklist.

Do not install until explicit approval is given.

## Pre-install gate

Confirm:

- [ ] rollback-only dry run passed;
- [ ] `participant_wellness_checkins` does not already exist;
- [ ] current branch and commit checkpoint are recorded;
- [ ] tracked tree is clean;
- [ ] no Johnny or real participant data will be used;
- [ ] no seed data is included;
- [ ] no Trust Engine synchronization is included;
- [ ] installation candidate hash or exact file is recorded;
- [ ] explicit installation approval is written in the thread.

## Installation candidate expectations

The controlled installation should create:

- [ ] `public.participant_wellness_checkins`;
- [ ] workspace foreign key;
- [ ] composite program/workspace foreign key;
- [ ] composite person/workspace foreign key;
- [ ] composite active-participation scope foreign key;
- [ ] creator foreign key to `auth.users`;
- [ ] allowed-value checks;
- [ ] note-length check;
- [ ] active/archive lifecycle check;
- [ ] one-active-check-in-per-day partial unique index;
- [ ] participant/date lookup index;
- [ ] immutable-scope trigger function;
- [ ] INSERT and UPDATE trigger events;
- [ ] RLS enabled;
- [ ] RLS forced;
- [ ] five policies;
- [ ] no DELETE policy;
- [ ] authenticated SELECT, INSERT, UPDATE grants;
- [ ] no anonymous table grants.

## Expected policies

- [ ] participant self-select;
- [ ] workspace-admin select;
- [ ] participant self-insert;
- [ ] participant same-day update;
- [ ] workspace-admin update/archive.

## Post-install structural verification

Run:

`THRIVE_PARTICIPANT_WELLNESS_CHECKIN_POST_INSTALL_VALIDATION_v0_1.sql`

Confirm:

- [ ] table exists once;
- [ ] all expected columns exist;
- [ ] all expected constraints exist;
- [ ] both expected indexes exist;
- [ ] trigger appears for INSERT;
- [ ] trigger appears for UPDATE;
- [ ] RLS is enabled;
- [ ] RLS is forced;
- [ ] exactly five policies exist;
- [ ] no DELETE policy exists;
- [ ] record count is zero immediately after installation.

## Authenticated behavioral tests

Use synthetic identities only.

### Person D

- [ ] can insert own active same-day check-in;
- [ ] can read own check-in;
- [ ] can update own same-day active check-in;
- [ ] cannot archive own check-in;
- [ ] cannot change workspace;
- [ ] cannot change program;
- [ ] cannot change supported person;
- [ ] cannot change creator;
- [ ] cannot insert a second active check-in for the same date;
- [ ] cannot insert for another participant;
- [ ] cannot read another participant's check-in.

### Person A

- [ ] sees only own check-ins;
- [ ] cannot see Person D check-ins;
- [ ] cannot edit Person D check-ins.

### Outsider

- [ ] cannot select Wellness rows;
- [ ] cannot insert Wellness rows;
- [ ] cannot update Wellness rows.

### Workspace admin

- [ ] can read synthetic participant check-ins in the workspace;
- [ ] can archive a synthetic check-in;
- [ ] archived row receives `archived_at`;
- [ ] admin cannot move a row to another workspace, program, or person.

## Lifecycle tests

- [ ] active row requires `archived_at` to be null;
- [ ] archived row requires `archived_at` to be populated;
- [ ] no hard-delete path exists;
- [ ] archived row no longer blocks a later active row for the same date;
- [ ] participant cannot reactivate an archived row.

## Field validation tests

Reject values outside the allowed sets for:

- [ ] overall day;
- [ ] stress;
- [ ] sleep;
- [ ] energy;
- [ ] confidence;
- [ ] routine;
- [ ] recovery support;
- [ ] support needed;
- [ ] chosen next step;
- [ ] lifecycle status.

Also confirm:

- [ ] blank note is rejected when not null;
- [ ] note longer than 2,000 characters is rejected.

## Application gate after database validation

Do not open the UI write path until:

- [ ] authenticated database tests pass;
- [ ] negative tests pass;
- [ ] synthetic test data is archived or retained under documented test status;
- [ ] interface candidate is reconciled to final database fields;
- [ ] plain-language labels are approved;
- [ ] error states are participant-safe;
- [ ] no automatic Support request exists;
- [ ] no scoring exists;
- [ ] no financial correlation exists;
- [ ] no Trust Engine synchronization exists.

## Build and repository checkpoint

At the end of the installation pass record:

- build status;
- targeted lint status;
- `git diff --check`;
- `git status`;
- database validation result;
- installation commit checkpoint;
- next gate.

Do not push unless explicitly approved.

## Rollback note

A production rollback script is not included in this candidate because no hard
delete or destructive production action is approved. If installation is later
approved, prepare a separate rollback candidate for review before execution.
