#!/usr/bin/env python3
from pathlib import Path
import sys

TARGET = Path("src/app/supported-person-auth-link-review/page.tsx")

if not TARGET.exists():
    sys.exit(f"Target not found: {TARGET}")

text = TARGET.read_text(encoding="utf-8")
original = text

AUTH_USER_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9"

if "const VERIFIED_AUTH_USER_ID" not in text:
    text = text.replace(
        'const PROPOSED_AUTH_EMAIL =\n  "dstein561+thrive-onboarding-person-d@gmail.com";',
        'const PROPOSED_AUTH_EMAIL =\n  "dstein561+thrive-onboarding-person-d@gmail.com";\n'
        f'const VERIFIED_AUTH_USER_ID = "{AUTH_USER_ID}";'
    )

if "type LinkResult" not in text:
    text = text.replace(
        "type ParticipationRow = {",
        '''type LinkResult = {
  observed: "allowed" | "denied" | "error";
  message: string;
  data: unknown;
};

type ParticipationRow = {'''
    )

state_anchor = '  const [errorMessage, setErrorMessage] = useState("");'
if "const [confirmation, setConfirmation]" not in text:
    text = text.replace(
        state_anchor,
        state_anchor + '''
  const [confirmation, setConfirmation] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkResult, setLinkResult] = useState<LinkResult | null>(null);'''
    )

if "async function executeAuthLink()" not in text:
    insert_before = "\n  if (!sessionChecked || loading) {"
    function_block = r'''
  async function executeAuthLink() {
    if (!isAdministrator) {
      setLinkResult({
        observed: "error",
        message: "Only the controlled administrator may run this action.",
        data: null,
      });
      return;
    }

    if (confirmation !== "LINK-D-AUTH") {
      setLinkResult({
        observed: "error",
        message: "Type LINK-D-AUTH exactly before submitting.",
        data: null,
      });
      return;
    }

    if (!person) {
      setLinkResult({
        observed: "error",
        message: "Supported person D is not loaded.",
        data: null,
      });
      return;
    }

    if (person.auth_user_id !== null) {
      setLinkResult({
        observed: "error",
        message:
          "Supported person D already has an authentication link. No request was sent.",
        data: person,
      });
      return;
    }

    setLinkBusy(true);
    setLinkResult(null);

    try {
      const response = await supabase
        .from("supported_people")
        .update({ auth_user_id: VERIFIED_AUTH_USER_ID })
        .eq("id", ONBOARDING_PERSON_ID)
        .is("auth_user_id", null)
        .select(
          "id, workspace_id, auth_user_id, display_name, preferred_name, status, external_reference, created_by",
        );

      if (response.error) {
        setLinkResult({
          observed: "denied",
          message: response.error.message,
          data: null,
        });
        return;
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      const updated = rows.length === 1 ? (rows[0] as SupportedPersonRow) : null;

      if (!updated) {
        setLinkResult({
          observed: "denied",
          message:
            "The authenticated request returned no updated row. RLS, authorization, or the null-link precondition prevented the change.",
          data: response.data,
        });
        return;
      }

      setPerson(updated);
      setLinkResult({
        observed: "allowed",
        message:
          "The authenticated request linked the verified synthetic auth user to supported person D and returned the updated row.",
        data: response.data,
      });
    } catch (error) {
      setLinkResult({
        observed: "error",
        message:
          error instanceof Error ? error.message : "Unknown execution error.",
        data: null,
      });
    } finally {
      setLinkBusy(false);
      setConfirmation("");
    }
  }
'''
    if insert_before not in text:
        sys.exit("Could not find insertion point for link function.")
    text = text.replace(insert_before, function_block + insert_before)

marker = '''            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Review conclusion</h2>'''

if "Run LINK-D-AUTH" not in text:
    action_block = r'''            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase text-emerald-700">
                LINK-D-AUTH
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Link verified synthetic auth user to supported person D
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This fixed administrator-only action updates only
                <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">
                  auth_user_id
                </code>
                on supported person D.
              </p>

              <div className="mt-5">
                <p className="text-sm font-black">Exact payload preview</p>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs text-emerald-200">
{JSON.stringify(
  {
    target_id: ONBOARDING_PERSON_ID,
    changes: { auth_user_id: VERIFIED_AUTH_USER_ID },
  },
  null,
  2,
)}
                </pre>
              </div>

              <div className="mt-5">
                <label className="text-sm font-black" htmlFor="link-confirmation">
                  Type LINK-D-AUTH to enable this single request
                </label>
                <input
                  id="link-confirmation"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 p-3"
                  autoComplete="off"
                />
              </div>

              <button
                type="button"
                disabled={
                  linkBusy ||
                  confirmation !== "LINK-D-AUTH" ||
                  !person ||
                  person.auth_user_id !== null
                }
                onClick={() => void executeAuthLink()}
                className="mt-5 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {linkBusy ? "Submitting isolated request..." : "Run LINK-D-AUTH"}
              </button>
            </section>

            {linkResult ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">Observed link response</h2>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-black">Expected</dt>
                    <dd>allowed</dd>
                  </div>
                  <div>
                    <dt className="font-black">Observed</dt>
                    <dd>{linkResult.observed}</dd>
                  </div>
                  <div>
                    <dt className="font-black">Message</dt>
                    <dd className="break-words">{linkResult.message}</dd>
                  </div>
                </dl>
                <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs text-emerald-200">
                  {JSON.stringify(linkResult.data, null, 2)}
                </pre>
              </section>
            ) : null}

'''
    if marker not in text:
        sys.exit("Could not find UI insertion point.")
    text = text.replace(marker, action_block + marker)

text = text.replace(
    "Review only. No authentication-user creation, auth-link update,",
    "No authentication-user creation or service-role path exists here. The fixed auth-link update runs only after exact typed confirmation. No",
)

required = [
    'const VERIFIED_AUTH_USER_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9";',
    'async function executeAuthLink()',
    '.update({ auth_user_id: VERIFIED_AUTH_USER_ID })',
    '.is("auth_user_id", null)',
    'Run LINK-D-AUTH',
]
missing = [item for item in required if item not in text]
if missing:
    sys.exit("Required markers missing after patch: " + ", ".join(missing))

for forbidden in ["service_role", ".delete(", "auth.admin"]:
    if forbidden in text:
        sys.exit(f"Forbidden marker detected after patch: {forbidden}")

if text == original:
    print("No changes required. LINK-D-AUTH candidate already appears installed.")
else:
    TARGET.write_text(text, encoding="utf-8")
    print(f"Patched {TARGET}")

print("Candidate action: LINK-D-AUTH")
print("Target supported person: 71000000-0000-4000-8000-000000000009")
print("Verified auth UUID: d48b7268-9aa6-4498-a923-2851fd5232c9")
print("No database request was executed.")
