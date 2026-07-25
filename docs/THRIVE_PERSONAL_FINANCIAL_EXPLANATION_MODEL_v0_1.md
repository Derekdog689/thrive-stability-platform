# THRIVE Personal Financial Explanation Model v0.1

## Status

Design and review only.

This document does not authorize database changes, write-enabled interfaces, data migration, or production execution.

## Purpose

THRIVE should allow a supported person, or an authorized support person acting within documented authority, to add context beside a personal financial observation.

An explanation adds human meaning without altering the original bank evidence.

The bank record remains immutable.

The explanation remains a separate, attributable, auditable record.

## Governing Principles

### One Person at a Time

The explanation belongs to the supported person’s personal support context.

It does not become property of a trust, housing program, support organization, or external system.

### Facts Remain Facts

The imported transaction preserves what the financial source directly reported, including:

- posted date;
- transaction date;
- amount;
- merchant or source description;
- transaction type;
- source row identity;
- source fingerprint;
- daily posted balance;
- source filename and file hash.

An explanation must not overwrite or silently correct those fields.

### Explanations Are Context

An explanation may describe:

- what the transaction was for;
- who was involved;
- whether it related to a bill or responsibility;
- whether it was planned;
- whether supporting evidence exists;
- whether help is requested;
- whether the person does not remember;
- whether the person prefers not to provide further detail.

An explanation is not automatically proof of purpose.

It is a human-supplied context record.

### No Automatic Judgment

THRIVE must not convert an explanation, missing explanation, or inconsistent explanation into:

- dishonesty;
- irresponsibility;
- relapse;
- impairment;
- incapacity;
- noncompliance;
- misuse;
- fraud;
- a clinical conclusion;
- a legal conclusion;
- a fiduciary conclusion.

## Example

### Bank Observation

- Transaction: ATM withdrawal
- Cash received: $200.00
- ATM operator surcharge: $3.75
- Separate non-network bank fee: $3.00
- Total removed from the account: $206.75

### Possible Personal Explanation

> I withdrew cash for groceries and transportation.

### System Presentation

THRIVE may display:

- observable bank facts;
- the person’s explanation;
- supporting evidence status;
- the cost of the transaction;
- a lower-cost option for future cash access.

THRIVE must not present the explanation as independently verified unless supporting evidence establishes that fact.

## Who May Supply an Explanation

An explanation may be supplied by:

- the supported person;
- an authorized support person;
- a legally authorized representative;
- an approved administrative support role acting within documented authority.

The record must identify who supplied the explanation.

The system must not imply that an authorized support person personally witnessed the transaction unless that fact is separately documented.

### Source of Context

THRIVE must distinguish between:

- **Personal explanation:** context supplied directly by the supported person.
- **Support note:** context supplied by an authorized support person based on records, conversation, or administrative assistance.
- **Observed fact:** information directly established by a source document or verified account record.

A support note must not be presented as the supported person’s own statement unless the person supplied or affirmed it.

## Required Attribution

Each explanation record should preserve:

- supported person ID;
- staged financial transaction ID;
- explanation author ID;
- author relationship or role;
- explanation text;
- explanation status;
- assistance-requested indicator;
- evidence-attached indicator;
- created timestamp;
- superseded timestamp, when applicable;
- superseding explanation ID, when applicable.

## Proposed Explanation Status

Suggested neutral values:

- `draft`
- `recorded`
- `superseded`
- `withdrawn`

These values describe the lifecycle of the explanation only.

They do not approve, reject, or validate the transaction.

## Proposed Context Type

An explanation may optionally identify one or more context types:

- `personal_spending`
- `food`
- `housing`
- `utilities`
- `phone`
- `transportation`
- `medical`
- `recovery_support`
- `cash_access`
- `bill_payment`
- `shared_household_expense`
- `administrative_expense`
- `other`
- `unknown`
- `prefer_not_to_say`

These are descriptive context labels, not moral or clinical classifications.

## Supporting Evidence

Optional supporting evidence may include:

- receipt;
- invoice;
- bill;
- check image;
- appointment record;
- reservation;
- payment confirmation;
- personal note;
- other relevant document.

Evidence should remain separate from the original transaction and from the explanation text.

Evidence attachment does not automatically establish legal, fiduciary, clinical, or financial conclusions.

## Assistance Requested

The supported person may indicate:

- no assistance requested;
- help understanding the transaction;
- help understanding fees;
- help locating a receipt;
- help paying or organizing a responsibility;
- help preventing a repeated fee;
- help preparing a limited explanation package;
- other support requested.

A request for assistance should create a support opportunity, not a disciplinary flag.

## Corrections and Supersession

Explanation records should not be silently overwritten.

When a person changes or corrects an explanation:

1. preserve the original explanation;
2. create a new explanation record;
3. mark the prior record as superseded;
4. identify the superseding record;
5. preserve author and timestamps;
6. show the current explanation without erasing history.

This provides accountability without treating normal correction as misconduct.

## Visibility and Consent

Explanation visibility must follow the supported person’s permissions and documented support relationships.

Possible visibility scopes may include:

- private to the supported person;
- visible to authorized DSS support staff;
- shared with a named authorized person;
- included in a specific evidence package;
- not shared externally.

An explanation must not automatically cross into the Trust Engine or another external system.

Existing documented authority may permit DSS Enterprises to access, organize, and assist with personal financial information as part of the established support relationship.

THRIVE should record the governing authorization and its scope. It should not fabricate a separate consent event for every routine support action already covered by that authorization.

New external sharing, expanded access, or use beyond the documented scope requires separate authority or consent.

Any external disclosure requires:

- lawful authority;
- documented consent or other valid authorization;
- a defined purpose;
- minimum necessary information;
- an auditable exchange record.

## Relationship to the Trust Engine

Johnny’s explanation remains part of his personal THRIVE support spine.

It may be included in a limited discretionary-distribution request or supporting package only when authorized and relevant.

The Trust Engine may record that a request and selected evidence were received.

The Trust Engine must not rewrite Johnny’s original explanation or personal bank record.

## Relationship to Behavioral and Wellness Analytics

An explanation may provide context for later personal pattern analysis.

For example:

- repeated ATM fees;
- transportation-related cash use;
- stress-related requests for assistance;
- missed bills;
- improved planning.

Analytics must remain observational and explainable.

The system must not infer recovery status, intent, impairment, or diagnosis from financial explanations.

## Proposed User Experience

A future transaction detail view may show:

### What the bank reported

Immutable source information.

### What this transaction cost

Clear explanation of related fees or linked financial events.

### Personal context

The latest personal explanation, if one exists.

### Supporting evidence

Optional attached receipts, check images, bills, or confirmations.

### Would support help?

Optional assistance choices.

### History

Prior explanations and corrections, shown as an audit trail.

## First Write-Enabled Feature Boundary

The first write-enabled personal reconciliation feature should allow only:

- adding an explanation;
- requesting assistance;
- optionally identifying a neutral context type;
- optionally indicating that supporting evidence exists.

It should not initially allow:

- changing transaction facts;
- approving transactions;
- classifying behavior;
- creating trust matches;
- creating trustee decisions;
- deleting bank observations;
- silently replacing explanations;
- automating payments.

## Proposed Future Data Objects

Possible future objects:

- `personal_financial_explanations`
- `personal_financial_explanation_history`
- `personal_financial_support_requests`
- `personal_financial_evidence_links`

Final table design requires separate schema review and approval.

## Non-Goals

This model does not:

- judge spending;
- require an explanation for every transaction;
- create trust authority;
- create clinical conclusions;
- create legal conclusions;
- approve personal activity;
- automate financial decisions;
- merge personal and external records.

## Decision

The first personal reconciliation write feature should give the supported person a voice beside the bank observation.

Facts remain immutable.

Context remains attributable.

Corrections remain auditable.

Support remains optional and consent-based.
