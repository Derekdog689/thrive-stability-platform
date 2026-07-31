"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const WORKSPACE_ID = "71000000-0000-4000-8000-000000000001";
const PROGRAM_ID = "71000000-0000-4000-8000-000000000002";

const PERSON_A_ID = "71000000-0000-4000-8000-000000000003";
const PERSON_A_AUTH_ID = "9b283c6e-c2f8-4f87-9f90-fa081ee249bd";

const PERSON_D_AUTH_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9";
const ADMIN_AUTH_ID = "3c0300e6-c4e9-4a84-b668-4a7e39593162";
const OUTSIDER_AUTH_ID = "d89a6549-ac1a-431c-aff1-1ba7313175ab";

const INACTIVE_PERSON_ID = "71000000-0000-4000-8000-000000000007";

const GOAL_ID = "73000000-0000-4000-8000-000000000001";

type Actor = "person-a" | "person-d" | "administrator" | "outsider" | "unknown";
type Observed = "allowed" | "denied" | "error";

type Result = {
  id: string;
  title: string;
  expected: "allowed" | "denied";
  observed: Observed;
  message: string;
  data?: unknown;
};

function classifyActor(userId: string): Actor {
  if (userId === PERSON_A_AUTH_ID) return "person-a";
  if (userId === PERSON_D_AUTH_ID) return "person-d";
  if (userId === ADMIN_AUTH_ID) return "administrator";
  if (userId === OUTSIDER_AUTH_ID) return "outsider";
  return "unknown";
}

function actorLabel(actor: Actor): string {
  switch (actor) {
    case "person-a":
      return "Synthetic Participant A";
    case "person-d":
      return "Synthetic Participant D";
    case "administrator":
      return "Synthetic Workspace Administrator";
    case "outsider":
      return "Synthetic Authenticated Outsider";
    default:
      return "Unrecognized identity";
  }
}

function denied(error: { message: string } | null): boolean {
  return error !== null;
}

export default function GoalsAuthenticatedTestPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const actor = useMemo(
    () => classifyActor(session?.user.id ?? ""),
    [session?.user.id],
  );

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const response = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(response.data.session);
      setSessionChecked(true);
    }

    void loadSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setSessionChecked(true);
      setResults([]);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  function record(result: Result) {
    setResults((current) => [
      result,
      ...current.filter((item) => item.id !== result.id),
    ]);
  }

  async function run(
    id: string,
    title: string,
    expected: "allowed" | "denied",
    operation: () => Promise<{ data: unknown; error: { message: string } | null }>,
  ) {
    setBusy(true);
    try {
      const response = await operation();
      const observed: Observed = denied(response.error) ? "denied" : "allowed";
      record({
        id,
        title,
        expected,
        observed,
        message: response.error?.message ?? "Operation completed.",
        data: response.data,
      });
    } catch (error) {
      record({
        id,
        title,
        expected,
        observed: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  const participantAActions = [
    {
      id: "T02",
      title: "Self-select before create",
      expected: "allowed" as const,
      run: () =>
        run("T02", "Self-select before create", "allowed", async () => {
          const response = await supabase
            .from("participant_goals")
            .select("*")
            .eq("supported_person_id", PERSON_A_ID);
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T03",
      title: "Create participant-owned synthetic Goal",
      expected: "allowed" as const,
      run: () =>
        run("T03", "Create participant-owned synthetic Goal", "allowed", async () => {
          const response = await supabase
            .from("participant_goals")
            .insert({
              id: GOAL_ID,
              workspace_id: WORKSPACE_ID,
              program_id: PROGRAM_ID,
              supported_person_id: PERSON_A_ID,
              title: "SYNTHETIC TEST GOAL A",
              why_it_matters: "Synthetic RLS validation only",
              next_step: "Record one synthetic verification result",
              goal_area: "synthetic_testing",
              progress_status: "not_started",
              ownership_source: "participant",
              created_by: PERSON_A_AUTH_ID,
            })
            .select()
            .single();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T04",
      title: "Wrong creator denial",
      expected: "denied" as const,
      run: () =>
        run("T04", "Wrong creator denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .insert({
              id: "73000000-0000-4000-8000-000000000004",
              workspace_id: WORKSPACE_ID,
              program_id: PROGRAM_ID,
              supported_person_id: PERSON_A_ID,
              title: "SYNTHETIC WRONG CREATOR",
              next_step: "Must be denied",
              progress_status: "not_started",
              ownership_source: "participant",
              created_by: PERSON_D_AUTH_ID,
            })
            .select();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T05",
      title: "Wrong supported-person denial",
      expected: "denied" as const,
      run: () =>
        run("T05", "Wrong supported-person denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .insert({
              id: "73000000-0000-4000-8000-000000000005",
              workspace_id: WORKSPACE_ID,
              program_id: PROGRAM_ID,
              supported_person_id: "71000000-0000-4000-8000-000000000009",
              title: "SYNTHETIC WRONG PERSON",
              next_step: "Must be denied",
              progress_status: "not_started",
              ownership_source: "participant",
              created_by: PERSON_A_AUTH_ID,
            })
            .select();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T06",
      title: "Wrong workspace/program denial",
      expected: "denied" as const,
      run: () =>
        run("T06", "Wrong workspace/program denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .insert({
              id: "73000000-0000-4000-8000-000000000006",
              workspace_id: "b0cad5e3-8b0b-40aa-adf8-9f75f6a092b5",
              program_id: "477ccd11-510f-4d85-8367-be9020f219f5",
              supported_person_id: PERSON_A_ID,
              title: "SYNTHETIC WRONG SCOPE",
              next_step: "Must be denied",
              progress_status: "not_started",
              ownership_source: "participant",
              created_by: PERSON_A_AUTH_ID,
            })
            .select();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T07",
      title: "Staff-suggestion insert denial",
      expected: "denied" as const,
      run: () =>
        run("T07", "Staff-suggestion insert denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .insert({
              id: "73000000-0000-4000-8000-000000000007",
              workspace_id: WORKSPACE_ID,
              program_id: PROGRAM_ID,
              supported_person_id: PERSON_A_ID,
              title: "SYNTHETIC STAFF SUGGESTION",
              next_step: "Must be denied",
              progress_status: "not_started",
              ownership_source: "staff_suggestion",
              created_by: PERSON_A_AUTH_ID,
            })
            .select();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T10",
      title: "Participant content update",
      expected: "allowed" as const,
      run: () =>
        run("T10", "Participant content update", "allowed", async () => {
          const response = await supabase
            .from("participant_goals")
            .update({
              title: "SYNTHETIC TEST GOAL A UPDATED",
              next_step: "Complete the next synthetic validation step",
              progress_status: "in_progress",
            })
            .eq("id", GOAL_ID)
            .select()
            .single();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T11",
      title: "Immutable-field update denial",
      expected: "denied" as const,
      run: () =>
        run("T11", "Immutable-field update denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .update({ supported_person_id: INACTIVE_PERSON_ID })
            .eq("id", GOAL_ID)
            .select();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T12",
      title: "Participant archive",
      expected: "allowed" as const,
      run: () =>
        run("T12", "Participant archive", "allowed", async () => {
          const response = await supabase
            .from("participant_goals")
            .update({ progress_status: "archived" })
            .eq("id", GOAL_ID)
            .select()
            .single();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T13",
      title: "Participant reactivation denial",
      expected: "denied" as const,
      run: () =>
        run("T13", "Participant reactivation denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .update({ progress_status: "in_progress" })
            .eq("id", GOAL_ID)
            .select();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T17A",
      title: "Participant DELETE denial",
      expected: "denied" as const,
      run: () =>
        run("T17A", "Participant DELETE denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .delete()
            .eq("id", GOAL_ID)
            .select();

          const deniedByPolicy =
            response.error !== null ||
            (Array.isArray(response.data) && response.data.length === 0);

          return deniedByPolicy
            ? {
                data: response.data,
                error: { message: response.error?.message ?? "No row was deleted." },
              }
            : { data: response.data, error: null };
        }),
    },
  ];

  const crossPersonActions = [
    {
      id: actor === "person-d" ? "T08" : "T09",
      title:
        actor === "person-d"
          ? "Participant D cross-person select denial"
          : "Outsider select denial",
      expected: "denied" as const,
      run: () =>
        run(
          actor === "person-d" ? "T08" : "T09",
          actor === "person-d"
            ? "Participant D cross-person select denial"
            : "Outsider select denial",
          "denied",
          async () => {
            const response = await supabase
              .from("participant_goals")
              .select("*")
              .eq("id", GOAL_ID)
              .maybeSingle();

            const hidden = response.error === null && response.data === null;
            return hidden
              ? { data: null, error: { message: "RLS returned no visible row." } }
              : { data: response.data, error: response.error };
          },
        ),
    },
    {
      id: actor === "person-d" ? "T17D" : "T17O",
      title:
        actor === "person-d"
          ? "Participant D DELETE denial"
          : "Outsider DELETE denial",
      expected: "denied" as const,
      run: () =>
        run(
          actor === "person-d" ? "T17D" : "T17O",
          actor === "person-d"
            ? "Participant D DELETE denial"
            : "Outsider DELETE denial",
          "denied",
          async () => {
            const response = await supabase
              .from("participant_goals")
              .delete()
              .eq("id", GOAL_ID)
              .select();

            const deniedByInvisibility =
              response.error === null &&
              Array.isArray(response.data) &&
              response.data.length === 0;

            return deniedByInvisibility
              ? { data: response.data, error: { message: "No row was deletable or visible." } }
              : { data: response.data, error: response.error };
          },
        ),
    },
  ];

  const adminActions = [
    {
      id: "T14",
      title: "Workspace-admin read",
      expected: "allowed" as const,
      run: () =>
        run("T14", "Workspace-admin read", "allowed", async () => {
          const response = await supabase
            .from("participant_goals")
            .select("*")
            .eq("id", GOAL_ID)
            .single();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T15",
      title: "Workspace-admin reactivation",
      expected: "allowed" as const,
      run: () =>
        run("T15", "Workspace-admin reactivation", "allowed", async () => {
          const response = await supabase
            .from("participant_goals")
            .update({ progress_status: "in_progress" })
            .eq("id", GOAL_ID)
            .select()
            .single();
          return { data: response.data, error: response.error };
        }),
    },
    {
      id: "T17M",
      title: "Workspace-admin DELETE denial",
      expected: "denied" as const,
      run: () =>
        run("T17M", "Workspace-admin DELETE denial", "denied", async () => {
          const response = await supabase
            .from("participant_goals")
            .delete()
            .eq("id", GOAL_ID)
            .select();

          const deniedByPolicy =
            response.error !== null ||
            (Array.isArray(response.data) && response.data.length === 0);

          return deniedByPolicy
            ? {
                data: response.data,
                error: { message: response.error?.message ?? "No row was deleted." },
              }
            : { data: response.data, error: null };
        }),
    },
    {
      id: "T18",
      title: "Archive Goal for closeout",
      expected: "allowed" as const,
      run: () =>
        run("T18", "Archive Goal for closeout", "allowed", async () => {
          const response = await supabase
            .from("participant_goals")
            .update({ progress_status: "archived" })
            .eq("id", GOAL_ID)
            .select()
            .single();
          return { data: response.data, error: response.error };
        }),
    },
  ];

  const actions =
    actor === "person-a"
      ? participantAActions
      : actor === "person-d" || actor === "outsider"
        ? crossPersonActions
        : actor === "administrator"
          ? adminActions
          : [];

  if (!sessionChecked) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        Checking authenticated session.
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Goals authenticated test</h1>
          <p className="mt-4">Sign in through the normal login page first.</p>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white"
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
            Controlled synthetic validation
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Goals authenticated RLS test
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Actions run only when clicked. Use the locked synthetic accounts in
            the documented sequence. Stop immediately on any failed boundary.
          </p>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="font-black">Authenticated actor</p>
          <p className="mt-2 break-all text-sm">{session.user.email}</p>
          <p className="mt-1 break-all text-sm">{session.user.id}</p>
          <p className="mt-2 font-black">{actorLabel(actor)}</p>
        </section>

        {actor === "unknown" ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
            This identity is not approved for the Goals synthetic test. No test
            actions are available.
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={busy}
              onClick={action.run}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                {action.id} · expected {action.expected}
              </p>
              <p className="mt-2 text-xl font-black">{action.title}</p>
            </button>
          ))}
        </section>

        <section className="space-y-4">
          {results.map((result) => {
            const passed = result.expected === result.observed;
            return (
              <article
                key={result.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      {result.id}
                    </p>
                    <h2 className="mt-1 text-2xl font-black">{result.title}</h2>
                  </div>
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${
                      passed
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-red-100 text-red-900"
                    }`}
                  >
                    {passed ? "PASS" : "STOP"}
                  </span>
                </div>
                <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                  <div>
                    <dt className="font-black">Expected</dt>
                    <dd>{result.expected}</dd>
                  </div>
                  <div>
                    <dt className="font-black">Observed</dt>
                    <dd>{result.observed}</dd>
                  </div>
                  <div>
                    <dt className="font-black">Message</dt>
                    <dd>{result.message}</dd>
                  </div>
                </dl>
                <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs text-emerald-200">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </article>
            );
          })}
        </section>

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
          <p className="font-black text-emerald-300">Frozen boundaries</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Synthetic identities only. No Johnny, production participant,
            Trust Engine synchronization, participant-status change, auth
            linking, service-role path, deployment, merge, or push.
          </p>
        </section>
      </section>
    </main>
  );
}