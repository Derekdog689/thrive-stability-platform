"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ONBOARDING_PERSON_ID = "71000000-0000-4000-8000-000000000009";
const ONBOARDING_PARTICIPATION_ID =
  "71000000-0000-4000-8000-000000000010";
const TARGET_PROGRAM_ID = "71000000-0000-4000-8000-000000000002";
const TARGET_WORKSPACE_ID = "71000000-0000-4000-8000-000000000001";
const PERSON_D_AUTH_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9";

type ProbeResult = {
  label: string;
  data: unknown;
  error: string | null;
};

export default function SupportedPersonProgramSummaryProbePage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ProbeResult[]>([]);

  const isPersonD = userId === PERSON_D_AUTH_ID;

  useEffect(() => {
    let mounted = true;

    async function runProbe() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      const user = sessionData.session?.user ?? null;

      if (sessionError || !user) {
        setSessionChecked(true);
        setLoading(false);
        setResults([
          {
            label: "session",
            data: null,
            error:
              sessionError?.message ??
              "Sign in as synthetic supported person D.",
          },
        ]);
        return;
      }

      setEmail(user.email ?? "");
      setUserId(user.id);
      setSessionChecked(true);

      if (user.id !== PERSON_D_AUTH_ID) {
        setLoading(false);
        return;
      }

      const [personResponse, participationResponse, programResponse] =
        await Promise.all([
          supabase
            .from("supported_people")
            .select("*")
            .eq("id", ONBOARDING_PERSON_ID)
            .maybeSingle(),
          supabase
            .from("program_participants")
            .select("*")
            .eq("id", ONBOARDING_PARTICIPATION_ID)
            .maybeSingle(),
          supabase
            .from("programs")
            .select("*")
            .eq("id", TARGET_PROGRAM_ID)
            .eq("workspace_id", TARGET_WORKSPACE_ID)
            .maybeSingle(),
        ]);

      if (!mounted) return;

      setResults([
        {
          label: "supported_person",
          data: personResponse.data,
          error: personResponse.error?.message ?? null,
        },
        {
          label: "program_participation",
          data: participationResponse.data,
          error: participationResponse.error?.message ?? null,
        },
        {
          label: "exact_program_row",
          data: programResponse.data,
          error: programResponse.error?.message ?? null,
        },
      ]);

      setLoading(false);
    }

    void runProbe();

    return () => {
      mounted = false;
    };
  }, []);

  if (!sessionChecked || loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          Running read-only exact-program probe.
        </section>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-6xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-3xl font-black">Sign-in required</h1>
          <p className="mt-4">
            Sign in as synthetic supported person D before loading this
            read-only probe.
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
            Participant-Safe Program Summary Probe
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only exact-row inspection for synthetic supported person D.
            This page contains no create, update, delete, membership, or
            service-role path.
          </p>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="font-black">Authenticated probe actor</p>
          <p className="mt-3 break-all text-sm">Email: {email}</p>
          <p className="mt-1 break-all text-sm">User ID: {userId}</p>
          <p className="mt-1 text-sm">
            Classification:{" "}
            {isPersonD
              ? "Controlled synthetic supported person D"
              : "Not authorized for this probe"}
          </p>
        </section>

        {!isPersonD ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
            This probe is restricted to synthetic supported person D. No data
            query result is displayed.
          </section>
        ) : null}

        {isPersonD ? (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <article className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-500">
                  Exact program target
                </p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-black">Program ID</dt>
                    <dd className="break-all">{TARGET_PROGRAM_ID}</dd>
                  </div>
                  <div>
                    <dt className="font-black">Workspace ID</dt>
                    <dd className="break-all">{TARGET_WORKSPACE_ID}</dd>
                  </div>
                  <div>
                    <dt className="font-black">Query shape</dt>
                    <dd>Exact ID and workspace only</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-500">
                  Probe boundary
                </p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-black">Database write</dt>
                    <dd>no</dd>
                  </div>
                  <div>
                    <dt className="font-black">Workspace membership</dt>
                    <dd>not created</dd>
                  </div>
                  <div>
                    <dt className="font-black">Program list query</dt>
                    <dd>not performed</dd>
                  </div>
                </dl>
              </article>
            </section>

            {results.map((result) => (
              <section
                key={result.label}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-2xl font-black">{result.label}</h2>
                <p className="mt-3 text-sm">
                  Error: {result.error ?? "none"}
                </p>
                <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs text-emerald-200">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </section>
            ))}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Probe interpretation</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                A non-null exact program row means current RLS already supports
                the UI-only path. A null row with no error means the row is not
                visible under current policy. An explicit error must be
                captured exactly before any candidate is changed.
              </p>
            </section>
          </>
        ) : null}

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
          <p className="font-black text-emerald-300">
            Participant-safe summary boundary
          </p>
          <p className="mt-3 text-sm leading-6">
            Read-only synthetic probe. No SQL, RLS change, workspace
            membership, program creation, supported-person mutation,
            participation mutation, Johnny work, Trust Engine synchronization,
            service-role access, delete, push, merge, or deployment occurs
            here.
          </p>
        </section>
      </section>
    </main>
  );
}