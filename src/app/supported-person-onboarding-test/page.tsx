"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TEST_WORKSPACE_ID = "71000000-0000-4000-8000-000000000001";
const ONBOARDING_PERSON_ID = "71000000-0000-4000-8000-000000000009";
const ONBOARDING_PARTICIPATION_ID =
  "71000000-0000-4000-8000-000000000010";
const TEST_PROGRAM_ID = "71000000-0000-4000-8000-000000000002";
const TEST_PERSON_A_ID = "71000000-0000-4000-8000-000000000003";
const TEST_PERSON_B_ID = "71000000-0000-4000-8000-000000000004";
const TEST_PARTICIPATION_A_ID = "71000000-0000-4000-8000-000000000005";
const WRITE_TEST_PERSON_ID = "71000000-0000-4000-8000-000000000007";
const WRITE_TEST_PARTICIPATION_ID =
  "71000000-0000-4000-8000-000000000008";

const TEST_ADMIN_ID = "3c0300e6-c4e9-4a84-b668-4a7e39593162";
const TEST_PERSON_A_AUTH_ID = "9b283c6e-c2f8-4f87-9f90-fa081ee249bd";
const TEST_PERSON_B_AUTH_ID = "28cecd10-43ed-4ae5-8668-31cfa515412c";
const TEST_SUPPORT_ID = "7f0a7540-7a6d-4a1a-a29f-7a26c9571db9";
const TEST_VIEWER_ID = "d3782ad5-8e99-4779-8928-0143bd567486";
const TEST_OUTSIDER_ID = "d89a6549-ac1a-431c-aff1-1ba7313175ab";

type Actor =
  | "administrator"
  | "person-a"
  | "person-b"
  | "support"
  | "viewer"
  | "outsider"
  | "unknown";

type TestAction = {
  id: string;
  title: string;
  expected: "allowed" | "denied";
  description: string;
  allowedActors: Actor[];
  payload: Record<string, unknown>;
};

type TestResult = {
  actionId: string;
  expected: "allowed" | "denied";
  observed: "allowed" | "denied" | "error";
  message: string;
  data: unknown;
};

function classifyActor(userId: string): Actor {
  switch (userId) {
    case TEST_ADMIN_ID:
      return "administrator";
    case TEST_PERSON_A_AUTH_ID:
      return "person-a";
    case TEST_PERSON_B_AUTH_ID:
      return "person-b";
    case TEST_SUPPORT_ID:
      return "support";
    case TEST_VIEWER_ID:
      return "viewer";
    case TEST_OUTSIDER_ID:
      return "outsider";
    default:
      return "unknown";
  }
}

function actorLabel(actor: Actor): string {
  switch (actor) {
    case "administrator":
      return "Controlled administrator";
    case "person-a":
      return "Controlled supported person A";
    case "person-b":
      return "Controlled supported person B";
    case "support":
      return "Controlled support member";
    case "viewer":
      return "Controlled viewer member";
    case "outsider":
      return "Controlled authenticated outsider";
    default:
      return "Unrecognized identity";
  }
}

export default function SupportedPersonOnboardingTestPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [selectedActionId, setSelectedActionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const actor = useMemo(() => classifyActor(userId), [userId]);

  const actions = useMemo<TestAction[]>(
    () => [
      {
        id: "CREATE-D-PARTICIPATION",
        title: "Create synthetic program participation for supported person D",
        expected: "allowed",
        description:
          "Creates one reserved synthetic program-participation row linking supported person D to the fixed synthetic program. It does not create an authentication user or modify the supported-person identity.",
        allowedActors: ["administrator"],
        payload: {
          id: ONBOARDING_PARTICIPATION_ID,
          workspace_id: TEST_WORKSPACE_ID,
          program_id: TEST_PROGRAM_ID,
          supported_person_id: ONBOARDING_PERSON_ID,
          participant_role: "supported_person",
          status: "active",
          created_by: TEST_ADMIN_ID,
        },
      },
    ],
    [],
  );

  const visibleActions = useMemo(
    () => actions.filter((action) => action.allowedActors.includes(actor)),
    [actions, actor],
  );

  const selectedAction =
    visibleActions.find((action) => action.id === selectedActionId) ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error || !data.session?.user) {
        setEmail("");
        setUserId("");
        setSessionChecked(true);
        return;
      }

      setEmail(data.session.user.email ?? "");
      setUserId(data.session.user.id);
      setSessionChecked(true);
    }

    void loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function executeAction(action: TestAction) {
    if (confirmation !== action.id) {
      setResult({
        actionId: action.id,
        expected: action.expected,
        observed: "error",
        message: `Type ${action.id} exactly before submitting.`,
        data: null,
      });
      return;
    }

    if (!action.allowedActors.includes(actor)) {
      setResult({
        actionId: action.id,
        expected: action.expected,
        observed: "error",
        message: "This action is not available to the authenticated test actor.",
        data: null,
      });
      return;
    }

    setBusy(true);
    setResult(null);

    try {
      let response:
        | { data: unknown; error: { message: string } | null }
        | undefined;

      switch (action.id) {
        case "CREATE-D-PARTICIPATION":
          response = await supabase
            .from("program_participants")
            .insert(action.payload)
            .select();
          break;

        default:
          throw new Error("Unsupported fixed onboarding action.");
      }

      if (!response) {
        throw new Error("No response was returned.");
      }

      if (response.error) {
        setResult({
          actionId: action.id,
          expected: action.expected,
          observed: "denied",
          message: response.error.message,
          data: null,
        });
      } else {
        const returnedRows = Array.isArray(response.data)
          ? response.data
          : null;
        const affectedZeroRows =
          returnedRows !== null && returnedRows.length === 0;

        setResult({
          actionId: action.id,
          expected: action.expected,
          observed: affectedZeroRows ? "denied" : "allowed",
          message: affectedZeroRows
            ? "The authenticated request affected zero visible rows. RLS or authorization prevented the requested change."
            : "The authenticated request completed and returned the affected row.",
          data: response.data,
        });
      }
    } catch (error) {
      setResult({
        actionId: action.id,
        expected: action.expected,
        observed: "error",
        message:
          error instanceof Error ? error.message : "Unknown execution error.",
        data: null,
      });
    } finally {
      setBusy(false);
      setConfirmation("");
    }
  }

  if (!sessionChecked) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          Checking authenticated session.
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
            Sign in with one controlled synthetic test identity before using
            this temporary route.
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
            Synthetic Supported-Person Onboarding
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Temporary controlled harness for individually approved synthetic
            RLS write tests. Nothing runs automatically.
          </p>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="font-black">Authenticated test actor</p>
          <p className="mt-3 break-all text-sm">Email: {email}</p>
          <p className="mt-1 break-all text-sm">User ID: {userId}</p>
          <p className="mt-1 text-sm">Classification: {actorLabel(actor)}</p>
        </section>

        {actor === "unknown" ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
            This identity is not one of the six approved controlled synthetic
            accounts. No test actions are available.
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">
              Fixed workspace
            </p>
            <p className="mt-3 break-all font-semibold">{TEST_WORKSPACE_ID}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">
              Fixed program
            </p>
            <p className="mt-3 break-all font-semibold">{TEST_PROGRAM_ID}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <label className="text-sm font-black" htmlFor="test-action">
            Available fixed action
          </label>
          <select
            id="test-action"
            value={selectedActionId}
            onChange={(event) => {
              setSelectedActionId(event.target.value);
              setConfirmation("");
              setResult(null);
            }}
            className="mt-3 w-full rounded-2xl border border-slate-200 p-3"
          >
            <option value="">Select one test</option>
            {visibleActions.map((action) => (
              <option key={action.id} value={action.id}>
                {action.id}: {action.title}
              </option>
            ))}
          </select>
        </section>

        {selectedAction ? (
          <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-black uppercase text-emerald-700">
                {selectedAction.id}
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {selectedAction.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedAction.description}
              </p>
              <p className="mt-3 text-sm font-bold">
                Expected result: {selectedAction.expected}
              </p>
            </div>

            <div>
              <p className="text-sm font-black">Exact payload preview</p>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs text-emerald-200">
                {JSON.stringify(selectedAction.payload, null, 2)}
              </pre>
            </div>

            <div>
              <label className="text-sm font-black" htmlFor="confirmation">
                Type {selectedAction.id} to enable this single request
              </label>
              <input
                id="confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 p-3"
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              disabled={busy || confirmation !== selectedAction.id}
              onClick={() => void executeAction(selectedAction)}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Submitting isolated request..." : `Run ${selectedAction.id}`}
            </button>
          </section>
        ) : null}

        {result ? (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Observed response</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-black">Action</dt>
                <dd>{result.actionId}</dd>
              </div>
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
                <dd className="break-words">{result.message}</dd>
              </div>
            </dl>

            <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs text-emerald-200">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </section>
        ) : null}

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
          <p className="font-black text-emerald-300">
            Temporary write-test boundary
          </p>
          <p className="mt-3 text-sm leading-6">
            Synthetic fixtures only. No generic editing, deletes, automatic
            retries, service-role access, Johnny records, Trust Engine data,
            real financial observations, clinical information, recovery
            information, legal information, or private case data.
          </p>
          <p className="mt-3 text-sm leading-6">
            W18 and W19 remain deferred. Loading this route performs no database
            write.
          </p>
        </section>
      </section>
    </main>
  );
}
