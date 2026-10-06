"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import {
  formatDate as formatMoneyDate,
  formatMoney,
  useParticipantFinancial,
} from "../useParticipantFinancial";
import {
  buildMoneyPeriodSummary,
  MoneyPeriodSummary,
} from "../money/buildMoneyPeriodSummary";
import {
  AssistedBudgetSupportLink,
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

type IconName = "today" | "wellness" | "goal" | "money" | "support";

function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "today") return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-5.5h5V20" /></svg>;
  if (name === "wellness") return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (name === "goal") return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="m15 9 5-5M16.5 4H20v3.5" /></svg>;
  if (name === "money") return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h.01M17 14h.01" /><circle cx="12" cy="12" r="2.5" /></svg>;
  return <svg {...common}><path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2 5.6.2 7.6L12 21l8.6-7.6c2.2-2 2.3-5.5.2-7.6Z" /></svg>;
}

type SupportArea = {
  value: ParticipantSupportCategory;
  label: string;
  symbol: string;
  prompts: string[];
};

type GoalSupportContext = {
  title: string;
  nextStep: string;
  why: string | null;
};

type WellnessSupportContext = {
  overall: string | null;
  facts: string[];
  nextStep: string | null;
  question: string | null;
};

type MoneySupportContext = {
  intent: "starter-plan" | "review-plan";
  budgetPeriodId: string | null;
};

function readableSignal(label: string, value: string) {
  return `${label}: ${value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())}`;
}

function wellnessNextStepLabel(value: string | null) {
  if (!value) return null;
  const labels: Record<string, string> = {
    contact_supportive_person: "Talk to someone supportive",
    ask_for_help: "Ask THRIVE for help",
    choose_one_task: "Do one useful thing",
    review_today_plan: "Keep one thing steady",
    take_a_break: "Take a break",
    food_water_rest: "Handle a basic need",
    other: "Something else",
  };
  return labels[value] ?? value.replaceAll("_", " ");
}

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
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: "/living-signal/today", label: "Today", icon: "today" },
    { href: "/wellness", label: "Wellness", icon: "wellness" },
    { href: "/goals", label: "Goals", icon: "goal" },
    { href: "/budget", label: "Money", icon: "money" },
    { href: "/support", label: "Support", icon: "support" },
  ];

  return <nav className="support-bottom-nav fixed left-1/2 z-50 grid w-[calc(100%-20px)] max-w-[660px] -translate-x-1/2 grid-cols-5 gap-[3px] rounded-[24px] border border-white/75 bg-[#fbf9f3]/90 p-[6px] shadow-[0_20px_62px_rgba(10,31,39,0.18)] backdrop-blur-[26px] [bottom:calc(6px+env(safe-area-inset-bottom,0px))]">{items.map((item) => <Link key={item.href} href={item.href} className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-center text-[10px] font-black uppercase text-[#536174] no-underline transition active:scale-95 ${item.href === "/support" ? "bg-[linear-gradient(180deg,#bf745f,#a95349)] text-white shadow-[0_9px_24px_rgba(169,83,73,0.22)]" : "hover:bg-white/70 hover:text-[#173644]"}`}><Icon name={item.icon} className="h-5 w-5" /><span className="truncate">{item.label}</span></Link>)}</nav>;
}

function SupportCard({ request, statusEvents, participantResponses, participantReplies, assistedBudgetLink, moneySummary, working, onWithdraw, onSubmitReply, compact = false, focused = false }: {
  request: ParticipantSupportRequest;
  statusEvents: ParticipantSupportStatusEvent[];
  participantResponses: ParticipantSupportResponse[];
  participantReplies: ParticipantSupportReply[];
  assistedBudgetLink?: AssistedBudgetSupportLink | null;
  moneySummary?: MoneyPeriodSummary | null;
  working: boolean;
  onWithdraw: (request: ParticipantSupportRequest) => Promise<{ ok: boolean; message: string }>;
  onSubmitReply: (request: ParticipantSupportRequest, content: string) => Promise<ParticipantReplyResult>;
  compact?: boolean;
  focused?: boolean;
}) {
  const [replyDraft, setReplyDraft] = useState("");
  const [replyNotice, setReplyNotice] = useState("");
  const [withdrawNotice, setWithdrawNotice] = useState("");
  const [showReply, setShowReply] = useState(false);
  const entries = participantResponses.filter((item) => item.support_request_id === request.id);
  const replies = participantReplies.filter((item) => item.support_request_id === request.id);
  const events = statusEvents.filter((item) => item.support_request_id === request.id);
  const latestSupportMessage = entries.at(-1)?.content ?? null;
  const assistedPlanNeedsReview =
    request.participant_category === "budget_money" &&
    request.status === "waiting_for_participant" &&
    assistedBudgetLink?.budget_status === "draft";
  const assistedPlanAlreadyActive =
    request.participant_category === "budget_money" &&
    assistedBudgetLink?.budget_status === "active";
  const needsYou = request.status === "waiting_for_participant" && !assistedPlanAlreadyActive;
  const statusLabel = assistedPlanNeedsReview
    ? "Plan ready"
    : assistedPlanAlreadyActive
      ? "Plan active"
      : labelStatus(request.status);

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

  return <article id={`support-request-${request.id}`} className={`support-thread-card scroll-mt-24 overflow-hidden rounded-[1.8rem] border bg-white/72 shadow-[0_18px_48px_rgba(70,40,43,0.08)] backdrop-blur-xl ${focused ? "border-rose-300 ring-4 ring-rose-100/70" : needsYou ? "border-amber-200" : "border-white/72"}`}>
    <div className={compact ? "p-4" : "p-5 sm:p-6"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{labelCategory(request.participant_category)}</p><h3 className={`mt-2 font-black leading-tight text-slate-950 ${compact ? "text-lg" : "text-2xl"}`}>{request.participant_message}</h3></div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${assistedPlanNeedsReview ? "bg-sky-100 text-sky-900" : assistedPlanAlreadyActive ? "bg-emerald-100 text-emerald-900" : needsYou ? "bg-amber-100 text-amber-900" : request.status === "completed" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{statusLabel}</span>
      </div>

      {!compact ? <div className={`mt-4 rounded-[1.25rem] px-4 py-3 text-sm font-bold ${assistedPlanNeedsReview ? "bg-sky-50 text-sky-950" : needsYou ? "bg-amber-50 text-amber-950" : "bg-emerald-50/80 text-emerald-950"}`}>{assistedPlanNeedsReview ? "Your starter Money plan is ready to review." : assistedPlanAlreadyActive ? "Your starter Money plan is active." : needsYou ? "Support needs something from you." : request.status === "submitted" ? "Support has your request. You do not need to repeat it." : request.status === "acknowledged" ? "Support has seen this." : request.status === "in_progress" ? "Support is reviewing this." : request.status === "completed" ? "This request is resolved." : "This request is in your history."}</div> : null}

      {assistedPlanNeedsReview && assistedBudgetLink ? <section className="mt-4 rounded-[1.4rem] border border-sky-200 bg-sky-50 p-4">
        {latestSupportMessage ? <><p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">Support prepared</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{latestSupportMessage}</p></> : null}
        <p className="mt-3 text-sm font-semibold leading-6 text-sky-950">Review the plan in Money. Change anything you want before you use it.</p>
        <Link href={"/budget?review=" + encodeURIComponent(assistedBudgetLink.budget_period_id)} className="mt-4 flex w-full items-center justify-center rounded-full bg-emerald-700 px-4 py-3 font-black text-white">Review starter plan</Link>
        <button type="button" onClick={() => setShowReply((current) => !current)} className="mt-3 w-full rounded-full border border-sky-200 bg-white px-4 py-3 font-black text-sky-900">{showReply ? "Hide message" : "Message Support"}</button>
        {showReply ? <div className="mt-3"><textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} maxLength={4000} rows={3} className="w-full rounded-[1.2rem] border border-sky-200 bg-white px-4 py-3" placeholder="Write a message to Support" /><button type="button" disabled={working || !replyDraft.trim()} onClick={() => void sendReply()} className="mt-3 w-full rounded-full bg-sky-700 px-4 py-3 font-black text-white disabled:opacity-50">{working ? "Sending..." : "Send message"}</button></div> : null}
        {replyNotice ? <p className="mt-2 text-sm font-bold text-slate-600">{replyNotice}</p> : null}
      </section> : needsYou ? <section className="mt-4 rounded-[1.4rem] border border-amber-200 bg-amber-50 p-4">
        {latestSupportMessage ? <><p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">Support said</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{latestSupportMessage}</p></> : <p className="font-black text-amber-950">A response is needed.</p>}
        <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} maxLength={4000} rows={3} className="mt-3 w-full rounded-[1.2rem] border border-amber-200 bg-white px-4 py-3" placeholder="Write your response" />
        <button type="button" disabled={working || !replyDraft.trim()} onClick={() => void sendReply()} className="mt-3 w-full rounded-full bg-emerald-700 px-4 py-3 font-black text-white disabled:opacity-50">{working ? "Sending..." : "Send response"}</button>
        {replyNotice ? <p className="mt-2 text-sm font-bold text-slate-600">{replyNotice}</p> : null}
      </section> : null}

      {moneySummary && assistedBudgetLink?.budget_status === "completed" ? <section className="mt-4 rounded-[1.4rem] border border-emerald-200 bg-emerald-50/75 p-4">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Continuing from Money</p><p className="mt-1 text-lg font-black text-emerald-950">{formatMoneyDate(moneySummary.periodStart)} to {formatMoneyDate(moneySummary.periodEnd)}</p></div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-emerald-800">Completed</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/90 p-3"><p className="text-[10px] font-black uppercase text-slate-400">Available</p><p className="mt-1 text-lg font-black text-slate-900">{formatMoney(moneySummary.available)}</p></div>
          <div className="rounded-2xl bg-white/90 p-3"><p className="text-[10px] font-black uppercase text-slate-400">Planned</p><p className="mt-1 text-lg font-black text-slate-900">{formatMoney(moneySummary.planned)}</p></div>
          <div className="rounded-2xl bg-white/90 p-3"><p className="text-[10px] font-black uppercase text-slate-400">Recorded out</p><p className="mt-1 text-lg font-black text-slate-900">{formatMoney(moneySummary.recordedOut)}</p></div>
          <div className="rounded-2xl bg-white/90 p-3"><p className="text-[10px] font-black uppercase text-slate-400">Activity</p><p className="mt-1 text-lg font-black text-slate-900">{moneySummary.activityCount}</p></div>
        </div>
        <details className="mt-3 rounded-2xl border border-emerald-100 bg-white/75">
          <summary className="cursor-pointer list-none px-3 py-3 text-sm font-black text-emerald-900">More plan details</summary>
          <div className="border-t border-emerald-100 px-3 py-3 text-sm font-semibold leading-6 text-slate-600">
            <p>{formatMoney(moneySummary.unassigned)} was not assigned to categories.</p>
            <p className="mt-1">{formatMoney(moneySummary.remainingInCategories)} remained inside planned categories.</p>
            <p className="mt-1">{moneySummary.withinPlanLines.length} categor{moneySummary.withinPlanLines.length === 1 ? "y was" : "ies were"} within the amount{moneySummary.withinPlanLines.length === 1 ? "" : "s"} set.</p>
            <p className="mt-1">{moneySummary.overPlanLines.length} categor{moneySummary.overPlanLines.length === 1 ? "y was" : "ies were"} above the amount{moneySummary.overPlanLines.length === 1 ? "" : "s"} set.</p>
            {moneySummary.recordedOutDelta !== null ? <p className="mt-2">Compared with the immediately prior completed plan, recorded money out was {formatMoney(Math.abs(moneySummary.recordedOutDelta))} {moneySummary.recordedOutDelta > 0 ? "higher" : moneySummary.recordedOutDelta < 0 ? "lower" : "the same"}.</p> : null}
            {moneySummary.plannedDelta !== null ? <p className="mt-1">Planned category amounts were {formatMoney(Math.abs(moneySummary.plannedDelta))} {moneySummary.plannedDelta > 0 ? "higher" : moneySummary.plannedDelta < 0 ? "lower" : "the same"} than the immediately prior completed plan.</p> : null}
          </div>
        </details>
        <Link href={"/budget?review=" + encodeURIComponent(assistedBudgetLink.budget_period_id)} className="mt-3 inline-flex font-black text-emerald-800 underline decoration-emerald-200 underline-offset-4">Open this Money plan</Link>
      </section> : null}

      <details className="mt-4 rounded-[1.2rem] border border-slate-200/80 bg-white/55">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-700">Details</summary>
        <div className="border-t border-slate-200/70 p-4 text-sm text-slate-600">
          <div className="grid grid-cols-2 gap-3"><div><p className="text-[10px] font-black uppercase text-slate-400">Requested</p><p className="mt-1 font-bold">{formatDate(request.created_at)}</p></div><div><p className="text-[10px] font-black uppercase text-slate-400">Follow-up</p><p className="mt-1 font-bold">{labelContact(request.contact_preference)}</p></div></div>
          {request.requested_support ? <div className="mt-4"><p className="text-[10px] font-black uppercase text-slate-400">What would help</p><p className="mt-1 leading-6">{request.requested_support}</p></div> : null}
          {assistedBudgetLink?.budget_status === "completed" ? <div className="mt-4"><p className="text-[10px] font-black uppercase text-slate-400">Money context</p><Link href={"/budget?review=" + encodeURIComponent(assistedBudgetLink.budget_period_id)} className="mt-1 inline-flex font-black text-emerald-800 underline decoration-emerald-200 underline-offset-4">Completed plan attached · Open plan</Link></div> : null}
          {entries.length || replies.length || events.length ? <div className="mt-4"><p className="text-[10px] font-black uppercase text-slate-400">History</p><p className="mt-1">{events.length} status update{events.length === 1 ? "" : "s"} · {entries.length} Support message{entries.length === 1 ? "" : "s"} · {replies.length} repl{replies.length === 1 ? "y" : "ies"}</p></div> : null}
          {request.status === "submitted" ? <button type="button" disabled={working} onClick={() => void withdraw()} className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600">Withdraw request</button> : null}
          {withdrawNotice ? <p className="mt-2 text-sm font-bold">{withdrawNotice}</p> : null}
        </div>
      </details>
    </div>
  </article>;
}

export default function SupportPage() {
  const { participantName, requests, statusEvents, participantResponses, participantReplies, assistedBudgetLinks, loading, working, errorMessage, canCreate, createRequest, withdrawRequest, submitParticipantReply } = useParticipantSupport();
  const {
    budgetPeriods,
    budgetLines,
    financialActivity,
    financialActivityAllocations,
    financialActivityPeriodLinks,
  } = useParticipantFinancial();
  const [draft, setDraft] = useState<SupportRequestDraft>(emptyDraft);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [goalContext, setGoalContext] = useState<GoalSupportContext | null>(null);
  const [wellnessContext, setWellnessContext] = useState<WellnessSupportContext | null>(null);
  const [moneyContext, setMoneyContext] = useState<MoneySupportContext | null>(null);
  const [focusedRequestId, setFocusedRequestId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("from");
    const requestId = params.get("request")?.trim() ?? "";
    if (requestId) setFocusedRequestId(requestId);

    if (source === "money") {
      const requestedIntent = params.get("intent")?.trim() ?? "";
      const intent: MoneySupportContext["intent"] =
        requestedIntent === "review-plan" ? "review-plan" : "starter-plan";
      const budgetPeriodId =
        intent === "review-plan" ? params.get("budgetPeriod")?.trim() || null : null;

      setMoneyContext({ intent, budgetPeriodId });
      setGoalContext(null);
      setWellnessContext(null);
      setDraft({
        participantCategory: "budget_money",
        participantMessage:
          intent === "review-plan"
            ? "I’d like help talking through this Money plan."
            : "I’d like help building a starter Money plan.",
        requestedSupport:
          intent === "review-plan"
            ? "Help me understand what I want to carry forward, change, or ask about from this plan."
            : "Help me build a starter plan I can review before I use it.",
        contactPreference: "in_app",
      });
      setStep(2);
      setShowCreate(true);
      return;
    }

    if (source === "goal") {
      const title = params.get("goalTitle")?.trim() ?? "";
      const nextStep = params.get("goalNext")?.trim() ?? "";
      const why = params.get("goalWhy")?.trim() || null;
      if (!title || !nextStep) return;

      const context: GoalSupportContext = { title, nextStep, why };
      const lines = [
        `Goal: ${title}`,
        `Current next step: ${nextStep}`,
        why ? `Why it matters: ${why}` : null,
      ].filter(Boolean).join("\n\n");

      setGoalContext(context);
      setWellnessContext(null);
      setDraft({
        participantCategory: "goal_support",
        participantMessage: lines,
        requestedSupport: "",
        contactPreference: "in_app",
      });
      setStep(2);
      setShowCreate(true);
      return;
    }

    if (source !== "wellness") return;

    const overall = params.get("overall")?.trim() || null;
    const nextStep = params.get("nextStep")?.trim() || null;
    const question = params.get("question")?.trim() || null;
    const factPairs: Array<[string, string | null]> = [
      ["Stress", params.get("stress")],
      ["Sleep", params.get("sleep")],
      ["Energy", params.get("energy")],
      ["Confidence", params.get("confidence")],
      ["Routine", params.get("routine")],
      ["Recovery support", params.get("recoverySupport")],
      ["Support", params.get("supportNeeded")],
    ];
    const facts = factPairs
      .filter((item): item is [string, string] => Boolean(item[1]))
      .map(([label, value]) => readableSignal(label, value));

    const context: WellnessSupportContext = { overall, facts, nextStep, question };
    const fallbackMessage =
      nextStep === "contact_supportive_person"
        ? "I chose to talk to someone supportive."
        : nextStep === "ask_for_help"
          ? "I chose to ask THRIVE for help."
          : "I want help with something from my Wellness check-in.";

    setWellnessContext(context);
    setGoalContext(null);
    setDraft({
      participantCategory: "wellness_support",
      participantMessage: question ?? fallbackMessage,
      requestedSupport: "",
      contactPreference: "in_app",
    });
    setStep(2);
    setShowCreate(true);
  }, []);

  const openRequests = useMemo(() => requests.filter((request) => !["completed", "withdrawn", "archived"].includes(request.status)), [requests]);
  const pastRequests = useMemo(() => requests.filter((request) => ["completed", "withdrawn", "archived"].includes(request.status)), [requests]);
  const focusedRequest = useMemo(
    () => requests.find((request) => request.id === focusedRequestId) ?? null,
    [requests, focusedRequestId],
  );
  const focusedOpenRequest =
    focusedRequest && !["completed", "withdrawn", "archived"].includes(focusedRequest.status)
      ? focusedRequest
      : null;
  const focusedPastRequest =
    focusedRequest && ["completed", "withdrawn", "archived"].includes(focusedRequest.status)
      ? focusedRequest
      : null;
  const priorityRequest = useMemo(
    () => focusedOpenRequest ?? openRequests.find((request) => request.status === "waiting_for_participant") ?? openRequests[0] ?? null,
    [focusedOpenRequest, openRequests],
  );
  const otherOpenRequests = useMemo(() => priorityRequest ? openRequests.filter((request) => request.id !== priorityRequest.id) : openRequests, [openRequests, priorityRequest]);
  const assistedBudgetByRequestId = useMemo(
    () => new Map(assistedBudgetLinks.map((item) => [item.support_request_id, item])),
    [assistedBudgetLinks],
  );
  const moneySummaryByRequestId = useMemo(() => {
    const summaries = new Map<string, MoneyPeriodSummary>();

    for (const link of assistedBudgetLinks) {
      if (link.budget_status !== "completed") continue;
      const period = budgetPeriods.find((item) => item.id === link.budget_period_id);
      if (!period || period.status !== "completed") continue;

      summaries.set(
        link.support_request_id,
        buildMoneyPeriodSummary({
          period,
          periods: budgetPeriods,
          budgetLines,
          financialActivity,
          financialActivityAllocations,
          financialActivityPeriodLinks,
        }),
      );
    }

    return summaries;
  }, [
    assistedBudgetLinks,
    budgetPeriods,
    budgetLines,
    financialActivity,
    financialActivityAllocations,
    financialActivityPeriodLinks,
  ]);
  const priorityAssistedBudget = priorityRequest ? assistedBudgetByRequestId.get(priorityRequest.id) ?? null : null;
  const priorityNeedsParticipant =
    priorityRequest?.status === "waiting_for_participant" &&
    priorityAssistedBudget?.budget_status !== "active";
  const selectedArea = participantAreas.find((area) => area.value === draft.participantCategory) ?? participantAreas.at(-1)!;

  useEffect(() => {
    if (loading || !focusedRequestId || !focusedRequest) return;

    setShowCreate(false);
    setGoalContext(null);
    setWellnessContext(null);
    setMoneyContext(null);

    if (focusedPastRequest) setShowHistory(true);

    const moveToRequest = () => {
      const target = document.getElementById(`support-request-${focusedRequestId}`);
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 76;
      window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
    };

    const firstPass = window.setTimeout(moveToRequest, 80);
    const settlePass = window.setTimeout(moveToRequest, 420);
    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(settlePass);
    };
  }, [focusedPastRequest, focusedRequest, focusedRequestId, loading]);

  function beginCreate() { setGoalContext(null); setWellnessContext(null); setMoneyContext(null); setDraft(emptyDraft); setStep(1); setNotice(""); setShowCreate(true); }
  function closeCreate() {
    setShowCreate(false);
    setGoalContext(null);
    setWellnessContext(null);
    setMoneyContext(null);
    setDraft(emptyDraft);
    setStep(1);
    setNotice("");
    if (typeof window !== "undefined" && ["goal", "wellness", "money"].includes(new URLSearchParams(window.location.search).get("from") ?? "")) {
      window.history.replaceState({}, "", "/support");
    }
  }
  function chooseArea(area: SupportArea) { setDraft((current) => ({ ...current, participantCategory: area.value, requestedSupport: "" })); setStep(2); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const result = await createRequest(draft, {
      budgetPeriodId:
        moneyContext?.intent === "review-plan"
          ? moneyContext.budgetPeriodId
          : null,
    });
    setNotice(result.message);
    if (!result.ok) return;
    setDraft(emptyDraft);
    setStep(1);
    setShowCreate(false);
    setGoalContext(null);
    setWellnessContext(null);
    setMoneyContext(null);
    if (typeof window !== "undefined" && ["goal", "wellness", "money"].includes(new URLSearchParams(window.location.search).get("from") ?? "")) {
      window.history.replaceState({}, "", "/support");
    }
  }

  return <AuthGate><main className={`support-living-signal support-environment-v1 ${priorityNeedsParticipant ? "support-state-needs-you" : priorityRequest ? "support-state-open" : pastRequests.length > 0 ? "support-state-settled" : "support-state-clear"} relative min-h-screen overflow-x-hidden pb-36 text-[#2b2425]`}><div className="support-fixed-environment" aria-hidden="true" /><div className="support-connection-atmosphere" aria-hidden="true"><span className="support-path support-path--one" /><span className="support-path support-path--two" /><span className="support-glow support-glow--one" /><span className="support-glow support-glow--two" /></div><section className="support-scroll-content relative z-10 mx-auto max-w-5xl space-y-4 px-3 pt-3 sm:px-6 sm:pt-6">
    <header className="support-scene-header relative overflow-hidden rounded-[2rem] border border-white/36 px-4 pb-5 pt-4 shadow-[0_28px_80px_rgba(49,26,29,0.22)] sm:px-6 sm:pb-6 sm:pt-5"><div className="support-scene-shade" aria-hidden="true" /><div className="relative z-10"><div className="flex items-center justify-between gap-3"><Link href="/living-signal/today" className="flex items-center gap-2.5"><div className="wellness-brandmark" aria-hidden="true"><span className="wellness-leaf wellness-leaf--one" /><span className="wellness-leaf wellness-leaf--two" /><span className="wellness-leaf wellness-leaf--three" /></div><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ffe6dc]">DSS Enterprises</p><p className="text-sm font-black tracking-[0.04em] text-white">THRIVE</p></div></Link><span className="flex items-center gap-2 rounded-full border border-white/24 bg-[#4b2e31]/36 px-3 py-2 text-xs font-black text-white shadow-sm backdrop-blur-xl"><Icon name="support" className="h-5 w-5" />Support</span></div><div className="support-scene-copy mt-8 max-w-2xl sm:mt-12"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ffd0a8]">{priorityNeedsParticipant ? "The thread is waiting for you" : priorityRequest ? "You already opened a door" : "Help can start here"}</p><h1 className="mt-2 font-serif text-[2.65rem] font-semibold leading-[0.93] tracking-[-0.045em] text-white sm:text-6xl">{priorityNeedsParticipant ? "There is a way back in." : priorityRequest ? "You do not have to start over." : `What would help, ${participantName}?`}</h1><p className="mt-3 max-w-xl text-base font-semibold leading-6 text-white/84">{priorityNeedsParticipant ? "Support left the thread open. See what is needed, respond when you are ready, and keep the context intact." : priorityRequest ? "Your request is already carrying forward. THRIVE keeps the conversation connected instead of making you repeat it." : "Ask once. THRIVE keeps the thread together and gives you a place to return."}</p></div><div className="support-connection-ribbon mt-6"><div className="support-connection-track" aria-hidden="true"><span className="support-connection-line" /><span className={`support-connection-node support-connection-node--ask ${openRequests.length > 0 ? "is-lit" : ""}`} /><span className={`support-connection-node support-connection-node--reply ${priorityNeedsParticipant ? "is-lit is-current" : priorityRequest ? "is-lit" : ""}`} /><span className={`support-connection-node support-connection-node--resolve ${pastRequests.length > 0 ? "is-lit" : ""}`} /></div><div className="support-connection-facts"><span><strong>{openRequests.length}</strong> open</span><span><strong>{priorityNeedsParticipant ? 1 : 0}</strong> needs you</span><span><strong>{pastRequests.length}</strong> history kept</span></div></div></div></header>

    {loading ? <section className="rounded-[1.8rem] bg-white/75 p-6">Loading Support.</section> : null}
    {errorMessage ? <section className="rounded-[1.8rem] border border-rose-200 bg-rose-50 p-5"><p className="font-black">Support could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}
    {!loading && !errorMessage && !canCreate ? <section className="rounded-[1.8rem] bg-white/75 p-6"><h2 className="text-xl font-black">Support is not connected yet</h2></section> : null}

    {!loading && !errorMessage && canCreate ? <>
      {!goalContext && !wellnessContext && !moneyContext && priorityRequest ? <section className="support-current-thread"><div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Right now</p><h2 className="mt-1 text-2xl font-black">Your Support</h2></div>{priorityNeedsParticipant ? <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-900">{priorityAssistedBudget?.budget_status === "draft" ? "Plan ready" : "Needs you"}</span> : null}</div><SupportCard request={priorityRequest} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} assistedBudgetLink={priorityAssistedBudget} moneySummary={priorityRequest ? moneySummaryByRequestId.get(priorityRequest.id) ?? null : null} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} focused={priorityRequest.id === focusedRequestId} /></section> : !goalContext && !wellnessContext && !moneyContext ? <section className="support-clear-state rounded-[1.8rem] border border-white/60 bg-white/58 p-5 shadow-[0_18px_48px_rgba(70,40,43,0.08)] backdrop-blur-xl"><p className="font-black">No open Support requests</p><p className="mt-1 text-sm font-semibold text-slate-500">Nothing is waiting here right now.</p></section> : null}

      {!showCreate && !goalContext && !wellnessContext && !moneyContext ? <button type="button" onClick={beginCreate} className="w-full rounded-[1.5rem] bg-emerald-700 px-5 py-4 text-left text-lg font-black text-white shadow-[0_12px_28px_rgba(4,120,87,0.18)]">+ Ask for support</button> : null}

      {showCreate ? <form id="support-request-create" onSubmit={submit} className="support-create-surface rounded-[1.8rem] border border-white/60 bg-white/62 p-5 shadow-[0_20px_54px_rgba(70,40,43,0.10)] backdrop-blur-2xl sm:p-7">
        {moneyContext ? <section className="mb-5 rounded-[1.4rem] border border-sky-200 bg-sky-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Continuing from Money</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {moneyContext.intent === "review-plan"
              ? "You do not need to explain the plan again."
              : "You do not need to figure out the whole plan first."}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
            {moneyContext.intent === "review-plan"
              ? "Support can help you talk through the Money plan you were just looking at."
              : "Support can help prepare a starter plan for you to review. Nothing becomes active until you choose to use it."}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Review or edit the request below, then send it when you are ready.</p>
        </section> : null}
        {wellnessContext ? <section className="mb-5 rounded-[1.4rem] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Continuing from Wellness</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">You do not need to explain it again.</h2>
          {wellnessContext.question ? <div className="mt-4 rounded-[1.1rem] bg-white/90 p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">You asked</p><p className="mt-2 text-lg font-black leading-7 text-slate-950">{wellnessContext.question}</p></div> : null}
          {wellnessContext.nextStep ? <p className="mt-3 text-sm font-bold leading-6 text-slate-700">You chose: {wellnessNextStepLabel(wellnessContext.nextStep)}</p> : null}
          <details className="mt-3 rounded-[1.1rem] border border-emerald-200/80 bg-white/65">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-emerald-900">Context from Wellness</summary>
            <div className="border-t border-emerald-100 px-4 py-3 text-sm leading-6 text-slate-600">
              {wellnessContext.overall ? <p><strong>Overall:</strong> {wellnessContext.overall.replaceAll("_", " ")}</p> : null}
              {wellnessContext.facts.length > 0 ? <ul className="mt-2 space-y-1">{wellnessContext.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul> : null}
            </div>
          </details>
          <p className="mt-3 text-sm leading-6 text-slate-600">Review or edit your question below, then send it when you are ready.</p>
        </section> : null}
        {goalContext ? <section className="mb-5 rounded-[1.4rem] border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Continuing from Goals</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{goalContext.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Next: {goalContext.nextStep}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">THRIVE carried over the words already in this goal. Review or edit them before you send anything to Support.</p>
        </section> : null}
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Ask for support</p><div className="mt-2 flex gap-1.5"><span className="h-1.5 w-10 rounded-full bg-emerald-600" /><span className={`h-1.5 w-10 rounded-full ${step === 2 ? "bg-emerald-600" : "bg-slate-200"}`} /></div></div><button type="button" onClick={closeCreate} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black">Close</button></div>
        {step === 1 ? <section className="mt-6"><h2 className="text-3xl font-black">What is this about?</h2><div className="mt-4 grid grid-cols-2 gap-3">{participantAreas.map((area) => <button key={area.value} type="button" onClick={() => chooseArea(area)} className="flex min-h-24 flex-col items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-3 py-4 text-center transition active:scale-[0.98]"><span className="text-2xl font-black text-emerald-800">{area.symbol}</span><span className="mt-2 font-black">{area.label}</span></button>)}</div></section> : null}
        {step === 2 ? <section className="mt-6"><button type="button" onClick={() => setStep(1)} className="text-sm font-black text-slate-600">← Back</button><p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{selectedArea.label}</p><h2 className="mt-1 text-3xl font-black">{wellnessContext || moneyContext ? "What do you want help with?" : "Tell Support what is happening."}</h2><div className="mt-4 flex flex-wrap gap-2">{selectedArea.prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setDraft((current) => ({ ...current, requestedSupport: prompt }))} className={`rounded-full border px-3 py-2 text-xs font-black ${draft.requestedSupport === prompt ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{prompt}</button>)}</div><textarea value={draft.participantMessage} onChange={(event) => setDraft((current) => ({ ...current, participantMessage: event.target.value }))} maxLength={4000} rows={5} autoFocus className="mt-4 w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3" placeholder="What is happening?" />
          <details className="mt-3 rounded-[1.2rem] border border-slate-200 bg-white/60"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-700">Follow-up preference · {labelContact(draft.contactPreference)}</summary><div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-3">{contactOptions.map((option) => <button key={option.value} type="button" onClick={() => setDraft((current) => ({ ...current, contactPreference: option.value }))} className={`rounded-xl border px-3 py-2.5 text-sm font-black ${draft.contactPreference === option.value ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"}`}>{option.label}</button>)}</div></details>
          <button type="submit" disabled={working || !draft.participantMessage.trim()} className="mt-4 w-full rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white disabled:opacity-50">{working ? "Sending..." : "Send to Support"}</button>{notice ? <p className="mt-3 text-sm font-bold text-slate-600">{notice}</p> : null}</section> : null}
      </form> : null}

      {otherOpenRequests.length > 0 ? <section className="support-other-open rounded-[1.5rem] border border-white/60 bg-white/52 p-4 backdrop-blur-xl"><button type="button" onClick={() => setShowAllOpen((current) => !current)} className="flex w-full items-center justify-between font-black text-slate-700"><span>{otherOpenRequests.length} other open request{otherOpenRequests.length === 1 ? "" : "s"}</span><span>{showAllOpen ? "−" : "+"}</span></button>{showAllOpen ? <div className="mt-4 space-y-3">{otherOpenRequests.map((request) => <SupportCard key={request.id} request={request} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} assistedBudgetLink={assistedBudgetByRequestId.get(request.id) ?? null} moneySummary={moneySummaryByRequestId.get(request.id) ?? null} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} compact focused={request.id === focusedRequestId} />)}</div> : null}</section> : null}
      {pastRequests.length > 0 ? <section className="support-history-surface rounded-[1.5rem] border border-white/60 bg-white/46 p-4 backdrop-blur-xl"><button type="button" onClick={() => setShowHistory((current) => !current)} className="flex w-full items-center justify-between font-black text-slate-600"><span>Past requests · {pastRequests.length}</span><span>{showHistory ? "−" : "+"}</span></button>{showHistory ? <div className="mt-4 space-y-3">{pastRequests.map((request) => <SupportCard key={request.id} request={request} statusEvents={statusEvents} participantResponses={participantResponses} participantReplies={participantReplies} assistedBudgetLink={assistedBudgetByRequestId.get(request.id) ?? null} moneySummary={moneySummaryByRequestId.get(request.id) ?? null} working={working} onWithdraw={withdrawRequest} onSubmitReply={submitParticipantReply} compact={!focusedPastRequest || request.id !== focusedRequestId} focused={request.id === focusedRequestId} />)}</div> : null}</section> : null}
    </> : null}

    <Link href="/resources" className="support-resource-bridge group flex items-center justify-between rounded-[1.5rem] border border-white/60 bg-white/54 p-4 shadow-[0_16px_42px_rgba(70,40,43,0.08)] backdrop-blur-xl transition active:scale-[0.99]">
      <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Resources</p><p className="mt-1 text-lg font-black text-slate-950">Find a starting point</p><p className="mt-1 text-sm font-semibold text-slate-600">Browse available help without starting a Support request.</p></div><span className="ml-4 text-2xl font-black text-emerald-800 transition group-hover:translate-x-1">›</span>
    </Link>

    <details className="rounded-[1.4rem] border border-amber-200 bg-amber-50/75"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-amber-950">Emergency help</summary><div className="border-t border-amber-200 px-4 py-3 text-sm leading-6 text-amber-900">THRIVE Support is not an emergency service. Use the appropriate emergency service available to you for immediate help.</div></details>
  </section><SupportBottomNav /></main></AuthGate>;
}