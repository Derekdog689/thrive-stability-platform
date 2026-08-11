# THRIVE Transaction Explanations Ordinary Participant v0.1 Candidate

## Gate
Candidate construction only.

This package is not installed and does not authorize deployment, push, SQL, RLS changes, schema changes, service-role use, Johnny activation, or Trust Engine synchronization.

## Verified basis
- Participant financial transactions are read through `get_my_financial_transactions_v1`.
- Participant transaction explanations are stored separately from staged bank evidence.
- Participant RLS allows insert of their own explanation for a transaction they own.
- Participant RLS allows select of their own explanations.
- Participant RLS allows update of their own draft explanation.
- Person D already has one live synthetic draft explanation for the grocery transaction.

## Candidate files
1. `src/app/transaction-explanations/useParticipantTransactionExplanations.ts`
2. `src/app/budget/page.tsx`

## Candidate behavior
- Budget remains the transaction-facing participant screen.
- Recent account activity keeps bank evidence visible.
- Existing participant context is matched by staged transaction ID.
- Existing draft context is shown inline.
- `Add context` opens an inline participant-owned draft form.
- Participant can choose one database-valid context category.
- Participant text is optional and remains participant-authored.
- Saving creates status `draft`.
- Existing participant-owned draft context can be edited.
- No submit lifecycle, reviewer follow-up, resolve, archive, Support automation, or Trust action is introduced.
- Underlying staged financial transactions are never updated.

## First controlled proof
1. Read-only: confirm Person D's existing grocery draft appears on Budget after install.
2. Refresh: confirm the draft persists through normal readback.
3. Separate approval before any write proof.
4. For write proof, prefer either editing the existing synthetic grocery draft or creating context for the second synthetic transaction after reconciling live state.

## Install gate not yet approved
Before installation:
- review both complete candidate files
- confirm no authority/lifecycle broadening
- confirm no code outside the two candidate paths
- then obtain explicit install approval
