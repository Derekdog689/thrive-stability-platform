# THRIVE Recovery Support Functional-Fit Reconciliation v0.1

Date: 2026-10-01  
Status: APPROVED RECONCILIATION CANDIDATE / NO IMPLEMENTATION YET  
Parent checkpoints:
- `docs/THRIVE_ENGINE_TO_VISION_RECONCILIATION_CHECKPOINT_2026-10-01.md`
- `docs/THRIVE_RESOURCES_SCOPE_AUDIENCE_v0_1.md`
- `docs/THRIVE_RECOVERY_SUPPORT_PROVING_GROUND_v0_1.md`

## Purpose

Reconcile the approved Living Signal Recovery Support flow against the current THRIVE engine and live database before adding code or persistence.

Target proving loop:

```text
explicit participant need
→ choose a support path
→ see real source-grounded options
→ participant chooses an option
→ take action
→ follow up on that exact action
→ adapt
→ show factual progress in Story
```

The objective is to identify what the existing engine already supports, what only needs presentation/connection work, and what is a genuine persistence gap.

## Functional fit

| Vision-board behavior | Current engine fit | Current source / capability | Decision |
|---|---|---|---|
| Participant states a recovery-support need | Supported | Wellness check-in fields, participant note, Goals, explicit Support context | KEEP |
| THRIVE recognizes explicit current context | Supported | Wellness return + Cross-Lane Synthesis can use participant-owned facts | KEEP / TUNE |
| Show four directions: meeting / reading / connect / routine | Presentation-capable | Existing Recovery Support proving-ground design; no authority issue | TUNE presentation |
| Find a real meeting source | Resource infrastructure supported; live result feed not yet proven | Canonical Resources + organizations + access paths + verification | EXTEND source integration |
| Show official source provenance | Supported | `resource_organizations`, `resource_organization_roles`, `resource_access_paths` | KEEP |
| Show service geography / audience | Supported | `resources.state_code`, `county_name`, `service_area_text`, `audience_text` | KEEP |
| Explain what to do next | Supported | `resource_guidance_sections` | KEEP |
| Route to human Support from a Resource | Supported | `support_request_links.resource_id` and `resource_access_path_id` | KEEP |
| Browsing creates Support automatically | Not allowed | Existing product boundary | PROHIBITED |
| Participant saves a Resource/meeting | No mature persisted participant-owned resource-save model identified | No current saved-resource table/state in the reconciled Resource spine | GENUINE GAP CANDIDATE |
| Participant opens external source | Can navigate, but click alone must not become progress evidence | Existing access path can be opened; no completion meaning | KEEP navigation / no inference |
| Participant plans to try an option | No dedicated persisted Resource action state identified | Could potentially be client-only for first proof; persistence not yet approved | GAP CANDIDATE |
| Participant confirms “I went / I tried it” | No dedicated Resource follow-through record identified | Existing Support/Goals/Wellness should not be overloaded merely to store generic Resource outcomes | GENUINE GAP CANDIDATE |
| Follow-up asks about the exact prior option | Requires durable prior-action identity if it must survive sessions/devices | Existing Resource IDs provide identity, but no participant action record yet | EXTENSION LIKELY |
| “It helped / okay / not a fit / not yet” | No approved persistence model | Vision/proving-ground candidate only | EXTENSION LIKELY |
| THRIVE changes the next return based on feedback | Logic pattern exists | Contextual Wellness Return / Cross-Lane Synthesis provide bounded precedents | TUNE after persistence decision |
| Story shows participant-confirmed Resource progress | Story can derive facts, but the Resource-action fact must exist first | Existing Story/read-model direction | BLOCKED BY ACTION FACT |
| Meeting attendance inferred from opening/directions/location | Not allowed | Frozen boundary | PROHIBITED |
| Recovery score / sobriety ranking | Not allowed | Frozen boundary | PROHIBITED |

## Existing engine we should reuse

### Participant identity and scope

Keep current:

- Supabase Auth;
- supported person;
- active program participation;
- workspace scope;
- RLS.

No Recovery Support-specific identity system is needed.

### Resource truth

Keep current canonical structure:

- `resources`;
- `resource_organizations`;
- `resource_organization_roles`;
- `resource_access_paths`;
- `resource_guidance_sections`;
- `resource_verifications`;
- `resource_visibility`.

This structure already answers:

- what the Resource is;
- who owns/publishes it;
- how to reach it;
- what THRIVE may explain;
- when/how it was verified;
- where it is visible.

### Support bridge

Keep current:

- `support_requests`;
- `support_request_entries`;
- `support_request_status_events`;
- `support_request_links`.

Resource context already has a lawful/intentional bridge into Support.

Do not create a second “resource support request” workflow.

### Story

Story should remain a derived read model first.

Do not create Story persistence merely to display a Resource event.

Story may eventually display:

- Resource saved;
- option planned;
- participant-confirmed follow-through;
- participant-confirmed useful/not useful;

but only when those facts have a legitimate participant-owned source.

## Smallest proving slice

The smallest credible Recovery Support slice should be:

### Step 1 — Enter from explicit context

Participant chooses or has already explicitly selected Recovery Support.

No inferred need from banking, passive browsing, diagnosis, or hidden scoring.

### Step 2 — Choose “Find a meeting”

Use the approved Living Signal presentation, but keep the action narrow.

### Step 3 — Show source-grounded meeting paths

First proof should use the verified official source layer:

- A.A.;
- N.A.;
- SMART Recovery;
- optionally SAMHSA as a broader support fallback.

If live individual meeting results cannot yet be retrieved reliably from an approved source, THRIVE should expose the official meeting finder rather than fabricate meeting cards.

### Step 4 — Participant chooses

For the first functional proof, “choose” may mean:

- open official finder;
- choose another source;
- ask THRIVE Support for help.

A persistent “save” button should not be promoted until its data contract is approved.

### Step 5 — Follow-up boundary

The vision requires exact-action follow-up.

This is the first likely genuine persistence gap.

Before adding schema, answer:

- Must the follow-up survive logout/device/session?
- Is a saved Resource itself useful without a planned/attempted state?
- Does one generic Resource-action record cover meetings, readings, community resources and future guided pathways?
- What minimum participant-owned status vocabulary is required?
- What audit/history behavior is required?
- Can a participant correct or close the action without hard delete?

## Candidate minimal persistent fact

If the proving slice demonstrates persistence is necessary, the smallest future candidate should represent a **participant-owned Resource action**, not a clinical or Support conclusion.

Potential factual properties to evaluate later:

- supported person;
- program/workspace;
- resource;
- optional access path;
- action type;
- participant-selected state;
- participant-confirmed outcome;
- participant note;
- timestamps;
- archive/correction state.

Candidate states must remain factual and participant-controlled.

Examples only:

- saved;
- planned;
- attempted;
- completed / attended / read / contacted, when participant-confirmed;
- not_yet;
- not_useful;
- changed_direction;
- archived.

This section is a design question, not schema approval.

## Do not overload existing tables

Do not use:

- Wellness check-ins as generic Resource-action storage;
- Goals as generic bookmarks;
- Support requests as hidden Resource activity logs;
- Support entries as substitute participant follow-up records;
- Story as source-of-truth persistence.

Those systems may reference or display Resource-action facts later, but should retain their own ownership semantics.

## Decision from this reconciliation

### Already safe to proceed without schema

- curate/verify Resources;
- expose official meeting/source choices;
- show authority/provenance;
- show guidance;
- route intentionally into Support;
- preserve Living Signal presentation;
- derive contextual entry from explicit participant facts.

### Hold until a separate design gate

- saved Resources;
- saved meeting;
- durable planned action;
- participant-confirmed follow-through;
- “did this help?” persistence;
- adaptation state;
- Resource-action contribution to Story.

## Acceptance test before Johnny activation

Recovery Support is functionally ready for Johnny only when, at minimum:

1. he can enter the Recovery Support path intentionally;
2. THRIVE returns real current source-grounded options;
3. the choices lead somewhere useful rather than to a dead end;
4. Support remains available when he wants human help;
5. THRIVE does not fabricate attendance or success;
6. any persistent follow-up state has an approved participant-owned model;
7. returning to THRIVE preserves enough continuity that he is not forced to start from zero;
8. Story only reflects facts the system actually owns.

## Exact next implementation gate

**Resource-source proving slice, read-first.**

Before any schema proposal:

1. reconcile the four recovery-source candidates against the existing Resource records;
2. decide whether each is a canonical Resource or an access path under a broader Resource;
3. determine what can be shown directly from current Resource architecture;
4. prototype the Recovery Support “Find a meeting” path without persistence;
5. test whether that non-persistent proof exposes a real need for participant Resource-action persistence;
6. only then draft a minimal persistence candidate if necessary.

No production SQL, no new table, no Johnny activation, and no merge to `main` is authorized by this document.
