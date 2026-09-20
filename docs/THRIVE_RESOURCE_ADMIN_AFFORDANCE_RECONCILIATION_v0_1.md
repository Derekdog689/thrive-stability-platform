# THRIVE Resource Admin Affordance Reconciliation v0.1

Status: review-only candidate  
Branch: `candidate/admin-reconciliation-v0-1`  
Scope: Admin Resource Library + Resource Maintenance only

## Verified live state

The live Resource model is structurally stronger than the current maintenance UI suggests.

For the four participant-visible operational Resources currently in THRIVE:
- each has one active primary authority organization;
- each has one active primary access path;
- each has participant guidance;
- each has one verified factual check;
- each is active in the current workspace.

The synthetic/test Resources remain test evidence and should not compete with normal operator work.

No schema, RLS, Resource records, visibility, or participant data changes are proposed in this candidate.

## UX objective

Translate the existing relational model into operator questions:

1. What is this Resource?
2. How does someone actually use it?
3. What should THRIVE explain?
4. Can I trust this information right now?

The database remains authoritative. The UI should derive and summarize what it already knows rather than making Admin repeatedly interpret relationships.

## Resource Library

| Current surface | Candidate treatment | Reason |
|---|---|---|
| Create safe draft form always open | COLLAPSE | Draft creation is occasional, not the primary library task. Use `+ Add Resource` to reveal it. |
| Canonical / visibility badges | SHOW, simplify wording | Useful state, but translate to human language such as `Active for participants`, `Paused`, `Draft`. |
| Category | SHOW | Useful scan signal. |
| Service area | SHOW | Important for choosing and maintaining Resources. |
| Verification cadence | DERIVE into due state | Prefer `Review due Dec 8` / `Verified through Mar 8` over exposing cadence as the dominant signal. |
| Content readiness checklist | DERIVE / COMPRESS | Replace four technical prerequisites with one readiness summary and reveal details only when incomplete. |
| Pause / resume visibility | SHOW | Legitimate operational action. Keep separate from canonical status. |
| C1 boundary explanation | COLLAPSE / remove from normal path | Governance is valid but currently interrupts routine operation. Keep concise help text where needed. |
| Synthetic test Resource | ADVANCED / test evidence | Keep available without competing with participant Resource inventory. |

## Resource Maintenance

### A. Resource summary

Primary operator view:
- Resource name
- plain-language purpose
- category
- service area
- participant visibility
- primary action
- verification state / next review

Candidate top summary:

```
Ready for participants

✓ Official source identified
✓ Primary way to access it
✓ Participant guidance available
✓ Verified through Mar 8, 2027

Primary action: Call 211
```

Canonical status and workspace visibility remain separate facts.

### B. Source & authority

| Current control | Treatment | Candidate wording |
|---|---|---|
| Organization name | ADVANCED edit | Organization |
| Organization type | ADVANCED | Organization type |
| Role | ADVANCED | Role in this Resource |
| Official website | ADVANCED | Official website |
| Existing primary authority card | SHOW | Official source |
| Add authority organization form | COLLAPSE | `Add another source or organization` |

Normal Admin view should show the primary authority as a finished fact. Creation controls appear only when deliberately editing source relationships.

### C. Access options

| Current control | Treatment | Candidate wording |
|---|---|---|
| Path type | ADVANCED / DERIVE where possible | Access type |
| Authority organization link | DERIVE first | Source organization |
| Label | SHOW while editing | Action label |
| Plain-language instruction | SHOW while editing | What should the participant know before using this? |
| URL | SHOW conditionally | Website |
| Phone | SHOW conditionally | Phone |
| Email | SHOW conditionally | Email |
| Existing primary path | SHOW prominently | Primary action |
| Additional paths | COLLAPSE | Other ways to access |

Existing operational Resources already link their primary access paths to their primary organizations. The UI should display this relationship rather than asking Admin to rediscover it.

When creating a new access path, default the source organization to the Resource's current primary authority when one exists, while retaining an explicit advanced selector.

### D. Participant guidance

| Current control | Treatment | Candidate wording |
|---|---|---|
| Existing guidance sections | SHOW | What THRIVE tells the participant |
| Section type | RENAME / translate | Guidance type |
| Source access path | DERIVE / simplify | This guidance goes with |
| Heading | SHOW while editing | Heading |
| Guidance | SHOW while editing | Participant guidance |
| Blank Add Guidance form always visible | COLLAPSE | `+ Add guidance` |

Candidate source-path choices:
- General Resource
- Call 211
- Open MyACCESS
- SSA Online Services
- other current access paths

Do not show raw relationship language such as `source_access_path_id`.

### E. Verification

| Current control | Treatment | Candidate wording |
|---|---|---|
| Latest verification record | SHOW prominently | Verified status |
| Verification scope | ADVANCED | What was checked? |
| Verified on | SHOW | Verified on |
| Source URL | ADVANCED / prefill candidate | Source used |
| Verification note | SHOW while reviewing | What did you confirm? |
| Next review | SHOW | Review again |
| Full verification form always visible | COLLAPSE | `Review verification` |
| Verification history | COLLAPSE | `Verification history` |

Normal operator summary should answer:
- when this Resource was last checked;
- what was checked;
- when it should be reviewed again.

The current live pattern has one verified check per operational Resource, so a compact summary is sufficient for normal work.

### F. Availability

Keep canonical status and participant visibility separate.

Normal display:
- `Resource active`
- `Visible to participants`

Actions:
- Pause participant visibility
- Resume participant visibility

Canonical activation remains a deliberate governance action and should not be visually confused with workspace visibility.

## Desktop-primary layout

Admin is desktop-primary. Use available width.

Recommended Resource Maintenance composition:

### Header row
Left:
- Resource identity and purpose

Right:
- visibility state
- verification state
- primary action

### Main workspace
Left column, wider:
1. How participants use it
2. What THRIVE explains

Right column, narrower:
1. Official source
2. Verification
3. Availability

Each section shows the current finished state first. Editing forms remain closed until Admin chooses an edit/add action.

## Derived defaults

Candidate behavior without changing stored data:

- Primary authority = active `resource_organization_roles.is_primary` relationship.
- Primary access = active `resource_access_paths.is_primary` relationship.
- Guidance source label = matching access-path label, or `General Resource` when null.
- Verification summary = latest verified record.
- Review state = derived from `next_review_on`.
- Readiness = current activation prerequisites, expressed in operator language.
- New access path source organization = preselect primary authority when available; Admin may change it.
- New guidance source path = default to primary access when appropriate; Admin may choose General Resource.

These are presentation/defaulting rules only. They do not merge ownership, authority, verification, or decision-making.

## Explicit non-goals

This pass does not:
- change the database schema;
- change RLS;
- activate, pause, archive, or edit Resource data;
- delete synthetic/test evidence;
- change participant eligibility or recommendation logic;
- create a recommendation engine;
- change Johnny's account or participation;
- connect to or synchronize with the Trust Engine.

## Implementation candidate order

If approved after review:

1. Compress Resource Library creation and readiness surfaces.
2. Refactor Resource Maintenance to finished-state-first sections.
3. Translate relationship selectors into operator language.
4. Add derived primary-source / primary-action / verification summaries.
5. Desktop QA first, then phone sanity check.
6. Build / TypeScript verification.
7. Human walkthrough before any merge to `main`.

## Acceptance test

Admin should be able to open a Resource and answer within a few seconds:

- What is it?
- Who is the official source?
- What should the participant do?
- What will THRIVE explain?
- Is the information current?
- Is it visible?

The admin should not need to understand table relationships to answer those questions.
