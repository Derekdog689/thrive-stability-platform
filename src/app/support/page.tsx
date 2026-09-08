"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import {
  ContactPreference,
  ParticipantReplyResult,
  ParticipantSupportCategory,
  ParticipantSupportReply,
  ParticipantSupportRequest,
  ParticipantSupportResponse,
  ParticipantSupportStatusEvent,
  SupportRequestDraft,
  SupportRequestStatus,
  useParticipantSupport,
} from "./useParticipantSupport";

type SupportArea = {
  value: ParticipantSupportCategory;
  label: string;
  symbol: string;
  prompts: string[];
};

const participantAreas: SupportArea[] = [
  { value: "budget_money", label: "Money", symbol: "$", prompts: ["My Budget does not fit anymore", "I need help with a Budget area", "I want help deciding what to do next"] },
  { value: "transaction_understanding", label: "Activity", symbol: "↕", prompts: ["I do not recognize something", "I want help understanding an activity item", "I think something is categorized wrong"] },
  { value: "wellness_support", label: "Wellness", symbol: "☼", prompts: ["Something changed", "I want help with a routine", "I want help choosing a small next step"] },
  { value: "goal_support", label: "Goals", symbol: "◎", prompts: ["I do not know my next step", "Something is getting in the way", "I want to break this into smaller steps"] },
  { value: "program_question", label: "THRIVE", symbol: "T", prompts: ["I have a question about THRIVE", "A step does not make sense", "I want to know what support is available"] },
  { value: "other", label: "Not sure", symbol: "?", prompts: ["I have a question", "Something changed", "I need help figuring out what to do next"] },
];

const contactOptions: Array<{ value: ContactPreference; label: string }> = [
  { value: "in_app", label: "In THRIVE" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
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
  return labels[status];
}

function labelCategory(category: ParticipantSupportCategory) {
  if (category === "appointment_paperwork") return "Appointments / paperwork";
  if (category === "technology_app") return "Technology / app";
  return participantAreas.find((area) => area.value === category)?.label ?? "Support";
}

function labelContact(value: ContactPreference | null) {
  return contactOptions.find((option) => option.value === value)?.label ?? "In THRIVE";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function SupportBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "☼" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "♡" },
  ];

  return <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[1.75rem] border border-white/60 bg-white/90 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:bottom-5"><div className="grid grid-cols-5 gap-1">{items.map((item) => <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center transition ${item.href === "/support" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"}`}><span className="text-xl font-black leading-none">{item.icon}</span><span className="mt-1 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">{item.label}</span></Link>)}</div></nav>;
}

function SupportCard({
  request,
  statusEvents,
  participantResponses,
  participantReplies,
  working,
  onWithdraw,
  onSubmitReply,
  compact = false,
}: {
  request: ParticipantSupportRequest;
  statusEvents: ParticipantSupportStatusEvent[];
  participantResponses: ParticipantSupportResponse[];
  participantReplies: ParticipantSupportReply[];
  working: boolean;
  onWithdraw: (request: ParticipantSupportRequest) => Promise<{ ok: boolean; message: string }>;
  onSubmitReply: (request: ParticipantSupportRequest, content: string) => Promise<ParticipantReplyResult>;
  compact?: boolean;
}) {
  const [replyDraft, setReplyDraft] = useState("");
  const [replyNotice, setReplyNotice] = useState("");
  const [withdrawNotice, setWithdrawNotice] = useState("");
  const entries = participantResponses.filter((item) => item.support_request_id === request.id);
  const replies = participantReplies.filter((item) => item.support_request_id === request.id);
  const events = statusEvents.filter((item) => item.support_request_id === request.id);
  const latestSupportMessage = entries.at(-1)?.content ?? null;
  const needsYou = request.status === "waiting_for_participant";

  async function sendReply() {
    const result = await onSubmitReply(request, replyDraft);
    setReplyNotice(result.message);
    if (result.ok) setReplyDraft("");
  }

  async function withdraw() {
    if (!window.confirm("Withdraw this Support request? It will stay in your history.")) return;
    const result = await onWithdraw(request);
    setWithdrawNotice(result.message);
  }

  return <article className={`overflow-hidden rounded-[1.8rem] border bg-white/78 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl ${needsYou ? "border-amber-200" : "border-white/80"}`}>
    <div className={compact ? "p-4" : "p-5 sm:p-6"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{labelCategory(request.participant_category)}</p>
          <h3 className={`mt-2 font-black leading-tight text-slate-950 ${compact ? "text-lg" : "text-2xl"}`}>{request.participant_message}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${needsYou ? "bg-amber-100 text-amber-900" : request.status === "completed" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{labelStatus(request.status)}</span>
      </div>

      {!compact ? <div className={`mt-4 rounded-[1.25rem] px-4 py-3 text-sm font-bold ${needsYou ? "bg-amber-50 text-amber-950" : "bg-emerald-50/80 text-emerald-950"}`}>
        {needsYou ? "Support needs something from you." : request.status === "submitted" ? "Support received this. Nothing is needed from you right now." : request.status === "acknowledged" ? "Support has seen this." : request.status === "in_progress" ? "Support is reviewing this." : request.status === "completed" ? "This request is resolved." : "This request is in your history."}
      </div> : null}

      {needsYou ? <section className="mt-4 rounded-[1.4rem] border border-amber-200 bg-amber-50 p-4">
        {latestSupportMessage ? <><p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">Support said</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{latestSupportMessage}</p></> : <p className="font-black text-amber-950">A response is needed.</p>}
        <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} maxLength={4000} rows={3} className="mt-3 w-full rounded-[1.2rem] border border-amber-200 bg-white px-4 py-3" placeholder="Write your response" />
        <button type="button" disabled={working || !replyDraft.trim()} onClick={() => void sendReply()} className="mt-3 w-full rounded-full bg-emerald-700 px-4 py-3 font-black text-white disabled:opacity-50">{working ? "Sending..." : "Send response"}</button>
        {replyNotice ? <p className="mt-2 text-sm font-bold text-slate-600">{replyNotice}</p> : null}
      </section> : null}

      <details className="mt-4 rounded-[1.2rem] border border-slate-200/80 bg-white/55">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-700">Details</summary>
        <div className="border-t border-slate-200/70 p-4 text-sm text-slate-600">
          <div className="grid grid-cols-2 gap-3"><div><p className="text-[10px] font-black uppercase text-slate-400">Requested</p><p className="mt-1 font-bold">{formatDate(request.created_at)}</p></div><div><p className="text-[10px] font-black uppercase text-slate-400">Follow-up</p><p className="mt-1 font-bold">{labelContact(request.contact_preference)}</p></div></div>
          {request.requested_support ? <div className="mt-4"><p className="text-[10px] font-black uppercase text-slate-400">What would help</p><p className="mt-1 leading-6">{request.requested_support}</p></div> : null}
          {entries.length || replies.length || events.length ? <div className="mt-4"><p className="text-[10px] font-black uppercase text-slate-400">History</p><p className="mt-1">{events.length} status update{events.length === 1 ? "" : "s"} · {entries.length} Support message{entries.length === 1 ? "" : "s"} · {replies.length} repl{replies.length === 1 ? "y" : "ies"}</p></div> : null}
          {request.status === "submitted" ? <button type="button" disabled={working} onClick={() => void withdraw()} className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600">Withdraw request</button> : null}
          {withdrawNotice ? <p className="mt-2 text-sm font-bold">{withdrawNotice}</p> : null}
        </div>
      </details>
    </div>
  </article>;
}

export default function SupportPage() {
  const { participantName, requests, statusEvents, participantResponses, participantReplies, loading, working, errorMessage, canCreate, createRequest, withdrawRequest, submitParticipantReply } = useParticipantSupport();
  const [draft, setDraft] = useState<SupportRequestDraft>(emptyDraft);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const openRequests = useMemo(() => requests.filter((request) => !["completed", "withdrawn", "archived"].includes(request.status)), [requests]);
  const pastRequests = useMemo(() => requests.filter((request) => ["completed", "withdrawn", "archived"].includes(request.status)), [requests]);
  const priorityRequest = useMemo(() => openRequests.find((request) => request.status === "waiting_for_participant") ?? openRequests[0] ?? null, [openRequests]);
  const otherOpenRequests = useMemo(() => priorityRequest ? openRequests.filter((request) => request.id !== priorityRequest.id) : openRequests, [openRequests, priorityRequest]);
  const selectedArea = participantAreas.find((area) => area.value === draft.participantCategory) ?? participantAreas.at(-1)!;

  function beginCreate() {
    setDraft(emptyDraft);
    setStep(1);
    setNotice("");
    setShowCreate(true);
  }

  function chooseArea(area: SupportArea) {
    setDraft((current) => ({ ...current, participantCategory: area.value, requestedSupport: "" }));
    setStep(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const result = await createRequest(draft);
    setNotice(result.message);
    if (!result.ok) return;
    setDraft(emptyDraft);
    setStep(1);
    setShowCreate(false);
  }

  return <AuthGate><main className="thrive-today-bg min-h-screen pb-36 text-slate-950"><section className="mx-auto max-w-5xl space-y-4 px-3 pt-3 sm:px-6 sm:pt-6">
    <header className="thrive-ambient relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/32 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:p-7">
      <div className="thrive-orb thrive-orb-one" /><div className="thrive-orb thrive-orb-two" />
      <div className="relative z-10 flex items-center justify-between gap-3"><Link href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/72 text-base font-black text-emerald-950">T</div><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800">DSS Enterprises</p><p className="text-xs font-black text-emerald-950">THRIVE</p></div></Link><span className="rounded-full border border-white/80 bg-white/58 px-3 py-2 text-xs font-black text-emerald-900">♡ Support</span></div>
      <div className="relative z-10 mt-8 max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Support</p><h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-emerald-950 sm:text-6xl">What would help, {participantName}?</h1><p className="mt-3 text-base font-semibold text-slate-600">Ask once. THRIVE keeps the thread together.</p></div>
    </header>

    {loading ? <section className="rounded-[1.8rem] bg-white/75 p-6">Loading Support.</section> : null}
    {errorMessage ? <section className="rounded-[1.8rem] border border-rose-200 bg-rose-50 p-5"><p className="font-black">Support could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}
    {!loading && !errorMessage && !canCreate ? <section className="rounded-[1.8rem] bg-white/75 p-6"><h2 className="text-xl font-black">Support is not connected yet</h2></section> : null}

    {!loading && !errorMessage && canCreate ? <>
      {priorityRequest ? <section><div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Right now</p><h2 className="mt-1 text-2xl font-black">Your Support</h2></div>{priorityRequest.status === "waiting_for_participant" ? <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-900">Needs you</span> : null}</div><SupportCard request={priorityRequest} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} /></section> : <section className="rounded-[1.8rem] border border-white/80 bg-white/70 p-5 shadow-sm"><p className="font-black">No open Support requests</p><p className="mt-1 text-sm font-semibold text-slate-500">Nothing is waiting here right now.</p></section>}

      {!showCreate ? <button type="button" onClick={beginCreate} className="w-full rounded-[1.5rem] bg-emerald-700 px-5 py-4 text-left text-lg font-black text-white shadow-[0_12px_28px_rgba(4,120,87,0.18)]">+ Ask for support</button> : null}

      {showCreate ? <form onSubmit={submit} className="rounded-[1.8rem] border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl sm:p-7">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Ask for support</p><div className="mt-2 flex gap-1.5"><span className="h-1.5 w-10 rounded-full bg-emerald-600" /><span className={`h-1.5 w-10 rounded-full ${step === 2 ? "bg-emerald-600" : "bg-slate-200"}`} /></div></div><button type="button" onClick={() => setShowCreate(false)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black">Close</button></div>

        {step === 1 ? <section className="mt-6"><h2 className="text-3xl font-black">What is this about?</h2><div className="mt-4 grid grid-cols-2 gap-3">{participantAreas.map((area) => <button key={area.value} type="button" onClick={() => chooseArea(area)} className="flex min-h-24 flex-col items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-3 py-4 text-center transition active:scale-[0.98]"><span className="text-2xl font-black text-emerald-800">{area.symbol}</span><span className="mt-2 font-black">{area.label}</span></button>)}</div></section> : null}

        {step === 2 ? <section className="mt-6"><button type="button" onClick={() => setStep(1)} className="text-sm font-black text-slate-600">← Back</button><p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{selectedArea.label}</p><h2 className="mt-1 text-3xl font-black">Tell Support what is happening.</h2><div className="mt-4 flex flex-wrap gap-2">{selectedArea.prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setDraft((current) => ({ ...current, requestedSupport: prompt }))} className={`rounded-full border px-3 py-2 text-xs font-black ${draft.requestedSupport === prompt ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{prompt}</button>)}</div><textarea value={draft.participantMessage} onChange={(event) => setDraft((current) => ({ ...current, participantMessage: event.target.value }))} maxLength={4000} rows={5} autoFocus className="mt-4 w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3" placeholder="What is happening?" />
          <details className="mt-3 rounded-[1.2rem] border border-slate-200 bg-white/60"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-700">Follow-up preference · {labelContact(draft.contactPreference)}</summary><div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-3">{contactOptions.map((option) => <button key={option.value} type="button" onClick={() => setDraft((current) => ({ ...current, contactPreference: option.value }))} className={`rounded-xl border px-3 py-2.5 text-sm font-black ${draft.contactPreference === option.value ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"}`}>{option.label}</button>)}</div></details>
          <button type="submit" disabled={working || !draft.participantMessage.trim()} className="mt-4 w-full rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white disabled:opacity-50">{working ? "Sending..." : "Send to Support"}</button>{notice ? <p className="mt-3 text-sm font-bold text-slate-600">{notice}</p> : null}</section> : null}
      </form> : null}

      {otherOpenRequests.length > 0 ? <section className="rounded-[1.5rem] border border-white/80 bg-white/55 p-4"><button type="button" onClick={() => setShowAllOpen((current) => !current)} className="flex w-full items-center justify-between font-black text-slate-700"><span>{otherOpenRequests.length} other open request{otherOpenRequests.length === 1 ? "" : "s"}</span><span>{showAllOpen ? "−" : "+"}</span></button>{showAllOpen ? <div className="mt-4 space-y-3">{otherOpenRequests.map((request) => <SupportCard key={request.id} request={request} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} compact />)}</div> : null}</section> : null}

      {pastRequests.length > 0 ? <section className="rounded-[1.5rem] border border-white/80 bg-white/45 p-4"><button type="button" onClick={() => setShowHistory((current) => !current)} className="flex w-full items-center justify-between font-black text-slate-600"><span>Past requests · {pastRequests.length}</span><span>{showHistory ? "−" : "+"}</span></button>{showHistory ? <div className="mt-4 space-y-3">{pastRequests.map((request) => <SupportCard key={request.id} request={request} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} compact />)}</div> : null}</section> : null}
    </> : null}

    <details className="rounded-[1.4rem] border border-amber-200 bg-amber-50/75"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-amber-950">Emergency help</summary><div className="border-t border-amber-200 px-4 py-3 text-sm leading-6 text-amber-900">THRIVE Support is not an emergency service. Use the appropriate emergency service available to you for immediate help.</div></details>
  </section><SupportBottomNav /></main></AuthGate>;
}
