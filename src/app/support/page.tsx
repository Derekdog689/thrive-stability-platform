"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
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
  shortTitle: string;
  symbol: string;
  description: string;
}> = [
  {
    value: "budget_money",
    title: "Budget help",
    shortTitle: "Money",
    symbol: "$",
    description: "Review a plan, understand a category, or prepare a question.",
  },
  {
    value: "transaction_understanding",
    title: "Transaction understanding",
    shortTitle: "Activity",
    symbol: "↕",
    description: "Ask for help reviewing an imported financial observation.",
  },
  {
    value: "wellness_support",
    title: "Wellness support",
    shortTitle: "Wellness",
    symbol: "◌",
    description: "Ask for help with routines, stress, sleep, or daily stability.",
  },
  {
    value: "goal_support",
    title: "Goal support",
    shortTitle: "Goals",
    symbol: "◎",
    description: "Talk through a barrier, next step, or support preference.",
  },
  {
    value: "program_question",
    title: "Program question",
    shortTitle: "Program",
    symbol: "i",
    description: "Ask about your current THRIVE participation or supports.",
  },
  {
    value: "other",
    title: "General support / I’m not sure",
    shortTitle: "Not sure",
    symbol: "?",
    description: "Start here when you know you need help but are not sure where it fits.",
  },
];

const guidanceChoices: Record<ParticipantSupportCategory, GuidanceChoice[]> = {
  budget_money: [
    { label: "I want to understand part of my Budget", help: "Use this if a category, amount, or part of your plan is confusing." },
    { label: "Something changed and my Budget no longer fits", help: "Use this when income, expenses, or priorities changed." },
    { label: "I am having trouble with one Budget area", help: "Use this when one part of the plan is harder to manage than expected." },
    { label: "I want help deciding my next Budget step", help: "Use this when you understand the issue but are not sure what to do next." },
    { label: "I’m not sure", help: "That is okay. You can explain what is happening in your own words next." },
  ],
  transaction_understanding: [
    { label: "I do not recognize a transaction", help: "Use this when you are unsure what a transaction is." },
    { label: "I recognize it but want help explaining it", help: "Use this when you know what happened but want help adding context." },
    { label: "I want to understand how it affects my Budget", help: "Use this when the transaction is clear but its Budget impact is not." },
    { label: "I think something may be categorized incorrectly", help: "Use this when the transaction seems to be in the wrong category." },
    { label: "I’m not sure", help: "That is okay. Describe what you see and what is confusing." },
  ],
  wellness_support: [
    { label: "I want help thinking through a routine", help: "Use this for sleep, daily structure, stress, or another routine." },
    { label: "Something has changed and I want support", help: "Use this when something feels different and you want help thinking it through." },
    { label: "I want help choosing a small next step", help: "Use this when you know what area matters but want help making it manageable." },
    { label: "I want to talk through what has been helping", help: "Use this to review what has been useful and what you may want to continue." },
    { label: "I’m not sure", help: "That is okay. You can describe what has been going on without choosing a label." },
  ],
  goal_support: [
    { label: "I do not know my next step", help: "Use this when the Goal is clear but the next action is not." },
    { label: "Something is getting in the way", help: "Use this when a barrier is making the Goal harder to move forward." },
    { label: "I want to break the Goal into smaller steps", help: "Use this when the Goal feels too large or hard to organize." },
    { label: "My situation changed and I want to review the Goal", help: "Use this when the Goal may need to be adjusted." },
    { label: "I’m not sure", help: "That is okay. Start by telling Support what you are trying to accomplish." },
  ],
  program_question: [
    { label: "I have a question about my THRIVE participation", help: "Use this for questions about your current participation." },
    { label: "I am unsure what a program step means", help: "Use this when a process, expectation, or next step is unclear." },
    { label: "I want to understand what support is available", help: "Use this when you want to know what help you can ask for." },
    { label: "Something changed and I need clarification", help: "Use this when your situation or program understanding changed." },
    { label: "I’m not sure", help: "That is okay. Tell Support what you are trying to understand." },
  ],
  other: [
    { label: "I have a question", help: "Use this when you know what you want to ask." },
    { label: "Something changed", help: "Use this when a new situation is what brought you here." },
    { label: "I need help figuring out what to do next", help: "Use this when you know there is a problem but not the next step." },
    { label: "I need clarification", help: "Use this when something does not make sense yet." },
    { label: "I know I need help, but I’m not sure what kind", help: "That is enough to start. Explain what is happening next." },
  ],
};

const contactOptions: Array<{ value: ContactPreference; label: string }> = [
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
    acknowledged: "Seen",
    in_progress: "In review",
    waiting_for_participant: "Needs you",
    completed: "Resolved",
    withdrawn: "Withdrawn",
    archived: "History",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function labelCategory(category: ParticipantSupportCategory) {
  return supportAreas.find((area) => area.value === category)?.title ?? category.replaceAll("_", " ");
}

function labelContact(value: ContactPreference | null) {
  if (!value) return "Not specified";
  return contactOptions.find((option) => option.value === value)?.label ?? value.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function statusSignal(status: SupportRequestStatus) {
  const signals: Record<SupportRequestStatus, { title: string; action: string; tone: string }> = {
    submitted: { title: "We received it", action: "Nothing needed from you right now.", tone: "bg-emerald-50 text-emerald-950" },
    acknowledged: { title: "Support has seen it", action: "Nothing needed from you right now.", tone: "bg-emerald-50 text-emerald-950" },
    in_progress: { title: "Support is reviewing it", action: "Nothing needed from you right now.", tone: "bg-[#eef3f1] text-[#28443f]" },
    waiting_for_participant: { title: "Support needs something from you", action: "Read the latest message and reply below.", tone: "bg-amber-50 text-amber-950" },
    completed: { title: "This request is resolved", action: "You can start a new request anytime.", tone: "bg-emerald-50 text-emerald-950" },
    withdrawn: { title: "This request was withdrawn", action: "It stays in your history.", tone: "bg-slate-50 text-slate-800" },
    archived: { title: "This request is in history", action: "No action is needed.", tone: "bg-slate-50 text-slate-800" },
  };
  return signals[status];
}

function SupportBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "◌" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "◯" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[1.75rem] border border-white/60 bg-white/90 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:bottom-5">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center transition ${item.href === "/support" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"}`}>
            <span className="text-base font-black leading-none">{item.icon}</span>
            <span className="mt-1 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function SupportRequestCard({ request, statusEvents, participantResponses, participantReplies, working, onWithdraw, onSubmitReply }: {
  request: ParticipantSupportRequest;
  statusEvents: ParticipantSupportStatusEvent[];
  participantResponses: ParticipantSupportResponse[];
  participantReplies: ParticipantSupportReply[];
  working: boolean;
  onWithdraw: (request: ParticipantSupportRequest) => Promise<{ ok: boolean; message: string }>;
  onSubmitReply: (request: ParticipantSupportRequest, content: string) => Promise<ParticipantReplyResult>;
}) {
  const requestStatusEvents = statusEvents.filter((event) => event.support_request_id === request.id);
  const requestParticipantResponses = participantResponses.filter((response) => response.support_request_id === request.id);
  const requestParticipantReplies = participantReplies.filter((reply) => reply.support_request_id === request.id);
  const [withdrawNotice, setWithdrawNotice] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyNotice, setReplyNotice] = useState("");
  const signal = statusSignal(request.status);

  async function handleWithdraw() {
    setWithdrawNotice("");
    const confirmed = window.confirm("Withdraw this Support request? This request will move to your request history.");
    if (!confirmed) return;
    const result = await onWithdraw(request);
    setWithdrawNotice(result.message);
  }

  async function handleReply() {
    setReplyNotice("");
    const result = await onSubmitReply(request, replyDraft);
    setReplyNotice(result.message);
    if (result.ok) setReplyDraft("");
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{labelCategory(request.participant_category)}</p>
            <h3 className="mt-2 text-xl font-black leading-7 text-slate-950 sm:text-2xl">{request.participant_message}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-900">{labelStatus(request.status)}</span>
        </div>

        <div className={`mt-5 rounded-2xl p-4 ${signal.tone}`}>
          <p className="text-sm font-black">{signal.title}</p>
          <p className="mt-1 text-sm leading-6 opacity-80">{signal.action}</p>
        </div>

        {request.requested_support ? (
          <div className="mt-4 rounded-2xl bg-[#f7f2ea] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9b613f]">What would help</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{request.requested_support}</p>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black text-slate-500">
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">Received ✓</span>
          {requestStatusEvents.some((event) => event.to_status === "acknowledged") || request.status !== "submitted" ? <span className="shrink-0">→</span> : null}
          {requestStatusEvents.some((event) => event.to_status === "acknowledged") || request.status !== "submitted" ? <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">Seen ✓</span> : null}
          {request.status === "in_progress" || request.status === "waiting_for_participant" || request.status === "completed" ? <span className="shrink-0">→</span> : null}
          {request.status === "in_progress" || request.status === "waiting_for_participant" || request.status === "completed" ? <span className="shrink-0 rounded-full bg-[#eef3f1] px-3 py-2 text-[#365a52]">In review {request.status === "in_progress" ? "●" : "✓"}</span> : null}
          {request.status === "waiting_for_participant" ? <><span className="shrink-0">→</span><span className="shrink-0 rounded-full bg-amber-50 px-3 py-2 text-amber-900">Needs you ●</span></> : null}
          {request.status === "completed" ? <><span className="shrink-0">→</span><span className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">Resolved ✓</span></> : null}
        </div>

        {request.status === "waiting_for_participant" ? (
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-black text-amber-950">Your response is needed</p>
            {requestParticipantResponses.length > 0 ? (
              <div className="mt-3 rounded-xl bg-white/70 p-3">
                <p className="text-xs font-black uppercase tracking-wide text-amber-800">Latest Support message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{requestParticipantResponses[requestParticipantResponses.length - 1]?.content}</p>
              </div>
            ) : null}
            <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} maxLength={4000} rows={4} className="mt-4 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 font-normal" placeholder="Write your response" />
            <button type="button" disabled={working || !replyDraft.trim()} onClick={handleReply} className="mt-3 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-60">{working ? "Sending..." : "Send response"}</button>
            {replyNotice ? <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{replyNotice}</p> : null}
          </section>
        ) : null}

        <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50">
          <summary className="cursor-pointer list-none p-4 font-black text-slate-700">View details</summary>
          <div className="border-t border-slate-200 p-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs font-black uppercase tracking-wide text-slate-400">Requested</dt><dd className="mt-1 font-semibold">{formatDate(request.created_at)}</dd></div>
              <div><dt className="text-xs font-black uppercase tracking-wide text-slate-400">Follow-up</dt><dd className="mt-1 font-semibold">{labelContact(request.contact_preference)}</dd></div>
            </dl>

            {requestStatusEvents.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Request history</p>
                <div className="mt-3 space-y-3">
                  {requestStatusEvents.map((event) => (
                    <div key={event.id} className="flex items-start justify-between gap-3 text-sm">
                      <div><p className="font-bold">{event.to_status ? labelStatus(event.to_status) : "Status updated"}</p>{event.change_note ? <p className="mt-1 text-slate-600">{event.change_note}</p> : null}</div>
                      <span className="shrink-0 text-xs text-slate-500">{formatDate(event.changed_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {requestParticipantResponses.length > 0 ? (
              <div className="mt-5"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Support responses</p><div className="mt-3 space-y-3">{requestParticipantResponses.map((response) => <div key={response.id} className="rounded-xl bg-white p-3"><p className="whitespace-pre-wrap text-sm leading-6">{response.content}</p><p className="mt-2 text-xs text-slate-500">{formatDate(response.created_at)}</p></div>)}</div></div>
            ) : null}

            {requestParticipantReplies.length > 0 ? (
              <div className="mt-5"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Your replies</p><div className="mt-3 space-y-3">{requestParticipantReplies.map((reply) => <div key={reply.id} className="rounded-xl bg-emerald-50 p-3"><p className="whitespace-pre-wrap text-sm leading-6">{reply.content}</p><p className="mt-2 text-xs text-slate-500">{formatDate(reply.created_at)}</p></div>)}</div></div>
            ) : null}

            {request.status === "submitted" ? (
              <div className="mt-5"><button type="button" disabled={working} onClick={handleWithdraw} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-60">{working ? "Withdrawing..." : "Withdraw request"}</button>{withdrawNotice ? <p className="mt-2 text-sm text-slate-600">{withdrawNotice}</p> : null}</div>
            ) : null}
          </div>
        </details>
      </div>
    </article>
  );
}

export default function SupportPage() {
  const { participantName, requests, statusEvents, participantResponses, participantReplies, loading, working, errorMessage, canCreate, createRequest, withdrawRequest, submitParticipantReply } = useParticipantSupport();
  const [draft, setDraft] = useState<SupportRequestDraft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [guidanceChoice, setGuidanceChoice] = useState("");

  const activeRequests = useMemo(() => requests.filter((request) => !["completed", "withdrawn", "archived"].includes(request.status)), [requests]);
  const historicalRequests = useMemo(() => requests.filter((request) => ["completed", "withdrawn", "archived"].includes(request.status)), [requests]);
  const shouldShowCreate = showCreate || (!loading && !errorMessage && canCreate && requests.length === 0);
  const selectedGuidance = guidanceChoices[draft.participantCategory].find((choice) => choice.label === guidanceChoice);

  function resetCreateFlow() {
    setDraft(emptyDraft);
    setNotice("");
    setGuidanceChoice("");
    setCreateStep(1);
  }

  function cancelCreateFlow() {
    const confirmed = window.confirm("Cancel this Support request? Your current draft will be cleared.");
    if (!confirmed) return;
    resetCreateFlow();
    setShowSubmitConfirmation(false);
    setShowCreate(false);
  }

  function chooseCategory(category: ParticipantSupportCategory) {
    setDraft((current) => ({ ...current, participantCategory: category, requestedSupport: "" }));
    setGuidanceChoice("");
    setCreateStep(2);
  }

  function chooseGuidance(choice: GuidanceChoice) {
    setGuidanceChoice(choice.label);
    setDraft((current) => ({ ...current, requestedSupport: current.requestedSupport.trim().length > 0 ? current.requestedSupport : choice.label === "I’m not sure" || choice.label === "I know I need help, but I’m not sure what kind" ? "" : choice.label }));
    setCreateStep(3);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setShowSubmitConfirmation(false);
    const result = await createRequest(draft);
    setNotice(result.message);
    if (!result.ok) return;
    resetCreateFlow();
    setShowCreate(false);
    setShowSubmitConfirmation(true);
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#e8f0eb] px-3 pb-28 pt-3 text-slate-950 sm:px-6 sm:pb-32 sm:pt-6">
        <section className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
          <header className="relative min-h-[340px] overflow-hidden rounded-[2.5rem] bg-[#31574d] text-white shadow-[0_28px_90px_rgba(32,59,56,0.2)] sm:min-h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(241,190,128,0.45),transparent_18%),linear-gradient(155deg,#91a9a0_0%,#6f9184_28%,#486e63_52%,#31574d_76%,#284b43_100%)]" />
            <div className="relative flex min-h-[340px] flex-col p-5 sm:min-h-[420px] sm:p-8">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-lg font-black ring-1 ring-white/20">T</div><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-50/70">DSS Enterprises</p><p className="text-sm font-black">THRIVE</p></div></Link>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide">Support</span>
              </div>
              <div className="mt-auto max-w-3xl pb-4">
                <p className="font-serif text-2xl text-amber-50/90">When something could use another person.</p>
                <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight sm:text-7xl">What would help, {participantName}?</h1>
                <p className="mt-4 text-lg text-emerald-50/90">Start wherever feels closest.</p>
              </div>
            </div>
          </header>

          {loading ? <section className="rounded-[2rem] bg-white p-6 shadow-sm">Loading Support.</section> : null}
          {errorMessage ? <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6"><p className="font-black">Support could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}
          {!loading && !errorMessage && !canCreate ? <section className="rounded-[2rem] bg-white p-6 shadow-sm"><h2 className="text-2xl font-black">Support is not connected yet</h2><p className="mt-2 text-sm text-slate-600">Support becomes available when your account is connected to an active THRIVE program.</p></section> : null}

          {!loading && !errorMessage && canCreate ? (
            <>
              {showSubmitConfirmation ? <section role="status" className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Request sent</p><h2 className="mt-2 text-2xl font-black">We received it.</h2><p className="mt-2 text-sm text-slate-700">You can follow it below. If Support needs something from you, THRIVE will make that clear.</p></section> : null}

              <section className="space-y-4">
                <div className="px-1"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Your Support</p><h2 className="mt-2 font-serif text-3xl font-semibold">What is happening now.</h2></div>
                {activeRequests.length === 0 ? <div className="rounded-[2rem] bg-white p-6 shadow-sm"><p className="font-black">No open Support requests</p><p className="mt-2 text-sm text-slate-600">Nothing is waiting here right now.</p></div> : activeRequests.map((request) => <SupportRequestCard key={request.id} request={request} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} />)}
              </section>

              {shouldShowCreate ? (
                <form id="support-request-create" onSubmit={handleCreate} className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-8">
                  <div className="sticky top-3 z-20 flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Ask for support</p><p className="mt-1 text-sm font-bold text-slate-500">Step {createStep} of 6</p></div><button type="button" onClick={cancelCreateFlow} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black">Cancel</button></div>

                  {createStep === 1 ? <section className="mt-6"><h2 className="font-serif text-3xl font-semibold">What kind of help?</h2><div className="mt-5 grid grid-cols-2 gap-3">{supportAreas.map((area) => <button key={area.value} type="button" onClick={() => chooseCategory(area.value)} className="flex min-h-28 flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/50"><span className="text-2xl font-black">{area.symbol}</span><span className="mt-2 font-black">{area.shortTitle}</span></button>)}</div></section> : null}

                  {createStep === 2 ? <section className="mt-6"><button type="button" onClick={() => setCreateStep(1)} className="text-sm font-black text-slate-600">Back</button><h2 className="mt-4 font-serif text-3xl font-semibold">Which sounds closest?</h2><div className="mt-5 grid gap-3">{guidanceChoices[draft.participantCategory].map((choice) => <button key={choice.label} type="button" onClick={() => chooseGuidance(choice)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/50"><span className="font-black">{choice.label}</span><span className="mt-1 block text-sm leading-6 text-slate-500">{choice.help}</span></button>)}</div></section> : null}

                  {createStep === 3 ? <section className="mt-6"><button type="button" onClick={() => setCreateStep(2)} className="text-sm font-black text-slate-600">Back</button><h2 className="mt-4 font-serif text-3xl font-semibold">Tell Support what is happening.</h2>{selectedGuidance ? <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm"><span className="font-black">You chose:</span> {selectedGuidance.label}</div> : null}<textarea value={draft.participantMessage} onChange={(event) => setDraft((current) => ({ ...current, participantMessage: event.target.value }))} maxLength={4000} rows={6} autoFocus className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="What is happening?" /><button type="button" disabled={!draft.participantMessage.trim()} onClick={() => setCreateStep(4)} className="mt-4 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-50">Continue</button></section> : null}

                  {createStep === 4 ? <section className="mt-6"><button type="button" onClick={() => setCreateStep(3)} className="text-sm font-black text-slate-600">Back</button><h2 className="mt-4 font-serif text-3xl font-semibold">What would help?</h2><textarea value={draft.requestedSupport} onChange={(event) => setDraft((current) => ({ ...current, requestedSupport: event.target.value }))} maxLength={2000} rows={5} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Optional" /><button type="button" onClick={() => setCreateStep(5)} className="mt-4 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white">Continue</button></section> : null}

                  {createStep === 5 ? <section className="mt-6"><button type="button" onClick={() => setCreateStep(4)} className="text-sm font-black text-slate-600">Back</button><h2 className="mt-4 font-serif text-3xl font-semibold">How should Support follow up?</h2><div className="mt-5 grid grid-cols-2 gap-3">{contactOptions.map((option) => <button key={option.value} type="button" onClick={() => { setDraft((current) => ({ ...current, contactPreference: option.value })); setCreateStep(6); }} className={`rounded-2xl border p-4 text-left font-bold ${draft.contactPreference === option.value ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white"}`}>{option.label}</button>)}</div></section> : null}

                  {createStep === 6 ? <section className="mt-6"><button type="button" onClick={() => setCreateStep(5)} className="text-sm font-black text-slate-600">Back</button><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Before you send</p><h2 className="mt-2 font-serif text-3xl font-semibold">Does this sound right?</h2><div className="mt-5 grid gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">What is happening</p><p className="mt-2 whitespace-pre-wrap font-semibold">{draft.participantMessage}</p></div>{draft.requestedSupport.trim() ? <div className="rounded-2xl bg-[#f7f2ea] p-4"><p className="text-xs font-black uppercase tracking-wide text-[#9b613f]">What would help</p><p className="mt-2 whitespace-pre-wrap font-semibold">{draft.requestedSupport}</p></div> : null}<div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Follow-up</p><p className="mt-2 font-semibold">{labelContact(draft.contactPreference)}</p></div></div><div className="mt-5 flex gap-3"><button type="submit" disabled={working || !draft.participantMessage.trim()} className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-60">{working ? "Sending..." : "Send request"}</button><button type="button" onClick={() => setCreateStep(3)} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-black">Change something</button></div>{notice ? <p className="mt-4 text-sm font-semibold">{notice}</p> : null}</section> : null}
                </form>
              ) : null}

              {requests.length > 0 && !shouldShowCreate ? <button type="button" onClick={() => { resetCreateFlow(); setShowSubmitConfirmation(false); setShowCreate(true); }} className="w-full rounded-[2rem] border border-emerald-100 bg-white p-5 text-left font-black text-emerald-900 shadow-sm">+ Ask for support</button> : null}

              {historicalRequests.length > 0 ? <section className="rounded-[2rem] bg-white p-5 shadow-sm"><button type="button" aria-expanded={showHistory} onClick={() => setShowHistory((current) => !current)} className="w-full text-left font-black text-emerald-900">{showHistory ? "Hide past requests" : `Look back at past requests (${historicalRequests.length})`}</button>{showHistory ? <div className="mt-5 space-y-4">{historicalRequests.map((request) => <SupportRequestCard key={request.id} request={request} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} />)}</div> : null}</section> : null}
            </>
          ) : null}

          <details className="rounded-[2rem] border border-emerald-100 bg-white shadow-sm"><summary className="cursor-pointer list-none p-5 font-black text-emerald-900">About Support</summary><div className="border-t border-slate-100 p-5 text-sm leading-6 text-slate-600"><p>THRIVE Support helps you ask questions, understand next steps, and communicate with authorized Support reviewers.</p></div></details>
          <details className="rounded-[2rem] border border-amber-200 bg-amber-50 shadow-sm"><summary className="cursor-pointer list-none p-5 font-black text-amber-950">Emergency help</summary><div className="border-t border-amber-200 p-5 text-sm leading-6 text-amber-900"><p>Support is not an emergency service. If you need immediate emergency help, use the appropriate emergency service available to you.</p></div></details>
        </section>

        <SupportBottomNav />
      </main>
    </AuthGate>
  );
}
