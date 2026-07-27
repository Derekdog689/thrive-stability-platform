"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const PERSON_D_AUTH_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9";
const PERSON_A_AUTH_ID = "9b283c6e-c2f8-4f87-9f90-fa081ee249bd";
const OUTSIDER_AUTH_ID = "d89a6549-ac1a-431c-aff1-1ba7313175ab";

const PROGRAMS = [
  {
    key: "linked_program",
    label: "Shared controlled synthetic program",
    id: "71000000-0000-4000-8000-000000000002",
    expected: "visible",
  },
  {
    key: "unrelated_demo_program",
    label: "Unrelated demo program",
    id: "477ccd11-510f-4d85-8367-be9020f219f5",
    expected: "hidden",
  },
  {
    key: "johnny_program",
    label: "Johnny program",
    id: "f67f14a2-6666-44d6-99d4-dbb2678a2863",
    expected: "hidden",
  },
] as const;

type ProgramResult = {
  key: string;
  label: string;
  id: string;
  expected: string;
  data: unknown;
  error: string | null;
};

export default function SupportedPersonProgramNegativeTestsPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ProgramResult[]>([]);

  const isPersonD = userId === PERSON_D_AUTH_ID;
  const isPersonA = userId === PERSON_A_AUTH_ID;
  const isOutsider = userId === OUTSIDER_AUTH_ID;
  const isApprovedActor = isPersonD || isPersonA || isOutsider;

  useEffect(() => {
    let mounted = true;

    async function runTests() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      const user = sessionData.session?.user ?? null;

      if (sessionError || !user) {
        setChecked(true);
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");
      setUserId(user.id);
      setChecked(true);

      if (
        user.id !== PERSON_D_AUTH_ID &&
        user.id !== PERSON_A_AUTH_ID &&
        user.id !== OUTSIDER_AUTH_ID
      ) {
        setLoading(false);
        return;
      }

      const responses = await Promise.all(
        PROGRAMS.map(async (program) => {
          const response = await supabase
            .from("programs")
            .select(
              "id, workspace_id, program_name, program_type, status, description",
            )
            .eq("id", program.id)
            .maybeSingle();

          return {
            key: program.key,
            label: program.label,
            id: program.id,
            expected: program.expected,
            data: response.data,
            error: response.error?.message ?? null,
          };
        }),
      );

      if (!mounted) return;

      setResults(responses);
      setLoading(false);
    }

    void runTests();

    return () => {
      mounted = false;
    };
  }, []);

  if (!checked || loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          Running read-only program-isolation tests.
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
            Sign in as synthetic supported person D before running this page.
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
            Supported-Person Program Isolation Tests
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Exact-ID authenticated reads only. No program list query, create,
            update, delete, membership, or service-role path exists here.
          </p>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="font-black">Authenticated test actor</p>
          <p className="mt-3 break-all text-sm">Email: {email}</p>
          <p className="mt-1 break-all text-sm">User ID: {userId}</p>
          <p className="mt-1 text-sm">
            Classification:{" "}
            {isPersonD
              ? "Controlled synthetic supported person D"
              : isPersonA
                ? "Controlled synthetic supported person A"
                : isOutsider
                  ? "Controlled synthetic outsider"
                  : "Not authorized for this test page"}
          </p>
        </section>

        {!isApprovedActor ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
            This page is restricted to controlled synthetic persons A, D, and the outsider.
            No program query results are displayed.
          </section>
        ) : null}

        {isApprovedActor
          ? results.map((result) => {
              const visible = result.data !== null;
              const expectedForActor = isOutsider
                ? "hidden"
                : result.key === "linked_program"
                  ? "visible"
                  : "hidden";

              const passed =
                result.error === null &&
                ((expectedForActor === "visible" && visible) ||
                  (expectedForActor === "hidden" && !visible));

              return (
                <section
                  key={result.key}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black">{result.label}</h2>
                      <p className="mt-2 break-all text-sm text-slate-600">
                        {result.id}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-black ${
                        passed
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-red-100 text-red-900"
                      }`}
                    >
                      {passed ? "PASS" : "REVIEW"}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <dt className="font-black">Expected</dt>
                      <dd>{expectedForActor}</dd>
                    </div>
                    <div>
                      <dt className="font-black">Observed</dt>
                      <dd>{visible ? "visible" : "hidden"}</dd>
                    </div>
                    <div>
                      <dt className="font-black">Error</dt>
                      <dd>{result.error ?? "none"}</dd>
                    </div>
                  </dl>

                  <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs text-emerald-200">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </section>
              );
            })
          : null}

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
          <p className="font-black text-emerald-300">Read-only test boundary</p>
          <p className="mt-3 text-sm leading-6">
            No SQL, RLS change, workspace membership, program mutation,
            participation mutation, supported-person mutation, Johnny change,
            Trust Engine synchronization, service-role access, delete, push,
            merge, or deployment occurs here.
          </p>
        </section>
      </section>
    </main>
  );
}
