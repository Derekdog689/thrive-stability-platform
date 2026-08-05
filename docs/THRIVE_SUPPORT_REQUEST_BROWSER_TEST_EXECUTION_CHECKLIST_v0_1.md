# THRIVE Support Request Browser Test Execution Checklist v0.1

## Status

Review-only candidate. Do not execute until separately approved.

## Pre-execution approval checkpoint

- [ ] Separate synthetic execution approval recorded.
- [ ] Current commit checkpoint recorded.
- [ ] `git diff --check` passes.
- [ ] `git status` reviewed.
- [ ] Parked unrelated files remain untouched.
- [ ] No push, merge, deployment, or service-role use approved.
- [ ] No Johnny activation.
- [ ] No Trust Engine synchronization.
- [ ] No notifications or emergency workflow.
- [ ] All Support tables confirmed empty or prior synthetic history documented.

## Harness review

- [ ] Route is development-only.
- [ ] `SUPPORT_TEST_EXECUTION_ENABLED` remains `false` during review.
- [ ] No credentials are stored in source.
- [ ] No service-role key is present.
- [ ] No run-all or batch action exists.
- [ ] Every action displays its payload and exact returned error or data.
- [ ] No DELETE action runs automatically.
- [ ] No account-creation action exists.
- [ ] No linked module mutation action exists.

## Actor preparation

### Participant D

- [ ] Synthetic auth user identified.
- [ ] Email recorded.
- [ ] `auth.uid()` recorded.
- [ ] Workspace ID recorded.
- [ ] Program ID recorded.
- [ ] Supported-person ID recorded.
- [ ] Active program participation confirmed.

### Participant A

- [ ] Synthetic auth user identified.
- [ ] Email recorded.
- [ ] `auth.uid()` recorded.
- [ ] Workspace ID recorded.
- [ ] Program ID recorded.
- [ ] Supported-person ID recorded.
- [ ] Active program participation confirmed.

### Outsider

- [ ] Synthetic auth user identified.
- [ ] Email recorded.
- [ ] `auth.uid()` recorded.
- [ ] No authorized Support workspace confirmed.

### Active Support member

- [ ] Synthetic auth user identified.
- [ ] Workspace member ID recorded.
- [ ] Same-workspace membership confirmed.
- [ ] `member_role = support`.
- [ ] Active status confirmed.

### Active admin

- [ ] Synthetic auth user identified.
- [ ] Workspace member ID recorded.
- [ ] Same-workspace membership confirmed.
- [ ] `member_role = admin`.
- [ ] Active status confirmed.

### Inactive or removed Support member

- [ ] Synthetic auth user identified.
- [ ] Workspace member ID recorded.
- [ ] Non-active status confirmed.
- [ ] No real operational member modified.

## Linked-record preparation

- [ ] Same-scope synthetic Goal ID recorded.
- [ ] Same-scope synthetic Wellness check-in ID recorded.
- [ ] Same-scope synthetic budget-category ID recorded.
- [ ] Same-scope synthetic budget-period ID recorded.
- [ ] Same-scope staged-transaction ID recorded only where ownership is proven.
- [ ] Completed prior synthetic Support request ID recorded, if prior-request linking is tested.
- [ ] No linked source record will be modified by the Support harness.

## Execution record template

For every test, record:

| Field | Value |
|---|---|
| Test ID | |
| Date/time | |
| Actor label | |
| Auth email | |
| `auth.uid()` | |
| Workspace ID | |
| Program ID | |
| Supported-person ID | |
| Request ID | |
| Entry ID | |
| Link ID | |
| Action | |
| Payload | |
| Expected result | |
| Actual result | |
| Exact Supabase error | |
| Screenshot reference | |
| Pass/fail | |
| Stop condition triggered | |

## Gate A: actor and identity proof

- [ ] Participant D authenticates normally.
- [ ] Participant A authenticates normally.
- [ ] Outsider authenticates normally.
- [ ] Active Support member authenticates normally.
- [ ] Active admin authenticates normally.
- [ ] Inactive or removed Support member authenticates normally.
- [ ] Expected reviewer recognition is documented for each actor.
- [ ] No service-role client is used.

## Gate B: Participant D request creation

- [ ] Valid self request succeeds.
- [ ] Status defaults to `submitted`.
- [ ] Routing remains null.
- [ ] Assignment remains null.
- [ ] Terminal timestamps remain null.
- [ ] Initial status event exists.
- [ ] Participant A identity is rejected.
- [ ] Alternate workspace is rejected.
- [ ] Alternate program is rejected.
- [ ] Inactive participation is rejected.
- [ ] Unsupported category is rejected.
- [ ] Blank message is rejected.
- [ ] Message over 4,000 characters is rejected.
- [ ] Requested support over 2,000 characters is rejected.
- [ ] Participant-supplied routing is rejected.
- [ ] Participant-supplied assignment is rejected.
- [ ] Participant-supplied terminal timestamps are rejected.

## Gate C: read isolation

- [ ] Participant D sees own request.
- [ ] Participant D sees own participant response.
- [ ] Participant D does not see internal note.
- [ ] Participant D sees active links only.
- [ ] Participant D sees `status_changed` events only.
- [ ] Participant A sees no Participant D Support records.
- [ ] Outsider sees no Support records.

## Gate D: participant links

- [ ] Same-scope Goal link succeeds.
- [ ] Same-scope Wellness link succeeds.
- [ ] Same-scope budget-category link succeeds.
- [ ] Same-scope budget-period link succeeds.
- [ ] Same-scope staged-transaction link succeeds only where ownership is proven.
- [ ] Cross-person link is rejected.
- [ ] Cross-program link is rejected.
- [ ] Cross-workspace link is rejected.
- [ ] Multiple targets in one link row are rejected.
- [ ] Self-referencing prior request is rejected.
- [ ] Non-completed prior request is rejected.
- [ ] Archive with reason succeeds while parent remains submitted.
- [ ] Archive without reason is rejected.
- [ ] Link change after acknowledgment is rejected.

## Gate E: withdrawal

- [ ] Second Participant D request created.
- [ ] `submitted -> withdrawn` succeeds.
- [ ] `withdrawn_at` populated.
- [ ] Unrelated simultaneous field mutation rejected.
- [ ] Reopening withdrawn request rejected.
- [ ] Reviewer archives withdrawn request.
- [ ] `withdrawn_at` remains after archive.

## Gate F: reviewer workflow

- [ ] Active Support member reads submitted request.
- [ ] Direct `submitted -> archived` rejected.
- [ ] `submitted -> acknowledged` succeeds.
- [ ] Routing category set without changing participant category.
- [ ] Active same-workspace Support assignment succeeds.
- [ ] Active same-workspace admin assignment succeeds.
- [ ] Inactive assignment rejected.
- [ ] Outsider assignment rejected.
- [ ] Viewer assignment rejected.
- [ ] Trustee assignment rejected.
- [ ] Individual assignment rejected.
- [ ] Cross-workspace assignment rejected.
- [ ] `acknowledged -> in_progress` succeeds.
- [ ] `in_progress -> waiting_for_participant` succeeds.
- [ ] `waiting_for_participant -> in_progress` succeeds.
- [ ] Completion succeeds.
- [ ] `completed_at` populated.
- [ ] Reopening completed request rejected.
- [ ] Completed request archives.
- [ ] `completed_at` remains after archive.
- [ ] Active admin authority produces the same scope restrictions.

## Gate G: entries

- [ ] Reviewer creates participant response.
- [ ] Reviewer creates internal note.
- [ ] Participant sees participant response only.
- [ ] Participant A sees neither.
- [ ] Outsider sees neither.
- [ ] Reviewer sees both.
- [ ] Blank content rejected.
- [ ] Content over 4,000 characters rejected.
- [ ] Blank non-null title rejected.
- [ ] Title over 120 characters rejected.
- [ ] Content edit rejected.
- [ ] Archive with reason succeeds.
- [ ] Archive without reason rejected.
- [ ] Archived participant response leaves normal participant view.
- [ ] Reviewer retains audit visibility.
- [ ] Hard delete rejected.

## Gate H: status and audit events

- [ ] Submission event exists.
- [ ] Withdrawal event exists.
- [ ] Acknowledgment event exists.
- [ ] Lifecycle transition events exist.
- [ ] Routing event exists.
- [ ] Assignment event exists.
- [ ] Entry archive event exists.
- [ ] Link archive event exists.
- [ ] Participant sees only `status_changed`.
- [ ] Reviewer sees all authorized event types.
- [ ] Direct insert rejected.
- [ ] Direct update rejected.
- [ ] Direct delete rejected.

## Gate I: inactive or removed reviewer

- [ ] Reviewer recognition is false.
- [ ] Reviewer-only select denied.
- [ ] Request update denied.
- [ ] Entry insert denied.
- [ ] Entry archive denied.
- [ ] Link archive denied.
- [ ] Assignment denied.

## Gate J: no-delete proof

- [ ] Participant DELETE denied on all four Support tables.
- [ ] Support reviewer DELETE denied on all four Support tables.
- [ ] Admin DELETE denied on all four Support tables.
- [ ] Outsider DELETE denied on all four Support tables.
- [ ] Historical records remain available through authorized reads.

## Gate K: cross-module boundary proof

- [ ] Goal unchanged.
- [ ] Wellness check-in unchanged.
- [ ] Staged transaction unchanged.
- [ ] Budget category unchanged.
- [ ] Budget period unchanged.
- [ ] Program participation unchanged.
- [ ] No Trust Engine record or action created.
- [ ] No external-sharing consent created.
- [ ] No notification created.
- [ ] No emergency or clinical workflow triggered.

## Stop conditions

Stop immediately if any item occurs:

- [ ] One participant sees another participant's record.
- [ ] Outsider receives Support data.
- [ ] Internal note becomes participant-visible.
- [ ] Terminal request reopens.
- [ ] Linked source record changes through Support.
- [ ] DELETE succeeds.
- [ ] Reviewer acts outside the authorized workspace.
- [ ] Trust Engine, notification, emergency, or external-sharing action occurs.

## Closeout

- [ ] Synthetic records archived through approved lifecycle paths.
- [ ] No hard delete performed.
- [ ] All synthetic IDs documented.
- [ ] Screenshots indexed.
- [ ] Pass/fail table completed.
- [ ] No service-role client used.
- [ ] `git diff --check` run.
- [ ] `git status` recorded.
- [ ] Commit checkpoint recorded.
- [ ] No push, merge, or deployment performed without approval.

## Exact next gate after candidate review

Approve or revise the review-only files. Synthetic actor creation and test execution remain separately gated.
