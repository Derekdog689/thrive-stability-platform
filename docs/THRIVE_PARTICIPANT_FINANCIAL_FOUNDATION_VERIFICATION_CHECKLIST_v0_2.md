# THRIVE Participant Financial Foundation Verification Checklist v0.2

## Preflight

- [x] Confirm live `(id, workspace_id)` supported-person uniqueness
- [x] Confirm live identity helper functions
- [x] Confirm candidate contains final rollback
- [ ] Confirm branch and checkpoint `519dd86`
- [ ] Confirm no push
- [ ] Confirm staged v0.1 is replaced by v0.2

## Dry run

- [ ] Execute complete v0.2 candidate in Supabase SQL Editor
- [ ] Candidate reaches inventory queries
- [ ] Ownership table appears during transaction
- [ ] Explanation table appears during transaction
- [ ] Budget tables appear during transaction
- [ ] Three participant read functions appear
- [ ] Final rollback completes
- [ ] Candidate tables do not remain
- [ ] Candidate functions do not remain
- [ ] Existing financial counts remain unchanged

## Installation approval checkpoint

Do not remove the final rollback until explicit approval is recorded after successful dry run.

## Post-install identity tests

- [ ] Admin can see candidate objects
- [ ] Person A sees only owned sources
- [ ] Person D sees only owned sources
- [ ] Participant without ownership sees zero financial rows
- [ ] Outsider sees zero financial rows
- [ ] Participant cannot read administrative reviews
- [ ] Participant cannot alter explanation identity fields
- [ ] Existing January importer remains unchanged

## Stop conditions

- participant cross-access;
- recursive RLS error;
- existing admin access weakened;
- source evidence rewritten;
- service-role requirement;
- any hard delete.
