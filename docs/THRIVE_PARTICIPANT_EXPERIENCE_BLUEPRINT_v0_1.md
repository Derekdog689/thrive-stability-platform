# THRIVE Participant Experience Blueprint v0.1

## Document status

Review-only product blueprint.

This document defines the intended participant-facing experience for the THRIVE personal stability, financial capability, and recovery-informed support platform.

It does not authorize implementation, database changes, SQL execution, data migration, production writes, service-role use, deployment, or synchronization with the Trust Engine.

## Verified starting state

The following foundation has been completed and validated:

- authenticated supported-person identity linkage;
- active participation lookup;
- participant-linked program lookup;
- participant-safe program RLS;
- Person A positive access validation;
- Person D positive access validation;
- controlled outsider isolation validation;
- participant navigation installation;
- permanent participant route at `/my-program`;
- production build validation;
- permanent My Program v0.1 validation record.

Current source checkpoint:

-- c8fb1e8 (HEAD -> main) Document permanent My Program v0.1 validation`

The synthetic accounts and diagnostic routes were used to prove system communication, scope, and isolation. They are not the intended final participant experience.

## Product intent

THRIVE should help one supported person understand where they are, what matters today, what they planned, what happened, what needs explanation, and what manageable next step is available.

The participant experience should be:

- person-centered;
- supportive rather than punitive;
- educational rather than accusatory;
- mobile-first;
- understandable without technical knowledge;
- transparent about where information came from;
- explicit about who owns an entry or decision;
- careful not to turn observations into conclusions.

THRIVE is not a hidden surveillance interface, a clinical judgment engine, a fiduciary authority system, or an extension of the Trust Engine.

## Core system boundary

Johnny's THRIVE personal support spine and the Trust Engine are independent systems.

THRIVE may compare authorized facts across systems, but it must not merge:

- ownership;
- authority;
- approvals;
- consent;
- decision-making;
- record custody;
- fiduciary conclusions.

A bank transaction is an observed fact. It does not establish intent, irresponsibility, relapse, incapacity, trust misuse, deception, or any legal, clinical, or fiduciary conclusion.

## Participant experience principles

### 1. Explain before flagging

When something appears unusual, the participant should first be offered a chance to understand and explain it.

Preferred sequence:

1. show the verified fact;
2. identify its source;
3. invite participant context;
4. offer education or support;
5. record any requested next step;
6. reserve conclusions for authorized people and authorized processes.

### 2. Separate facts, patterns, explanations, and conclusions

The interface should visibly distinguish:

- **Verified fact:** directly stored or received information;
- **Observed pattern:** a repeated or notable sequence;
- **Participant explanation:** the participant's own context;
- **Support explanation:** educational or operational context;
- **Conclusion:** a separately authorized determination, if one exists.

The interface must not visually blend these categories.

### 3. Build around human questions

Participant pages should answer questions such as:

- What matters today?
- What do I have available?
- What bills are coming?
- What did I spend?
- What needs my explanation?
- How am I doing?
- What am I working toward?
- Who can help me?
- What is the next manageable step?

The participant should not need to understand database tables, policies, UUIDs, or system architecture.

### 4. Make mobile use the primary design test

Every feature should be understandable and usable on a phone.

A participant should generally be able to:

- understand the page within a few seconds;
- complete one action with one hand;
- avoid dense forms and large tables;
- see the most important information first;
- return to the home screen easily.

### 5. Separate viewing from doing

Each page should make clear:

- what THRIVE knows;
- what the participant entered;
- what came from an authorized external source;
- what is read-only;
- what the participant may change;
- what requires staff or other authorized action.

## Proposed participant navigation

### MVP navigation

1. Today
2. My Program
3. Budget
4. Wellness
5. Goals
6. Support

### Later navigation

7. Reports
8. Settings or My Information

The initial MVP should not expose test harnesses, schema probes, RLS tools, authentication review pages, or administrative utilities.

## Page 1: Today

### Purpose

`Today` should be the participant's practical home screen.

It should answer:

- What matters today?
- What is coming soon?
- What needs my attention?
- What can I complete now?

### Participant-facing content

Candidate content:

- greeting and current date;
- one primary next step;
- upcoming bill or financial reminder;
- upcoming appointment or commitment;
- active goal progress;
- wellness check-in prompt;
- unresolved explanation request;
- recent positive progress;
- quick access to Budget, Wellness, and Goals.

### Participant actions

Possible participant actions:

- complete today's check-in;
- review a budget item;
- add an explanation;
- mark a participant-owned task complete;
- request help;
- open a current goal.

### Ownership boundaries

The page may summarize information from other THRIVE sections.

It should not independently create legal, clinical, financial, fiduciary, or recovery conclusions.

### MVP status

Recommended first real participant page after blueprint approval.

## Page 2: My Program

### Purpose

`My Program` explains the participant's current support structure.

It should answer:

- What program am I participating in?
- What is the program intended to support?
- What is my role?
- What supports are active?
- What decisions belong to me?
- Who can help me?

### Current v0.1 capability

The permanent `/my-program` route currently displays:

- participant preferred or display name;
- active linked program;
- program description;
- program type;
- program status;
- participant role;
- participation status.

### Proposed v0.2 content

Candidate additions:

- plain-language program overview;
- participant goals connected to the program;
- current support categories;
- participant-safe next steps;
- support contacts or help pathways;
- explanation of participant choice and decision boundaries;
- clear source labels for program facts.

### Participant actions

Initially:

- view program information;
- request help;
- open linked goals;
- acknowledge understanding only when acknowledgment has a real operational purpose.

Program facts should remain read-only until a separately approved edit workflow exists.

### Ownership boundaries

Program administration, membership, status changes, and authority decisions remain outside the participant interface unless explicitly approved.

## Page 3: Budget

### Purpose

`Budget` supports financial capability, understanding, planning, and participant explanation.

It should answer:

- What money is available?
- What bills are planned?
- What has been spent?
- What remains safe to plan?
- What needs explanation?
- What financial goal am I working toward?

### Participant-facing sections

Candidate sections:

- monthly overview;
- available income;
- planned bills;
- recurring obligations;
- spending by category;
- safe-to-plan amount;
- savings goal;
- recent transactions;
- items needing explanation;
- participant notes;
- educational guidance.

### Transaction explanation states

A participant may be able to mark an item as:

- recognized;
- not recognized;
- planned;
- unexpected;
- needs explanation;
- personal purchase;
- support requested.

These states are participant context, not final findings.

### Participant actions

Candidate actions:

- create or update a personal budget plan;
- categorize a participant-owned item;
- add a transaction explanation;
- request help understanding an item;
- create a savings goal;
- record a planned expense;
- compare planned and actual activity.

### Source separation

The interface must clearly label whether an item came from:

- participant entry;
- bank observation;
- THRIVE calculation;
- staff-entered support record;
- separately authorized Trust Engine fact.

A Trust Engine fact must remain a reference to an independent source, not become THRIVE-owned authority.

### Prohibited behavior

Budget must not automatically label spending as irresponsible, suspicious, relapse-related, abusive, or evidence of incapacity.

## Page 4: Wellness

### Purpose

`Wellness` supports reflection, stability, routine, and early help-seeking.

It should answer:

- How am I doing today?
- What is affecting me?
- What support would help?
- What routine am I trying to maintain?
- What is one manageable next step?

### Participant-facing sections

Candidate sections:

- daily or scheduled check-in;
- mood or emotional state;
- stress;
- sleep;
- energy;
- confidence;
- recovery support;
- routine completion;
- optional personal note;
- help request;
- supportive next step.

### Participant actions

Candidate actions:

- complete a brief check-in;
- add a personal note;
- select a current need;
- request contact or support;
- review recent self-reported trends;
- choose a suggested next step.

### Safety and interpretation boundary

Self-reported wellness data must not silently become a clinical diagnosis, relapse determination, capacity finding, or emergency conclusion.

Any urgent safety workflow must be separately designed, authorized, tested, and documented.

## Page 5: Goals

### Purpose

`Goals` turns broad intentions into manageable participant-owned steps.

It should answer:

- What am I working toward?
- Why does it matter to me?
- What is the next step?
- What progress have I made?
- Where am I stuck?
- What support do I want?

### Goal structure

A goal may contain:

- participant-written title;
- participant-written reason;
- category;
- target date, when useful;
- next step;
- progress status;
- completed evidence;
- barrier;
- support request;
- optional connection to program or budget.

### Participant actions

Candidate actions:

- create a goal;
- edit a participant-owned goal;
- pause a goal;
- complete a goal;
- add a next step;
- record progress;
- request support.

No hard delete should be available during the MVP. Goals should use states such as active, paused, completed, or archived.

### Ownership boundary

A staff-suggested goal must remain visibly distinct from a participant-created goal.

The participant should be able to understand who created or suggested each goal.

## Page 6: Support

### Purpose

`Support` provides clear, low-friction ways to ask for help and understand available assistance.

It should answer:

- Who can help me?
- What kind of help is available?
- How do I ask?
- What requests are open?
- What happened with my prior request?

### Participant-facing sections

Candidate sections:

- support contacts;
- request-help categories;
- current support requests;
- recent responses;
- appointment or follow-up information;
- emergency and crisis information when separately approved and locally correct.

### Participant actions

Candidate actions:

- request budget help;
- request help understanding a transaction;
- request wellness support;
- request help with a goal;
- ask a general question;
- view request status.

### Boundary

A support request does not itself create consent for external sharing, expanded system access, clinical intervention, or Trust Engine action.

## Page 7: Reports

### Purpose

`Reports` provides participant-readable summaries after the core daily experience is stable.

Candidate reports:

- monthly budget summary;
- planned versus actual spending;
- goal progress;
- wellness check-in history;
- support request history;
- participant-entered explanations;
- authorized cross-system comparison.

Reports should remain educational and transparent about source and date.

Reports are not part of the first MVP build sequence.

## Dashboard and acknowledgment cards

Acknowledgment cards should not be the center of the product.

They may be useful when:

- a person must confirm that information was shown;
- a policy or program fact requires documented understanding;
- a participant wants to record recognition or request clarification.

They should not replace:

- budgeting tools;
- wellness check-ins;
- goal management;
- support requests;
- explanations;
- progress tracking.

The dashboard should prioritize useful actions and current context rather than displaying a wall of acknowledgments.

## Information ownership model

Every participant-facing item should include or derive an ownership classification.

### Participant-owned

Examples:

- personal goal;
- personal note;
- transaction explanation;
- check-in response;
- help request;
- planned expense.

The participant may generally create and update these items within approved rules.

### THRIVE operational record

Examples:

- support request status;
- program participation fact;
- assigned support contact;
- system-generated reminder;
- educational recommendation.

Changes require the appropriate THRIVE workflow and authority.

### Observational evidence

Examples:

- imported bank transaction;
- account balance snapshot;
- timestamped activity;
- comparison result.

These are facts or observations, not conclusions.

### External authorized fact

Examples:

- a separately authorized fact received from the Trust Engine;
- an authorized appointment fact from another system.

The source must remain visible, and THRIVE must not claim ownership or authority over it.

### Restricted conclusion

Examples:

- legal determination;
- clinical finding;
- fiduciary determination;
- incapacity conclusion;
- relapse conclusion;
- trust misuse determination.

These are outside ordinary participant-facing inference and require separate authority and process.

## Fact and explanation display model

A reusable participant-safe information block should support:

### Verified fact

What is known and where it came from.

### Participant context

What the participant says happened or what the item means to them.

### Support explanation

Educational information or operational clarification.

### Next step

A manageable action the participant may choose.

### Conclusion

Shown only when a valid, authorized conclusion exists. The interface must not manufacture one.

## MVP write permissions candidate

Review-only proposal:

| Area | Participant capability |
|---|---|
| Today | Complete participant-owned tasks and open related pages |
| My Program | Read-only, with help request |
| Budget plan | Create and update participant-owned plan |
| Transaction explanation | Add and update participant context |
| Wellness check-in | Submit participant self-report |
| Goals | Create, update, pause, complete, or archive participant-owned goals |
| Support | Create support requests and view status |
| Trust Engine facts | Read-only comparison when separately authorized |
| Program administration | No participant write |
| Workspace administration | No participant access |

These are product candidates, not implementation approvals.

## Internal and test routes

Existing diagnostic pages are development and validation tools.

Examples include:

- supported-person probes;
- write tests;
- negative access tests;
- program summary probes;
- authentication-link review;
- workspace tests;
- synthetic onboarding tests.

Their purpose is to validate:

- authentication;
- RLS;
- identity linkage;
- participant isolation;
- allowed and denied writes;
- data relationships.

They should:

- remain outside participant navigation;
- be clearly marked internal;
- eventually be restricted to development or authorized staff;
- be replaced by automated tests where practical;
- not be hard-deleted during the MVP.

## Recommended MVP build order

### Phase 1: Today shell

Create a read-only Today page with participant-safe placeholders and navigation to existing real features.

Goal: establish the participant home screen and visual language.

### Phase 2: Budget v0.1

Create a real participant budget view using the current verified data model only after schema reconciliation.

Initial capabilities:

- planned monthly budget;
- recurring bills;
- safe-to-plan calculation;
- participant-entered notes;
- no bank synchronization unless separately approved.

### Phase 3: Wellness check-in v0.1

Create a brief participant self-report workflow.

Initial capabilities:

- a small number of understandable prompts;
- optional note;
- participant-selected help request;
- history visible only to the authorized participant and authorized support roles.

### Phase 4: Goals v0.1

Create participant-owned goal and next-step tracking.

### Phase 5: Support v0.1

Create structured participant help requests and status visibility.

### Phase 6: Authorized observations and comparisons

Only after separate inspection and authority review:

- bank observations;
- transaction explanations;
- Trust Engine fact comparison;
- participant-readable reports.

## Design requirements

### Mobile-first

- prioritize phone layouts;
- use large touch targets;
- keep actions near the relevant information;
- avoid dense multi-column forms;
- minimize typing;
- support one-handed use;
- keep key actions within a short scroll.

### Plain language

Avoid:

- internal table names;
- policy names without explanation;
- RLS terminology;
- UUIDs;
- raw JSON;
- developer language;
- unexplained financial jargon.

### Visual hierarchy

Each page should make these clear:

1. what matters now;
2. what the participant can do;
3. what is informational;
4. what came from another source;
5. where help is available.

### Non-shaming language

Prefer:

- “Needs explanation”
- “Would you like help reviewing this?”
- “This was different from the plan”
- “Add context”
- “Choose a next step”

Avoid:

- “Bad spending”
- “Failure”
- “Noncompliant”
- “Suspicious”
- “Irresponsible”
- “Relapse behavior”

unless a separately authorized record legitimately uses a required term and the participant-facing display provides appropriate context.

## Accessibility and inclusion

The MVP should support:

- keyboard navigation;
- clear focus states;
- readable contrast;
- understandable labels;
- screen-reader-friendly controls;
- error messages that explain how to recover;
- optional text rather than forced disclosure;
- respectful handling of names and pronouns;
- no color-only status meaning.

## Notification approach

Notifications should initially be limited and participant-controlled.

Candidate notifications:

- planned bill approaching;
- goal next step due;
- wellness check-in available;
- support request updated;
- participant-requested reminder.

Avoid excessive alerts, fear-based wording, or automatic escalation without a separately approved workflow.

## Audit and history principles

Participant writes should preserve:

- who entered the information;
- when it was entered;
- whether it was participant-owned or staff-entered;
- prior state when edits matter;
- archive, pause, inactive, or completed status rather than hard delete.

Audit visibility should be appropriate to the participant experience and not expose internal technical data.

## Decisions required before implementation

The following decisions should be approved before code or schema work begins:

1. Is `Today` the permanent participant landing page?
2. Is the MVP navigation limited to Today, My Program, Budget, Wellness, Goals, and Support?
3. Which Budget information will initially be participant-entered?
4. Will bank observations be deferred until after the personal budget workflow is usable?
5. What wellness prompts are appropriate for the first non-clinical check-in?
6. May the participant create goals immediately?
7. Which support-request categories should exist in v0.1?
8. Which roles may read participant-entered explanations and check-ins?
9. What data may be compared with the Trust Engine, under what authority?
10. Which internal test routes should later be restricted, archived, or replaced by automated tests?

## Recommended product decision

Approve the following MVP direction:

- `Today` becomes the participant landing page;
- `My Program` remains the read-only support-structure page;
- `Budget` becomes the first substantive participant tool;
- `Wellness` provides brief self-report and help-seeking;
- `Goals` supports participant-owned progress;
- `Support` provides structured assistance requests;
- bank observations and Trust Engine comparisons remain deferred until the participant-owned budgeting experience is working;
- internal synthetic and diagnostic routes remain available for controlled validation but stay outside normal navigation.

## Frozen boundaries

This blueprint does not authorize:

- real Johnny data entry;
- Johnny authentication creation or modification;
- Trust Engine synchronization;
- bank connection;
- transaction import;
- financial interpretation;
- clinical interpretation;
- program membership changes;
- workspace changes;
- new database objects;
- SQL execution;
- RLS changes;
- service-role use;
- deployment;
- push or merge;
- deletion of test routes.

## Build status

Documentation-only pass.

No source build was required or run during creation of this blueprint.

## Commit checkpoint

Starting checkpoint:

`d5989c4 Document permanent My Program v0.1 validation`

The blueprint should be reviewed before it is placed into the repository or committed.

## Exact next gate

Review and approve, revise, or reject the proposed participant navigation and MVP build order.

After approval, the next technical gate should be:

**Inspect the existing dashboard shell, budget routes, current live schema, and participant-safe data sources to prepare a read-only Today and Budget implementation candidate.**

Do not create schema, execute SQL, insert Johnny, synchronize with the Trust Engine, or begin production writes during that inspection.
