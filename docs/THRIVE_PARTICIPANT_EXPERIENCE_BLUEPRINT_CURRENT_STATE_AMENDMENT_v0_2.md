# THRIVE Participant Experience Blueprint Current-State Amendment v0.2

## Document status

Review-only current-state amendment.

This document updates the implementation status of the approved `THRIVE_PARTICIPANT_EXPERIENCE_BLUEPRINT_v0_1.md`. It does not replace the original blueprint. The original product principles, ownership boundaries, source-separation rules, and Trust Engine boundary remain in force.

This amendment does not authorize new schema, SQL execution, production writes, service-role use, deployment, push, merge, or Trust Engine synchronization.

## Current verified checkpoint

`c8fb1e8 Document participant Budget install and visibility verification`

## Verified participant experience now implemented

### Today

Status: implemented as the participant landing page.

Current verified behavior:

- participant-safe greeting;
- connected-source summary;
- imported-transaction count;
- recorded outflow summary;
- latest statement period;
- next-step links;
- explicit read-only participant boundary;
- no legal, clinical, fiduciary, or behavioral conclusion from spending.

### My Program

Status: implemented in the shared participant shell.

Current verified behavior:

- active participant-linked program lookup;
- preferred or display name;
- program name and description;
- program type and status;
- participant role and participation status;
- participant-safe no-program state;
- no program administration or membership writes;
- no Trust Engine controls.

### Budget

Status: first participant-facing read model implemented and verified.

Current verified behavior for synthetic Person D:

- one active February 2099 Budget period;
- four Budget lines;
- planned total of $2,400.00;
- recorded actual total of $35.00;
- generated remaining total of $2,365.00;
- imported financial evidence displayed separately from the Budget plan.

Identity verification:

- Person D sees one period and four lines;
- Person A sees zero periods and zero lines;
- outsider sees zero periods and zero lines.

Budget planning and imported bank evidence remain distinct records and distinct participant-facing sections.

### Reports

Status: initial participant-readable shell implemented earlier than the original recommended sequence.

Current verified behavior:

- connected financial-source summary;
- imported-transaction count;
- recorded outflow;
- category summary;
- statement history;
- explicit source and interpretation boundary.

Reports remain educational and read-only.

## Current shared navigation

1. Today
2. My Program
3. Budget
4. Wellness
5. Goals
6. Support
7. Reports

Wellness, Goals, and Support remain future-facing navigation items until their separate gates are approved.

## Clarification on bank observations

Controlled synthetic bank observations are now present for development and authenticated visibility testing.

This does not authorize:

- real bank connection;
- real participant transaction import;
- financial interpretation;
- automated categorization conclusions;
- Trust Engine synchronization;
- use of a displayed transaction as evidence of intent, irresponsibility, relapse, incapacity, deception, misuse, or any legal, clinical, or fiduciary conclusion.

Imported records remain observational evidence only.

## Product direction retained

- Today is the participant landing page;
- My Program is the read-only support-structure page;
- Budget supports planning and transparent comparison;
- Wellness supports brief non-clinical self-report and help-seeking;
- Goals will support participant-owned progress;
- Support will provide structured assistance requests;
- source ownership must remain visible;
- facts, patterns, explanations, and conclusions must remain distinct;
- internal test routes remain outside normal participant navigation.

## Next product phase

The next product phase is Wellness v0.1.

The first Wellness step is a read-only participant shell establishing plain-language purpose, participant ownership of self-report, a non-clinical interpretation boundary, candidate reflection areas, supportive next-step language, and a neutral no-history state.

No write affordance is authorized until schema, ownership, RLS, and safety workflows are separately reviewed and approved.

## Frozen boundaries

- no Wellness database objects;
- no Wellness writes;
- no check-in storage;
- no clinical scoring;
- no relapse inference;
- no capacity inference;
- no emergency escalation;
- no spending-to-wellness inference;
- no Johnny data;
- no real bank import;
- no Trust Engine synchronization;
- no service-role use;
- no deployment;
- no push or merge;
- no deletion of internal test routes.

## Build status

Documentation-only amendment. No source build required.

## Exact next gate

Review and approve the first non-clinical Wellness shell candidate.

After approval, inspect the existing shared participant shell and navigation, then create `/wellness` as a read-only participant page with no schema or write workflow.
