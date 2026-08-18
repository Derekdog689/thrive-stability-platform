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

type ParticipantReplyRow = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  support_request_id: string;
  entry_type: "participant_reply";
  title: string | null;
  content: string;
  created_at: string;
};

type ParticipantResponseRow = {
  id: string;
  support_request_id: string;
  entry_type: "participant_response";
  created_at: string;
};

type SupportStatusEventRow = {
  id: string;
  support_request_id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  changed_at: string;
};

const supportRequestSelect =
  "id, workspace_id, program_id, supported_person_id, participant_category, participant_message, requested_support, contact_preference, status, created_at";

const participantReplySelect =
  "id, workspace_id, program_id, supported_person_id, support_request_id, entry_type, title, content, created_at";

const participantResponseTimingSelect =
  "id, support_request_id, entry_type, created_at";

const supportStatusTimingSelect =
  "id, support_request_id, event_type, from_status, to_status, changed_at";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function labelStatus(value: string) {
  const labels: Record<string, string> = {
    submitted: "Received",
    acknowledged: "Acknowledged",
    in_progress: "In progress",
    waiting_for_participant: "Waiting for participant",
    completed: "Completed",
    withdrawn: "Withdrawn",
    archived: "Archived",
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

function canWriteParticipantVisibleMessage(status: string) {
  return ["acknowledged", "in_progress", "waiting_for_participant"].includes(
    status,
  );
}

function canCompleteRequest(status: string) {
  return ["acknowledged", "in_progress", "waiting_for_participant"].includes(
    status,
  );
}


function newestTimestamp(values: Array<string | null | undefined>) {
  const valid = values.filter((value): value is string => Boolean(value));
  if (valid.length === 0) return null;

  return valid.reduce((latest, value) =>
    new Date(value).getTime() > new Date(latest).getTime() ? value : latest,
  );
}

function elapsedLabel(fromValue: string, nowMs: number) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((nowMs - new Date(fromValue).getTime()) / 60000),
  );

  if (elapsedMinutes < 1) return "less than a minute";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min`;

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours < 24) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0
    ? `${days} day${days === 1 ? "" : "s"} ${remainingHours} hr`
    : `${days} day${days === 1 ? "" : "s"}`;
}

function remainingLabel(targetMs: number, nowMs: number) {
  const remainingMinutes = Math.max(0, Math.ceil((targetMs - nowMs) / 60000));

  if (remainingMinutes < 60) {
    return `${remainingMinutes} min`;
  }

  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function TimingGuidance({
  request,
  statusEvents,
  participantReplies,
  participantResponses,
  nowMs,
}: {
  request: SupportRequestRow;
  statusEvents: SupportStatusEventRow[];
  participantReplies: ParticipantReplyRow[];
  participantResponses: ParticipantResponseRow[];
  nowMs: number;
}) {
  if (["completed", "withdrawn", "archived"].includes(request.status)) {
    return null;
  }

  const requestEvents = statusEvents.filter(
    (event) => event.support_request_id === request.id,
  );
  const requestReplies = participantReplies.filter(
    (reply) => reply.support_request_id === request.id,
  );
  const requestResponses = participantResponses.filter(
    (response) => response.support_request_id === request.id,
  );

  const acknowledgmentEvent = requestEvents.find(
    (event) =>
      event.event_type === "status_changed" &&
      event.to_status === "acknowledged",
  );

  const latestReplyAt = newestTimestamp(
    requestReplies.map((reply) => reply.created_at),
  );

  const reviewerActivityAfterReply = latestReplyAt
    ? newestTimestamp([
        ...requestResponses
          .filter(
            (response) =>
              new Date(response.created_at).getTime() >
              new Date(latestReplyAt).getTime(),
          )
          .map((response) => response.created_at),
        ...requestEvents
          .filter(
            (event) =>
              event.event_type === "status_changed" &&
              new Date(event.changed_at).getTime() >
                new Date(latestReplyAt).getTime(),
          )
          .map((event) => event.changed_at),
      ])
    : null;

  if (request.status === "submitted") {
    const targetMs = new Date(request.created_at).getTime() + 60 * 60 * 1000;
    const needsAttention = nowMs > targetMs;

    return (
      <section
        className={`mt-4 rounded-2xl border p-4 ${
          needsAttention
            ? "border-amber-200 bg-amber-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <p className="text-sm font-black text-slate-900">
          Reviewer timing
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          Received {elapsedLabel(request.created_at, nowMs)} ago.
          {needsAttention
            ? " The 1-hour acknowledgment target needs attention."
            : ` Acknowledgment target: ${remainingLabel(targetMs, nowMs)} remaining.`}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Display only. THRIVE does not change status or send anything automatically.
        </p>
      </section>
    );
  }

  if (request.status === "waiting_for_participant") {
    if (!latestReplyAt || reviewerActivityAfterReply) {
      return (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-900">
            Reviewer timing
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            Waiting on the participant. No reviewer response timer is running
            while the participant owns the next move.
          </p>
        </section>
      );
    }

    const targetMs = new Date(latestReplyAt).getTime() + 24 * 60 * 60 * 1000;
    const needsAttention = nowMs > targetMs;

    return (
      <section
        className={`mt-4 rounded-2xl border p-4 ${
          needsAttention
            ? "border-amber-200 bg-amber-50"
            : "border-sky-200 bg-sky-50"
        }`}
      >
        <p className="text-sm font-black text-slate-900">
          Participant replied
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          Reply received {elapsedLabel(latestReplyAt, nowMs)} ago.
          {needsAttention
            ? " Reviewer follow-up timing needs attention."
            : ` Follow-up target: ${remainingLabel(targetMs, nowMs)} remaining.`}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Target: meaningful reviewer response or action within 24 hours of the participant reply.
        </p>
      </section>
    );
  }

  if (latestReplyAt && !reviewerActivityAfterReply) {
    const targetMs = new Date(latestReplyAt).getTime() + 24 * 60 * 60 * 1000;
    const needsAttention = nowMs > targetMs;

    return (
      <section
        className={`mt-4 rounded-2xl border p-4 ${
          needsAttention
            ? "border-amber-200 bg-amber-50"
            : "border-sky-200 bg-sky-50"
        }`}
      >
        <p className="text-sm font-black text-slate-900">
          Participant follow-up timing
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          The participant replied {elapsedLabel(latestReplyAt, nowMs)} ago.
          {needsAttention
            ? " Reviewer follow-up timing needs attention."
            : ` Follow-up target: ${remainingLabel(targetMs, nowMs)} remaining.`}
        </p>
      </section>
    );
  }

  if (acknowledgmentEvent) {
    const acknowledgmentMinutes = Math.max(
      0,
      Math.round(
        (new Date(acknowledgmentEvent.changed_at).getTime() -
          new Date(request.created_at).getTime()) /
          60000,
      ),
    );

    return (
      <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-black text-slate-900">
          Communication timing
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {acknowledgmentMinutes <= 60
            ? `Acknowledgment target met in ${acknowledgmentMinutes} min.`
            : `Acknowledgment occurred after the 1-hour target (${acknowledgmentMinutes} min).`}
          {" "}Support remains responsible for a meaningful response or visible
          progress within the normal 24-hour communication standard.
        </p>
      </section>
    );
  }

  return null;
}

export default function AdminSupportPage() {
  const {
    state,
    membership,
    errorMessage: accessErrorMessage,
    canAccessAdmin,
  } = useAdminAccess();

  const [requests, setRequests] = useState<SupportRequestRow[]>([]);
  const [participantReplies, setParticipantReplies] = useState<
    ParticipantReplyRow[]
  >([]);
  const [participantResponses, setParticipantResponses] = useState<
    ParticipantResponseRow[]
  >([]);
  const [statusEvents, setStatusEvents] = useState<SupportStatusEventRow[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestErrorMessage, setRequestErrorMessage] = useState("");
  const [responseDrafts, setResponseDrafts] = useState<
    Record<string, ParticipantResponseDraft>
  >({});
  const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [responseNotice, setResponseNotice] = useState<Record<string, string>>(
    {},
  );
  const [statusNotice, setStatusNotice] = useState<Record<string, string>>({});
  const [showClosedRequests, setShowClosedRequests] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      if (!canAccessAdmin || !membership) {
        if (mounted) {
          setRequests([]);
          setParticipantReplies([]);
          setParticipantResponses([]);
          setStatusEvents([]);
          setLoadingRequests(false);
        }
        return;
      }

      setLoadingRequests(true);
      setRequestErrorMessage("");

      const [requestResult, replyResult, responseResult, statusEventResult] =
        await Promise.all([
          supabase
            .from("support_requests")
            .select(supportRequestSelect)
            .eq("workspace_id", membership.workspace_id)
            .order("created_at", { ascending: false }),
          supabase
            .from("support_request_entries")
            .select(participantReplySelect)
            .eq("workspace_id", membership.workspace_id)
            .eq("entry_type", "participant_reply")
            .is("archived_at", null)
            .order("created_at", { ascending: true }),
          supabase
            .from("support_request_entries")
            .select(participantResponseTimingSelect)
            .eq("workspace_id", membership.workspace_id)
            .eq("entry_type", "participant_response")
            .is("archived_at", null)
            .order("created_at", { ascending: true }),
          supabase
            .from("support_request_status_events")
            .select(supportStatusTimingSelect)
            .eq("workspace_id", membership.workspace_id)
            .eq("event_type", "status_changed")
            .order("changed_at", { ascending: true }),
        ]);

      if (!mounted) return;

      if (requestResult.error) {
        setRequestErrorMessage(requestResult.error.message);
        setLoadingRequests(false);
        return;
      }

      if (replyResult.error) {
        setRequestErrorMessage(replyResult.error.message);
        setLoadingRequests(false);
        return;
      }

      if (responseResult.error) {
        setRequestErrorMessage(responseResult.error.message);
        setLoadingRequests(false);
        return;
      }

      if (statusEventResult.error) {
        setRequestErrorMessage(statusEventResult.error.message);
        setLoadingRequests(false);
        return;
      }

      setRequests((requestResult.data as SupportRequestRow[] | null) ?? []);
      setParticipantReplies(
        (replyResult.data as ParticipantReplyRow[] | null) ?? [],
      );
      setParticipantResponses(
        (responseResult.data as ParticipantResponseRow[] | null) ?? [],
      );
      setStatusEvents(
        (statusEventResult.data as SupportStatusEventRow[] | null) ?? [],
      );
      setLoadingRequests(false);
    }

    loadRequests();

    return () => {
      mounted = false;
    };
  }, [canAccessAdmin, membership]);

  function clearNotices(requestId: string) {
    setResponseNotice((current) => ({
      ...current,
      [requestId]: "",
    }));
    setStatusNotice((current) => ({
      ...current,
      [requestId]: "",
    }));
  }

  function clearResponseDraft(requestId: string) {
    setResponseDrafts((current) => ({
      ...current,
      [requestId]: {
        title: "",
        content: "",
      },
    }));
  }

  function replaceRequest(row: SupportRequestRow) {
    setRequests((current) =>
      current.map((item) => (item.id === row.id ? row : item)),
    );
  }

  async function insertParticipantVisibleMessage(
    request: SupportRequestRow,
    successMessage: string,
  ) {
    const draft = responseDrafts[request.id];

    if (!draft?.content.trim()) {
      setResponseNotice((current) => ({
        ...current,
        [request.id]: "Write the participant-visible message before sending.",
      }));
      return { ok: false as const };
    }

    if (!canWriteParticipantVisibleMessage(request.status)) {
      setResponseNotice((current) => ({
        ...current,
        [request.id]:
          "This Support request is not open for a participant-visible message.",
      }));
      return { ok: false as const };
    }

    setSendingRequestId(request.id);
    clearNotices(request.id);

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
      return { ok: false as const };
    }

    const { error } = await supabase.from("support_request_entries").insert({
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
          error.message || "The participant-visible message could not be sent.",
      }));
      return { ok: false as const };
    }

    clearResponseDraft(request.id);
    setResponseNotice((current) => ({
      ...current,
      [request.id]: successMessage,
    }));

    return { ok: true as const };
  }

  async function sendParticipantUpdate(request: SupportRequestRow) {
    await insertParticipantVisibleMessage(
      request,
      "Participant-visible update sent.",
    );
  }

  async function acknowledgeRequest(request: SupportRequestRow) {
    if (request.status !== "submitted") {
      setStatusNotice((current) => ({
        ...current,
        [request.id]: "Only a newly received request can be acknowledged.",
      }));
      return;
    }

    setUpdatingRequestId(request.id);
    clearNotices(request.id);

    const { data, error } = await supabase
      .from("support_requests")
      .update({ status: "acknowledged" })
      .eq("id", request.id)
      .eq("workspace_id", request.workspace_id)
      .eq("status", "submitted")
      .select(supportRequestSelect)
      .single();

    setUpdatingRequestId(null);

    if (error) {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          error.message || "The Support request could not be acknowledged.",
      }));
      return;
    }

    replaceRequest(data as SupportRequestRow);
    setStatusNotice((current) => ({
      ...current,
      [request.id]: "Support request acknowledged.",
    }));
  }

  async function startWorkRequest(request: SupportRequestRow) {
    if (request.status !== "acknowledged") {
      setStatusNotice((current) => ({
        ...current,
        [request.id]: "Only an acknowledged request can be started.",
      }));
      return;
    }

    setUpdatingRequestId(request.id);
    clearNotices(request.id);

    const { data, error } = await supabase
      .from("support_requests")
      .update({ status: "in_progress" })
      .eq("id", request.id)
      .eq("workspace_id", request.workspace_id)
      .eq("status", "acknowledged")
      .select(supportRequestSelect)
      .single();

    setUpdatingRequestId(null);

    if (error) {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          error.message || "The Support request could not be started.",
      }));
      return;
    }

    replaceRequest(data as SupportRequestRow);
    setStatusNotice((current) => ({
      ...current,
      [request.id]: "Support work started.",
    }));
  }

  async function requestInformation(request: SupportRequestRow) {
    if (request.status !== "in_progress") {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          "Information can be requested only while Support is actively working on the request.",
      }));
      return;
    }

    const draft = responseDrafts[request.id];

    if (!draft?.content.trim()) {
      setResponseNotice((current) => ({
        ...current,
        [request.id]:
          "Explain what information you need from the participant before requesting it.",
      }));
      return;
    }

    const messageResult = await insertParticipantVisibleMessage(
      request,
      "Information request sent to the participant.",
    );

    if (!messageResult.ok) {
      return;
    }

    setUpdatingRequestId(request.id);

    const { data, error } = await supabase
      .from("support_requests")
      .update({ status: "waiting_for_participant" })
      .eq("id", request.id)
      .eq("workspace_id", request.workspace_id)
      .eq("status", "in_progress")
      .select(supportRequestSelect)
      .single();

    setUpdatingRequestId(null);

    if (error) {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          "The participant-visible information request was sent, but the request status could not be changed. Review the request before trying again.",
      }));
      return;
    }

    replaceRequest(data as SupportRequestRow);
    setStatusNotice((current) => ({
      ...current,
      [request.id]: "Waiting for the participant to respond.",
    }));
  }

  async function askFollowUp(request: SupportRequestRow) {
    if (request.status !== "waiting_for_participant") {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          "A follow-up question can be sent only while waiting for the participant.",
      }));
      return;
    }

    await insertParticipantVisibleMessage(
      request,
      "Follow-up question sent. The request remains waiting for the participant.",
    );
  }

  async function resumeWorkRequest(request: SupportRequestRow) {
    if (request.status !== "waiting_for_participant") {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          "Only a request waiting for the participant can be resumed.",
      }));
      return;
    }

    setUpdatingRequestId(request.id);
    clearNotices(request.id);

    const { data, error } = await supabase
      .from("support_requests")
      .update({ status: "in_progress" })
      .eq("id", request.id)
      .eq("workspace_id", request.workspace_id)
      .eq("status", "waiting_for_participant")
      .select(supportRequestSelect)
      .single();

    setUpdatingRequestId(null);

    if (error) {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          error.message || "The Support request could not be resumed.",
      }));
      return;
    }

    replaceRequest(data as SupportRequestRow);
    setStatusNotice((current) => ({
      ...current,
      [request.id]: "Support work resumed.",
    }));
  }

  async function completeRequest(request: SupportRequestRow) {
    if (!canCompleteRequest(request.status)) {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          "This Support request is not currently eligible for completion.",
      }));
      return;
    }

    const confirmed = window.confirm(
      "Complete this Support request? The participant will see it as Resolved and it cannot be reopened.",
    );

    if (!confirmed) return;

    setUpdatingRequestId(request.id);
    clearNotices(request.id);

    const { data, error } = await supabase
      .from("support_requests")
      .update({ status: "completed" })
      .eq("id", request.id)
      .eq("workspace_id", request.workspace_id)
      .eq("status", request.status)
      .select(supportRequestSelect)
      .single();

    setUpdatingRequestId(null);

    if (error) {
      setStatusNotice((current) => ({
        ...current,
        [request.id]:
          error.message || "The Support request could not be completed.",
      }));
      return;
    }

    replaceRequest(data as SupportRequestRow);
    clearResponseDraft(request.id);
    setStatusNotice((current) => ({
      ...current,
      [request.id]: "Support request completed.",
    }));
  }

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Checking Support review access</h1>
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
            <h1 className="text-3xl font-black">THRIVE Review access required</h1>

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
            <h1 className="text-3xl font-black">THRIVE Review could not load</h1>

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
            <h1 className="text-3xl font-black">Reviewer access not available</h1>

            <p className="mt-3 text-slate-600">
              This account does not have an active THRIVE reviewer or admin
              workspace membership.
            </p>
          </div>
        </section>
      </main>
    );
  }

    const supportActionRequests = requests.filter((request) =>
    ["submitted", "acknowledged", "in_progress"].includes(request.status),
  );

  const waitingParticipantRequests = requests.filter(
    (request) => request.status === "waiting_for_participant",
  );

  const closedRequests = requests.filter((request) =>
    ["completed", "withdrawn", "archived"].includes(request.status),
  );

  return (
    <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-700">
              THRIVE Review
            </p>

            <h1 className="mt-2 text-4xl font-black">Support queue</h1>

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
            <h2 className="text-xl font-black">No Support requests</h2>

            <p className="mt-2 text-slate-600">
              There are no Support requests currently visible to this reviewer.
            </p>
          </div>
        ) : null}

                <div className="mt-8 space-y-10">
          {supportActionRequests.length > 0 ? (
            <section>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Reviewer action
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Needs Support action
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Requests that currently need acknowledgment, active review, or
                  another decision from Support.
                </p>
              </div>

              <div className="space-y-5">
                {supportActionRequests.map((request) => {
                  const requestParticipantReplies = participantReplies.filter(
                    (reply) => reply.support_request_id === request.id,
                  );

                  const draft = responseDrafts[request.id] ?? {
                    title: "",
                    content: "",
                  };

                  const isBusy =
                    updatingRequestId === request.id ||
                    sendingRequestId === request.id;

                  return (
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

                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
                          {labelStatus(request.status)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {request.status === "submitted" ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => acknowledgeRequest(request)}
                            className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy
                              ? "Acknowledging..."
                              : "Acknowledge request"}
                          </button>
                        ) : null}

                        {request.status === "acknowledged" ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => startWorkRequest(request)}
                            className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "Starting..." : "Start work"}
                          </button>
                        ) : null}

                        {request.status === "waiting_for_participant" ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => resumeWorkRequest(request)}
                            className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "Resuming..." : "Resume work"}
                          </button>
                        ) : null}

                        {canCompleteRequest(request.status) ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => completeRequest(request)}
                            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "Updating..." : "Complete request"}
                          </button>
                        ) : null}

                        {statusNotice[request.id] ? (
                          <p
                            role="status"
                            aria-live="polite"
                            className="text-sm font-semibold text-slate-600"
                          >
                            {statusNotice[request.id]}
                          </p>
                        ) : null}
                      </div>

                      <TimingGuidance
                        request={request}
                        statusEvents={statusEvents}
                        participantReplies={requestParticipantReplies}
                        participantResponses={participantResponses.filter(
                          (response) =>
                            response.support_request_id === request.id,
                        )}
                        nowMs={nowMs}
                      />

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
                          <dt className="font-bold text-slate-500">Requested</dt>

                          <dd className="mt-1 font-semibold text-slate-800">
                            {formatDate(request.created_at)}
                          </dd>
                        </div>
                      </dl>

                      {requestParticipantReplies.length > 0 ? (
                        <section className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
                          <p className="text-sm font-black text-slate-800">
                            Participant replied
                          </p>

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

                      {canWriteParticipantVisibleMessage(request.status) ? (
                        <section className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                          <p className="text-sm font-black text-slate-800">
                            Participant-visible message
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Write the message the participant should see, then
                            choose what that message means for the request.
                          </p>

                          <input
                            type="text"
                            value={draft.title}
                            onChange={(event) =>
                              setResponseDrafts((current) => ({
                                ...current,
                                [request.id]: {
                                  title: event.target.value,
                                  content:
                                    current[request.id]?.content ?? "",
                                },
                              }))
                            }
                            placeholder="Message title"
                            maxLength={120}
                            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                          />

                          <textarea
                            value={draft.content}
                            onChange={(event) =>
                              setResponseDrafts((current) => ({
                                ...current,
                                [request.id]: {
                                  title: current[request.id]?.title ?? "",
                                  content: event.target.value,
                                },
                              }))
                            }
                            placeholder={
                              request.status === "waiting_for_participant"
                                ? "Write the follow-up information or question the participant should see"
                                : "Write the update or information request the participant should see"
                            }
                            maxLength={4000}
                            rows={5}
                            className="mt-3 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-emerald-500"
                          />

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            {request.status === "acknowledged" ||
                            request.status === "in_progress" ? (
                              <button
                                type="button"
                                disabled={isBusy || !draft.content.trim()}
                                onClick={() => sendParticipantUpdate(request)}
                                className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {sendingRequestId === request.id
                                  ? "Sending..."
                                  : "Send update"}
                              </button>
                            ) : null}

                            {request.status === "in_progress" ? (
                              <button
                                type="button"
                                disabled={isBusy || !draft.content.trim()}
                                onClick={() => requestInformation(request)}
                                className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isBusy
                                  ? "Sending..."
                                  : "Request information"}
                              </button>
                            ) : null}

                            {request.status ===
                            "waiting_for_participant" ? (
                              <button
                                type="button"
                                disabled={isBusy || !draft.content.trim()}
                                onClick={() => askFollowUp(request)}
                                className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {sendingRequestId === request.id
                                  ? "Sending..."
                                  : "Ask follow-up"}
                              </button>
                            ) : null}

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
                  );
                })}
              </div>
            </section>
          ) : null}

          {waitingParticipantRequests.length > 0 ? (
            <section>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Participant action
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Waiting on participant
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Support has asked for information. These requests remain open
                  while the participant owns the next move.
                </p>
              </div>

              <div className="space-y-5">
                {waitingParticipantRequests.map((request) => {
                  const requestParticipantReplies = participantReplies.filter(
                    (reply) => reply.support_request_id === request.id,
                  );

                  const draft = responseDrafts[request.id] ?? {
                    title: "",
                    content: "",
                  };

                  const isBusy =
                    updatingRequestId === request.id ||
                    sendingRequestId === request.id;

                  return (
                    <article
                      key={request.id}
                      className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                            {request.participant_category.replaceAll("_", " ")}
                          </p>

                          <h2 className="mt-2 text-xl font-black">
                            Participant Support request
                          </h2>
                        </div>

                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                          {labelStatus(request.status)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => resumeWorkRequest(request)}
                          className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? "Resuming..." : "Resume work"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => completeRequest(request)}
                          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? "Updating..." : "Complete request"}
                        </button>

                        {statusNotice[request.id] ? (
                          <p
                            role="status"
                            aria-live="polite"
                            className="text-sm font-semibold text-slate-600"
                          >
                            {statusNotice[request.id]}
                          </p>
                        ) : null}
                      </div>

                      <TimingGuidance
                        request={request}
                        statusEvents={statusEvents}
                        participantReplies={requestParticipantReplies}
                        participantResponses={participantResponses.filter(
                          (response) =>
                            response.support_request_id === request.id,
                        )}
                        nowMs={nowMs}
                      />

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
                          <dt className="font-bold text-slate-500">Requested</dt>
                          <dd className="mt-1 font-semibold text-slate-800">
                            {formatDate(request.created_at)}
                          </dd>
                        </div>
                      </dl>

                      {requestParticipantReplies.length > 0 ? (
                        <section className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
                          <p className="text-sm font-black text-slate-800">
                            Participant replied
                          </p>

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

                      <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
                        <p className="text-sm font-black text-slate-800">
                          Participant-visible follow-up
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Send another question only if more information is
                          genuinely needed.
                        </p>

                        <input
                          type="text"
                          value={draft.title}
                          onChange={(event) =>
                            setResponseDrafts((current) => ({
                              ...current,
                              [request.id]: {
                                title: event.target.value,
                                content:
                                  current[request.id]?.content ?? "",
                              },
                            }))
                          }
                          placeholder="Message title"
                          maxLength={120}
                          className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500"
                        />

                        <textarea
                          value={draft.content}
                          onChange={(event) =>
                            setResponseDrafts((current) => ({
                              ...current,
                              [request.id]: {
                                title: current[request.id]?.title ?? "",
                                content: event.target.value,
                              },
                            }))
                          }
                          placeholder="Write the follow-up information or question the participant should see"
                          maxLength={4000}
                          rows={5}
                          className="mt-3 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-amber-500"
                        />

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            disabled={isBusy || !draft.content.trim()}
                            onClick={() => askFollowUp(request)}
                            className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {sendingRequestId === request.id
                              ? "Sending..."
                              : "Ask follow-up"}
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
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {closedRequests.length > 0 ? (
            <section>
              <div className="flex flex-wrap items-start justify-between gap-4">
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
      History
    </p>

    <h2 className="mt-1 text-2xl font-black text-slate-950">
      Closed requests
    </h2>

    <p className="mt-1 text-sm text-slate-600">
      Completed, withdrawn, and archived Support requests remain available as
      read-only history.
    </p>
  </div>

  <button
    type="button"
    onClick={() => setShowClosedRequests((current) => !current)}
    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
  >
    {showClosedRequests
      ? "Hide closed requests"
      : `Show closed requests (${closedRequests.length})`}
  </button>
</div>

              {showClosedRequests ? (
  <div className="mt-5 space-y-5">
                {closedRequests.map((request) => {
                  const requestParticipantReplies = participantReplies.filter(
                    (reply) => reply.support_request_id === request.id,
                  );

                  return (
                    <article
                      key={request.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {request.participant_category.replaceAll("_", " ")}
                          </p>

                          <h2 className="mt-2 text-xl font-black">
                            Participant Support request
                          </h2>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-800">
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
                          <dt className="font-bold text-slate-500">Requested</dt>
                          <dd className="mt-1 font-semibold text-slate-800">
                            {formatDate(request.created_at)}
                          </dd>
                        </div>
                      </dl>

                      {requestParticipantReplies.length > 0 ? (
                        <section className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
                          <p className="text-sm font-black text-slate-800">
                            Participant replied
                          </p>

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
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        ) : null}
        </div>
      </section>
    </main>
  );
}
