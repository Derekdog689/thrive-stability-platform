# THRIVE Budget Categories Plan

## Purpose

This file defines the planned budget category layer for the THRIVE Stewardship & Stability Platform.

This is a planning document only.

No Supabase SQL should be executed from this file.

No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this planning phase.

## Current Build Position

THRIVE currently has the following stable foundation:

- Supabase email/password authentication works.
- Workspace records are visible through authenticated RLS.
- Workspace selection persists in browser `localStorage`.
- Program records are visible through authenticated RLS.
- Program selection persists in browser `localStorage`.
- The dashboard listens to both selected workspace context and selected program context.
- Program records are organizational support lanes only.

## Budget Category Purpose

Budget categories represent planned financial lanes inside a selected workspace and program.

They help organize mock/test spending structure around the THRIVE principle:

> Essentials first. Flexible spending second. Support without shame.

Budget categories are not bank records, transactions, receipts, legal instructions, trustee decisions, clinical recommendations, credit repair advice, bankruptcy advice, investment advice, or crisis intervention.

## Core Concept

A budget category answers:

- What is this money intended for?
- Is this category protected or flexible?
- How much was planned?
- How much has been used?
- How much remains?
- Should this category be visible in the dashboard?

## Relationship Model

Budget categories should belong to:

1. A workspace.
2. A program.

This means the likely future relationship is:

```text
workspaces
  -> programs
    -> budget_categories

This keeps categories tied to a clear operating lane instead of attaching everything directly to the workspace.

Planned MVP Table
budget_categories

Purpose:
Stores protected, flexible, support, and reserve budget lanes for mock/test dashboard and workflow development.

Planned columns:

Column	Type	Notes
id	uuid	Primary key
workspace_id	uuid	References workspaces(id)
program_id	uuid	References programs(id)
category_name	text	Display name
category_type	text	Allowed values: protected, flexible, support, reserve
planned_amount	numeric	Mock planned amount
spent_amount	numeric	Mock spent amount
remaining_amount	numeric	Mock remaining amount
sort_order	integer	Display order
is_active	boolean	Whether category is active
created_by	uuid	References auth.users(id)
created_at	timestamptz	Creation timestamp
updated_at	timestamptz	Update timestamp
Planned Category Types
protected

Used for essential needs that should be separated from impulsive or flexible spending.

Examples:

Housing
Utilities
Food
Phone
Transportation
Medical or recovery-related essentials

Boundary:
A protected category does not create legal authority to control someone’s money. It is an organizational and visibility tool only.

flexible

Used for discretionary spending that may change week to week.

Examples:

Personal spending
Entertainment
Dining out
Clothing
Miscellaneous spending

Boundary:
Flexible spending flags should not shame, diagnose, or moralize behavior.

support

Used for support-related expenses or planned support actions.

Examples:

Meeting transportation
Documentation help
Coaching support
Administrative support

Boundary:
Support categories do not create clinical, fiduciary, legal, or crisis-service authority.

reserve

Used for money intentionally set aside.

Examples:

Emergency reserve
Medical reserve
Administrative reserve
Future distribution reserve

Boundary:
Reserve categories are planning tools only. Trustee or authorized decision-maker responsibilities remain separate.

Mock/Test Data Examples

Only mock/test records may be used during MVP.

Example 001
Field	Value
category_name	Housing
category_type	protected
planned_amount	1200.00
spent_amount	1200.00
remaining_amount	0.00
sort_order	1
is_active	true
Example 002
Field	Value
category_name	Food
category_type	protected
planned_amount	400.00
spent_amount	125.00
remaining_amount	275.00
sort_order	2
is_active	true
Example 003
Field	Value
category_name	Flexible Spending
category_type	flexible
planned_amount	300.00
spent_amount	210.00
remaining_amount	90.00
sort_order	3
is_active	true
Example 004
Field	Value
category_name	Emergency Reserve
category_type	reserve
planned_amount	500.00
spent_amount	0.00
remaining_amount	500.00
sort_order	4
is_active	true
RLS Direction

Budget categories must be workspace-scoped and program-scoped.

Initial RLS direction:

Active workspace members may read budget categories for workspaces they belong to.
Program access must be limited through the parent workspace relationship.
Workspace admins may create budget categories.
Workspace admins may update budget categories.
No hard-delete workflow during MVP.
Categories should be deactivated using is_active = false or archived later if needed.
App Testing Direction

A future temporary test page should be created:

src/app/budget-test/page.tsx

The test page should allow a signed-in workspace admin to:

Confirm active Supabase session.
Load visible workspaces.
Load visible programs under the selected workspace.
Create mock/test budget categories.
Load visible budget categories through RLS.
Confirm categories are scoped to the selected workspace and selected program.
Display clear mock/test-only security warnings.
Dashboard Direction

After RLS testing is proven, budget category records may power mock dashboard sections such as:

Available balance
Protected categories
Remaining essentials
Flexible spending
Reserve visibility
Safe-to-spend estimate

The dashboard must continue to clearly distinguish mock/test data from real financial records.

Security Boundary

During this phase:

No real bank data.
No real trust ledger data.
No real beneficiary data.
No clinical or recovery records.
No private case notes.
No document uploads.
No receipt uploads.
No service role usage in the client app.
No public access to sensitive records.

Budget categories are planning and visibility tools only.

Legal and Ethical Boundary

Budget categories must not be represented as:

Legal advice
Fiduciary decision-making
Financial advisory services
Investment advice
Credit repair
Bankruptcy advice
Clinical treatment
Crisis intervention
Control over another person’s money

THRIVE may support organization, reporting, planning, and clarity. Authorized decision-makers remain responsible for final decisions.

Deferred Decisions

The following decisions are deferred:

Whether remaining_amount should be stored or calculated.
Whether category history should be tracked in a separate table.
Whether categories should have monthly budget periods.
Whether trustee-visible and individual-visible category views should differ.
Whether support users may edit categories.
Whether categories should connect directly to future transactions.
Whether category-level audit logging should be required in MVP.
Current Decision

Proceed with a separate budget category planning document before writing SQL.

Do not create the budget_categories table yet.

Do not connect dashboard cards to Supabase budget data yet.

Do not enter real financial, trust, beneficiary, clinical, recovery, or personally identifying data.

Session Notes
Budget Categories Planning Session 001

Created initial budget category planning document after completing workspace context, program context, and dashboard listener checkpoints.

Purpose:
Define the budget category boundary before SQL design.

Security:
Mock/test only. Budget category planning does not authorize real financial, trust, beneficiary, clinical, recovery, or personally identifying data entry.