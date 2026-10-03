# THRIVE Live Story v0.1 Candidate

Status: review-only candidate  
Branch: `candidate/live-story-v0-1`

## Purpose

Close the participant loop without inventing a new persistence layer:

`saved lane facts -> Today -> Story -> return to the owning lane`

Story is a derived read surface. It does not create conclusions, scores, attendance, reading completion, or Resource outcomes.

## Candidate changes

1. Recovery Support remains distinct from human THRIVE Support.
   - `recovery_support = could_use_support` plus Wellness `ask_for_help` is treated as the Recovery Support affordance unless `support_needed = yes`.
   - Explicit human-support signals continue to route to THRIVE Support.

2. `/living-signal/story` now reads existing participant facts.
   - Wellness: saved check-ins, grouped by day.
   - Goals: added goals and current completed status where the current row supports it.
   - Money: Financial Activity grouped by day plus completed Money plans.
   - Support: persisted support status events.
   - Current threads: recovery-support preference, current Goal, unresolved Support request, current/draft Money plan.

3. The preview-only Story claims were removed.
   - No hard-coded meeting attendance.
   - No hard-coded Goal completion.
   - No hard-coded Money closeout.
   - No synthetic progress map.

## Explicitly excluded

- No schema migration.
- No new Story table.
- No Resource-browse persistence.
- No meeting-attendance inference.
- No reading-completion inference.
- No routine persistence.
- No Trust Engine work.
- No Johnny activation.
- No production merge or install.

## Review cases

### Recovery Support truth

Given:
- `recovery_support = could_use_support`
- `chosen_next_step = ask_for_help`
- `support_needed IS NULL`

Expected:
- Recovery Support remains the participant-facing direction.
- Cross-lane synthesis does not turn that record into a human Support request/CTA.

Given:
- `support_needed = yes`

Expected:
- Human THRIVE Support remains available regardless of recovery-support selection.

### Story chronology

Expected:
- Multiple Wellness check-ins on one day become one factual daily Story row with the latest saved signal.
- Money activity reports only that activity was recorded.
- Resource browsing does not appear in Story.
- Recovery routine choices do not appear in Story because they are not persisted.
- Support chronology comes only from persisted status events.
- Story links return to the lane that owns the fact.

## Approval boundary

This candidate may be reviewed and tested. Merge, deployment, schema work, and any broader persistence change require a separate approval.
