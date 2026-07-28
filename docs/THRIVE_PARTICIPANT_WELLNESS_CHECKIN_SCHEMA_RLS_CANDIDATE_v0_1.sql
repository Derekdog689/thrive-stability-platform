-- THRIVE PARTICIPANT WELLNESS CHECK-IN SCHEMA AND RLS CANDIDATE v0.1
-- REVIEW ONLY
-- DO NOT EXECUTE
--
-- This file is intentionally non-installing.
-- It records the proposed shape for review against live helpers and constraints.

-- ============================================================
-- PROPOSED TABLE
-- ============================================================

/*
create table public.participant_wellness_checkins (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete restrict,

  program_id uuid not null
    references public.programs(id) on delete restrict,

  supported_person_id uuid not null
    references public.supported_people(id) on delete restrict,

  checkin_date date not null default current_date,

  overall_day text not null,

  stress text null,
  sleep text null,
  energy text null,
  confidence text null,
  routine text null,
  recovery_support text null,

  support_needed boolean null,

  chosen_next_step text null,
  participant_note text null,

  status text not null default 'active',

  created_by uuid not null
    references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint participant_wellness_checkins_overall_day_check
    check (overall_day in ('good', 'okay', 'hard', 'not_sure')),

  constraint participant_wellness_checkins_stress_check
    check (
      stress is null
      or stress in ('low', 'okay', 'high', 'not_sure')
    ),

  constraint participant_wellness_checkins_sleep_check
    check (
      sleep is null
      or sleep in ('good', 'okay', 'poor', 'not_sure')
    ),

  constraint participant_wellness_checkins_energy_check
    check (
      energy is null
      or energy in ('good', 'okay', 'low', 'not_sure')
    ),

  constraint participant_wellness_checkins_confidence_check
    check (
      confidence is null
      or confidence in ('good', 'okay', 'low', 'not_sure')
    ),

  constraint participant_wellness_checkins_routine_check
    check (
      routine is null
      or routine in ('on_track', 'mixed', 'off_track', 'not_sure')
    ),

  constraint participant_wellness_checkins_recovery_support_check
    check (
      recovery_support is null
      or recovery_support in (
        'connected',
        'could_use_support',
        'not_needed',
        'not_sure'
      )
    ),

  constraint participant_wellness_checkins_next_step_check
    check (
      chosen_next_step is null
      or chosen_next_step in (
        'take_a_break',
        'review_today_plan',
        'choose_one_task',
        'contact_supportive_person',
        'food_water_rest',
        'ask_for_help',
        'other'
      )
    ),

  constraint participant_wellness_checkins_status_check
    check (status in ('active', 'archived')),

  constraint participant_wellness_checkins_note_not_blank
    check (
      participant_note is null
      or length(trim(participant_note)) > 0
    ),

  constraint participant_wellness_checkins_archive_state_check
    check (
      (status = 'active' and archived_at is null)
      or
      (status = 'archived' and archived_at is not null)
    )
);
*/

-- ============================================================
-- PROPOSED INDEXES
-- ============================================================

/*
create index participant_wellness_checkins_person_date_idx
  on public.participant_wellness_checkins (
    workspace_id,
    program_id,
    supported_person_id,
    checkin_date desc
  );

create unique index participant_wellness_checkins_one_active_day_idx
  on public.participant_wellness_checkins (
    supported_person_id,
    checkin_date
  )
  where status = 'active';
*/

-- ============================================================
-- PROPOSED SCOPE VALIDATION
-- ============================================================

/*
A before insert/update trigger should confirm:

1. supported_people.id = supported_person_id
2. supported_people.workspace_id = workspace_id
3. supported_people.status = 'active'
4. programs.id = program_id
5. programs.workspace_id = workspace_id
6. programs.status = 'active'
7. an active program_participants row exists for:
   - workspace_id
   - program_id
   - supported_person_id
8. created_by = auth.uid() for participant-created entries

Do not finalize the trigger until current live helper functions and parent
constraints are inspected.
*/

-- ============================================================
-- PROPOSED RLS
-- ============================================================

/*
alter table public.participant_wellness_checkins enable row level security;
alter table public.participant_wellness_checkins force row level security;

Participant SELECT policy candidate:

A signed-in user may select a row when:

exists (
  select 1
  from public.supported_people sp
  where sp.id = participant_wellness_checkins.supported_person_id
    and sp.auth_user_id = auth.uid()
    and sp.status = 'active'
    and sp.workspace_id = participant_wellness_checkins.workspace_id
)

Participant INSERT policy candidate:

A signed-in user may insert when:

- created_by = auth.uid()
- the supported person is linked to auth.uid()
- the supported person is active
- the program participation is active
- workspace, program, and person scope agree

Participant UPDATE policy candidate:

Initially limit updates to:

- the participant's own active same-day check-in;
- participant_note;
- optional reflection fields;
- chosen_next_step;
- support_needed;
- updated_at.

Do not allow changing:

- workspace_id;
- program_id;
- supported_person_id;
- created_by;
- created_at.

DELETE policy:

No delete policy.

Archive policy:

Archive should be an update from active to archived with archived_at set.
The exact actor permissions remain unresolved.
*/

-- ============================================================
-- PROPOSED READ MODEL
-- ============================================================

/*
The first UI may read directly through RLS:

select
  id,
  checkin_date,
  overall_day,
  stress,
  sleep,
  energy,
  confidence,
  routine,
  recovery_support,
  support_needed,
  chosen_next_step,
  participant_note,
  status,
  created_at,
  updated_at
from public.participant_wellness_checkins
where status = 'active'
order by checkin_date desc, created_at desc;
*/

-- ============================================================
-- INSTALLATION BLOCKERS
-- ============================================================

-- 1. Inspect live parent constraints.
-- 2. Inspect live helper functions.
-- 3. Decide staff visibility.
-- 4. Decide same-day edit behavior.
-- 5. Decide archive authority.
-- 6. Produce rollback dry-run candidate.
