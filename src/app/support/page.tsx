"use client";

import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  ContactPreference,
  ParticipantSupportCategory,
  ParticipantSupportRequest,
  ParticipantSupportResponse,
  ParticipantSupportStatusEvent,
  SupportRequestDraft,
  SupportRequestStatus,
  useParticipantSupport,
} from "./useParticipantSupport";

const supportAreas: Array<{
  value: ParticipantSupportCategory;
  title: string;
  description: string;
}> = [
  {
    value: "budget_money",
    title: "Budget help",
    description: "Review a plan, understand a category, or prepare a question.",
  },
  {
    value: "transaction_understanding",
    title: "Transaction understanding",
    description: "Ask for help reviewing an imported financial observation.",
  },
  {
    value: "wellness_support",
    title: "Wellness support",
    description: "Ask for help with routines, stress, sleep, or daily stability.",
  },
  {
    value: "goal_support",
    title: "Goal support",
    description: "Talk through a barrier, next step, or support preference.",
  },
  {
    value: "program_question",
    title: "Program question",
    description: "Ask about your current THRIVE participation or supports.",
  },
  {
    value: "other",
    title: "General support",
    description: "Ask a plain-language question when you are not sure where it fits.",
  },
];

const contactOptions: Array<{
  value: ContactPreference;
  label: string;
}> = [
  { value: "in_app", label: "In THRIVE" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text message" },
  { value: "email", label: "Email" },
  { value: "no_preference", label: "No preference" },
];

const emptyDraft: SupportRequestDraft = {
  participantCategory: "other",
  participantMessage: "",
  requestedSupport: "",
  contactPreference: "in_app",
};

function labelStatus(status: SupportRequestStatus) {
  const labels: Record<SupportRequestStatus, string> = {
    submitted: "Received",
    acknowledged: "Acknowledged",
    in_progress: "In review",
    waiting_for_participant: "Waiting for you",
    completed: "Resolved",
    withdrawn: "Withdrawn",
    archived: "Archived",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function labelCategory(category: ParticipantSupportCategory) {
  return (
    supportAreas.find((area) => area.value === category)?.title ??
    category.replaceAll("_", " ")
  );
}

function labelContact(value: ContactPreference | null) {
  if (!value) return "Not specified";

  return (
    contactOptions.find((option) => option.value === value)?.label ??
    value.replaceAll("_", " ")
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function SupportRequestCard({
  request,
  statusEvents,
  participantResponses,
  working,
  onWithdraw,
}: {
  request: ParticipantSupportRequest;
  statusEvents: ParticipantSupportStatusEvent[];
  participantResponses: ParticipantSupportResponse[];
  working: boolean;
  onWithdraw: (
    request: ParticipantSupportRequest,
  ) => Promise<{ ok: boolean; message: string }>;
}) {
  const requestStatusEvents = statusEvents.filter(
    (event) => event.support_request_id === request.id,
  );

  const requestParticipantResponses = participantResponses.filter(
  (response) => response.support_request_id === request.id,
);

const [withdrawNotice, setWithdrawNotice] = useState("");

async function handleWithdraw() {
  setWithdrawNotice("");

  const confirmed = window.confirm(
    "Withdraw this Support request? This request will move to your request history.",
  );

  if (!confirmed) return;

  const result = await onWithdraw(request);
  setWithdrawNotice(result.message);
}

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            {labelCategory(request.participant_category)}
          </p>
          <h3 className="mt-2 text-xl font-black">
            {request.participant_message}
          </h3>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
          {labelStatus(request.status)}
        </span>
      </div>

      {request.requested_support ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-black">What would be useful</p>
          <p className="mt-2 leading-7 text-slate-700">
            {request.requested_support}
          </p>
        </div>
      ) : null}

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-black text-slate-500">Follow-up preference</dt>
          <dd className="mt-1 font-semibold text-slate-800">
            {labelContact(request.contact_preference)}
          </dd>
        </div>

        <div>
          <dt className="font-black text-slate-500">Requested</dt>
          <dd className="mt-1 font-semibold text-slate-800">
            {formatDate(request.created_at)}
          </dd>
        </div>
      </dl>
            {requestStatusEvents.length > 0 ? (
        <section className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-sm font-black text-slate-800">
            Request progress
          </p>

          <div className="mt-4 space-y-3">
            {requestStatusEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    {event.to_status
                      ? labelStatus(event.to_status)
                      : "Status updated"}
                  </p>

                  {event.change_note ? (
                    <p className="mt-1 text-slate-600">
                      {event.change_note}
                    </p>
                  ) : null}
                </div>

                <p className="shrink-0 text-xs font-semibold text-slate-500">
                  {formatDate(event.changed_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
            {requestParticipantResponses.length > 0 ? (
  <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-5">
    <p className="text-sm font-black text-slate-800">
      Support response
    </p>

    <div className="mt-4 space-y-4">
      {requestParticipantResponses.map((response) => (
        <div key={response.id}>
          {response.title ? (
            <p className="font-bold text-slate-800">
              {response.title}
            </p>
          ) : null}

          <p className="mt-1 text-sm leading-6 text-slate-700">
            {response.content}
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            {formatDate(response.created_at)}
          </p>
        </div>
      ))}
    </div>
  </section>
) : null}
{request.status === "submitted" ? (
        <div className="mt-5">
          <button
            type="button"
            disabled={working}
            onClick={handleWithdraw}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working ? "Withdrawing..." : "Withdraw request"}
          </button>

          {withdrawNotice ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-3 text-sm font-semibold text-slate-600"
            >
              {withdrawNotice}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function SupportPage() {
const {
  participantName,
  requests,
  statusEvents,
  participantResponses,
  loading,
  working,
  errorMessage,
  canCreate,
  createRequest,
  withdrawRequest,
} = useParticipantSupport();

  const [draft, setDraft] = useState<SupportRequestDraft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const activeRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status !== "completed" &&
          request.status !== "withdrawn" &&
          request.status !== "archived",
      ),
    [requests],
  );

  const historicalRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "completed" ||
          request.status === "withdrawn" ||
          request.status === "archived",
      ),
    [requests],
  );

  const shouldShowCreate =
    showCreate ||
    (!loading && !errorMessage && canCreate && requests.length === 0);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const result = await createRequest(draft);
    setNotice(result.message);

    if (!result.ok) {
      return;
    }

    setDraft(emptyDraft);
    setShowCreate(false);
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Support
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Know where to ask. Keep the request clear.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Ask for help in your own words and keep the status of each
                request visible.
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Support requests.
              </section>
            ) : null}

            {errorMessage ? (
              <section
                role="alert"
                className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950"
              >
                <p className="font-black">
                  Your Support requests could not be loaded.
                </p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage && !canCreate ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Support status
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  No active participant program is connected yet
                </h2>
                <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                  Support requests become available when your account is
                  connected to an active THRIVE program.
                </p>
              </section>
            ) : null}

            {!loading && !errorMessage && canCreate ? (
              <>
                <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                    Your Support
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Welcome, {participantName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Your requests stay connected to your THRIVE participation.
                    A request asks for support. It does not create new authority
                    or consent.
                  </p>
                </section>

                <section className="space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Current requests
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      See what happens next
                    </h2>
                  </div>

                  {activeRequests.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <p className="font-black">No open Support requests</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        When you want help with something, you can create a
                        request below.
                      </p>
                    </div>
                  ) : (
                 activeRequests.map((request) => (
  <SupportRequestCard
    key={request.id}
    request={request}
    statusEvents={statusEvents}
    participantResponses={participantResponses}
    working={working}
    onWithdraw={withdrawRequest}
  />
))
)}
                </section>

                {shouldShowCreate ? (
                  <form
                    id="support-request-create"
                    onSubmit={handleCreate}
                    className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Ask for support
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      What would be helpful?
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      Choose the closest category and describe the request in
                      your own words.
                    </p>

                    <div className="mt-6 grid gap-6">
                      <label className="text-sm font-black">
                        Help category
                        <select
                          value={draft.participantCategory}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              participantCategory: event.target
                                .value as ParticipantSupportCategory,
                            }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                        >
                          {supportAreas.map((area) => (
                            <option key={area.value} value={area.value}>
                              {area.title}
                            </option>
                          ))}
                        </select>
                      </label>

                      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {supportAreas.map((area) => (
                          <div
                            key={area.value}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                          >
                            <p className="font-black">{area.title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {area.description}
                            </p>
                          </div>
                        ))}
                      </section>

                      <label className="text-sm font-black">
                        What do you need help with?
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Write the request in your own words.
                        </span>
                        <textarea
                          value={draft.participantMessage}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              participantMessage: event.target.value,
                            }))
                          }
                          maxLength={4000}
                          rows={5}
                          required
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                        />
                        <span className="mt-1 block text-right text-xs font-normal text-slate-400">
                          {draft.participantMessage.length}/4000
                        </span>
                      </label>

                      <label className="text-sm font-black">
                        What would be useful?
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Optional. Describe the kind of support you would find
                          helpful.
                        </span>
                        <textarea
                          value={draft.requestedSupport}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              requestedSupport: event.target.value,
                            }))
                          }
                          maxLength={2000}
                          rows={4}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                        />
                        <span className="mt-1 block text-right text-xs font-normal text-slate-400">
                          {draft.requestedSupport.length}/2000
                        </span>
                      </label>

                      <label className="text-sm font-black">
                        How would you prefer someone to follow up?
                        <select
                          value={draft.contactPreference}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              contactPreference: event.target
                                .value as ContactPreference,
                            }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                        >
                          {contactOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <section
                        aria-label="Review your Support request"
                        className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"
                      >
                        <p className="text-sm font-black text-emerald-900">
                          Review before sending
                        </p>

                        <dl className="mt-4 grid gap-4 text-sm">
                          <div>
                            <dt className="font-black">Category</dt>
                            <dd className="mt-1 text-slate-700">
                              {labelCategory(draft.participantCategory)}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-black">Your request</dt>
                            <dd className="mt-1 whitespace-pre-wrap text-slate-700">
                              {draft.participantMessage.trim() ||
                                "Not added yet"}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-black">What would be useful</dt>
                            <dd className="mt-1 whitespace-pre-wrap text-slate-700">
                              {draft.requestedSupport.trim() || "Not added"}
                            </dd>
                          </div>

                          <div>
                            <dt className="font-black">Follow-up preference</dt>
                            <dd className="mt-1 text-slate-700">
                              {labelContact(draft.contactPreference)}
                            </dd>
                          </div>
                        </dl>
                      </section>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={working}
                        className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-60"
                      >
                        {working ? "Sending..." : "Send Support request"}
                      </button>

                      {requests.length > 0 ? (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => {
                            setDraft(emptyDraft);
                            setNotice("");
                            setShowCreate(false);
                          }}
                          className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>

                    {notice ? (
                      <p
                        role={notice.includes("sent") ? "status" : "alert"}
                        aria-live="polite"
                        className="mt-4 text-sm font-semibold text-slate-700"
                      >
                        {notice}
                      </p>
                    ) : null}
                  </form>
                ) : null}

                {requests.length > 0 && !shouldShowCreate ? (
                  <button
                    type="button"
                    aria-expanded={showCreate}
                    aria-controls="support-request-create"
                    onClick={() => {
                      setNotice("");
                      setShowCreate(true);
                    }}
                    className="w-full rounded-3xl border border-emerald-200 bg-white p-5 text-left font-black text-emerald-800 shadow-sm"
                  >
                    Ask for support
                  </button>
                ) : null}

                {historicalRequests.length > 0 ? (
                  <section className="space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Request history
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        Previous requests
                      </h2>
                    </div>

                    {historicalRequests.map((request) => (
                    <SupportRequestCard
  key={request.id}
  request={request}
  statusEvents={statusEvents}
  participantResponses={participantResponses}
  working={working}
  onWithdraw={withdrawRequest}
/>
                    ))}
                  </section>
                ) : null}
              </>
            ) : null}

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="font-black text-emerald-300">
                Support-request boundary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                A Support request does not create consent for external sharing,
                expanded system access, clinical intervention, emergency
                escalation, or Trust Engine action. Those require separately
                approved authority and workflows.
              </p>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <p className="font-black text-amber-950">
                Support is not an emergency service
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                This page is for ordinary THRIVE Support requests. It does not
                provide emergency response or make clinical decisions.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
