# THRIVE Thread Anchor — Money v0.3 Closeout / Cross-Lane Next Gate

Date: 2026-09-29  
Repository: `Derekdog689/thrive-stability-platform`  
Production project: `thrive-stability-platform`  
Supabase project: `ovzifochmrsaxabclxoe`

## Verified state

Money Meaning + Closeout v0.3 is merged to `main`.

- PR #24 hardened Money activity membership and atomic manual Money-in ownership.
- PR #25 merged Money Meaning + Closeout v0.3.
- Money v0.3 merge commit: `bff1d492a7b43837fac1cab716c57d7de8e95580`.
- Vercel deployment for that merge is SUCCESS.
- Phone verification of the merged v0.3 experience is the next user-side test.
- No new schema work is pending for this handoff.
- No historical Money activity was backfilled, moved, reclassified, or deleted as part of the recent Money ownership work.

## Frozen product boundaries

1. THRIVE's participant support spine and the Trust Engine remain independent systems.
2. Financial activity and bank data are observational evidence, not proof of intent, irresponsibility, relapse, incapacity, trust misuse, or any legal, clinical, or fiduciary conclusion.
3. Participant-entered facts may be surfaced plainly when relevant, including sensitive facts.
4. Facts, patterns, bounded interpretations, and guidance must remain visibly distinct.
5. THRIVE may connect relevant participant-owned facts across lanes when the connection is transparent and grounded.
6. THRIVE must not invent motive, diagnosis, causality, relapse, incapacity, intent, or clinical conclusions.
7. Participant choice stays last.
8. No hard deletes during the current MVP.
9. No production execution, merge, deployment, destructive action, or service-role use without the appropriate explicit approval gate.
10. The database is truth. Inspect live schema and current code before proposing structural changes.

## Product north star

> THRIVE does not judge the person or decide what their life means. It remembers what they tell it, notices what changes, connects relevant facts, returns them with care, and helps the person decide what comes next.

Core participant spine:

**SEE ME → REMEMBER ME → SHOW ME → HELP ME MOVE**

Core intelligence sequence:

**What is true → What changed → What stayed the same → What still matters → What worked anyway → What might help next**

Expanded behavior loop:

**Moment → Change → Pattern → Context → Interpretation → Choice → Outcome → Memory**

## Money: current product truth

Money ownership is now explicit.

- Current-plan activity counts only activity actually connected to the current Money plan.
- Older Budget activity stays with its original plan.
- Date overlap alone does not make activity part of the active Budget.
- Eligible unlinked activity may appear under **Available to add**, but is not counted until the participant chooses to connect it.
- Manual Money-in created from the active Budget uses an atomic create-and-link path.
- Invalid period-link inserts are blocked.
- Linked manual Money-in cannot silently become Money-out.
- Linked manual Money-in cannot be moved outside its owning Budget period.
- Archiving preserves membership history rather than deleting it.

## Money v0.3 experience

The merged v0.3 candidate adds the participant-facing meaning layer.

### Active-plan math

The UI now distinguishes:

- **Money available**
- **Assigned to categories**
- **Money used**
- **Still in planned categories**
- **Not assigned yet**
- **Still unspent overall**

This is meant to remove the ambiguity that previously made values like $4,000 available, $2,330 planned, $1,670 unassigned, and $580 left in planned categories feel contradictory.

### Available to add

The blue **Available to add** section is now designed to stay collapsed by default and open only when the participant deliberately chooses to inspect it.

Reason: eligible old/unlinked activity is useful context, but should not visually overpower the current-plan feed.

### Money closeout

Completed Money plans now return meaning instead of disappearing into a dead `Completed` state.

The closeout return includes:

- what was available,
- what was planned,
- what was used,
- what remained in planned categories,
- what was left unassigned,
- factual category observations,
- comparison to a prior completed plan when available,
- carry-forward choices for the next plan,
- Support as an optional next move.

Money closeout language must remain factual and non-moralizing.

## Approved behavioral interpretation principle

Participant-entered facts should not be hidden merely because they may be sensitive.

Example:

If the participant records beer spending and separately asks for recovery support, THRIVE may say:

- the participant recorded beer spending,
- the participant also asked for recovery support during the same period,
- those facts may be worth looking at together,
- THRIVE does not know whether they are connected,
- the participant decides whether the connection fits.

Allowed:

- surface literal participant-entered facts,
- identify repeated patterns,
- compare periods,
- connect relevant facts across lanes,
- offer bounded interpretations,
- invite reflection,
- offer Support.

Not allowed:

- infer relapse,
- diagnose,
- infer intent,
- infer causality,
- make legal, clinical, fiduciary, or capacity conclusions from the data.

## Current approved roadmap

Sequence is approved and should be followed unless live findings require a smaller corrective gate.

1. Finish Money Meaning + Closeout.
2. Phone-test merged Money v0.3.
3. Resolve only concrete Money presentation/usability issues found in the phone test.
4. Build the cross-lane synthesis layer.
5. Reconcile Today as the simple front-door translator for those cross-lane returns.
6. Build the Story page after the lanes are producing trustworthy returns.
7. Run zero-instruction real-user acceptance testing.
8. Freeze the participant spine for v1 and let real usage drive v1.1.
9. Resource expansion remains parked until real usage shows what is actually missing.

## Cross-lane synthesis direction

The next intelligence layer should let THRIVE say:

> These two things you told me may belong in the same conversation.

Examples may include:

- Money + Recovery
- Money + Support
- Wellness + Goals
- Wellness + Support
- Goals + Money

Cross-lane output should preserve the order:

1. Fact
2. Pattern
3. Bounded interpretation
4. Optional guidance
5. Participant choice

The Story page should eventually synthesize completed cycles, goals, check-ins, Money plans, Support threads, and participant feedback into a living long-view narrative rather than a permanent label.

## Phone test to bring into the next thread

Test the merged production Money v0.3 on the phone and report what actually happens.

Check specifically:

1. **Available to add** stays collapsed by default.
2. Opening **Review activity** does not automatically expand **Available to add**.
3. Active Money math is understandable without reverse-engineering it.
4. The relationship among available, planned, used, unassigned, and remaining money makes sense.
5. Current-plan activity contains only activity owned by the current plan.
6. Eligible unlinked activity is clearly separate and optional to add.
7. Completing a Budget produces a visible Money closeout return.
8. The closeout feels useful rather than like a receipt.
9. Category observations feel factual rather than judgmental.
10. The next action after closeout is clear.
11. Bottom navigation does not obscure important controls/content.
12. Any large-value wrapping or mobile hierarchy issues are documented with screenshots.

## Exact next gate

**Phone verification of the merged Money Meaning + Closeout v0.3 production experience.**

Do not begin cross-lane implementation until the phone test is reconciled and any concrete Money v0.3 usability defects are either fixed or explicitly accepted.

After Money v0.3 is accepted, the next implementation gate is:

**Cross-Lane Synthesis v0.1 candidate**

That candidate should begin with read-only reconciliation of the current Wellness, Goals, Money, Support, Today, and relevant live schema surfaces before any code or database change is proposed.

## Thread restart instruction

At the start of the next thread:

1. Read this anchor.
2. Verify current `main` and current production status before making changes.
3. Accept the user's phone-test screenshots/feedback as the first new evidence.
4. Reconcile those findings against the merged Money v0.3 implementation.
5. Fix only confirmed Money v0.3 issues first.
6. Once Money is accepted, move to the approved Cross-Lane Synthesis v0.1 gate.

## Working-pass checkpoint

- Build status at handoff: Vercel SUCCESS for Money v0.3 merge.
- `git diff --check`: not run locally; remote-only workflow.
- `git status`: no local checkout.
- Money v0.3 merge checkpoint: `bff1d492a7b43837fac1cab716c57d7de8e95580`.
- Next gate: phone verification, then Cross-Lane Synthesis v0.1.
