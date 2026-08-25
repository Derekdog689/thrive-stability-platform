-- THRIVE System Checkpoints Install v0.1
-- Date: 2026-08-24
-- Status: approved installation candidate
-- Purpose: smallest system-level known-good baseline ledger.
-- This does not create participant content, Trust Engine synchronization,
-- supported-person records, auth users, or application-facing mutation paths.

begin;

create table public.system_checkpoints (
  id uuid primary key default gen_random_uuid(),
  checkpoint_name text not null,
  version text not null,
  status text not null,
  scope text not null,
  summary text not null,
  repo_commit text,
  evidence_paths text[] not null default '{}'::text[],
  recorded_at timestamptz not null default now(),
  recorded_by uuid null references auth.users(id) on delete set null,
  recorded_by_label text not null,
  notes text,
  supersedes_checkpoint_id uuid null references public.system_checkpoints(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint system_checkpoints_name_nonblank_chk
    check (length(btrim(checkpoint_name)) between 1 and 160),

  constraint system_checkpoints_version_nonblank_chk
    check (length(btrim(version)) between 1 and 80),

  constraint system_checkpoints_status_chk
    check (status = any (array['candidate'::text, 'frozen'::text, 'superseded'::text, 'archived'::text])),

  constraint system_checkpoints_scope_nonblank_chk
    check (length(btrim(scope)) between 1 and 4000),

  constraint system_checkpoints_summary_nonblank_chk
    check (length(btrim(summary)) between 1 and 8000),

  constraint system_checkpoints_repo_commit_chk
    check (repo_commit is null or repo_commit ~ '^[0-9a-f]{7,40}$'),

  constraint system_checkpoints_recorded_by_label_nonblank_chk
    check (length(btrim(recorded_by_label)) between 1 and 240),

  constraint system_checkpoints_notes_length_chk
    check (notes is null or length(btrim(notes)) between 1 and 8000),

  constraint system_checkpoints_not_self_supersede_chk
    check (supersedes_checkpoint_id is null or supersedes_checkpoint_id <> id),

  constraint system_checkpoints_name_version_unique
    unique (checkpoint_name, version)
);

comment on table public.system_checkpoints is
  'THRIVE system-level known-good checkpoint ledger. Detailed evidence remains in the repository; this table records concise baseline identity, scope, provenance, and lifecycle.';

comment on column public.system_checkpoints.scope is
  'Explicitly verified system scope. A checkpoint does not certify behavior outside this text.';

comment on column public.system_checkpoints.evidence_paths is
  'Repository paths supporting the checkpoint. Detailed evidence is not duplicated into the database.';

comment on column public.system_checkpoints.recorded_by_label is
  'Human-readable provenance label. recorded_by may be null when a checkpoint is recorded through an approved administrative database operation rather than an authenticated product session.';

alter table public.system_checkpoints enable row level security;
alter table public.system_checkpoints force row level security;

revoke all on table public.system_checkpoints from public;
revoke all on table public.system_checkpoints from anon;
revoke all on table public.system_checkpoints from authenticated;

-- No participant, Support, reviewer, workspace-admin, or generic authenticated
-- policies are installed in v0.1. Reading or changing system governance through
-- product UI requires a separately reviewed future gate.

create or replace function public.prevent_system_checkpoint_delete()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  raise exception 'THRIVE system checkpoints are append/preserve records and may not be hard-deleted';
end;
$$;

revoke all on function public.prevent_system_checkpoint_delete() from public;
revoke all on function public.prevent_system_checkpoint_delete() from anon;
revoke all on function public.prevent_system_checkpoint_delete() from authenticated;

create trigger system_checkpoints_prevent_delete
before delete on public.system_checkpoints
for each row
execute function public.prevent_system_checkpoint_delete();

commit;
