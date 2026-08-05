"use client";

import { useCallback, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  SUPPORT_TEST_EXECUTION_ENABLED,
  supportLinkedRecords,
  supportTestActors,
} from "./supportTestConfig";

type ResultState = {
  action: string;
  ok: boolean;
  data?: unknown;
  error?: string;
};

type RequestDraft = {
  workspaceId: string;
  programId: string;
  supportedPersonId: string;
  participantCategory: string;
  participantMessage: string;
  requestedSupport: string;
  contactPreference: string;
};

const emptyDraft: RequestDraft = {
  workspaceId: "",
  programId: "",
  supportedPersonId: "",
  participantCategory: "other",
  participantMessage: "SYNTHETIC SUPPORT TEST ONLY",
  requestedSupport: "Review-only browser-authenticated Support test candidate.",
  contactPreference: "in_app",
};

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function SupportTestHarnessPage() {
  const [draft, setDraft] = useState<RequestDraft>(emptyDraft);
  const [requestId, setRequestId] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [busy, setBusy] = useState(false);

  const executionLabel = SUPPORT_TEST_EXECUTION_ENABLED
    ? "Execution enabled"
    : "Review-only lock active";

  const configuredActorSummary = useMemo(
    () => ({
      participantD: supportTestActors.participantD,
      participantA: supportTestActors.participantA,
      outsider: supportTestActors.outsider,
      activeSupportMember: supportTestActors.activeSupportMember,
      activeAdmin: supportTestActors.activeAdmin,
      inactiveSupportMember: supportTestActors.inactiveSupportMember,
      linkedRecords: supportLinkedRecords,
    }),
    []
  );

  const runAction = useCallback(
    async (action: string, operation: () => Promise<unknown>) => {
      if (!SUPPORT_TEST_EXECUTION_ENABLED) {
        setResult({
          action,
          ok: false,
          error:
            "Review-only lock active. Separate approval is required before enabling synthetic execution.",
        });
        return;
      }

      setBusy(true);
      setResult(null);

      try {
        const data = await operation();
        setResult({ action, ok: true, data });
      } catch (error) {
        setResult({
          action,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setBusy(false);
      }
    },
    []
  );

  async function loadIdentity() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return {
      email: user?.email ?? null,
      authUserId: user?.id ?? null,
      authenticated: Boolean(user),
    };
  }

  async function createSyntheticRequest() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("No authenticated browser user.");

    const payload = {
      workspace_id: draft.workspaceId,
      program_id: draft.programId,
      supported_person_id: draft.supportedPersonId,
      participant_category: draft.participantCategory,
      participant_message: draft.participantMessage,
      requested_support: draft.requestedSupport || null,
      contact_preference: draft.contactPreference || null,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("support_requests")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function readRequest() {
    if (!requestId) throw new Error("Enter a Support request ID.");

    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .eq("id", requestId);

    if (error) throw error;
    return data;
  }

  async function withdrawRequest() {
    if (!requestId) throw new Error("Enter a Support request ID.");

    const payload = {
      status: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("support_requests")
      .update(payload)
      .eq("id", requestId)
      .select();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function readEntries() {
    if (!requestId) throw new Error("Enter a Support request ID.");

    const { data, error } = await supabase
      .from("support_request_entries")
      .select("*")
      .eq("support_request_id", requestId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  async function readLinks() {
    if (!requestId) throw new Error("Enter a Support request ID.");

    const { data, error } = await supabase
      .from("support_request_links")
      .select("*")
      .eq("support_request_id", requestId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  async function readEvents() {
    if (!requestId) throw new Error("Enter a Support request ID.");

    const { data, error } = await supabase
      .from("support_request_status_events")
      .select("*")
      .eq("support_request_id", requestId)
      .order("changed_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  async function directStatusEventInsertProof() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("No authenticated browser user.");
    if (!requestId) throw new Error("Enter a Support request ID.");

    const payload = {
      workspace_id: draft.workspaceId,
      program_id: draft.programId,
      supported_person_id: draft.supportedPersonId,
      support_request_id: requestId,
      event_type: "status_changed",
      from_status: null,
      to_status: "submitted",
      changed_by: user.id,
      change_note: "SYNTHETIC direct-write denial proof",
    };

    const { data, error } = await supabase
      .from("support_request_status_events")
      .insert(payload)
      .select();

    return {
      payload,
      expected: "Authenticated direct insert must fail.",
      returnedData: data,
      returnedError: error,
    };
  }

  const disabled = busy || !SUPPORT_TEST_EXECUTION_ENABLED;

  return (
    <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-3xl font-black">
            THRIVE Support test harness
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Browser-authenticated candidate only. No service-role client, no
            Johnny activation, no automatic batch execution, no hard deletes,
            no Trust Engine synchronization.
          </p>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900">
            {executionLabel}
          </div>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Configured actors</h2>
          <p className="mt-2 text-sm text-slate-600">
            IDs remain blank until a separately approved synthetic setup pass.
            Never store passwords or service-role credentials here.
          </p>
          <div className="mt-4">
            <JsonBlock value={configuredActorSummary} />
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Identity</h2>
          <button
            type="button"
            disabled={disabled}
            onClick={() => runAction("load authenticated identity", loadIdentity)}
            className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Load browser identity
          </button>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Request configuration</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["workspaceId", "Workspace ID"],
              ["programId", "Program ID"],
              ["supportedPersonId", "Supported-person ID"],
              ["participantCategory", "Participant category"],
              ["participantMessage", "Participant message"],
              ["requestedSupport", "Requested support"],
              ["contactPreference", "Contact preference"],
            ].map(([key, label]) => (
              <label key={key} className="text-sm font-bold text-slate-700">
                {label}
                <input
                  value={draft[key as keyof RequestDraft]}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block text-sm font-bold text-slate-700">
            Existing Support request ID
            <input
              value={requestId}
              onChange={(event) => setRequestId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction("create synthetic request", createSyntheticRequest)
              }
              className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create request
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => runAction("read request", readRequest)}
              className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Read request
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => runAction("withdraw request", withdrawRequest)}
              className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Withdraw request
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Visibility and audit reads</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() => runAction("read entries", readEntries)}
              className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Read entries
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => runAction("read links", readLinks)}
              className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Read links
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => runAction("read status events", readEvents)}
              className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Read status events
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction(
                  "direct status-event insert denial proof",
                  directStatusEventInsertProof
                )
              }
              className="rounded-xl bg-rose-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prove direct event insert fails
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Single-action result</h2>
          <p className="mt-2 text-sm text-slate-600">
            The harness intentionally has no run-all button, loops, cleanup
            automation, account creation, or service-role path.
          </p>
          <div className="mt-4">
            <JsonBlock value={result ?? { status: "No action run." }} />
          </div>
        </section>
      </section>
    </main>
  );
}
