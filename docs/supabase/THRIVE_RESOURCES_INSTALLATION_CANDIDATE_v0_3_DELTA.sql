-- THRIVE Resources / Guided Reference
-- Installation candidate v0.3 DELTA
-- Date: 2026-08-24
-- REVIEW-ONLY. DO NOT EXECUTE YET.
--
-- Purpose:
-- Correct one live-schema mismatch found during pre-install preflight.
--
-- Live truth:
-- public.support_request_links currently enforces exactly one primary target across:
--   staged_transaction_id
--   budget_category_id
--   budget_period_id
--   wellness_checkin_id
--   goal_id
--   prior_support_request_id
--
-- Resources v0.2 adds resource_id as a new legitimate primary Support-link target.
-- Without changing the existing constraint, a resource-only Support link would fail.
--
-- This delta changes ONLY that constraint.
-- resource_access_path_id remains optional subordinate context and is intentionally
-- NOT counted as a separate primary target.

begin;

alter table public.support_request_links
  drop constraint if exists support_request_links_exactly_one_target;

alter table public.support_request_links
  add constraint support_request_links_exactly_one_target
  check (
    num_nonnulls(
      staged_transaction_id,
      budget_category_id,
      budget_period_id,
      wellness_checkin_id,
      goal_id,
      prior_support_request_id,
      resource_id
    ) = 1
  );

-- Existing v0.2 resource-path shape and composite FK remain unchanged:
--   resource_access_path_id may be null;
--   if present, resource_id must also be present;
--   if present, the access path must belong to that same resource.
--
-- Resulting valid shapes include:
--   goal_id only
--   wellness_checkin_id only
--   prior_support_request_id only
--   resource_id only
--   resource_id + matching resource_access_path_id
--
-- Invalid shapes remain rejected:
--   resource_id + goal_id
--   resource_id + wellness_checkin_id
--   resource_access_path_id without resource_id
--   resource_id + access path belonging to another resource

rollback;

-- END REVIEW-ONLY v0.3 DELTA
