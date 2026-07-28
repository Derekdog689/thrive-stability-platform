# THRIVE Budget Participant Product Review Candidate v0.1

## Status

Review-only participant-experience candidate.

## Purpose

Improve interpretation of the existing participant Budget read model without
adding edits, explanations, or database changes.

## Preserved behavior

- authenticated participant access;
- current budget-period resolution;
- participant budget-line reads;
- planned, actual, and remaining amounts;
- recent participant-owned transaction reads;
- latest statement-period context;
- read-only behavior.

## Product changes

- adds descriptive category states;
- changes “actual” language to “recorded activity” where participant-facing;
- explains what planned, recorded, and remaining values mean;
- adds a neutral progress bar for each category;
- preserves the observational status of banking evidence;
- removes technical “participant Budget” wording;
- keeps all participant writes disabled.

## Descriptive states

- No activity yet
- Plan available
- Within the current plan
- Most of the plan is used
- Plan fully used
- Above the current plan

These states describe connected amounts only. They do not determine intent,
responsibility, relapse, capacity, or misuse.

## Frozen boundaries

- no database or RLS changes;
- no ingestion changes;
- no participant editing;
- no transaction-explanation write;
- no Johnny or real participant data changes;
- no Trust Engine synchronization;
- no deployment.

## Review questions

1. Are the descriptive states understandable without sounding judgmental?
2. Does the page help the participant interpret the numbers?
3. Are the category cards readable on desktop and mobile?
4. Does transaction evidence remain clearly observational?
5. Is the page useful without adding edits yet?

## Exact next gate

Review `/budget` locally on desktop and narrow mobile widths.

Do not commit until the visible wording and layout are approved.
