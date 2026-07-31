# THRIVE Goals Participant UI Wiring Candidate v0.1

## Status

Review-only participant UI candidate.

This package does not authorize deployment, production activation, Johnny use, Trust Engine synchronization, service-role use, hard delete, merge, or push.

## Verified starting state

- Goals schema v0.2 is installed and post-install verified.
- Authenticated synthetic RLS testing passed.
- One archived synthetic Goal remains as evidence.
- Current `/goals` route is a read-only shell.
- The established participant-resolution path is:
  - authenticated browser session;
  - `supported_people.auth_user_id`;
  - active `program_participants` row;
  - participant-scoped `participant_goals`.
- No additional database migration is proposed.

## Candidate files

- `src/app/goals/page.tsx`
- `src/app/goals/useParticipantGoals.ts`

## Participant capabilities

The candidate allows a signed-in participant with active program participation to:

- view active Goals;
- view archived Goals separately;
- create a participant-owned Goal;
- provide an optional personal reason;
- record one next step;
- choose an optional goal area;
- update progress among:
  - not started;
  - in progress;
  - paused;
  - completed;
- archive a Goal.

## Preserved boundaries

The candidate does not allow:

- hard delete;
- participant reactivation of archived Goals;
- staff-suggestion creation;
- automatic Wellness-to-Goal conversion;
- Trust Engine synchronization;
- program-participation changes;
- staff assignment;
- scoring;
- compliance findings;
- clinical interpretation;
- relapse findings;
- capacity findings;
- legal or fiduciary conclusions.

## Data and ownership behavior

Create operations force:

```text
ownership_source = participant
created_by = authenticated user
supported_person_id = authenticated supported person
workspace_id = participant workspace
program_id = active participation program
progress_status = not_started
```

The browser does not choose or edit identity, ownership, workspace, program, creator, or created timestamp fields.

RLS and the installed trigger remain the final authority.

## UX behavior

- participant-safe language only;
- no UUID display;
- no raw JSON;
- no database terminology;
- clear empty states;
- supportive confirmation messages;
- archived Goals remain visible only when requested;
- no reactivation control is shown;
- no delete control is shown.

## Review notes

The candidate intentionally keeps editing narrow in v0.1. Progress and archive actions are visible. Full inline editing of title, reason, next step, and goal area can be added in a later reviewed pass if desired.

The hook already supports updating those fields without changing identity or ownership scope.

## Exact next gate

Copy the two candidate source files into the repository, run the build and static checks, and review the `/goals` experience using synthetic Participant A or D.

Do not deploy or push.
