# THRIVE Assisted Budget Setup v0.1 Approved Implementation Candidate

## Approved participant language

### Money Step 1

**Create your plan**

Start with the money you want to plan with.

**Not sure where to start?**

THRIVE Support can help you build a starter plan to review.

**Action:** Ask for help building my plan

Participant-facing language uses **starter plan**, not **template**.

## Approved product lifecycle

Participant asks for help → admin prepares starter draft → participant reviews → participant changes/accepts/leaves for later → participant acceptance activates the same draft.

The participant never re-enters the admin-prepared categories.

## Live-schema reconciliation

The existing tables remain authoritative:

- `participant_budget_periods`
- `participant_budget_lines`
- `support_requests`
- `support_request_entries`
- `support_request_links`

No parallel assisted-budget table is proposed.

The existing Support link already has `budget_period_id` with workspace/program/person scope enforcement.

The existing participant Budget RPCs remain authoritative for:
- draft editing;
- category editing;
- activation;
- completion.

## New backend candidate

One admin-only transactional RPC:

`prepare_assisted_budget_v1(...)`

It creates the participant-owned draft, starter lines, Support link, participant-visible Support message, and moves the Support request to waiting-for-participant.

One lifecycle hardening trigger prevents workspace admins or reviewers from moving `draft -> active`. Only the supported person may activate the plan.

## v0.1 template strategy

Starter structures stay code-defined for v0.1.

No reusable template database table is proposed yet.

## Authority

Admin may prepare a starter Budget after a participant asks for Money help.

Admin preparation does not equal participant approval.

Participant activation remains the final action.

## Installation gate

Before production installation:

1. review candidate SQL;
2. run database advisors;
3. install in a controlled gate;
4. execute the authenticated test plan;
5. wire admin prototype to the RPC;
6. make Money recognize Support-linked drafts;
7. verify mobile participant flow;
8. merge only after green validation.
