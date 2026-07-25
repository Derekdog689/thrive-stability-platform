# THRIVE Supported-Person Identity Test and Installation Plan v0.1

## Status

Review-only planning document.

This document does not authorize:

- SQL execution;
- installation of the supported-person schema;
- creation of Johnny's authentication account;
- insertion of Johnny's supported-person record;
- creation of Johnny's workspace membership;
- assignment of Johnny to a program;
- creation of a personal financial explanation table;
- synchronization with the Trust Engine;
- production test-data insertion;
- deployment, push, or merge.

## Plan Date

July 25, 2026

## Governing Candidate

This plan applies to:

- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_CANDIDATE_v0_2.sql`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_RECONCILIATION_v0_2.md`

The SQL candidate remains review-only and ends with `rollback`.

## Purpose

The purpose of this plan is to define the controlled path for validating and, only after separate approval, installing the supported-person identity foundation.

The intended foundation includes:

- `supported_people`;
- `program_participants`;
- optional authenticated-user linkage through nullable unique `auth_user_id`;
- composite workspace-preserving foreign keys;
- administrator management policies;
- linked supported-person self-read policies;
- lifecycle states instead of hard deletion;
- no broad read access based solely on workspace membership.

## Governing Boundaries

Johnny's THRIVE personal support spine and the Trust Engine remain independent systems.

A supported-person record does not establish:

- legal authority;
- clinical status;
- incapacity;
- guardianship;
- trustee authority;
- fiduciary authority;
- consent;
- beneficiary classification;
- external sharing authority.

Workspace membership, supported-person identity, application authentication, program participation, and record authorship remain separate database concepts.

## Verified Live Prerequisites

The live database currently contains:

- `profiles`;
- `workspaces`;
- `workspace_members`;
- `programs`.

RLS is enabled on those tables.

The live database does not currently contain:

- `supported_people`;
- `program_participants`.

The live `programs` table has:

- primary key `(id)`;
- no unique constraint on `(id, workspace_id)`;
- no equivalent composite unique index.

The v0.2 candidate therefore proposes a supporting unique constraint on:

```text
programs(id, workspace_id)

The following helper functions are already installed:

is_workspace_member(uuid);
is_workspace_admin(uuid);
is_program_in_workspace(uuid, uuid).
Intended Access Model
Active workspace administrator
  -> may read supported-person and participation records
  -> may create supported-person and participation records
  -> may update permitted identity metadata and lifecycle status
  -> may not hard-delete records through an RLS policy

Linked active supported person
  -> may read their own supported-person identity
  -> may read their own program participation
  -> may not create, assign, update, archive, approve, or delete records

Other workspace roles
  -> receive no supported-person or participation access solely because of
     workspace membership
Required Test Identities

Future RLS testing should use controlled test identities that are not Johnny.

Required identities:

Workspace administrator
Supported-person test user with active individual membership
Second supported-person test user
Active support workspace member
Active viewer workspace member
Authenticated user with no membership in the test workspace

The test identities must use clearly marked nonproduction data.

No real financial, clinical, trust, recovery, or personally identifying information should be entered during schema proof.

Required Test Workspace and Program

Testing should use a clearly marked nonproduction workspace and program.

Example labels:

Workspace: SUPPORTED PERSON RLS TEST
Program: SUPPORTED PERSON PROGRAM TEST

The test program must belong to the test workspace and have status = 'active'.

Testing must not reuse Johnny's eventual production record.

Installation Gates
Gate 1: Candidate Review

Required before any SQL execution:

review v0.2 SQL line by line;
confirm all proposed object names;
confirm the composite program scope prerequisite;
confirm no broad workspace-member read policies;
confirm no delete policies;
confirm no Johnny inserts;
confirm no explanation-table SQL;
confirm no Trust Engine references;
confirm the candidate ends with rollback.

Expected outcome:

Candidate approved for controlled dry-run preparation only.
Gate 2: Dry-Run Script Preparation

Prepare a separate dry-run artifact derived from v0.2.

The dry-run artifact must:

begin with begin;
contain the proposed DDL and policies;
include inspection queries after object creation;
end with rollback;
contain no production records;
contain no Johnny data;
contain no auth-user creation;
contain no service-role operations.

Expected outcome:

Dry-run script prepared but not executed.
Gate 3: Dry-Run Approval

Before execution, separately approve:

the exact dry-run file;
the target Supabase project;
the database role being used;
the expected created objects;
the rollback boundary;
the test identities and test workspace;
the evidence that will be captured.

Expected outcome:

Dry-run execution explicitly authorized.
Gate 4: Controlled Dry Run

When separately authorized, execute only the approved dry-run artifact.

The dry run must verify:

all DDL compiles;
the composite programs(id, workspace_id) key can be created;
both proposed tables can be created;
all constraints can be created;
helper functions can be created;
triggers can be created;
RLS can be enabled;
all policies can be created;
inspection queries return the expected definitions;
the final rollback removes all dry-run objects.

Expected outcome:

Dry run succeeds and leaves the live schema unchanged.
Gate 5: Installation Script Preparation

After a successful dry run, prepare a separate installation candidate.

The installation candidate must:

be derived from the dry-run-proven SQL;
use an explicitly reviewed transaction strategy;
handle the program composite constraint safely;
avoid silent replacement of unrelated live objects;
contain no Johnny inserts;
contain no test-data inserts;
contain no explanation-table SQL;
contain no Trust Engine synchronization;
contain no delete policies.

Expected outcome:

Installation candidate prepared but not executed.
Gate 6: Installation Approval

Installation requires separate explicit approval after review of:

exact SQL file;
target database;
planned execution role;
expected schema changes;
rollback and recovery procedure;
pre-install schema snapshot;
post-install verification queries;
test plan;
evidence-capture procedure.

Expected outcome:

Installation explicitly authorized.
Gate 7: Schema Installation

Only after Gate 6 approval may the installation SQL be executed.

The installation pass should create schema objects only.

It must not create:

Johnny's auth account;
Johnny's profile;
Johnny's workspace membership;
Johnny's supported-person record;
Johnny's program participation;
explanation records;
Trust Engine connections.

Expected outcome:

Supported-person schema installed without production person records.
Gate 8: Post-Installation Structural Verification

Verify the following live objects.

Tables
supported_people
program_participants
Program scope prerequisite
unique constraint on programs(id, workspace_id)
Supported-person constraints
primary key on id
foreign key to workspaces
nullable foreign key to auth.users
unique auth_user_id
unique (id, workspace_id)
status check
nonblank text checks
Program-participant constraints
primary key on id
composite program/workspace foreign key
composite supported-person/workspace foreign key
unique person/program assignment
participant-role check
status check
Triggers
supported-person updated-at trigger
participation updated-at trigger
supported-person immutable-scope trigger
participation immutable-scope trigger
RLS
RLS enabled on both tables
no delete policies
no broad workspace-member read policies

Expected outcome:

Installed schema matches the approved candidate.
RLS Test Matrix
Test A: Administrator reads supported people

Actor:

Active workspace administrator

Expected result:

Allowed for records in the administered workspace.
Test B: Administrator creates a supported person

Conditions:

target workspace is administered by the actor;
created_by = auth.uid();
test data only.

Expected result:

Allowed.
Test C: Administrator updates permitted identity metadata

Examples:

display_name;
preferred_name;
status;
external_reference;
auth_user_id.

Expected result:

Allowed when immutable scope and creation-lineage fields are unchanged.
Test D: Administrator attempts to change supported-person workspace

Expected result:

Denied by immutable-scope trigger.
Test E: Linked active supported person reads own identity

Conditions:

supported_people.auth_user_id = auth.uid();
supported-person status is active.

Expected result:

Allowed for the linked person's own row only.
Test F: Supported person reads another person's identity

Expected result:

Denied.
Test G: Paused or archived supported person reads own identity

Expected result under v0.2:

Denied because self-read requires supported-person status = active.
Test H: Support-role member reads supported-person records

Actor:

Active workspace member with member_role = support

Expected result:

Denied solely on the basis of support membership.
Test I: Viewer reads supported-person records

Expected result:

Denied.
Test J: Individual member without supported-person linkage reads records

Expected result:

Denied.
Test K: Administrator creates program participation

Conditions:

administrator controls the workspace;
program belongs to that workspace;
program status is active;
supported person belongs to that workspace;
supported person is not archived;
created_by = auth.uid().

Expected result:

Allowed.
Test L: Cross-workspace program assignment

Attempt:

participation workspace belongs to Workspace A;
program belongs to Workspace B.

Expected result:

Denied by composite program/workspace foreign key and policy validation.
Test M: Cross-workspace supported-person assignment

Attempt:

participation workspace belongs to Workspace A;
supported person belongs to Workspace B.

Expected result:

Denied by composite supported-person/workspace foreign key and policy validation.
Test N: Assignment to inactive program

Expected result:

Denied by is_program_in_workspace().
Test O: Assignment of archived supported person

Expected result:

Denied by is_supported_person_in_workspace().
Test P: Linked supported person reads own participation

Expected result:

Allowed for their own participation records.
Test Q: Linked supported person reads another person's participation

Expected result:

Denied.
Test R: Supported person creates or updates participation

Expected result:

Denied because no self-insert or self-update policy exists.
Test S: Administrator updates participation status

Permitted examples:

active to inactive;
active to completed;
inactive to active when all policy checks remain satisfied.

Expected result:

Allowed.
Test T: Administrator changes participation identity or scope

Attempted changes:

workspace_id;
program_id;
supported_person_id;
participant_role;
created_by;
created_at.

Expected result:

Denied by immutable-scope trigger.
Test U: Hard deletion

Expected result:

Denied because no DELETE policy exists.
Rollback Verification

The controlled dry run must confirm that rollback leaves no new supported-person objects behind.

After rollback, inspection should confirm:

supported_people does not exist;
program_participants does not exist;
proposed supported-person helper functions do not exist;
proposed supported-person triggers do not exist;
proposed supported-person policies do not exist;
the temporary program composite constraint does not remain.

Any object remaining after rollback is a failed dry-run result that must be investigated before installation planning continues.

Installation Recovery Planning

Before installation, capture:

current table inventory;
current program constraints;
current indexes;
current policies;
current helper-function definitions;
current triggers;
current Git commit;
approved installation-file hash.

If installation fails inside a transaction, rollback should restore the prior state.

No manual partial cleanup should occur until the resulting live state is inspected.

No hard deletes should be used as a cleanup shortcut.

## Post-Installation Evidence

The installation record should include:

- execution date and time;
- authorized operator;
- target project;
- approved Git commit;
- installation-file name;
- installation-file hash;
- SQL execution result;
- created tables;
- created constraints;
- created indexes;
- created functions;
- created triggers;
- created policies;
- RLS status;
- test matrix results;
- `git diff --check`;
- `git status`;
- commit checkpoint;
- confirmation that no Johnny or Trust Engine records were created.

## Johnny Onboarding Boundary

Johnny onboarding is a later, separate gate.

It will require independent approval for:

1. Authentication account creation
2. Profile verification
3. Active `individual` workspace membership
4. Supported-person record creation
5. Auth-user linkage
6. Program participation
7. Person-facing application-access testing

Schema installation does not authorize any of those actions.

## Explanation-Table Boundary

The personal financial explanation table remains outside this plan.

It may be considered only after:

- supported-person identity is installed;
- program participation is installed;
- authentication linkage is proven;
- RLS is tested;
- Johnny onboarding authority is separately approved.

## Trust Engine Boundary

No installation or test step may:

- read from the Trust Engine using service-role authority;
- write to the Trust Engine;
- synchronize records;
- merge identities;
- transfer approvals;
- transfer fiduciary conclusions;
- infer trust intent from bank observations.

Any future comparison capability requires separate architecture, authority, and consent review.

## Approval Record

Current approval status:

```text
Review-only test and installation plan requested.
No dry run approved.
No installation approved.
No Johnny onboarding approved.
No external-system synchronization approved.
```
## Next Gate

Review this plan against the v0.2 candidate and reconciliation.

After explicit approval, prepare only a review-only dry-run SQL candidate and its expected-results checklist.

Do not execute SQL.
