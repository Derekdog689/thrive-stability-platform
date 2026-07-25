# THRIVE Supported Person Identity Model v0.1

## Status

Architecture candidate only.

No database migration is authorized by this document.

## Purpose

THRIVE supports one person at a time.

The platform therefore requires a neutral identity for the person receiving
support. That identity must remain distinct from organizations, trusts,
programs, staff accounts, external systems, and application-access records.

A supported person may also have an authenticated THRIVE login. The personal
identity and authenticated account should be linked without being treated as
the same database concept.

## Current Schema Gap

The current schema includes:

- authenticated user profiles;
- workspaces;
- workspace memberships;
- programs;
- financial sources;
- financial import batches;
- staged financial observations;
- financial review records.

It does not include a neutral supported-person identity.

The following existing identities must not be used alone as a substitute:

- `profiles.id` identifies an authenticated application user;
- `workspace_members.user_id` identifies a user with workspace access;
- `workspaces.id` identifies an organizational or operational boundary;
- `programs.id` identifies a support lane;
- `created_by` identifies the authenticated author of a record.

None of those fields independently identifies the person whose personal support
spine is being maintained.

## Proposed Entity: supported_people

A `supported_people` record represents one person receiving THRIVE support.

It does not independently create:

- legal authority;
- trustee authority;
- clinical status;
- financial incapacity;
- guardianship;
- beneficiary classification;
- consent;
- application access.

Candidate fields:

- `id`
- `workspace_id`
- `auth_user_id`
- `display_name`
- `preferred_name`
- `status`
- `external_reference`
- `created_by`
- `created_at`
- `updated_at`

### Authentication Link

`auth_user_id` should be nullable and unique when present.

This allows a supported person to exist before receiving a login while also
allowing the person to later authenticate and access authorized parts of their
own record.

The authentication link does not replace workspace membership or permission
checks.

### Status Values

Candidate status values:

- `active`
- `paused`
- `archived`

### External Reference

`external_reference` is optional.

It may support reconciliation with an authorized external system, but it must
not automatically expose, merge, or transfer information between systems.

## Proposed Entity: program_participants

A `program_participants` record connects one supported person to one THRIVE
program.

Candidate fields:

- `id`
- `workspace_id`
- `program_id`
- `supported_person_id`
- `participant_role`
- `status`
- `created_by`
- `created_at`
- `updated_at`

Candidate participant role:

- `supported_person`

Candidate status values:

- `active`
- `inactive`
- `completed`

The initial model permits one supported person to participate in more than one
program while preserving independent program context.

## Johnny Model

Johnny is the first modeled supported person.

His personal financial observations, responsibilities, explanations, wellness
input, goals, and support context belong to his THRIVE personal support spine.

Johnny will receive an authenticated THRIVE login.

His login should be connected to his supported-person record through
`auth_user_id`. He should also receive an active workspace membership with the
role `individual`.

The Jutta Koster Living Trust remains an independent external system.

Johnny's supported-person identity must not be represented by:

- the Trust;
- the trustee;
- a trust-beneficiary field;
- the THRIVE workspace;
- the THRIVE program;
- a DSS staff login.

## Authenticated Users Versus Supported People

These identities serve different purposes:

```text
supported_person
  = the person whose personal support context is being recorded

auth_user
  = a person authenticated to use the application

workspace_member
  = the authenticated user's access role within a workspace

created_by
  = the authenticated user who created a particular record
For Johnny, the supported-person identity and authenticated account will refer
to the same human, but they retain different technical responsibilities.

Johnny's Initial Access Role

Johnny's initial application-access model should be:

auth.users
  -> profiles
  -> workspace_members.member_role = individual
  -> supported_people.auth_user_id
  -> program_participants

His access should be limited to approved person-facing functions associated
with his own supported-person identity.

He must not automatically receive:

workspace administration rights;
access to DSS administrative records;
access to another supported person's information;
Trust Engine records;
trustee decision records;
unrestricted review or approval functions.
Explanation Relationship

A future personal financial explanation should identify:

the supported person;
the program participation;
the staged financial observation;
the explanation author;
the source of the explanation;
visibility and sharing scope;
correction or supersession lineage.

The explanation must remain separate from the immutable bank observation.

Johnny may author his own explanation while signed in.

An authorized DSS support user may also document an explanation or context
provided by Johnny. The record must distinguish who supplied the information
from who entered it into THRIVE.

Scoped Integrity

Future foreign keys should preserve workspace and program identity.

The staged financial transaction table already supports a scoped relationship
through:

id + workspace_id + program_id

The supported-person and program-participant schema should follow the same
scope-preserving pattern.

Access Boundary

Creating a supported-person record does not automatically give that person,
staff member, family member, trustee, or external organization access.

Application access remains governed separately through:

authenticated users;
workspace membership;
role-based permissions;
supported-person ownership;
documented authority;
consent;
record visibility.

Linking auth_user_id does not by itself grant database access.

First Implementation Boundary

The first implementation should support:

one supported-person record for Johnny;
one authenticated user link for Johnny when his account is created;
one active individual workspace membership for Johnny;
one active assignment to the current support program;
authenticated DSS administrative access under the existing authorized
support relationship;
person-facing access limited to Johnny's own approved information;
no automatic external sharing;
no Trust Engine synchronization;
no deletion policy;
archive or deactivate instead of hard deletion.
Future Reusability

The same structure may later support another person without reusing Johnny's
identity, permissions, explanations, wellness records, or financial context.

Each supported person must receive:

an independent supported-person record;
independent program participation;
independent permissions;
independent support context;
an optional separate authenticated login.

The platform may support many people, but it operates one person at a time.

Next Gate

After this model is reviewed, create a review-only SQL candidate for:

supported_people
program_participants
the optional authenticated-user linkage
person-scoped access helper functions and RLS policies

Do not create the personal financial explanation table until supported-person
identity, program participation, authentication linkage, and access controls
are installed, secured, and tested.
