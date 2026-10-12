-- REVIEW-ONLY CANDIDATE. DO NOT APPLY WITHOUT EXPLICIT INSTALL APPROVAL.
-- Retains only the most recent selected guidance and corresponding optional usefulness.
alter table public.participant_goals
  add column guidance_choice text,
  add column guidance_title text,
  add column guidance_body text,
  add column guidance_usefulness text;

alter table public.participant_goals
  add constraint participant_goals_guidance_choice_check
    check (guidance_choice is null or guidance_choice in ('example', 'smaller', 'think')),
  add constraint participant_goals_guidance_usefulness_check
    check (guidance_usefulness is null or guidance_usefulness in ('yes', 'not_really', 'not_sure_yet')),
  add constraint participant_goals_guidance_consistency_check
    check (
      (guidance_choice is null and guidance_title is null and guidance_body is null and guidance_usefulness is null)
      or (guidance_choice is not null and nullif(btrim(guidance_title), '') is not null and nullif(btrim(guidance_body), '') is not null)
    );

comment on column public.participant_goals.guidance_choice is 'Participant-selected guidance type, not a progress or completion signal.';
comment on column public.participant_goals.guidance_usefulness is 'Optional participant usefulness feedback about the currently retained guidance.';
