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

type ReviewerDraft = {
  routingCategory: string;
  assignedMemberId: string;
  nextStatus: string;
};

type EntryDraft = {
  entryType: "participant_response" | "internal_note";
  title: string;
  content: string;
  archiveReason: string;
};

type LinkTargetType =
  | "goal"
  | "wellness_checkin"
  | "budget_category"
  | "budget_period"
  | "staged_transaction"
  | "prior_support_request";

type LinkDraft = {
  targetType: LinkTargetType;
  archiveReason: string;
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

const emptyReviewerDraft: ReviewerDraft = {
  routingCategory: "",
  assignedMemberId: "",
  nextStatus: "acknowledged",
};

const emptyEntryDraft: EntryDraft = {
  entryType: "participant_response",
  title: "Synthetic Support response",
  content: "SYNTHETIC SUPPORT TEST ONLY",
  archiveReason: "Synthetic archive proof",
};

const emptyLinkDraft: LinkDraft = {
  targetType: "goal",
  archiveReason: "Synthetic mistaken-link archive proof",
};

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function SupportTestHarnessPage() {
  const [draft, setDraft] = useState<RequestDraft>(emptyDraft);
  const [reviewerDraft, setReviewerDraft] =
    useState<ReviewerDraft>(emptyReviewerDraft);
  const [entryDraft, setEntryDraft] = useState<EntryDraft>(emptyEntryDraft);
  const [linkDraft, setLinkDraft] = useState<LinkDraft>(emptyLinkDraft);

  const [requestId, setRequestId] = useState("");
  const [entryId, setEntryId] = useState("");
  const [linkId, setLinkId] = useState("");
  const [eventId, setEventId] = useState("");

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

  async function requireUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("No authenticated browser user.");
    return user;
  }

  function requireRequestId() {
    if (!requestId) throw new Error("Enter a Support request ID.");
    return requestId;
  }

  function requireEntryId() {
    if (!entryId) throw new Error("Enter a Support entry ID.");
    return entryId;
  }

  function requireLinkId() {
    if (!linkId) throw new Error("Enter a Support link ID.");
    return linkId;
  }

  function requireEventId() {
    if (!eventId) throw new Error("Enter a Support status-event ID.");
    return eventId;
  }

  async function loadIdentity() {
    const user = await requireUser();
    return {
      email: user.email ?? null,
      authUserId: user.id,
      authenticated: true,
    };
  }

  async function createSyntheticRequest() {
    const user = await requireUser();
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
    const id = requireRequestId();
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .eq("id", id);

    if (error) throw error;
    return data;
  }

  async function withdrawRequest() {
    const id = requireRequestId();
    const payload = {
      status: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("support_requests")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function updateRoutingCategory() {
    const id = requireRequestId();
    const payload = {
      routing_category: reviewerDraft.routingCategory || null,
    };

    const { data, error } = await supabase
      .from("support_requests")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function updateAssignment() {
    const id = requireRequestId();
    const payload = {
      assigned_member_id: reviewerDraft.assignedMemberId || null,
    };

    const { data, error } = await supabase
      .from("support_requests")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function transitionRequestStatus() {
    const id = requireRequestId();
    const payload: Record<string, string | null> = {
      status: reviewerDraft.nextStatus,
    };

    if (reviewerDraft.nextStatus === "completed") {
      payload.completed_at = new Date().toISOString();
    }

    if (reviewerDraft.nextStatus === "archived") {
      payload.archived_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("support_requests")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function readEntries() {
    const id = requireRequestId();
    const { data, error } = await supabase
      .from("support_request_entries")
      .select("*")
      .eq("support_request_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  async function createEntry() {
    const user = await requireUser();
    const id = requireRequestId();
    const payload = {
      workspace_id: draft.workspaceId,
      program_id: draft.programId,
      supported_person_id: draft.supportedPersonId,
      support_request_id: id,
      entry_type: entryDraft.entryType,
      title: entryDraft.title || null,
      content: entryDraft.content,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("support_request_entries")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function proveEntryContentUpdateFails() {
    const id = requireEntryId();
    const payload = {
      content: "SYNTHETIC MUTATION ATTEMPT THAT MUST FAIL",
    };

    const { data, error } = await supabase
      .from("support_request_entries")
      .update(payload)
      .eq("id", id)
      .select();

    if (!error) {
      throw new Error(
        "Entry mutation denial proof was inconclusive because no database error was returned."
      );
    }

    return {
      payload,
      expected: "Entry content mutation must fail.",
      returnedData: data,
      returnedError: error,
      denialConfirmed: true,
    };
  }

  async function archiveEntry() {
    const id = requireEntryId();
    const payload = {
      archived_at: new Date().toISOString(),
      archive_reason: entryDraft.archiveReason,
    };

    const { data, error } = await supabase
      .from("support_request_entries")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function readLinks() {
    const id = requireRequestId();
    const { data, error } = await supabase
      .from("support_request_links")
      .select("*")
      .eq("support_request_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  function resolveLinkTarget() {
    const mapping: Record<LinkTargetType, string | undefined> = {
      goal: supportLinkedRecords.goalId,
      wellness_checkin: supportLinkedRecords.wellnessCheckinId,
      budget_category: supportLinkedRecords.budgetCategoryId,
      budget_period: supportLinkedRecords.budgetPeriodId,
      staged_transaction: supportLinkedRecords.stagedTransactionId,
      prior_support_request:
        supportLinkedRecords.completedPriorSupportRequestId,
    };

    const targetId = mapping[linkDraft.targetType];

    if (!targetId) {
      throw new Error(
        `No verified synthetic linked record configured for ${linkDraft.targetType}.`
      );
    }

    return targetId;
  }

  async function createLink() {
    const user = await requireUser();
    const id = requireRequestId();
    const targetId = resolveLinkTarget();

    const payload = {
      workspace_id: draft.workspaceId,
      program_id: draft.programId,
      supported_person_id: draft.supportedPersonId,
      support_request_id: id,
      staged_transaction_id:
        linkDraft.targetType === "staged_transaction" ? targetId : null,
      budget_category_id:
        linkDraft.targetType === "budget_category" ? targetId : null,
      budget_period_id:
        linkDraft.targetType === "budget_period" ? targetId : null,
      wellness_checkin_id:
        linkDraft.targetType === "wellness_checkin" ? targetId : null,
      goal_id: linkDraft.targetType === "goal" ? targetId : null,
      prior_support_request_id:
        linkDraft.targetType === "prior_support_request" ? targetId : null,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("support_request_links")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { payload, returned: data };
  }

async function proveLinkTargetUpdateFails() {
  const id = requireLinkId();

  const payload = {
    goal_id: "00000000-0000-4000-8000-000000000001",
  };

  const { data, error } = await supabase
    .from("support_request_links")
    .update(payload)
    .eq("id", id)
    .select();

  if (!error) {
    throw new Error(
      "Link target mutation denial proof was inconclusive because no database error was returned."
    );
  }

  return {
    payload,
    expected: "Support link target mutation must fail.",
    returnedData: data,
    returnedError: error,
    denialConfirmed: true,
  };
}

  async function archiveLink() {
    const id = requireLinkId();
    const payload = {
      archived_at: new Date().toISOString(),
      archive_reason: linkDraft.archiveReason,
    };

    const { data, error } = await supabase
      .from("support_request_links")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { payload, returned: data };
  }

  async function readEvents() {
    const id = requireRequestId();
    const { data, error } = await supabase
      .from("support_request_status_events")
      .select("*")
      .eq("support_request_id", id)
      .order("changed_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  async function directStatusEventInsertProof() {
    const user = await requireUser();
    const id = requireRequestId();
    const payload = {
      workspace_id: draft.workspaceId,
      program_id: draft.programId,
      supported_person_id: draft.supportedPersonId,
      support_request_id: id,
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

    if (!error) {
      throw new Error(
        "Status-event insert denial proof was inconclusive because no database error was returned."
      );
    }

    return {
      payload,
      expected: "Authenticated direct insert must fail.",
      returnedData: data,
      returnedError: error,
      denialConfirmed: true,
    };
  }

  async function directStatusEventUpdateProof() {
    const id = requireEventId();
    const payload = {
      change_note: "SYNTHETIC direct-update denial proof",
    };

    const { data, error } = await supabase
      .from("support_request_status_events")
      .update(payload)
      .eq("id", id)
      .select();

    if (!error) {
      throw new Error(
        "Status-event update denial proof was inconclusive because no database error was returned."
      );
    }

    return {
      payload,
      expected: "Authenticated direct update must fail.",
      returnedData: data,
      returnedError: error,
      denialConfirmed: true,
    };
  }

  async function directStatusEventDeleteProof() {
    const id = requireEventId();
    const { data, error } = await supabase
      .from("support_request_status_events")
      .delete()
      .eq("id", id)
      .select();

    if (!error) {
      throw new Error(
        "Status-event delete denial proof was inconclusive because no database error was returned."
      );
    }

    return {
      expected: "Authenticated direct delete must fail.",
      returnedData: data,
      returnedError: error,
      denialConfirmed: true,
    };
  }

  async function deleteRequestProof() {
    const id = requireRequestId();
    const { data, error } = await supabase
      .from("support_requests")
      .delete()
      .eq("id", id)
      .select();

    if (!error) {
      throw new Error(
        "Request delete denial proof was inconclusive because no database error was returned."
      );
    }

    return {
      expected: "Support request delete must fail.",
      returnedData: data,
      returnedError: error,
      denialConfirmed: true,
    };
  }

  async function deleteEntryProof() {
    const id = requireEntryId();
    const { data, error } = await supabase
      .from("support_request_entries")
      .delete()
      .eq("id", id)
      .select();

    if (!error) {
      throw new Error(
        "Entry delete denial proof was inconclusive because no database error was returned."
      );
    }

    return {
      expected: "Support entry delete must fail.",
      returnedData: data,
      returnedError: error,
      denialConfirmed: true,
    };
  }

  async function deleteLinkProof() {
    const id = requireLinkId();
    const { data, error } = await supabase
      .from("support_request_links")
      .delete()
      .eq("id", id)
      .select();

    if (!error) {
      throw new Error(
        "Link delete denial proof was inconclusive because no database error was returned."
      );
    }

    return {
      expected: "Support link delete must fail.",
      returnedData: data,
      returnedError: error,
      denialConfirmed: true,
    };
  }

  const disabled = busy || !SUPPORT_TEST_EXECUTION_ENABLED;

  return (
    <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-6xl space-y-6">
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
            Synthetic IDs only. Never store passwords, tokens, or service-role
            credentials here.
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
            onClick={() =>
              runAction("load authenticated identity", loadIdentity)
            }
            className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Load browser identity
          </button>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Request scope</h2>
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

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              Existing Support request ID
              <input
                value={requestId}
                onChange={(event) => setRequestId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Existing status-event ID
              <input
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={disabled} onClick={() => runAction("create synthetic request", createSyntheticRequest)} className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Create request</button>
            <button type="button" disabled={disabled} onClick={() => runAction("read request", readRequest)} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Read request</button>
            <button type="button" disabled={disabled} onClick={() => runAction("withdraw request", withdrawRequest)} className="rounded-xl bg-slate-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Withdraw request</button>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Reviewer lifecycle and routing</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-bold text-slate-700">
              Routing category
              <input value={reviewerDraft.routingCategory} onChange={(event) => setReviewerDraft((current) => ({ ...current, routingCategory: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Assigned workspace-member ID
              <input value={reviewerDraft.assignedMemberId} onChange={(event) => setReviewerDraft((current) => ({ ...current, assignedMemberId: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Next status
              <select value={reviewerDraft.nextStatus} onChange={(event) => setReviewerDraft((current) => ({ ...current, nextStatus: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal">
                {["acknowledged", "in_progress", "waiting_for_participant", "completed", "archived", "submitted"].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={disabled} onClick={() => runAction("update routing category", updateRoutingCategory)} className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Update routing category</button>
            <button type="button" disabled={disabled} onClick={() => runAction("update assignment", updateAssignment)} className="rounded-xl bg-sky-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Update assignment</button>
            <button type="button" disabled={disabled} onClick={() => runAction("transition request status", transitionRequestStatus)} className="rounded-xl bg-indigo-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Transition request status</button>
          </div>
        </section>

        <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Entries</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Entry type
              <select value={entryDraft.entryType} onChange={(event) => setEntryDraft((current) => ({ ...current, entryType: event.target.value as EntryDraft["entryType"] }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal">
                <option value="participant_response">participant_response</option>
                <option value="internal_note">internal_note</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">Existing entry ID
              <input value={entryId} onChange={(event) => setEntryId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-bold text-slate-700">Entry title
              <input value={entryDraft.title} onChange={(event) => setEntryDraft((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-bold text-slate-700">Entry content
              <input value={entryDraft.content} onChange={(event) => setEntryDraft((current) => ({ ...current, content: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Entry archive reason
              <input value={entryDraft.archiveReason} onChange={(event) => setEntryDraft((current) => ({ ...current, archiveReason: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={disabled} onClick={() => runAction("read entries", readEntries)} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Read entries</button>
            <button type="button" disabled={disabled} onClick={() => runAction("create entry", createEntry)} className="rounded-xl bg-violet-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Create entry</button>
            <button type="button" disabled={disabled} onClick={() => runAction("prove entry content update fails", proveEntryContentUpdateFails)} className="rounded-xl bg-rose-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prove entry mutation fails</button>
            <button type="button" disabled={disabled} onClick={() => runAction("archive entry", archiveEntry)} className="rounded-xl bg-amber-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Archive entry</button>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Links</h2>
          <p className="mt-2 text-sm text-slate-600">Link creation remains blocked until a verified synthetic target ID exists in supportLinkedRecords.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-bold text-slate-700">Link target type
              <select value={linkDraft.targetType} onChange={(event) => setLinkDraft((current) => ({ ...current, targetType: event.target.value as LinkTargetType }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal">
                <option value="goal">goal</option>
                <option value="wellness_checkin">wellness_checkin</option>
                <option value="budget_category">budget_category</option>
                <option value="budget_period">budget_period</option>
                <option value="staged_transaction">staged_transaction</option>
                <option value="prior_support_request">prior_support_request</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">Existing link ID
              <input value={linkId} onChange={(event) => setLinkId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-bold text-slate-700">Link archive reason
              <input value={linkDraft.archiveReason} onChange={(event) => setLinkDraft((current) => ({ ...current, archiveReason: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={disabled} onClick={() => runAction("read links", readLinks)} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Read links</button>
            <button type="button" disabled={disabled} onClick={() => runAction("create link", createLink)} className="rounded-xl bg-cyan-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Create configured link</button>
            <button
  type="button"
  disabled={disabled}
  onClick={() =>
    runAction(
      "prove link target update fails",
      proveLinkTargetUpdateFails
    )
  }
  className="rounded-xl bg-rose-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
>
  Prove link mutation fails
</button>
            <button type="button" disabled={disabled} onClick={() => runAction("archive link", archiveLink)} className="rounded-xl bg-amber-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Archive link</button>
          </div>
        </section>

        <section className="rounded-3xl border border-fuchsia-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Status-event audit proofs</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={disabled} onClick={() => runAction("read status events", readEvents)} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Read status events</button>
            <button type="button" disabled={disabled} onClick={() => runAction("direct status-event insert denial proof", directStatusEventInsertProof)} className="rounded-xl bg-rose-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prove event insert fails</button>
            <button type="button" disabled={disabled} onClick={() => runAction("direct status-event update denial proof", directStatusEventUpdateProof)} className="rounded-xl bg-rose-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prove event update fails</button>
            <button type="button" disabled={disabled} onClick={() => runAction("direct status-event delete denial proof", directStatusEventDeleteProof)} className="rounded-xl bg-rose-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prove event delete fails</button>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">No-delete proofs</h2>
          <p className="mt-2 text-sm text-slate-600">Every action below is expected to fail. No hard delete is an approved cleanup path.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={disabled} onClick={() => runAction("prove request delete fails", deleteRequestProof)} className="rounded-xl bg-rose-800 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prove request delete fails</button>
            <button type="button" disabled={disabled} onClick={() => runAction("prove entry delete fails", deleteEntryProof)} className="rounded-xl bg-rose-800 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prove entry delete fails</button>
            <button type="button" disabled={disabled} onClick={() => runAction("prove link delete fails", deleteLinkProof)} className="rounded-xl bg-rose-800 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Prove link delete fails</button>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Single-action result</h2>
          <p className="mt-2 text-sm text-slate-600">The harness intentionally has no run-all button, loops, cleanup automation, account creation, or service-role path.</p>
          <div className="mt-4">
            <JsonBlock value={result ?? { status: "No action run." }} />
          </div>
        </section>
      </section>
    </main>
  );
}
