"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TEST_ADMIN_ID = "3c0300e6-c4e9-4a84-b668-4a7e39593162";
const TEST_WORKSPACE_ID = "71000000-0000-4000-8000-000000000001";
const TEST_PROGRAM_ID = "71000000-0000-4000-8000-000000000002";
const ONBOARDING_PERSON_ID = "71000000-0000-4000-8000-000000000009";
const ONBOARDING_PARTICIPATION_ID =
  "71000000-0000-4000-8000-000000000010";
const PROPOSED_AUTH_EMAIL =
  "dstein561+thrive-onboarding-person-d@gmail.com";
const VERIFIED_AUTH_USER_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9";

type SupportedPersonRow = {
  id: string;
  workspace_id: string;
  auth_user_id: string | null;
  display_name: string;
  preferred_name: string | null;
  status: string;
  external_reference: string | null;
  created_by: string;
};

type LinkResult = {
  observed: "allowed" | "denied" | "error";
  message: string;
  data: unknown;
};

type ParticipationRow = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  participant_role: string;
  status: string;
  created_by: string;
};

export default function SupportedPersonAuthLinkReviewPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<SupportedPersonRow | null>(null);
  const [participation, setParticipation] =
    useState<ParticipationRow | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkResult, setLinkResult] = useState<LinkResult | null>(null);

  const isAdministrator = userId === TEST_ADMIN_ID;

  useEffect(() => {
    let mounted = true;

    async function loadReview() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      const user = sessionData.session?.user ?? null;

      if (sessionError || !user) {
        setSessionChecked(true);
        setLoading(false);
        setErrorMessage(
          sessionError?.message ?? "Sign in with the controlled administrator.",
        );
        return;
      }

      setEmail(user.email ?? "");
      setUserId(user.id);
      setSessionChecked(true);

      if (user.id !== TEST_ADMIN_ID) {
        setLoading(false);
        return;
      }

      const [personResponse, participationResponse] = await Promise.all([
        supabase
          .from("supported_people")
          .select(
            "id, workspace_id, auth_user_id, display_name, preferred_name, status, external_reference, created_by",
          )
          .eq("id", ONBOARDING_PERSON_ID)
          .maybeSingle(),
        supabase
          .from("program_participants")
          .select(
            "id, workspace_id, program_id, supported_person_id, participant_role, status, created_by",
          )
          .eq("id", ONBOARDING_PARTICIPATION_ID)
          .maybeSingle(),
      ]);

      if (!mounted) return;

      if (personResponse.error || participationResponse.error) {
        setErrorMessage(
          personResponse.error?.message ??
            participationResponse.error?.message ??
            "Unable to load review evidence.",
        );
      } else {
        setPerson(personResponse.data as SupportedPersonRow | null);
        setParticipation(
          participationResponse.data as ParticipationRow | null,
        );
      }

      setLoading(false);
    }

    void loadReview();

    return () => {
      mounted = false;
    };
  }, []);

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

  if (!sessionChecked || loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          Loading authenticated review evidence.
        </section>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-3xl font-black">Sign-in required</h1>
          <p className="mt-4">
            Sign in with the controlled administrator to review the synthetic
            authentication-link candidate.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white"
          >
            Go to login
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Synthetic Authentication-Link Review
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Review-only administrator affordance for supported person D. This
            page performs authenticated reads only and contains no create,
            update, delete, or service-role path.
          </p>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="font-black">Authenticated review actor</p>
          <p className="mt-3 break-all text-sm">Email: {email}</p>
          <p className="mt-1 break-all text-sm">User ID: {userId}</p>
          <p className="mt-1 text-sm">
            Classification:{" "}
            {isAdministrator
              ? "Controlled administrator"
              : "Not authorized for this review"}
          </p>
        </section>

        {!isAdministrator ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
            This review affordance is limited to the controlled administrator.
            No write action is available.
          </section>
        ) : null}

        {isAdministrator && errorMessage ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
            <p className="font-black">Review evidence could not be loaded</p>
            <p className="mt-3 break-words text-sm">{errorMessage}</p>
          </section>
        ) : null}

        {isAdministrator ? (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase text-emerald-700">
                Proposed synthetic authentication identity
              </p>
              <p className="mt-3 break-all text-xl font-black">
                {PROPOSED_AUTH_EMAIL}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                No authentication user has been created by this page. No UUID
                is guessed or fabricated.
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-500">
                  Supported person D
                </p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-black">Record found</dt>
                    <dd>{person ? "yes" : "no"}</dd>
                  </div>
                  <div>
                    <dt className="font-black">ID</dt>
                    <dd className="break-all">
                      {person?.id ?? ONBOARDING_PERSON_ID}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-black">Workspace</dt>
                    <dd className="break-all">
                      {person?.workspace_id ?? TEST_WORKSPACE_ID}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-black">Authentication link</dt>
                    <dd className="break-all">
                      {person?.auth_user_id ?? "null"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-black">Status</dt>
                    <dd>{person?.status ?? "not loaded"}</dd>
                  </div>
                  <div>
                    <dt className="font-black">Created by</dt>
                    <dd className="break-all">
                      {person?.created_by ?? "not loaded"}
                    </dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-500">
                  Program participation D
                </p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-black">Record found</dt>
                    <dd>{participation ? "yes" : "no"}</dd>
                  </div>
                  <div>
                    <dt className="font-black">ID</dt>
                    <dd className="break-all">
                      {participation?.id ?? ONBOARDING_PARTICIPATION_ID}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-black">Program</dt>
                    <dd className="break-all">
                      {participation?.program_id ?? TEST_PROGRAM_ID}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-black">Supported person</dt>
                    <dd className="break-all">
                      {participation?.supported_person_id ??
                        ONBOARDING_PERSON_ID}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-black">Role</dt>
                    <dd>
                      {participation?.participant_role ?? "not loaded"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-black">Status</dt>
                    <dd>{participation?.status ?? "not loaded"}</dd>
                  </div>
                </dl>
              </article>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
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

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Review conclusion</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                <div>
                  <dt className="font-black">Supported person D exists</dt>
                  <dd>{person ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt className="font-black">Participation D exists</dt>
                  <dd>{participation ? "yes" : "no"}</dd>
                </div>
                <div>
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
                </div>
              </dl>
            </section>
          </>
        ) : null}

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
          <p className="font-black text-emerald-300">
            Authentication-link boundary
          </p>
          <p className="mt-3 text-sm leading-6">
            No authentication-user creation or service-role path exists here. The fixed auth-link update runs only after exact typed confirmation. No
            service-role access, Johnny record, Trust Engine synchronization,
            explanation data, delete, push, merge, or deployment occurs here.
          </p>
        </section>
      </section>
    </main>
  );
}
