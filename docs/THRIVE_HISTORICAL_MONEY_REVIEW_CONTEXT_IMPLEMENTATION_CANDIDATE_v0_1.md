# THRIVE Historical Money Review Context Implementation Candidate v0.1

Status: REVIEW-ONLY IMPLEMENTATION CANDIDATE

Approved gate: document the smallest safe implementation for preserving exact completed Money-plan identity through participant Support and Admin review. No code, schema, SQL, merge, deploy, or historical-data changes are authorized by this file.

## Verified findings

- Money can reopen an exact completed Budget period by ID, including older completed periods.
- Money already derives factual closeout and immediate-prior-period comparison for the selected completed plan.
- A1 carries the exact Budget period into Support before submit.
- The current Support request create path does not persist that Budget-period identity after submit.
- Live schema confirms support_request_links is RLS-enabled and already contains budget_period_id scoped to the same workspace, program, and supported person.
- Existing Support design permits participant-created context links on a newly submitted request and reviewer reads of those links.
- Existing Admin assisted-Budget workflow remains the correct path for starter-plan requests.

## Candidate direction

### H1. Persist review-plan identity
After a review-plan Support request is created, attach its exact completed Budget period through the existing support_request_links budget-period relationship. Validate the period first. If context attachment fails, keep the participant's Support request and report that the exact Money context was not attached. Never substitute a different plan.

### H2. Shared factual summary
Extract the existing completed-plan calculations into one reusable Money summary so Money and Support cannot disagree. Facts only: period dates/status, available, planned, recorded out, remaining, unassigned, activity count, within/over category counts, and immediate-prior factual deltas. No scoring, causal explanation, or recommendation.

### H3. Participant saved-context card
A saved review-plan request should reopen with a compact Continuing from Money card for the same exact completed plan. No transaction list by default.

### H4. Admin read-path verification
Do not assume Admin can reuse participant get_my_* financial reads. First verify a narrowly authorized Admin read path for the exact linked Budget facts. If current authorization is insufficient, stop and create a separate read-only backend candidate. Do not broaden Admin access silently.

### H5. Intent-aware Admin behavior
starter-plan keeps Prepare starter budget. review-plan gets Review Money plan and factual historical context first. Historical review must not automatically create a new draft.

## Historical reach
v0.1 supports any exact completed plan plus its immediately prior completed-plan comparison. It does not add arbitrary plan-vs-plan selection, ranking, success/failure labels, trend scores, or inferred reasons.

## Story boundary
Story is unchanged in this pass. A later Story gate may reuse the shared factual summary for restrained cross-plan facts that link back to the exact historical plan.

## Acceptance sequence
1. Latest completed plan -> Support -> save -> reopen -> same exact plan remains attached.
2. Older completed plan -> Support -> save -> reopen -> same older plan remains attached and comparison uses its immediately prior completed plan.
3. Starter-plan remains separate and existing assisted-Budget workflow still works.
4. Admin review-plan shows exact factual context without automatically opening Budget creation.
5. Invalid/inaccessible Budget IDs never cause another plan to be substituted.

## Proposed gates
H1 participant persistence/readback. H2 shared summary + participant card. H3 Admin read-path verification only. H4 Admin historical context presentation. H5 intent-aware Admin action + dual-login/phone acceptance.
