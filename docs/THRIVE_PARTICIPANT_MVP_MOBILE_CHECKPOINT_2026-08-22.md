# THRIVE Participant MVP + Mobile Deployment Checkpoint

Date: 2026-08-22

Status: Review checkpoint captured on `mobile-viewport-fix-v0-1` after first successful Vercel deployment, live phone use, mobile containment repair, and read-only reconciliation against the live THRIVE database.

## 1. Verified deployment state

- Production branch: `main`
- Production checkpoint before mobile repair: `69cd731` (`Add participant CSV upload flow`)
- Mobile review branch: `mobile-viewport-fix-v0-1`
- Mobile containment checkpoint before this document: `15937c4`
- Vercel production deployment from `main`: successful
- Vercel preview deployment from `mobile-viewport-fix-v0-1`: successful
- Existing authenticated test participant can sign in from a real phone over the deployed Vercel URL.
- Supabase auth, participant context, Budget, Financial Activity, Wellness, Goals, Support, Today, and Reports are reachable in the deployed participant experience.
- No database changes were made during this review pass.
- No Trust Engine synchronization was added.

## 2. Frozen architecture and authority boundaries

These remain non-negotiable:

1. THRIVE's participant support spine and the Trust Engine remain independent systems.
2. THRIVE may compare authorized facts across systems but must not merge ownership, authority, approvals, or decision-making.
3. Bank/account activity is observational evidence. A displayed transaction does not establish intent, irresponsibility, relapse, incapacity, misuse, or any legal, clinical, or fiduciary conclusion.
4. Facts, patterns, participant explanations, and conclusions remain distinct.
5. Participant explanation remains separate from imported account evidence.
6. Support remains person-centered and human-controlled. THRIVE does not create clinical, legal, fiduciary, bankruptcy, credit-repair, investment, or crisis-service authority.
7. Role assignment inside THRIVE must not silently create authority in the Trust Engine or any other independent system.

## 3. Mobile deployment finding

The first production phone load exposed a global horizontal overflow defect. At normal browser scale, the participant experience rendered wider than the phone viewport and required manual browser zoom to fit.

A focused containment pass was created on `mobile-viewport-fix-v0-1` without changing database logic, schema, authentication, or participant workflow behavior.

The preview phone test now confirms:

- primary cards fit within the phone viewport;
- headings and descriptive text wrap at normal scale;
- the guardrail stays within the card;
- Budget summary cards remain readable;
- Financial Activity cards remain readable;
- Reports remains usable on mobile;
- the horizontal navigation can remain an internal scroll surface without forcing the entire page wider.

The participant experience is now usable on a real phone at normal browser scale. Further mobile polish remains appropriate, but the catastrophic viewport failure is contained.

## 4. Live database reconciliation

A read-only reconciliation was performed against the live THRIVE Supabase project for the current onboarding test participant.

### Current Budget

- Expected income: `$4,000.00`
- Planned across categories: `$3,255.00`
- Expected income not yet assigned to categories: `$745.00`

Current category state observed:

- Housing: planned `$1,800.00`, recorded/allocated `$500.00`, remaining `$1,300.00`
- Electric: planned `$135.00`, recorded/allocated `$0.00`, remaining `$135.00`
- Internet / cable: planned `$120.00`, recorded/allocated `$0.00`, remaining `$120.00`
- Food & household: planned `$600.00`, recorded/allocated `$31.88`, remaining `$568.12`
- Transportation: planned `$100.00`, recorded/allocated `$204.23`, remaining `$0.00`
- Personal: planned `$200.00`, recorded/allocated `$212.88`, remaining `$0.00`
- Savings / reserve: planned `$300.00`, recorded/allocated `$0.00`, remaining `$300.00`

Total currently recorded against Budget: `$948.99`

Remaining within the current plan: `$2,423.12`

The phone UI displays the same values.

### Financial Activity

Current available activity reconciles as:

- Imported activity: `24` records
- Participant-entered/manual activity: `3` records
- Total Financial Activity: `27` records
- Imported current inflow: `$1,600.00`
- Imported current outflow: `$453.99`
- Manual current inflow: `$1,000.00`
- Manual current outflow: `$525.00`

Combined current-period values:

- Income received: `$2,600.00`
- Money out: `$978.99`

The Today and Reports surfaces display these same values.

### Transaction explanations

- `26` current transaction explanations are present in submitted state.
- Participant explanation persistence is working.
- Submitted explanation remains separate from imported account evidence.

### Support

The database contains a proven participant/support lifecycle including submitted, acknowledged, in-progress, waiting-for-participant, participant reply, resumed work, and completed history.

Current review also shows a newer Support request that is submitted but not yet assigned/routed. This establishes an important wording requirement: participant-facing language must not imply human ownership before assignment actually exists.

### Wellness and Goals

The participant history contains repeated Wellness check-ins and active Goal data. The data spine is functioning, but repeated usability feedback indicates that Wellness and Goals need more guided progression and less passive information display in later UX work.

## 5. Confirmed functional defect

### Budget current-account-activity date mismatch

The Budget surface currently reports `0 posted transactions` for the active Budget period even though 24 imported current-period records exist.

Verified database condition:

- all 24 imported current records have a usable transaction/activity date;
- their `posted_date` field is currently null;
- Financial Activity and Reports correctly include those records;
- part of the Budget logic still relies on `posted_date` for in-period transaction evaluation.

Conclusion:

This is an application date-normalization defect, not a database-record absence.

Candidate repair direction:

- use the same normalized Financial Activity date rule in Budget that the unified activity layer uses;
- do not rewrite bank evidence merely to satisfy the UI;
- do not infer a posted date that was not supplied by the source.

No repair was installed during this checkpoint.

## 6. Participant MVP assessment

Current assessment:

**The participant data spine is MVP-level. The participant experience is approaching MVP-level. The operational/admin spine is not MVP-level yet.**

The participant loop now exists across real connected modules:

`NOTICE -> PLAN -> OBSERVE -> EXPLAIN -> COMPARE -> ADJUST -> CHOOSE SUPPORT`

The system currently demonstrates:

- authenticated participant entry;
- participant-specific program context;
- active Budget planning;
- imported Financial Activity;
- participant-entered Financial Activity;
- participant transaction explanations;
- transaction-to-Budget allocations;
- Wellness check-ins;
- Goals and next steps;
- participant Support requests and replies;
- Today orientation across current participant state;
- Reports that reconcile current financial information while keeping source boundaries visible.

This is no longer a collection of disconnected feature proofs. Participant actions now affect and appear meaningfully across multiple THRIVE surfaces.

## 7. Participant UX findings to preserve for later work

### Today

- Today successfully orients the participant across money, Wellness, Goals, and Support.
- Arbitrarily long Goal `next_step` content should not become a giant Today hero headline.
- Today should orient and route, while full Goal detail remains in Goals.

### Wellness

- Wellness is functioning and remains voluntary/non-clinical.
- Repeated test feedback indicates a desire for guided, box-to-box progression rather than a static reflection form.
- Future design should guide a participant toward a small chosen next action without automatically creating Support or conclusions.

### Goals

- Goal infrastructure works.
- Goal UX should favor progressive action and bounded next-step presentation.

### Support

- Support currently has the strongest action progression.
- Submitted/unassigned requests should use wording such as `Your request was received.`
- Wording such as `Your request is with the team.` should be reserved for a state where acknowledgment/assignment actually supports that statement.

### Budget

- Budget logic and math reconcile.
- Mobile category cards are vertically expensive.
- Future polish may collapse category detail behind a participant-controlled detail action while preserving plan/recorded/remaining values.

### Financial Activity

- CSV upload, manual activity, Budget connection, participant context, and submitted explanation are functioning.
- Native browser `window.confirm()` is functionally adequate but visually poor on mobile because the deployment hostname dominates the dialog.
- Candidate later polish: THRIVE-styled confirmation surface.

### Reports

- Reports reconcile correctly and survive mobile well.
- Later participant-language review should consider whether implementation terms such as `Parsed` and `Posted` should become clearer participant-facing language.

## 8. Future admin/reviewer gate

Do not build this inside the current participant cleanup pass.

When opened as its own gate, the admin/reviewer layer should include controlled onboarding and access management for THRIVE roles such as:

- participant/user;
- reviewer/support;
- admin.

Role design must remain scoped by workspace/program and must not silently create external authority.

Expected future responsibilities include:

- invite/onboard a supported person;
- associate the person to the correct workspace/program;
- assign THRIVE access role(s);
- manage reviewer/support access;
- provide a usable Support queue and response workflow;
- preserve audit/history and participant-visible response boundaries;
- keep THRIVE role authority separate from Trust Engine, clinical, fiduciary, or other external authority.

Exact role architecture remains a future review gate and should be designed from the live schema before implementation.

## 9. Approved immediate next gate

Remain narrow.

1. Repair the confirmed Budget date-normalization defect on the mobile review branch.
2. Re-run build validation.
3. Verify `git diff --check` where a local checkout is available or use equivalent repository review before promotion.
4. Phone-test the repaired preview at normal browser scale.
5. If verified, promote the mobile containment/date repair into `main` through an explicit approved merge/promotion step.
6. Continue several days of participant-side use before broad UX redesign.
7. Open admin/reviewer onboarding/access architecture as a separate future gate.

## 10. Current checkpoint summary

Build/deployment status:
- Vercel production build: passed at the pre-mobile production checkpoint.
- Vercel mobile preview build: passed at `15937c4`.
- Real-phone authenticated preview use: verified.

Database status:
- live data inspected read-only;
- no schema changes;
- no inserts/updates/deletes from this review;
- no service-role use for participant application behavior;
- Trust Engine remains separate.

Repository status:
- production `main` remains at the pre-mobile participant checkpoint until an explicit promotion is approved;
- mobile repair work and this checkpoint document are isolated on `mobile-viewport-fix-v0-1`.

Next gate:
**Budget date-normalization repair + build/phone verification, then explicit promotion decision.**
