# THRIVE Participant Continuity and Authentication Recovery Anchor v0.1

Date: 2026-10-08
Owner: DSS Enterprises
Repository: Derekdog689/thrive-stability-platform
Status: Review-only planning anchor; no implementation, merge, deployment, or production data change authorized by this document.
Branch: docs/participant-continuity-auth-recovery-anchor-20261008

## Purpose

Capture the agreed participant-value sequence after the first supported-person activation reported on October 8, 2026, and fold password recovery into the same operating plan without silently expanding scope.

This updates the planning sequence only. Prior roadmap documents may describe older pre-activation conditions and must not be misread as the current installed state. Live database, deployed application, and current code must be inspected at each implementation gate.

## Current observations and confidence

- Operator reports Johnny has been activated. Account, authorization, and participant state have **not** been independently verified during this documentation pass.
- The mobile login screenshot shows Email, Password, Enter THRIVE, Create an account, and Privacy. It shows no visible Forgot password affordance.
- Read-only GitHub default-branch search on October 8 located `signInWithPassword` in `src/app/login/page.tsx`, but no match for `resetPasswordForEmail`, `updateUser password`, or `Forgot password`. This is evidence of a likely missing self-service path, not proof about every external/admin recovery channel.
- No participant usage result, historical activity, consent, clinical interpretation, or trust-side authority is inferred from activation.

## Product promise

THRIVE should help a person return to work they have already started, understand what matters, take a manageable action, review what happened, and carry progress forward.

Operating loop: **Know -> Understand -> Explain -> Guide -> Act -> Review -> Adapt -> Connect.**

Each increment must return useful participant value rather than merely add screens or cards.

## Sequenced candidate gates

0. **Authentication Recovery v0.1 (access foundation).** Inspect existing auth routes, Supabase Auth and email setup, redirect allowlist, and mobile deep-link/browser return. Candidate: visible Forgot password link, self-service recovery email, safe new-password form, successful return to THRIVE, and clear failure/expired-link messages. Never reveal whether an email has an account. Keep admin-assisted *send recovery* separate and permissioned; admins never see participant passwords. Do not implement until approved and tested.
1. **Wellness -> Supported Action v0.1.** Turn an existing check-in or reflection into one concrete participant-controlled next step, preserving source context and a useful return.
2. **Goals -> Contextual Goal Guidance v0.1.** Translate goal state and real actions into manageable guidance, without claiming unobserved progress.
3. **Review + Adapt v0.1.** Allow a participant to revisit the action, say what helped or did not, and adjust, including a legitimate save/return-later option.
4. **Story Temporal Synthesis v0.1.** Ground daily, weekly, monthly, and longer-term comparisons in actual dated events. Preserve exact source-lane identities when returning to records.
5. **Human Support Notification + Acknowledgment Delivery v0.1.** Prove that requests reach authorized humans, are acknowledged, and can be followed up, without promising unverified delivery. **Safety/operational dependency:** if current UI already promises delivery, this gate becomes an immediate prerequisite rather than waiting behind Resources.
6. **Resources Native-First Routing v0.1.** Guide to useful verified in-app Recovery/Wellness/Money/Stability resources first, then relevant external official finders and existing Ask THRIVE Support routes when appropriate.

This retains the October 7 approved ordering of experience work, with Authentication Recovery inserted as Gate 0. Human Support remains before Resources as in that ordering. Do not treat a prior prose summary's inverse ordering as a newly approved architecture decision.

## Proving Johnny's participant experience

Observe actual voluntary use, navigation, return visits, recovery access, and support requests. Separate reported observations from interpretation. Ask whether THRIVE helped something move. Do not manufacture participant check-ins, explanations, consent, or outcomes. No automatic analytic judgment or cross-system synchronization.

## Frozen boundaries

1. Johnny's THRIVE personal support spine and the Trust Engine remain independent.
2. Comparing authorized facts never merges ownership, authority, approvals, consent, or decisions.
3. Bank transactions are observational evidence, not conclusions about intent, relapse, irresponsibility, capacity, or trust misuse.
4. Keep facts, patterns, explanations, and conclusions separate. Explain before flagging. Use practical non-shaming language.
5. Live database is truth for schema/data; current main and production are truth for deployed behavior. Inspect/reconcile before change.
6. No hard deletes in MVP. No fabricated consent, historical actions, clinical findings, or external authority.
7. Routine DSS support follows existing authority; expanded access/sharing requires separate authorization.
8. Work gates: inspect -> reconcile -> document -> candidate -> test -> approve -> install -> verify -> commit. No production mutation, deployment, merge, service-role use, or synchronization absent explicit approval.

## Immediate next gate

**Read-only authentication-recovery reconciliation**. Inventory login and recovery routes, Supabase email provider/template settings, allowed redirects, mobile browser return, and administrative permissions. Produce a smallest-safe candidate and test matrix before asking to install. Then resume Wellness -> Supported Action v0.1.

## Closeout of this documentation pass

- Build status: documentation-only anchor; feature state unchanged.
- `git diff --check`: not run; no local working tree available in this GitHub-only pass.
- `git status`: not run; no local working tree available.
- Commit checkpoint: recorded in GitHub branch history after creation; do not infer main/production has changed.
- Next gate: read-only auth reconciliation, then review candidate; no implicit execution.
