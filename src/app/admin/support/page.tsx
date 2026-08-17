"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../useAdminAccess";

type SupportRequestRow = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  participant_category: string;
  participant_message: string;
  requested_support: string | null;
  contact_preference: string | null;
  status: string;
  created_at: string;
};

type ParticipantResponseDraft = {
  title: string;
  content: string;
};

const supportRequestSelect =
  "id, workspace_id, program_id, supported_person_id, participant_category, participant_message, requested_support, contact_preference, status, created_at";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function labelStatus(value: string) {
  return value.replaceAll("_", " ");
}

function canRespondToRequest(status: string) {
  return [
    "submitted",
    "acknowledged",
    "in_progress",
    "waiting_for_participant",
  ].includes(status);
}

export default function AdminSupportPage() {
  const {
    state,
    membership,
    errorMessage: accessErrorMessage,
    canAccessAdmin,
  } = useAdminAccess();

  const [requests, setRequests] = useState<SupportRequestRow[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestErrorMessage, setRequestErrorMessage] = useState("");
  const [responseDrafts, setResponseDrafts] = useState<
  Record<string, ParticipantResponseDraft>
>({});
const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);
const [responseNotice, setResponseNotice] = useState<Record<string, string>>(
  {},
);
  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      if (!canAccessAdmin || !membership) {
        if (mounted) {
          setRequests([]);
          setLoadingRequests(false);
        }
        return;
      }

      setLoadingRequests(true);
      setRequestErrorMessage("");

      const { data, error } = await supabase
        .from("support_requests")
        .select(supportRequestSelect)
        .eq("workspace_id", membership.workspace_id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setRequestErrorMessage(error.message);
        setLoadingRequests(false);
        return;
      }

      setRequests((data as SupportRequestRow[] | null) ?? []);
      setLoadingRequests(false);
    }

    loadRequests();

    return () => {
      mounted = false;
    };
  }, [canAccessAdmin, membership]);

  async function sendParticipantResponse(request: SupportRequestRow) {
  const draft = responseDrafts[request.id];

  if (!draft?.content.trim()) {
    setResponseNotice((current) => ({
      ...current,
      [request.id]: "Write a response before sending.",
    }));
    return;
  }

  if (!canRespondToRequest(request.status)) {
    setResponseNotice((current) => ({
      ...current,
      [request.id]:
        "This Support request is no longer open for a participant-visible response.",
    }));
    return;
  }

  setSendingRequestId(request.id);

  setResponseNotice((current) => ({
    ...current,
    [request.id]: "",
  }));

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setSendingRequestId(null);

    setResponseNotice((current) => ({
      ...current,
      [request.id]: "Your reviewer session could not be verified.",
    }));

    return;
  }

  const { error } = await supabase
    .from("support_request_entries")
    .insert({
      workspace_id: request.workspace_id,
      program_id: request.program_id,
      supported_person_id: request.supported_person_id,
      support_request_id: request.id,
      entry_type: "participant_response",
      title: draft.title.trim() || null,
      content: draft.content.trim(),
      created_by: user.id,
    });

  setSendingRequestId(null);

  if (error) {
    setResponseNotice((current) => ({
      ...current,
      [request.id]:
        error.message || "The participant-visible response could not be sent.",
    }));

    return;
  }

  setResponseDrafts((current) => ({
    ...current,
    [request.id]: {
      title: "",
      content: "",
    },
  }));

  setResponseNotice((current) => ({
    ...current,
    [request.id]: "Participant-visible response sent.",
  }));
}

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">
              Checking Support review access
            </h1>
          </div>
        </section>
      </main>
    );
  }

  if (state === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">
              THRIVE Review access required
            </h1>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
            >
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">
              THRIVE Review could not load
            </h1>

            <p className="mt-3 text-slate-600">
              {accessErrorMessage || "The access check could not be completed."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!canAccessAdmin || state === "denied") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">
              Reviewer access not available
            </h1>

            <p className="mt-3 text-slate-600">
              This account does not have an active THRIVE reviewer or admin
              workspace membership.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-700">
              THRIVE Review
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Support queue
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Review participant Support requests visible to your authorized
              workspace role.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700"
          >
            Back to Review Home
          </Link>
        </div>

        {loadingRequests ? (
          <div className="mt-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="font-semibold text-slate-600">
              Loading Support requests...
            </p>
          </div>
        ) : null}

        {requestErrorMessage ? (
          <div className="mt-6 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
            <p className="font-bold text-rose-700">
              Support requests could not be loaded
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {requestErrorMessage}
            </p>
          </div>
        ) : null}

        {!loadingRequests &&
        !requestErrorMessage &&
        requests.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">
              No Support requests
            </h2>

            <p className="mt-2 text-slate-600">
              There are no Support requests currently visible to this reviewer.
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {request.participant_category.replaceAll("_", " ")}
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    Participant Support request
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black capitalize text-emerald-900">
                  {labelStatus(request.status)}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Participant message
                </p>

                <p className="mt-2 leading-7 text-slate-800">
                  {request.participant_message}
                </p>
              </div>

              {request.requested_support ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    What would be useful
                  </p>

                  <p className="mt-2 leading-7 text-slate-800">
                    {request.requested_support}
                  </p>
                </div>
              ) : null}

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-bold text-slate-500">
                    Follow-up preference
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-800">
                    {request.contact_preference
                      ? request.contact_preference.replaceAll("_", " ")
                      : "Not specified"}
                  </dd>
                </div>

                <div>
                  <dt className="font-bold text-slate-500">
                    Requested
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-800">
                    {formatDate(request.created_at)}
                  </dd>
                </div>
              </dl>
              {canRespondToRequest(request.status) ? (
  <section className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
    <p className="text-sm font-black text-slate-800">
      Participant-visible response
    </p>

    <p className="mt-1 text-sm leading-6 text-slate-600">
      This response will be visible to the participant in THRIVE Support.
    </p>
    <input
  type="text"
  value={responseDrafts[request.id]?.title ?? ""}
  onChange={(event) =>
    setResponseDrafts((current) => ({
      ...current,
      [request.id]: {
        title: event.target.value,
        content: current[request.id]?.content ?? "",
      },
    }))
  }
  placeholder="Response title"
  maxLength={120}
  className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
/>

<textarea
  value={responseDrafts[request.id]?.content ?? ""}
  onChange={(event) =>
    setResponseDrafts((current) => ({
      ...current,
      [request.id]: {
        title: current[request.id]?.title ?? "",
        content: event.target.value,
      },
    }))
  }
  placeholder="Write the response the participant will see"
  maxLength={4000}
  rows={5}
  className="mt-3 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-emerald-500"
/>
<div className="mt-4 flex flex-wrap items-center gap-3">
  <button
    type="button"
    disabled={
      sendingRequestId === request.id ||
      !responseDrafts[request.id]?.content.trim()
    }
    onClick={() => sendParticipantResponse(request)}
    className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
  >
    {sendingRequestId === request.id
      ? "Sending..."
      : "Send participant-visible response"}
  </button>

  {responseNotice[request.id] ? (
    <p
      role="status"
      aria-live="polite"
      className="text-sm font-semibold text-slate-600"
    >
      {responseNotice[request.id]}
    </p>
  ) : null}
</div>


  </section>
) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}