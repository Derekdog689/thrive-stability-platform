#!/usr/bin/env python3
from pathlib import Path
import sys

PAGE = Path("src/app/supported-person-auth-link-review/page.tsx")
DOC = Path("docs/THRIVE_SYNTHETIC_AUTH_LINK_D_VALIDATION_v0_1.md")

if not PAGE.exists():
    sys.exit(f"Target not found: {PAGE}")

text = PAGE.read_text(encoding="utf-8")
original = text

old_block = '''                <div>
                  <dt className="font-black">
                    Current authentication link remains null
                  </dt>
                  <dd>
                    {person && person.auth_user_id === null ? "yes" : "no"}
                  </dd>
                </div>
                <div>
                  <dt className="font-black">Database write performed</dt>
                  <dd>no</dd>
                </div>'''

new_block = '''                <div>
                  <dt className="font-black">
                    Authentication link established
                  </dt>
                  <dd>
                    {person?.auth_user_id === VERIFIED_AUTH_USER_ID
                      ? "yes"
                      : "no"}
                  </dd>
                </div>
                <div>
                  <dt className="font-black">
                    Database write performed during this session
                  </dt>
                  <dd>{linkResult?.observed === "allowed" ? "yes" : "no"}</dd>
                </div>'''

if old_block in text:
    text = text.replace(old_block, new_block)
elif "Authentication link established" not in text:
    sys.exit("Expected review-conclusion block was not found. No file was written.")

if text != original:
    PAGE.write_text(text, encoding="utf-8")
    print(f"Patched {PAGE}")
else:
    print("UI correction already appears installed.")

doc = '''# THRIVE Synthetic Authentication Link D Validation v0.1

## Status

Validation complete.

The fixed administrator-only action `LINK-D-AUTH` was executed once and returned one updated supported-person row.

## Verified Actor

- Email: `dstein561+thrive-rls-admin@gmail.com`
- User ID: `3c0300e6-c4e9-4a84-b668-4a7e39593162`
- Classification: controlled administrator

## Verified Authentication Identity

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Supabase Auth UUID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- UUID source: live Supabase Authentication user record
- UUID fabricated: no

## Verified Supported-Person Link

- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Authentication user ID after link: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Display name: `SUPPORTED PERSON ONBOARDING TEST D`
- Preferred name: `Onboarding Test D`
- Status: `active`
- External reference: `RLS-ONBOARDING-TEST-PERSON-D`
- Created by: `3c0300e6-c4e9-4a84-b668-4a7e39593162`

## Observed Result

- Expected: `allowed`
- Observed: `allowed`
- Returned rows: `1`
- API error: none
- Message: the authenticated request linked the verified synthetic auth user to supported person D and returned the updated row

## Integrity Confirmation

The update changed only `auth_user_id`.

No evidence indicates a change to:

- workspace scope;
- display name;
- preferred name;
- lifecycle status;
- external reference;
- creation lineage;
- program participation.

## Boundary Confirmation

- Synthetic auth user created: yes, through the Supabase dashboard before the link step
- Supported-person auth link created: yes
- Program participation changed: no
- Johnny record created: no
- Explanation table created: no
- Trust Engine synchronized: no
- Service-role key added to repository: no
- Service-role path added to application: no
- Delete performed: no
- Push performed: no
- Merge performed: no
- Deployment performed: no

## UI Correction

The review conclusion previously displayed a static `Database write performed: no` value after the successful link.

The corrected UI reports:

- `Authentication link established: yes` when the returned UUID matches the verified synthetic auth UUID;
- `Database write performed during this session: yes` when the observed link result is `allowed`.

## Conclusion

`LINK-D-AUTH` passed.

Synthetic supported person D is now linked to the verified controlled synthetic Supabase Auth user while workspace scope, identity metadata, participation, and creation lineage remain unchanged.

Do not execute `LINK-D-AUTH` again.

## Next Gate

Build and commit this validation and UI correction.

After that checkpoint, sign in as synthetic supported person D and perform read-only RLS validation.

No additional database mutation is approved.
'''

DOC.write_text(doc, encoding="utf-8")
print(f"Wrote {DOC}")
print("No database request was executed.")
