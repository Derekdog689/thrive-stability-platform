"use client";

import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  ContactPreference,
  ParticipantSupportCategory,
  ParticipantReplyResult,
  ParticipantSupportReply,
  ParticipantSupportRequest,
  ParticipantSupportResponse,
  ParticipantSupportStatusEvent,
  SupportRequestDraft,
  SupportRequestStatus,
  useParticipantSupport,
} from "./useParticipantSupport";

type GuidanceChoice = {
  label: string;
  help: string;
};

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
    title: "General support / I’m not sure",
    description:
      "Start here when you know you need help but are not sure where it fits.",
  },
];

const guidanceChoices: Record<ParticipantSupportCategory, GuidanceChoice[]> = {
  budget_money: [
    {
      label: "I want to understand part of my Budget",
      help: "Use this if a category, amount, or part of your plan is confusing.",
    },
    {
      label: "Something changed and my Budget no longer fits",
      help: "Use this when income, expenses, or priorities changed.",
    },
    {
      label: "I am having trouble with one Budget area",
      help: "Use this when one part of the plan is harder to manage than expected.",
    },
    {
      label: "I want help deciding my next Budget step",
      help: "Use this when you understand the issue but are not sure what to do next.",
    },
    {
      label: "I’m not sure",
      help: "That is okay. You can explain what is happening in your own words next.",
    },
  ],
  transaction_understanding: [
    {
      label: "I do not recognize a transaction",
      help: "Use this when you are unsure what a transaction is.",
    },
    {
      label: "I recognize it but want help explaining it",
      help: "Use this when you know what happened but want help adding context.",
    },
    {
      label: "I want to understand how it affects my Budget",
      help: "Use this when the transaction is clear but its Budget impact is not.",
    },
    {
      label: "I think something may be categorized incorrectly",
      help: "Use this when the transaction seems to be in the wrong category.",
    },
    {
      label: "I’m not sure",
      help: "That is okay. Describe what you see and what is confusing.",
    },
  ],
  wellness_support: [
    {
      label: "I want help thinking through a routine",
      help: "Use this for sleep, daily structure, stress, or another routine.",
    },
    {
      label: "Something has changed and I want support",
      help: "Use this when something feels different and you want help thinking it through.",
    },
    {
      label: "I want help choosing a small next step",
      help: "Use this when you know what area matters but want help making it manageable.",
    },
    {
      label: "I want to talk through what has been helping",
      help: "Use this to review what has been useful and what you may want to continue.",
    },
    {
      label: "I’m not sure",
      help: "That is okay. You can describe what has been going on without choosing a label.",
    },
  ],
  goal_support: [
    {
      label: "I do not know my next step",
      help: "Use this when the Goal is clear but the next action is not.",
    },
    {
      label: "Something is getting in the way",
      help: "Use this when a barrier is making the Goal harder to move forward.",
    },
    {
      label: "I want to break the Goal into smaller steps",
      help: "Use this when the Goal feels too large or hard to organize.",
    },
    {
      label: "My situation changed and I want to review the Goal",
      help: "Use this when the Goal may need to be adjusted.",
    },
    {
      label: "I’m not sure",
      help: "That is okay. Start by telling Support what you are trying to accomplish.",
    },
  ],
  program_question: [
    {
      label: "I have a question about my THRIVE participation",
      help: "Use this for questions about your current participation.",
    },
    {
      label: "I am unsure what a program step means",
      help: "Use this when a process, expectation, or next step is unclear.",
    },
    {
      label: "I want to understand what support is available",
      help: "Use this when you want to know what help you can ask for.",
    },
    {
      label: "Something changed and I need clarification",
      help: "Use this when your situation or program understanding changed.",
    },
    {
      label: "I’m not sure",
      help: "That is okay. Tell Support what you are trying to understand.",
    },
  ],
  other: [
    {
      label: "I have a question",
      help: "Use this when you know what you want to ask.",
    },
    {
      label: "Something changed",
      help: "Use this when a new situation is what brought you here.",
    },
    {
      label: "I need help figuring out what to do next",
      help: "Use this when you know there is a problem but not the next step.",
    },
    {
      label: "I need clarification",
      help: "Use this when something does not make sense yet.",
    },
    {
      label: "I know I need help, but I’m not sure what kind",
      help: "That is enough to start. Explain what is happening next.",
    },
  ],
};

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

function statusGuidance(status: SupportRequestStatus) {
  const guidance: Record<
    SupportRequestStatus,
    { title: string; body: string }
  > = {
    submitted: {
      title: "Support has received your request",
      body:
        "You do not need to do anything right now. Support aims to acknowledge new requests within 1 hour.",
    },
    acknowledged: {
      title: "Your request has been acknowledged",
      body:
        "Support has seen your request. A meaningful response or update is expected within 24 hours of your request. Some requests may take longer to fully resolve.",
    },
    in_progress: {
      title: "Support is reviewing your request",
      body:
        "No action is needed from you unless Support asks for more information. You will see updates here.",
    },
    waiting_for_participant: {
      title: "Support needs a response from you",
      body:
        "Read the latest Support message below, then reply with the information requested. Your reply will not automatically close or change the request.",
    },
    completed: {
      title: "This request is resolved",
      body:
        "This request is complete and cannot be reopened. If you need help with something else, start a new Support request.",
    },
    withdrawn: {
      title: "This request was withdrawn",
      body:
        "The request is closed and remains in your history. Start a new Support request if you need help later.",
    },
    archived: {
      title: "This request is in history",
      body:
        "This request remains preserved as part of your Support history.",
    },
  };

  return guidance[status];
}

function SupportRequestCard({
  request,
  statusEvents,
  participantResponses,
  participantReplies,
  working,
  onWithdraw,
  onSubmitReply,
}: {
  request: ParticipantSupportRequest;
  statusEvents: ParticipantSupportStatusEvent[];
  participantResponses: ParticipantSupportResponse[];
  participantReplies: ParticipantSupportReply[];
  working: boolean;
  onWithdraw: (
    request: ParticipantSupportRequest,
  ) => Promise<{ ok: boolean; message: string }>;
  onSubmitReply: (
    request: ParticipantSupportRequest,
    content: string,
  ) => Promise<ParticipantReplyResult>;
}) {
  const requestStatusEvents = statusEvents.filter(
    (event) => event.support_request_id === request.id,
  );

  const requestParticipantResponses = participantResponses.filter(
    (response) => response.support_request_id === request.id,
  );

  const requestParticipantReplies = participantReplies.filter(
    (reply) => reply.support_request_id === request.id,
  );

  const [withdrawNotice, setWithdrawNotice] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyNotice, setReplyNotice] = useState("");

  const guidance = statusGuidance(request.status);

  async function handleWithdraw() {
    setWithdrawNotice("");

    const confirmed = window.confirm(
      "Withdraw this Support request? This request will move to your request history.",
    );

    if (!confirmed) return;

    const result = await onWithdraw(request);
    setWithdrawNotice(result.message);
  }

  async function handleReply() {
    setReplyNotice("");

    const result = await onSubmitReply(request, replyDraft);
    setReplyNotice(result.message);

    if (result.ok) {
      setReplyDraft("");
    }
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

      <section
        className={`mt-5 rounded-2xl border p-5 ${
          request.status === "waiting_for_participant"
            ? "border-amber-200 bg-amber-50"
            : request.status === "completed"
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-100 bg-slate-50"
        }`}
      >
        <p className="font-black text-slate-900">{guidance.title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {guidance.body}
        </p>
      </section>

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
          <p className="text-sm font-black text-slate-800">Request progress</p>

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
                    <p className="mt-1 text-slate-600">{event.change_note}</p>
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
          <p className="text-sm font-black text-slate-800">Support response</p>

          <div className="mt-4 space-y-4">
            {requestParticipantResponses.map((response) => (
              <div key={response.id}>
                {response.title ? (
                  <p className="font-bold text-slate-800">{response.title}</p>
                ) : null}

                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
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

      {requestParticipantReplies.length > 0 ? (
        <section className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-black text-emerald-900">Your response</p>

          <div className="mt-4 space-y-4">
            {requestParticipantReplies.map((reply) => (
              <div key={reply.id}>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {reply.content}
                </p>

                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {formatDate(reply.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {request.status === "waiting_for_participant" ? (
        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-black text-amber-950">
            Your response is needed
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Review the latest Support response above, then send the information
            Support requested.
          </p>

          <label className="mt-4 block text-sm font-black text-slate-800">
            Your response
            <textarea
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              maxLength={4000}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 font-normal"
              placeholder="Write the information Support requested."
            />
          </label>

          <div className="mt-1 text-right text-xs font-semibold text-slate-500">
            {replyDraft.length}/4000
          </div>

          <button
            type="button"
            disabled={working || !replyDraft.trim()}
            onClick={handleReply}
            className="mt-4 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working ? "Sending..." : "Send response to Support"}
          </button>

          {replyNotice ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-3 text-sm font-semibold text-slate-700"
            >
              {replyNotice}
            </p>
          ) : null}
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
    participantReplies,
    loading,
    working,
    errorMessage,
    canCreate,
    createRequest,
    withdrawRequest,
    submitParticipantReply,
  } = useParticipantSupport();

  const [draft, setDraft] = useState<SupportRequestDraft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [guidanceChoice, setGuidanceChoice] = useState("");

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

  const selectedGuidance = guidanceChoices[draft.participantCategory].find(
    (choice) => choice.label === guidanceChoice,
  );

  function resetCreateFlow() {
    setDraft(emptyDraft);
    setNotice("");
    setGuidanceChoice("");
    setCreateStep(1);
  }

  function cancelCreateFlow() {
  const confirmed = window.confirm(
    "Cancel this Support request? Your current draft will be cleared.",
  );

  if (!confirmed) return;

  resetCreateFlow();
  setShowSubmitConfirmation(false);
  setShowCreate(false);
}

  function chooseCategory(category: ParticipantSupportCategory) {
    setDraft((current) => ({
      ...current,
      participantCategory: category,
      requestedSupport: "",
    }));
    setGuidanceChoice("");
    setCreateStep(2);
  }

  function chooseGuidance(choice: GuidanceChoice) {
    setGuidanceChoice(choice.label);

    setDraft((current) => ({
      ...current,
      requestedSupport:
        current.requestedSupport.trim().length > 0
          ? current.requestedSupport
          : choice.label === "I’m not sure" ||
              choice.label === "I know I need help, but I’m not sure what kind"
            ? ""
            : choice.label,
    }));

    setCreateStep(3);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setShowSubmitConfirmation(false);

    const result = await createRequest(draft);
    setNotice(result.message);

    if (!result.ok) {
      return;
    }

    resetCreateFlow();
    setShowCreate(false);
    setShowSubmitConfirmation(true);
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
                Ask for help and see what happens next.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                You do not need to know exactly what to ask for before you
                start. THRIVE can help you narrow it down one step at a time.
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
                  Support is not connected yet
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
                    Use Support when you have a question, need help thinking
                    through a next step, or are not sure where to start.
                  </p>
                </section>

                {showSubmitConfirmation ? (
                  <section
                    role="status"
                    aria-live="polite"
                    className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Request sent
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Your request is now with Support.
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                      Support aims to acknowledge new requests within 1 hour and
                      provide a meaningful response or update within 24 hours.
                      Some requests may take longer to fully resolve.
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      You can follow the request below. If Support needs
                      something from you, THRIVE will show what is needed and
                      give you a place to respond.
                    </p>
                  </section>
                ) : null}

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
                        participantReplies={participantReplies}
                        working={working}
                        onWithdraw={withdrawRequest}
                        onSubmitReply={submitParticipantReply}
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
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                          Ask for support
                        </p>
                        <h2 className="mt-2 text-2xl font-black">
                          We’ll take this one step at a time.
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                          You can go back, change an answer, or choose “I’m not
                          sure.” Your own words are always welcome.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
    Step {createStep} of 6
  </span>

  <button
    type="button"
    onClick={cancelCreateFlow}
    className="text-sm font-black text-slate-600 hover:text-slate-900"
  >
    Cancel
  </button>
</div>
                    </div>

                    {createStep === 1 ? (
                      <section className="mt-6">
                        <p className="text-lg font-black">
                          What area feels closest to what you need help with?
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Pick the closest match. If none feel right, choose
                          General support / I’m not sure.
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {supportAreas.map((area) => (
                            <button
                              key={area.value}
                              type="button"
                              onClick={() => chooseCategory(area.value)}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                            >
                              <span className="font-black text-slate-900">
                                {area.title}
                              </span>
                              <span className="mt-2 block text-sm leading-6 text-slate-600">
                                {area.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {createStep === 2 ? (
                      <section className="mt-6">
                        <button
                          type="button"
                          onClick={() => setCreateStep(1)}
                          className="text-sm font-black text-emerald-800"
                        >
                          ← Back to support areas
                        </button>

                        <p className="mt-4 text-lg font-black">
                          Which of these sounds closest?
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          This helps Support understand the direction of your
                          request. It does not decide anything for you.
                        </p>

                        <div className="mt-5 grid gap-3">
                          {guidanceChoices[draft.participantCategory].map(
                            (choice) => (
                              <button
                                key={choice.label}
                                type="button"
                                onClick={() => chooseGuidance(choice)}
                                className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                              >
                                <span className="font-black text-slate-900">
                                  {choice.label}
                                </span>
                                <span className="mt-1 block text-sm leading-6 text-slate-600">
                                  {choice.help}
                                </span>
                              </button>
                            ),
                          )}
                        </div>
                      </section>
                    ) : null}

                    {createStep === 3 ? (
                      <section className="mt-6">
                        <button
                          type="button"
                          onClick={() => setCreateStep(2)}
                          className="text-sm font-black text-emerald-800"
                        >
                          ← Back
                        </button>

                        <p className="mt-4 text-lg font-black">
                          Tell us what is happening.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          You do not need special words. Explain it the way you
                          would explain it to a person trying to help.
                        </p>

                        {selectedGuidance ? (
                          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                            <span className="font-black">You chose:</span>{" "}
                            {selectedGuidance.label}
                          </div>
                        ) : null}

                        <textarea
                          value={draft.participantMessage}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              participantMessage: event.target.value,
                            }))
                          }
                          maxLength={4000}
                          rows={6}
                          autoFocus
                          className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                          placeholder="What happened, what is confusing, or what are you trying to figure out?"
                        />

                        <div className="mt-1 text-right text-xs font-semibold text-slate-400">
                          {draft.participantMessage.length}/4000
                        </div>

                        <button
                          type="button"
                          disabled={!draft.participantMessage.trim()}
                          onClick={() => setCreateStep(4)}
                          className="mt-4 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Continue
                        </button>
                      </section>
                    ) : null}

                    {createStep === 4 ? (
                      <section className="mt-6">
                        <button
                          type="button"
                          onClick={() => setCreateStep(3)}
                          className="text-sm font-black text-emerald-800"
                        >
                          ← Back
                        </button>

                        <p className="mt-4 text-lg font-black">
                          What would be helpful right now?
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          You can keep the suggested direction, change it, or
                          write something completely different.
                        </p>

                        <textarea
                          value={draft.requestedSupport}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              requestedSupport: event.target.value,
                            }))
                          }
                          maxLength={2000}
                          rows={5}
                          className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                          placeholder="For example: help me understand this, help me think through my options, or help me decide a next step."
                        />

                        <div className="mt-1 text-right text-xs font-semibold text-slate-400">
                          {draft.requestedSupport.length}/2000
                        </div>

                        <button
                          type="button"
                          onClick={() => setCreateStep(5)}
                          className="mt-4 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white"
                        >
                          Continue
                        </button>
                      </section>
                    ) : null}

                    {createStep === 5 ? (
                      <section className="mt-6">
                        <button
                          type="button"
                          onClick={() => setCreateStep(4)}
                          className="text-sm font-black text-emerald-800"
                        >
                          ← Back
                        </button>

                        <p className="mt-4 text-lg font-black">
                          How would you prefer Support to follow up?
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {contactOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setDraft((current) => ({
                                  ...current,
                                  contactPreference: option.value,
                                }));
                                setCreateStep(6);
                              }}
                              className={`rounded-2xl border p-4 text-left font-bold transition ${
                                draft.contactPreference === option.value
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-emerald-300"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {createStep === 6 ? (
                      <section className="mt-6">
                        <button
                          type="button"
                          onClick={() => setCreateStep(5)}
                          className="text-sm font-black text-emerald-800"
                        >
                          ← Back
                        </button>

                        <p className="mt-4 text-lg font-black">
                          Review your request before sending.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Make sure this sounds like what you want Support to
                          understand. You can go back and change anything.
                        </p>

                        <section
                          aria-label="Review your Support request"
                          className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"
                        >
                          <dl className="grid gap-4 text-sm">
                            <div>
                              <dt className="font-black">Support area</dt>
                              <dd className="mt-1 text-slate-700">
                                {labelCategory(draft.participantCategory)}
                              </dd>
                            </div>

                            <div>
                              <dt className="font-black">
                                What sounded closest
                              </dt>
                              <dd className="mt-1 text-slate-700">
                                {guidanceChoice || "Not selected"}
                              </dd>
                            </div>

                            <div>
                              <dt className="font-black">What is happening</dt>
                              <dd className="mt-1 whitespace-pre-wrap text-slate-700">
                                {draft.participantMessage}
                              </dd>
                            </div>

                            <div>
                              <dt className="font-black">
                                What would be helpful
                              </dt>
                              <dd className="mt-1 whitespace-pre-wrap text-slate-700">
                                {draft.requestedSupport.trim() ||
                                  "No specific request added"}
                              </dd>
                            </div>

                            <div>
                              <dt className="font-black">
                                Follow-up preference
                              </dt>
                              <dd className="mt-1 text-slate-700">
                                {labelContact(draft.contactPreference)}
                              </dd>
                            </div>
                          </dl>
                        </section>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={working || !draft.participantMessage.trim()}
                            className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-60"
                          >
                            {working ? "Sending..." : "Send Support request"}
                          </button>

                          <button
                            type="button"
                            disabled={working}
                            onClick={() => {
                              resetCreateFlow();
                              setShowCreate(false);
                            }}
                            className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-700 disabled:opacity-60"
                          >
                            Cancel
                          </button>
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
                      </section>
                    ) : null}
                  </form>
                ) : null}

                {requests.length > 0 && !shouldShowCreate ? (
                  <button
                    type="button"
                    aria-expanded={showCreate}
                    aria-controls="support-request-create"
                    onClick={() => {
                      resetCreateFlow();
                      setShowSubmitConfirmation(false);
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
                        participantReplies={participantReplies}
                        working={working}
                        onWithdraw={withdrawRequest}
                        onSubmitReply={submitParticipantReply}
                      />
                    ))}
                  </section>
                ) : null}
              </>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="font-black text-slate-900">How Support works</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                THRIVE Support helps you ask questions, understand next steps,
                and communicate with authorized Support reviewers. Important
                decisions and permissions still stay with the appropriate
                people and processes.
              </p>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <p className="font-black text-amber-950">
                Support is not an emergency service
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                This page is for ordinary THRIVE Support requests. If you need
                immediate emergency help, use the appropriate emergency service
                available to you.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
