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
            Review only. No authentication-user creation, auth-link update,
            service-role access, Johnny record, Trust Engine synchronization,
            explanation data, delete, push, merge, or deployment occurs here.
          </p>
        </section>
      </section>
    </main>
  );
}
