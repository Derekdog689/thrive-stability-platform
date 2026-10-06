"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthGate from "../AuthGate";
import {
  FinancialActivity,
  FinancialActivityAllocation,
  formatDate,
  formatMoney,
  toNumber,
  useParticipantFinancial,
} from "../useParticipantFinancial";
import ActiveBudgetEditor from "../budget/ActiveBudgetEditor";
import BudgetDraftCategoryBuilder from "../budget/BudgetDraftCategoryBuilder";
import { useParticipantBudgetBuilder } from "../budget/useParticipantBudgetBuilder";
import { buildMoneyPeriodSummary } from "../money/buildMoneyPeriodSummary";
import {
  ParticipantTransactionExplanation,
  TransactionExplanationCategory,
  useParticipantTransactionExplanations,
} from "../transaction-explanations/useParticipantTransactionExplanations";

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

const contextChoices: Array<{ value: TransactionExplanationCategory; label: string }> = [
  { value: "recognized_purchase", label: "I recognize it" },
  { value: "bill_or_essential", label: "Bill / essential" },
  { value: "transfer", label: "Transfer" },
  { value: "refund_or_reversal", label: "Refund / reversal" },
  { value: "shared_expense", label: "Shared expense" },
  { value: "medical_expense", label: "Medical" },
  { value: "cash_withdrawal_context", label: "Cash withdrawal" },
  { value: "incorrect_or_unrecognized", label: "I don't recognize it" },
  { value: "other", label: "Other" },
];

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysUntil(dateKey: string) {
  const today = new Date(`${localDateKey()}T12:00:00`);
  const target = new Date(`${dateKey}T12:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function financialActivityKey(activityRecordType: string, activityId: string) {
  return `${activityRecordType}:${activityId}`;
}

function MoneyBottomNav() {
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: "/living-signal/today", label: "Today", icon: "today" },
    { href: "/wellness", label: "Wellness", icon: "wellness" },
    { href: "/goals", label: "Goals", icon: "goal" },
    { href: "/budget", label: "Money", icon: "money" },
    { href: "/support", label: "Support", icon: "support" },
  ];

  return <nav className="money-bottom-nav fixed left-1/2 z-50 grid w-[calc(100%-20px)] max-w-[660px] -translate-x-1/2 grid-cols-5 gap-[3px] rounded-[24px] border border-white/75 bg-[#fbf9f3]/90 p-[6px] shadow-[0_20px_62px_rgba(10,31,39,0.18)] backdrop-blur-[26px] [bottom:calc(6px+env(safe-area-inset-bottom,0px))]">{items.map((item) => <Link key={item.href} href={item.href} className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-center text-[10px] font-black uppercase text-[#536174] no-underline transition active:scale-95 ${item.href === "/budget" ? "bg-[linear-gradient(180deg,#168f85,#0d756f)] text-white shadow-[0_9px_24px_rgba(9,126,111,0.20)]" : "hover:bg-white/70 hover:text-[#173644]"}`}><Icon name={item.icon} className="h-5 w-5" /><span className="truncate">{item.label}</span></Link>)}</nav>;
}

function ActivityCard({
  activity,
  allocations,
  budgetLines,
  explanation,
  canWriteContext,
  canCategorize,
  canLinkToPlan,
  onCreateContext,
  onUpdateContext,
  onAllocate,
  onUpdateManual,
  onArchiveManual,
  onLinkToPlan,
}: {
  activity: FinancialActivity;
  allocations: FinancialActivityAllocation[];
  budgetLines: any[];
  explanation: ParticipantTransactionExplanation | undefined;
  canWriteContext: boolean;
  canCategorize: boolean;
  canLinkToPlan: boolean;
  onCreateContext: (transactionId: string, category: TransactionExplanationCategory, note: string) => Promise<{ ok: boolean; message: string }>;
  onUpdateContext: (explanation: ParticipantTransactionExplanation, category: TransactionExplanationCategory, note: string) => Promise<{ ok: boolean; message: string }>;
  onAllocate: (activity: FinancialActivity, budgetLineId: string, amount: number) => Promise<{ ok: boolean; message: string }>;
  onUpdateManual: (activity: FinancialActivity, date: string, direction: "inflow" | "outflow", amount: number, description: string) => Promise<{ ok: boolean; message: string }>;
  onArchiveManual: (activity: FinancialActivity) => Promise<{ ok: boolean; message: string }>;
  onLinkToPlan: (activity: FinancialActivity) => Promise<{ ok: boolean; message: string }>;
}) {
  const [showContext, setShowContext] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [category, setCategory] = useState<TransactionExplanationCategory>(explanation?.explanation_category ?? "recognized_purchase");
  const [note, setNote] = useState(explanation?.explanation_text ?? "");
  const [editDate, setEditDate] = useState(activity.activity_date);
  const [editDirection, setEditDirection] = useState<"inflow" | "outflow">(activity.activity_direction === "inflow" ? "inflow" : "outflow");
  const [editAmount, setEditAmount] = useState(String(Math.abs(toNumber(activity.signed_amount))));
  const [editDescription, setEditDescription] = useState(activity.description);
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);

  const activeAllocations = allocations.filter((item) => item.status === "active");
  const assigned = activeAllocations.reduce((sum, item) => sum + toNumber(item.allocated_amount), 0);
  const total = Math.abs(toNumber(activity.signed_amount));
  const unassigned = Math.max(total - assigned, 0);
  const isImported = activity.activity_record_type === "imported";
  const isOutflow = activity.activity_direction === "outflow";

  async function saveContext() {
    if (!isImported) return;
    setWorking(true);
    setNotice("");
    const result = explanation && explanation.status === "draft"
      ? await onUpdateContext(explanation, category, note)
      : await onCreateContext(activity.activity_id, category, note);
    setNotice(result.message);
    if (result.ok) setShowContext(false);
    setWorking(false);
  }

  async function categorize(line: any) {
    if (!canCategorize || unassigned <= 0) return;
    setWorking(true);
    setNotice("");
    const result = await onAllocate(activity, line.id, unassigned);
    setNotice(result.message);
    if (result.ok) setShowPlan(false);
    setWorking(false);
  }

  async function saveManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(editAmount);
    if (!editDate || !Number.isFinite(numericAmount) || numericAmount <= 0 || !editDescription.trim()) {
      setNotice("Add a date, amount, and short description.");
      return;
    }
    setWorking(true);
    const result = await onUpdateManual(activity, editDate, editDirection, numericAmount, editDescription.trim());
    setNotice(result.message);
    if (result.ok) setShowEdit(false);
    setWorking(false);
  }

  async function removeManual() {
    if (!window.confirm("Remove this entry from current activity? Its history will stay preserved.")) return;
    setWorking(true);
    const result = await onArchiveManual(activity);
    setNotice(result.message);
    setWorking(false);
  }

  async function addToPlan() {
    if (!canLinkToPlan) return;
    setWorking(true);
    setNotice("");
    const result = await onLinkToPlan(activity);
    setNotice(result.message);
    setWorking(false);
  }

  return <article className="money-activity-card rounded-[1.5rem] border border-white/70 bg-white/76 p-4">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-lg font-black">{activity.description}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${isImported ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"}`}>{isImported ? "Imported" : "Added by you"}</span></div><p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(activity.activity_date)} · {activity.source_name}</p></div><div className="shrink-0 text-right"><p className={`text-lg font-black ${activity.activity_direction === "inflow" ? "text-emerald-700" : "text-slate-950"}`}>{formatMoney(Math.abs(toNumber(activity.signed_amount)))}</p><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{activity.activity_direction === "inflow" ? "Money in" : "Money out"}</p></div></div>

    {explanation && isImported ? <div className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2.5"><p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Your context</p><p className="mt-1 text-sm font-black text-emerald-950">{contextChoices.find((choice) => choice.value === explanation.explanation_category)?.label ?? "Saved context"}</p>{explanation.explanation_text ? <p className="mt-1 text-xs leading-5 text-slate-600">{explanation.explanation_text}</p> : null}</div> : null}

    {activeAllocations.length ? <div className="mt-3 flex flex-wrap gap-2">{activeAllocations.map((item) => <span key={item.allocation_id} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{item.budget_category_name} · {formatMoney(item.allocated_amount)}</span>)}</div> : null}

    <div className={`mt-3 grid gap-2 ${isOutflow || canLinkToPlan ? "grid-cols-2" : "grid-cols-1"}`}>
      {isImported ? <button type="button" disabled={!canWriteContext || working || (explanation?.status != null && explanation.status !== "draft")} onClick={() => { setShowContext((current) => !current); setShowPlan(false); setShowEdit(false); setNotice(""); }} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700 disabled:opacity-40">{explanation ? "Edit context" : "Add context"}</button> : <button type="button" disabled={working} onClick={() => { setShowEdit((current) => !current); setShowPlan(false); setNotice(""); }} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700">Edit entry</button>}
      {isOutflow ? <button type="button" disabled={working || !canCategorize || unassigned <= 0 || budgetLines.length === 0} onClick={() => { setShowPlan((current) => !current); setShowContext(false); setShowEdit(false); setNotice(""); }} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700 disabled:opacity-40">{unassigned > 0 ? "Choose category" : "Categorized"}</button> : canLinkToPlan ? <button type="button" disabled={working} onClick={() => void addToPlan()} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-black text-emerald-800 disabled:opacity-40">{working ? "Adding..." : "Add to this plan"}</button> : null}
    </div>

    {showContext ? <div className="mt-3 rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">What was this?</p><div className="mt-2 flex flex-wrap gap-2">{contextChoices.map((choice) => <button key={choice.value} type="button" onClick={() => setCategory(choice.value)} className={`rounded-full px-3 py-2 text-xs font-black ${category === choice.value ? "bg-emerald-700 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{choice.label}</button>)}</div><label className="mt-3 block text-xs font-black text-slate-500">Anything to add? <span className="font-normal">Optional</span><textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-800" /></label><button type="button" disabled={working} onClick={() => void saveContext()} className="mt-3 w-full rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Save context</button></div> : null}

    {showPlan ? <div className="mt-3 rounded-2xl bg-slate-50 p-3"><p className="text-sm font-black">Where did this go?</p><p className="mt-1 text-xs font-semibold text-slate-500">Choose the Budget category.</p><div className="mt-3 grid grid-cols-2 gap-2">{budgetLines.map((line) => <button key={line.id} type="button" disabled={working} onClick={() => void categorize(line)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-black text-slate-700 disabled:opacity-50">{line.category_name}</button>)}</div></div> : null}

    {showEdit && !isImported ? <form onSubmit={saveManual} className="mt-3 rounded-2xl bg-slate-50 p-3"><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setEditDirection("outflow")} className={`rounded-full px-3 py-2.5 text-sm font-black ${editDirection === "outflow" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>Money out</button><button type="button" onClick={() => setEditDirection("inflow")} className={`rounded-full px-3 py-2.5 text-sm font-black ${editDirection === "inflow" ? "bg-emerald-700 text-white" : "bg-white text-slate-600"}`}>Money in</button></div><input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3" /><div className="mt-3 flex items-center rounded-xl border border-slate-200 bg-white px-3"><span className="font-black text-slate-400">$</span><input type="number" min="0.01" step="0.01" inputMode="decimal" value={editAmount} onChange={(event) => setEditAmount(event.target.value)} className="w-full bg-transparent px-2 py-3 text-xl font-black outline-none" /></div><input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3" /><div className="mt-3 grid grid-cols-2 gap-2"><button type="submit" disabled={working} className="rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-black text-white">Save</button><button type="button" disabled={working} onClick={() => void removeManual()} className="rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-black text-rose-700">Remove</button></div></form> : null}

    {notice ? <p className="mt-3 text-xs font-bold text-slate-600">{notice}</p> : null}
  </article>;
}

export default function MoneyCandidatePage() {
  const {
    activeProgramId,
    budgetPeriods,
    budgetLines,
    financialActivity,
    financialActivityAllocations,
    financialActivityPeriodLinks,
    loading,
    errorMessage,
    refresh,
  } = useParticipantFinancial();
  const {
    working: budgetWorking,
    errorMessage: budgetWriteError,
    createDraft: createBudgetDraft,
    completeBudget,
  } = useParticipantBudgetBuilder();
  const {
    explanationByTransactionId,
    canWrite,
    createDraft,
    updateDraft,
  } = useParticipantTransactionExplanations();

  const [newBudgetDraft, setNewBudgetDraft] = useState({ periodStart: "", periodEnd: "", expectedIncome: "", notes: "" });
  const [budgetNotice, setBudgetNotice] = useState("");
  const [showActivity, setShowActivity] = useState(false);
  const [showAvailableActivity, setShowAvailableActivity] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityDirection, setActivityDirection] = useState<"inflow" | "outflow">("outflow");
  const [activityDate, setActivityDate] = useState("");
  const [activityAmount, setActivityAmount] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityBudgetLineId, setActivityBudgetLineId] = useState("");
  const [activityNotice, setActivityNotice] = useState("");
  const [activityWorking, setActivityWorking] = useState(false);
  const [completingExpired, setCompletingExpired] = useState(false);
  const [showPlanSetup, setShowPlanSetup] = useState(false);
  const [showOrientationHelp, setShowOrientationHelp] = useState(false);
  const [focusDraftPlan, setFocusDraftPlan] = useState(false);
  const [assistedDraft, setAssistedDraft] = useState(false);
  const [reviewBudgetPeriodId, setReviewBudgetPeriodId] = useState("");

  const reviewPeriod = reviewBudgetPeriodId
    ? budgetPeriods.find((period) => period.id === reviewBudgetPeriodId) ?? null
    : null;
  const activePeriod = reviewPeriod
    ? reviewPeriod.status === "active"
      ? reviewPeriod
      : null
    : budgetPeriods.find((period) => period.status === "active") ?? null;
  const draftPeriod = reviewPeriod
    ? reviewPeriod.status === "draft"
      ? reviewPeriod
      : null
    : budgetPeriods.find((period) => period.status === "draft") ?? null;
  const completedPeriods = budgetPeriods
    .filter((period) => period.status === "completed")
    .sort((a, b) => {
      const aKey = a.completed_at ?? a.period_end;
      const bKey = b.completed_at ?? b.period_end;
      return bKey.localeCompare(aKey);
    });
  const selectedCompletedPeriod =
    reviewPeriod?.status === "completed" ? reviewPeriod : null;
  const selectedCompletedIndex = selectedCompletedPeriod
    ? completedPeriods.findIndex((period) => period.id === selectedCompletedPeriod.id)
    : -1;
  const latestCompletedPeriod = selectedCompletedPeriod ?? completedPeriods[0] ?? null;
  const previousCompletedPeriod =
    selectedCompletedIndex >= 0
      ? completedPeriods[selectedCompletedIndex + 1] ?? null
      : completedPeriods[1] ?? null;
  const activeLines = activePeriod ? budgetLines.filter((line) => line.budget_period_id === activePeriod.id && line.is_active) : [];
  const draftLines = draftPeriod ? budgetLines.filter((line) => line.budget_period_id === draftPeriod.id && line.is_active) : [];
  const allRelatedActivityKeys = new Set([
    ...financialActivityAllocations
      .filter((item) => item.status === "active" && item.archived_at === null)
      .map((item) => financialActivityKey(item.activity_record_type, item.activity_id)),
    ...financialActivityPeriodLinks
      .filter((item) => item.status === "active" && item.archived_at === null)
      .map((item) => financialActivityKey(item.activity_record_type, item.activity_id)),
  ]);

  const activePlanActivityKeys = activePeriod ? new Set([
    ...financialActivityAllocations
      .filter((item) => item.status === "active" && item.archived_at === null && item.budget_period_id === activePeriod.id)
      .map((item) => financialActivityKey(item.activity_record_type, item.activity_id)),
    ...financialActivityPeriodLinks
      .filter((item) => item.status === "active" && item.archived_at === null && item.budget_period_id === activePeriod.id)
      .map((item) => financialActivityKey(item.activity_record_type, item.activity_id)),
  ]) : new Set<string>();

  const draftPlanActivityKeys = draftPeriod ? new Set([
    ...financialActivityAllocations
      .filter((item) => item.status === "active" && item.archived_at === null && item.budget_period_id === draftPeriod.id)
      .map((item) => financialActivityKey(item.activity_record_type, item.activity_id)),
    ...financialActivityPeriodLinks
      .filter((item) => item.status === "active" && item.archived_at === null && item.budget_period_id === draftPeriod.id)
      .map((item) => financialActivityKey(item.activity_record_type, item.activity_id)),
  ]) : new Set<string>();

  const currentActivity = activePeriod
    ? financialActivity.filter((activity) => activePlanActivityKeys.has(financialActivityKey(activity.activity_record_type, activity.activity_id)))
    : [];
  const draftActivity = draftPeriod
    ? financialActivity.filter((activity) => draftPlanActivityKeys.has(financialActivityKey(activity.activity_record_type, activity.activity_id)))
    : [];
  const availableActivity = activePeriod
    ? financialActivity.filter((activity) => {
        const key = financialActivityKey(activity.activity_record_type, activity.activity_id);
        return activity.activity_date >= activePeriod.period_start
          && activity.activity_date <= activePeriod.period_end
          && !allRelatedActivityKeys.has(key);
      })
    : [];
  const activityRows = currentActivity.slice(0, 12);
  const budgetDaysLeft = activePeriod ? daysUntil(activePeriod.period_end) : null;
  const budgetExpired = activePeriod ? activePeriod.period_end < localDateKey() : false;
  const budgetEndingSoon = activePeriod && !budgetExpired && budgetDaysLeft !== null && budgetDaysLeft >= 0 && budgetDaysLeft <= 3;

  const planned = activeLines.reduce((sum, line) => sum + toNumber(line.planned_amount), 0);
  const out = activeLines.reduce((sum, line) => sum + toNumber(line.derived_actual_amount), 0);
  const remaining = activeLines.reduce((sum, line) => sum + toNumber(line.derived_remaining_amount), 0);
  const moneyAvailable = activePeriod ? toNumber(activePeriod.expected_income) : 0;
  const unassigned = Math.max(moneyAvailable - planned, 0);
  const unspentOverall = Math.max(moneyAvailable - out, 0);
  const overPlan = Math.max(out - planned, 0);
  const usedPercent = planned > 0 ? Math.max(0, Math.min(100, Math.round((out / planned) * 100))) : 0;
  const incomeIn = currentActivity
    .filter((activity) => activity.activity_direction === "inflow")
    .reduce((sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)), 0);

  const completedSummary = latestCompletedPeriod
    ? buildMoneyPeriodSummary({
        period: latestCompletedPeriod,
        periods: budgetPeriods,
        budgetLines,
        financialActivity,
        financialActivityAllocations,
        financialActivityPeriodLinks,
      })
    : null;
  const completedAvailable = completedSummary?.available ?? 0;
  const completedPlanned = completedSummary?.planned ?? 0;
  const completedOut = completedSummary?.recordedOut ?? 0;
  const completedRemaining = completedSummary?.remainingInCategories ?? 0;
  const completedUnassigned = completedSummary?.unassigned ?? 0;
  const completedUnspentOverall = completedSummary?.unspentOverall ?? 0;
  const completedWithinPlanLines = completedSummary?.withinPlanLines ?? [];
  const completedOverPlanLines = completedSummary?.overPlanLines ?? [];
  const latestCompletedActivityCount = completedSummary?.activityCount ?? 0;
  const completedOutDelta = completedSummary?.recordedOutDelta ?? null;
  const completedPlanDelta = completedSummary?.plannedDelta ?? null;
  const orientationPeriod = activePeriod ?? draftPeriod;
  const orientationExpectedIncome = orientationPeriod ? toNumber(orientationPeriod.expected_income) : null;
  const orientationActivityCount = activePeriod ? currentActivity.length : draftPeriod ? draftActivity.length : financialActivity.length;
  const recentActivityPreview = draftPeriod ? draftActivity.slice(0, 4) : financialActivity.slice(0, 4);
  const recentExplainedCount = recentActivityPreview.filter((activity) => activity.activity_record_type === "imported" && explanationByTransactionId.get(activity.activity_id)?.status !== "archived" && explanationByTransactionId.has(activity.activity_id)).length;

  useEffect(() => {
    const reviewId = new URLSearchParams(window.location.search).get("review")?.trim() ?? "";
    if (!reviewId) return;
    setReviewBudgetPeriodId(reviewId);
  }, []);

  useEffect(() => {
    if (loading || !reviewPeriod) return;

    if (reviewPeriod.status === "draft") {
      setShowPlanSetup(true);
      setFocusDraftPlan(true);
      return;
    }

    if (reviewPeriod.status !== "completed") return;

    setShowPlanSetup(false);

    const moveToCompletedPlan = () => {
      const target = document.getElementById("completed-money-plan");
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 76;
      window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
    };

    const firstPass = window.setTimeout(moveToCompletedPlan, 80);
    const settlePass = window.setTimeout(moveToCompletedPlan, 420);

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(settlePass);
    };
  }, [loading, reviewPeriod]);

  useEffect(() => {
    if (!focusDraftPlan || !draftPeriod || !showPlanSetup || loading) return;

    const moveToStepTwo = () => {
      const target = document.getElementById("money-plan");
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 76;
      window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
    };

    const firstPass = window.setTimeout(moveToStepTwo, 80);
    const settlePass = window.setTimeout(() => {
      moveToStepTwo();
      setFocusDraftPlan(false);
    }, 420);

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(settlePass);
    };
  }, [focusDraftPlan, draftPeriod, showPlanSetup, loading]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssistedDraftState() {
      if (!draftPeriod) {
        setAssistedDraft(false);
        return;
      }

      const result = await supabase
        .from("support_request_links")
        .select("id")
        .eq("budget_period_id", draftPeriod.id)
        .is("archived_at", null)
        .limit(1);

      if (!cancelled) {
        setAssistedDraft(!result.error && (result.data?.length ?? 0) > 0);
      }
    }

    void loadAssistedDraftState();
    return () => { cancelled = true; };
  }, [draftPeriod]);

  function scrollToMoneySection(id: string) {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const state = overPlan > 0 ? { label: `${formatMoney(overPlan)} over plan`, dot: "bg-amber-500", text: "text-amber-900", panel: "bg-amber-50 border-amber-200" } : remaining === 0 && planned > 0 ? { label: "Plan fully used", dot: "bg-slate-400", text: "text-slate-700", panel: "bg-slate-50 border-slate-200" } : { label: `${formatMoney(remaining)} left in the plan`, dot: "bg-emerald-500", text: "text-emerald-900", panel: "bg-emerald-50 border-emerald-100" };

  async function handleCreateBudgetDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBudgetNotice("");
    if (!activeProgramId) { setBudgetNotice("THRIVE could not identify one active program for this plan."); return; }
    if (!newBudgetDraft.periodStart || !newBudgetDraft.periodEnd) { setBudgetNotice("Choose a start and end date."); return; }
    if (newBudgetDraft.periodStart > newBudgetDraft.periodEnd) { setBudgetNotice("The start date needs to come before the end date."); return; }
    if (!newBudgetDraft.expectedIncome.trim()) { setBudgetNotice("Enter the amount you want to plan with."); return; }
    const expectedIncome = Number(newBudgetDraft.expectedIncome);
    if (!Number.isFinite(expectedIncome) || expectedIncome < 0) { setBudgetNotice("Enter zero or more."); return; }
    const result = await createBudgetDraft({ programId: activeProgramId, periodStart: newBudgetDraft.periodStart, periodEnd: newBudgetDraft.periodEnd, expectedIncome, notes: newBudgetDraft.notes });
    setBudgetNotice(result.message);
    if (result.ok) {
      setShowPlanSetup(true);
      setFocusDraftPlan(true);
      await refresh();
    }
  }

  async function completeExpiredBudget() {
    if (!activePeriod || !budgetExpired || completingExpired) return;
    setBudgetNotice("");
    setCompletingExpired(true);
    const result = await completeBudget(activePeriod.id);
    if (!result.ok) {
      setBudgetNotice(result.message);
      setCompletingExpired(false);
      return;
    }
    await refresh();
    setBudgetNotice("Plan completed. THRIVE summarized what happened below.");
    setCompletingExpired(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createContext(transactionId: string, category: TransactionExplanationCategory, note: string) {
    const result = await createDraft(transactionId, { explanationCategory: category, explanationText: note });
    return { ok: result.ok, message: result.message };
  }

  async function updateContext(explanation: ParticipantTransactionExplanation, category: TransactionExplanationCategory, note: string) {
    const result = await updateDraft(explanation, { explanationCategory: category, explanationText: note });
    return { ok: result.ok, message: result.message };
  }

  async function allocateActivity(activity: FinancialActivity, budgetLineId: string, amount: number) {
    const { error } = await supabase.rpc("allocate_my_financial_activity_v1", {
      p_activity_record_type: activity.activity_record_type,
      p_activity_id: activity.activity_id,
      p_budget_line_id: budgetLineId,
      p_allocated_amount: amount,
    });
    if (error) return { ok: false, message: error.message };
    await refresh();
    return { ok: true, message: "Category saved." };
  }

  async function linkActivityToCurrentPlan(activity: FinancialActivity) {
    if (!activePeriod) return { ok: false, message: "There is no active Money plan to add this to." };
    if (activity.activity_direction !== "inflow") return { ok: false, message: "Money out joins a plan through a Budget category." };

    const { error } = await supabase.rpc("link_my_financial_activity_to_budget_v1", {
      p_activity_record_type: activity.activity_record_type,
      p_activity_id: activity.activity_id,
      p_budget_period_id: activePeriod.id,
    });

    if (error) return { ok: false, message: error.message };
    await refresh();
    return { ok: true, message: "Money in added to this plan." };
  }

  async function updateManualActivity(activity: FinancialActivity, date: string, direction: "inflow" | "outflow", amount: number, description: string) {
    if (activity.activity_record_type !== "manual") return { ok: false, message: "Imported records cannot be edited here." };
    const { error } = await supabase.rpc("update_my_manual_financial_activity_v1", { p_activity_id: activity.activity_id, p_activity_date: date, p_activity_direction: direction, p_amount: amount, p_description: description });
    if (error) return { ok: false, message: error.message };
    await refresh();
    return { ok: true, message: "Entry updated." };
  }

  async function archiveManualActivity(activity: FinancialActivity) {
    if (activity.activity_record_type !== "manual") return { ok: false, message: "Imported records cannot be removed here." };
    const { error } = await supabase.rpc("archive_my_manual_financial_activity_v1", { p_activity_id: activity.activity_id });
    if (error) return { ok: false, message: error.message };
    await refresh();
    return { ok: true, message: "Entry removed from current activity. History is preserved." };
  }

  async function addManualActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivityNotice("");
    if (!activeProgramId || !activePeriod) { setActivityNotice("THRIVE could not identify one active Money plan."); return; }
    const amount = Number(activityAmount);
    if (!activityDate || !Number.isFinite(amount) || amount <= 0) { setActivityNotice("Add a date and amount."); return; }
    if (activityDate < activePeriod.period_start || activityDate > activePeriod.period_end) { setActivityNotice("Choose a date inside this Money plan."); return; }
    if (activityDirection === "outflow" && !activityBudgetLineId) { setActivityNotice("Choose where the money went."); return; }
    if (activityDirection === "inflow" && !activityDescription.trim()) { setActivityNotice("Add a short source for the money in."); return; }

    const selectedLine = activeLines.find((line) => line.id === activityBudgetLineId) ?? null;
    const description = activityDirection === "outflow"
      ? activityDescription.trim() || selectedLine?.category_name || "Money out"
      : activityDescription.trim();

    setActivityWorking(true);
    const createResult = activityDirection === "inflow"
      ? await supabase.rpc("create_my_manual_inflow_for_budget_v1", {
          p_program_id: activeProgramId,
          p_budget_period_id: activePeriod.id,
          p_activity_date: activityDate,
          p_amount: amount,
          p_description: description,
        })
      : await supabase.rpc("create_my_manual_financial_activity_v1", {
          p_program_id: activeProgramId,
          p_activity_date: activityDate,
          p_activity_direction: activityDirection,
          p_amount: amount,
          p_description: description,
        });

    if (createResult.error) {
      setActivityNotice(createResult.error.message);
      setActivityWorking(false);
      return;
    }

    if (activityDirection === "outflow") {
      const allocationResult = await supabase.rpc("allocate_my_financial_activity_v1", {
        p_activity_record_type: "manual",
        p_activity_id: createResult.data as string,
        p_budget_line_id: activityBudgetLineId,
        p_allocated_amount: amount,
      });
      if (allocationResult.error) {
        await refresh();
        setActivityNotice(`Activity saved, but its category was not saved: ${allocationResult.error.message}`);
        setActivityWorking(false);
        return;
      }
    }

    setActivityDate("");
    setActivityAmount("");
    setActivityDescription("");
    setActivityBudgetLineId("");
    setActivityDirection("outflow");
    setShowAddActivity(false);
    await refresh();
    setActivityNotice(activityDirection === "outflow" ? "Money out added to this plan." : "Money in added to this plan.");
    setActivityWorking(false);
  }

  return <AuthGate><main className={`money-living-signal money-environment-v2 ${activePeriod ? "money-state-active" : draftPeriod ? "money-state-draft" : latestCompletedPeriod ? "money-state-complete" : "money-state-open"} relative min-h-screen overflow-x-hidden pb-48 text-[#102f37] [scroll-padding-bottom:9rem] sm:pb-52`}><div className="money-fixed-environment" aria-hidden="true" /><div className="money-flow-atmosphere" aria-hidden="true"><span className="money-flow-band money-flow-band--one" /><span className="money-flow-band money-flow-band--two" /><span className="money-flow-light" /></div><section className="money-scroll-content relative z-10 mx-auto max-w-5xl space-y-5 px-3 pt-3 sm:space-y-6 sm:px-6 sm:pt-6">
    <header className="money-scene-header relative overflow-hidden rounded-[2rem] border border-white/36 px-4 pb-5 pt-4 shadow-[0_28px_80px_rgba(4,31,34,0.22)] sm:px-6 sm:pb-6 sm:pt-5"><div className="money-scene-shade" aria-hidden="true" /><div className="relative z-10"><div className="flex items-center justify-between gap-3"><Link href="/living-signal/today" className="flex items-center gap-2.5"><div className="wellness-brandmark" aria-hidden="true"><span className="wellness-leaf wellness-leaf--one" /><span className="wellness-leaf wellness-leaf--two" /><span className="wellness-leaf wellness-leaf--three" /></div><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d9fff4]">DSS Enterprises</p><p className="text-sm font-black tracking-[0.04em] text-white">THRIVE</p></div></Link><span className="flex items-center gap-2 rounded-full border border-white/24 bg-[#0c3d40]/36 px-3 py-2 text-xs font-black text-white shadow-sm backdrop-blur-xl"><Icon name="money" className="h-5 w-5" />Money</span></div><div className="money-scene-copy mt-8 max-w-2xl sm:mt-12"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ffd88a]">{activePeriod ? "Your money in motion" : draftPeriod ? "Shape the next cycle" : latestCompletedPeriod ? "One cycle settled" : "Start with what is real"}</p><h1 className="mt-2 font-serif text-[2.65rem] font-semibold leading-[0.93] tracking-[-0.045em] text-white sm:text-6xl">{activePeriod ? "See what is flowing." : draftPeriod ? "Build the next flow." : latestCompletedPeriod ? "See what this cycle became." : "Give your money a direction."}</h1><p className="mt-3 max-w-xl text-base font-semibold leading-6 text-white/82">{activePeriod ? "What came in, what moved out, what is still available, and what you want to carry forward." : draftPeriod ? "A plan can change before it becomes active. Shape it until it fits." : latestCompletedPeriod ? "The numbers are information, not a grade. Keep what helps and change what does not." : "You do not need a perfect budget. Start with the money and choices in front of you."}</p></div><div className="money-cycle-ribbon mt-6"><div className="money-cycle-track" aria-hidden="true"><span className="money-cycle-arc" /><span className={`money-cycle-marker money-cycle-marker--start ${orientationExpectedIncome !== null ? "is-lit" : ""}`} /><span className={`money-cycle-marker money-cycle-marker--flow ${orientationActivityCount > 0 ? "is-lit" : ""}`} /><span className={`money-cycle-marker money-cycle-marker--settle ${latestCompletedPeriod ? "is-lit" : ""}`} /></div><div className="money-cycle-facts"><span><strong>{orientationExpectedIncome === null ? "—" : formatMoney(orientationExpectedIncome)}</strong> available</span><span><strong>{orientationActivityCount}</strong> movements</span><span><strong>{completedPeriods.length}</strong> cycles kept</span></div></div></div></header>

    {loading ? <section className="rounded-[2rem] bg-white/75 p-6 shadow-sm">Loading money.</section> : null}
    {errorMessage ? <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6"><p className="font-black">Money could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}
    {budgetNotice ? <section className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4 text-sm font-black text-emerald-950">{budgetNotice}</section> : null}

    {!loading && !errorMessage && !activePeriod ? <section className="money-orientation-surface rounded-[2rem] border border-white/58 bg-white/52 p-5 shadow-[0_20px_58px_rgba(5,53,56,0.10)] backdrop-blur-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Money right now</p>
          <h2 className="mt-2 text-4xl font-black leading-tight text-slate-950">Your money, right now.</h2>
          <p className="mt-3 max-w-2xl text-lg font-semibold leading-7 text-slate-600">Here’s what THRIVE sees. Pick what you want to do next.</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">{activePeriod ? "Active plan" : draftPeriod ? "Draft plan" : "No active plan"}</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-white/80 bg-white/82 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Plan</p>
          <p className="mt-2 text-xl font-black text-slate-950">{activePeriod ? "Active" : draftPeriod ? "Draft" : "None"}</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/82 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Income</p>
          <p className="mt-2 whitespace-nowrap text-xl font-black text-slate-950">{orientationExpectedIncome === null ? "Not set" : formatMoney(orientationExpectedIncome)}</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/82 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Activity</p>
          <p className="mt-2 text-xl font-black text-slate-950">{orientationActivityCount}</p>
        </div>
      </div>

      {draftPeriod && orientationExpectedIncome === 0 ? <div className="mt-5 rounded-[1.5rem] border border-cyan-100 bg-cyan-50/85 p-5">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-700">Draft check</p>
        <p className="mt-2 text-2xl font-black text-cyan-950">$0 expected income</p>
        <p className="mt-2 text-base font-semibold leading-7 text-cyan-900">If that’s right, keep going. If not, change it when you continue the plan.</p>
      </div> : null}

      <div className="mt-6">
        <p className="text-lg font-black text-slate-800">What do you want to do?</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => { setShowActivity(true); setShowOrientationHelp(false); scrollToMoneySection("money-activity"); }} className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-5 py-5 text-left shadow-sm">
            <span className="block text-xl font-black text-emerald-950">See what happened</span>
            <span className="mt-1 block text-base font-semibold leading-6 text-emerald-800">Review money activity.</span>
          </button>
          <button type="button" onClick={() => { setShowPlanSetup(true); setShowOrientationHelp(false); scrollToMoneySection(activePeriod ? "money-plan" : draftPeriod ? "money-plan" : "money-plan-setup"); }} className="rounded-[1.4rem] border border-sky-100 bg-sky-50 px-5 py-5 text-left shadow-sm">
            <span className="block text-xl font-black text-sky-950">{activePeriod ? "Adjust my plan" : draftPeriod ? "Continue my plan" : "Make a plan"}</span>
            <span className="mt-1 block text-base font-semibold leading-6 text-sky-800">Shape what comes next.</span>
          </button>
          <Link href="/support" className="rounded-[1.4rem] border border-violet-100 bg-violet-50 px-5 py-5 text-left shadow-sm">
            <span className="block text-xl font-black text-violet-950">Get help with money</span>
            <span className="mt-1 block text-base font-semibold leading-6 text-violet-800">Open Support.</span>
          </Link>
          <button type="button" onClick={() => setShowOrientationHelp((current) => !current)} className="rounded-full border border-slate-200 bg-white px-5 py-3.5 text-left">
            <span className="block text-base font-black text-slate-700">I’m not sure where to start</span>
          </button>
        </div>
      </div>

      {showOrientationHelp ? <div className="mt-4 rounded-[1.4rem] bg-slate-50 p-5">
        <p className="text-lg font-black text-slate-800">Start here</p>
        <p className="mt-1 text-base font-semibold leading-7 text-slate-600">{financialActivity.length > 0 ? "Look at what happened first. Then decide whether you want to plan, explain something, or ask for help." : "There’s no recorded activity yet. You can make a plan or ask for help when you’re ready."}</p>
      </div> : null}

      {!activePeriod ? <div id="money-activity" className="mt-6 scroll-mt-24 rounded-[1.5rem] bg-white/86 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{draftPeriod ? "This draft period" : "Recent activity"}</p>
            <p className="mt-1 text-2xl font-black">What happened</p>
          </div>
          <span className="text-xs font-black text-slate-400">{draftPeriod ? `${draftActivity.length} in period` : `${financialActivity.length} total`}</span>
        </div>
        {recentActivityPreview.length > 0 ? <>
          <div className="mt-4 space-y-3">{recentActivityPreview.map((activity) => <div key={`${activity.activity_record_type}-${activity.activity_id}`} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-4"><div className="min-w-0"><p className="truncate text-base font-black text-slate-800">{activity.description}</p><p className="mt-1 text-sm font-semibold text-slate-500">{formatDate(activity.activity_date)} · {activity.source_name}</p></div><div className="shrink-0 text-right"><p className="text-lg font-black text-slate-800">{formatMoney(Math.abs(toNumber(activity.signed_amount)))}</p><p className="text-xs font-black uppercase tracking-wide text-slate-500">{activity.activity_direction === "inflow" ? "Money in" : "Money out"}</p></div></div>)}</div>
          {recentExplainedCount > 0 ? <p className="mt-3 text-xs font-bold text-slate-500">{recentExplainedCount} imported item{recentExplainedCount === 1 ? "" : "s"} in this view {recentExplainedCount === 1 ? "has" : "have"} your context.</p> : null}
        </> : <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-lg font-black text-slate-800">{draftPeriod ? "No activity in this draft period yet." : "No money activity is available yet."}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{draftPeriod ? "Older activity belongs to prior periods and is not shown as part of this draft." : "Activity will appear here when it is recorded or imported."}</p>
        </div>}
      </div> : null}
    </section> : null}

    {!loading && !errorMessage && !activePeriod && !draftPeriod && latestCompletedPeriod ? <section id="completed-money-plan" className="money-completed-surface scroll-mt-24 rounded-[2rem] border border-white/58 bg-white/54 p-5 shadow-[0_24px_64px_rgba(5,53,56,0.11)] backdrop-blur-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-700">{selectedCompletedPeriod ? "Completed Money plan" : "Last completed Money plan"}</p>
          <h2 className="mt-2 text-3xl font-black text-violet-950">Here is what happened.</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-violet-900">{formatDate(latestCompletedPeriod.period_start)} to {formatDate(latestCompletedPeriod.period_end)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black text-violet-800">Completed</span>
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-white/85 p-4">
        <p className="text-sm font-black text-slate-800">The plan in plain English</p>
        <p className="mt-2 text-base font-semibold leading-7 text-slate-700">
          You had {formatMoney(completedAvailable)} available, assigned {formatMoney(completedPlanned)} to categories, and recorded {formatMoney(completedOut)} as money out.
          {completedUnassigned > 0 ? ` ${formatMoney(completedUnassigned)} was never assigned to a category.` : " All of the available money was assigned to categories."}
        </p>
        <p className="mt-2 text-base font-semibold leading-7 text-slate-700">
          {formatMoney(completedRemaining)} remained inside the categories you planned, leaving {formatMoney(completedUnspentOverall)} unspent overall based on this plan.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white/85 p-4"><p className="text-[10px] font-black uppercase text-slate-400">Available</p><p className="mt-1 text-xl font-black">{formatMoney(completedAvailable)}</p></div>
        <div className="rounded-2xl bg-white/85 p-4"><p className="text-[10px] font-black uppercase text-slate-400">Planned</p><p className="mt-1 text-xl font-black">{formatMoney(completedPlanned)}</p></div>
        <div className="rounded-2xl bg-white/85 p-4"><p className="text-[10px] font-black uppercase text-slate-400">Used</p><p className="mt-1 text-xl font-black">{formatMoney(completedOut)}</p></div>
        <div className="rounded-2xl bg-white/85 p-4"><p className="text-[10px] font-black uppercase text-slate-400">Activity</p><p className="mt-1 text-xl font-black">{latestCompletedActivityCount}</p></div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-violet-100 bg-white/75 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">THRIVE noticed</p>
        <div className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-700">
          {completedWithinPlanLines.length > 0 ? <p>{completedWithinPlanLines.length} categor{completedWithinPlanLines.length === 1 ? "y stayed" : "ies stayed"} within the amount{completedWithinPlanLines.length === 1 ? "" : "s"} you set.</p> : null}
          {completedOverPlanLines.length > 0 ? <p>{completedOverPlanLines.length} categor{completedOverPlanLines.length === 1 ? "y ended" : "ies ended"} above the amount{completedOverPlanLines.length === 1 ? "" : "s"} you set.</p> : null}
          {completedUnassigned > 0 ? <p>{formatMoney(completedUnassigned)} remained flexible because it was never assigned to a category.</p> : null}
          {completedOutDelta !== null ? <p>You recorded {formatMoney(Math.abs(completedOutDelta))} {completedOutDelta > 0 ? "more" : completedOutDelta < 0 ? "less" : "the same amount of"} money out than in your previous completed plan{completedOutDelta === 0 ? "" : "."}</p> : null}
          {completedPlanDelta !== null && completedPlanDelta !== 0 ? <p>You assigned {formatMoney(Math.abs(completedPlanDelta))} {completedPlanDelta > 0 ? "more" : "less"} to categories than in your previous completed plan.</p> : null}
          {!previousCompletedPeriod ? <p>This is the first completed plan THRIVE can use as a comparison point.</p> : null}
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-emerald-50/80 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">What do you want to carry forward?</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-emerald-950">You can reuse what worked, change the amounts, leave money flexible again, or start fresh. The numbers are information, not a grade.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => { setShowPlanSetup(true); scrollToMoneySection("money-plan-setup"); }} className="rounded-full bg-emerald-700 px-4 py-3 font-black text-white">Start the next plan</button>
          <Link href={`/support?from=money&intent=review-plan&budgetPeriod=${encodeURIComponent(latestCompletedPeriod.id)}`} className="flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-3 font-black text-emerald-900">Talk it through with Support</Link>
        </div>
      </div>
    </section> : null}

    {!loading && !errorMessage && !activePeriod && !draftPeriod ? <section id="money-plan-setup" className="money-plan-setup-surface scroll-mt-24 rounded-[2rem] border border-white/58 bg-white/54 p-5 shadow-[0_22px_60px_rgba(5,53,56,0.10)] backdrop-blur-2xl sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Step 1 · Create your plan</p><h2 className="mt-2 text-3xl font-black">Start with the money you want to plan with.</h2></div></div><p className="mt-2 text-sm font-semibold text-slate-500">Choose the dates and the amount available. Where it goes comes next.</p>{showPlanSetup ? <form onSubmit={handleCreateBudgetDraft} className="mt-5 grid gap-4"><div className="grid grid-cols-2 gap-3"><label className="text-sm font-black">Start<input type="date" value={newBudgetDraft.periodStart} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, periodStart: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 font-normal" /></label><label className="text-sm font-black">End<input type="date" value={newBudgetDraft.periodEnd} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, periodEnd: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 font-normal" /></label></div><label className="text-sm font-black">Money available<div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={newBudgetDraft.expectedIncome} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, expectedIncome: event.target.value }))} className="w-full bg-transparent px-3 py-3 text-xl font-black outline-none" /></div></label><label className="text-sm font-black">Anything to remember? <span className="font-normal text-slate-400">Optional</span><textarea rows={2} value={newBudgetDraft.notes} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, notes: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal" /></label>{budgetWriteError ? <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{budgetWriteError}</p> : null}<button type="submit" disabled={budgetWorking || !activeProgramId} className="rounded-full bg-emerald-700 px-5 py-3.5 font-black text-white disabled:opacity-50">Continue</button></form> : <button type="button" onClick={() => setShowPlanSetup(true)} className="mt-5 w-full rounded-full border border-emerald-200 bg-white px-5 py-3.5 font-black text-emerald-800">Start plan</button>}<div className="mt-5 rounded-[1.4rem] border border-sky-100 bg-sky-50/75 p-4"><p className="text-sm font-black text-sky-950">Not sure where to start?</p><p className="mt-1 text-sm font-semibold leading-6 text-sky-800">THRIVE Support can help you build a starter plan to review.</p><Link href="/support?from=money&intent=starter-plan" className="mt-3 inline-flex rounded-full border border-sky-200 bg-white px-4 py-2.5 text-sm font-black text-sky-900">Ask for help building my plan</Link></div></section> : null}

    {!loading && !errorMessage && draftPeriod ? (
      showPlanSetup ? (
        <div id="money-plan" className="scroll-mt-24">
          <BudgetDraftCategoryBuilder draftPeriod={draftPeriod} currentLines={draftLines} refresh={refresh} />
        </div>
      ) : (
        <section className="rounded-[2rem] border border-sky-100 bg-sky-50/80 p-5 shadow-sm sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">{assistedDraft ? "Starter plan ready" : "Your draft is waiting"}</p>
          <h2 className="mt-2 text-3xl font-black text-sky-950">{assistedDraft ? "Support prepared a starting point for you." : "Continue when you’re ready."}</h2>
          <p className="mt-2 text-base font-semibold leading-7 text-sky-800">{assistedDraft ? "Nothing is final. Review every amount, change anything you want, and use the plan only if it works for you." : "The plan stays here. Open it when you want to work on what needs to be covered."}</p>
          <button type="button" onClick={() => { setShowPlanSetup(true); scrollToMoneySection("money-plan"); }} className="mt-4 w-full rounded-full bg-sky-700 px-5 py-4 text-lg font-black text-white">{assistedDraft ? "Review starter plan" : "Continue plan"}</button>
          {assistedDraft ? <p className="mt-3 text-sm font-semibold leading-6 text-sky-800">You still make the final choice before this plan becomes active.</p> : null}
        </section>
      )
    ) : null}

    {!loading && !errorMessage && activePeriod ? <>
      {budgetExpired ? <section className="rounded-[2rem] border border-amber-200 bg-amber-50/90 p-5 shadow-sm sm:p-7"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">Plan ended</p><h2 className="mt-2 text-3xl font-black text-amber-950">Your Money plan ended {formatDate(activePeriod.period_end)}.</h2><p className="mt-2 text-sm font-semibold text-amber-900">Review the final numbers, complete this plan, then THRIVE will open the next-plan setup.</p><button type="button" disabled={completingExpired || budgetWorking} onClick={() => void completeExpiredBudget()} className="mt-5 w-full rounded-full bg-amber-700 px-5 py-4 text-lg font-black text-white disabled:opacity-50">{completingExpired ? "Completing plan..." : "Complete plan"}</button></section> : budgetEndingSoon ? <section className="rounded-[2rem] border border-cyan-100 bg-cyan-50/80 p-5 shadow-sm"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-700">Coming up</p><h2 className="mt-2 text-2xl font-black text-cyan-950">Your Money plan {budgetDaysLeft === 0 ? "ends today" : `ends in ${budgetDaysLeft} day${budgetDaysLeft === 1 ? "" : "s"}`}.</h2><p className="mt-2 text-sm font-semibold text-cyan-800">Nothing to do yet. THRIVE will prompt you when it is time to close this plan and start the next one.</p></section> : null}

      <section className="money-current-cycle overflow-hidden rounded-[2rem] border border-white/58 bg-white/50 shadow-[0_24px_68px_rgba(5,53,56,0.12)] backdrop-blur-2xl">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Your plan right now</p>
              <p className="mt-2 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">{formatMoney(unspentOverall)}</p>
              <p className="mt-1 text-lg font-bold text-slate-500">still unspent from {formatMoney(moneyAvailable)} available</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${budgetExpired ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}>{budgetExpired ? `Ended ${formatDate(activePeriod.period_end)}` : "Active plan"}</span>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-800">Here is how that breaks down.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Assigned to categories</p>
                <p className="mt-1 text-2xl font-black">{formatMoney(planned)}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{formatMoney(out)} recorded as used · {formatMoney(Math.max(remaining, 0))} still in those categories</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Not assigned yet</p>
                <p className="mt-1 text-2xl font-black">{formatMoney(unassigned)}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Still available, but not given a category in this plan.</p>
              </div>
            </div>
          </div>

          <div className={`mt-5 flex items-center gap-3 rounded-full border px-4 py-3 ${state.panel}`}><span className={`h-3.5 w-3.5 rounded-full ${state.dot}`} /><p className={`font-black ${state.text}`}>{state.label}</p></div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${overPlan > 0 ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${usedPercent}%` }} /></div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Available</p><p className="mt-1 whitespace-nowrap text-base font-black">{formatMoney(moneyAvailable)}</p></div>
            <div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Used</p><p className="mt-1 whitespace-nowrap text-base font-black">{formatMoney(out)}</p></div>
            <div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Money in recorded</p><p className="mt-1 whitespace-nowrap text-base font-black">{formatMoney(incomeIn)}</p></div>
          </div>
        </div>
      </section>

      {!budgetExpired ? <div id="money-plan" className="scroll-mt-24"><ActiveBudgetEditor activePeriod={activePeriod} currentLines={activeLines} refresh={refresh} /></div> : null}

      <section className="money-categories-surface rounded-[2rem] border border-white/58 bg-white/50 p-5 shadow-[0_20px_56px_rgba(5,53,56,0.09)] backdrop-blur-2xl sm:p-7"><div className="flex items-end justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Your categories</p><h2 className="mt-2 text-3xl font-black">Where the money is going</h2></div><span className="text-sm font-black text-slate-500">{activeLines.length}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{activeLines.map((line) => { const linePlan = toNumber(line.planned_amount); const lineOut = toNumber(line.derived_actual_amount); const lineLeft = toNumber(line.derived_remaining_amount); const linePercent = linePlan > 0 ? Math.max(0, Math.min(100, Math.round((lineOut / linePlan) * 100))) : 0; const lineOver = lineOut > linePlan; return <article key={line.id} className="rounded-[1.5rem] border border-slate-100 bg-white/85 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{line.category_name}</p><p className={`mt-1 text-sm font-bold ${lineOver ? "text-amber-800" : "text-slate-500"}`}>{lineOver ? `${formatMoney(lineOut - linePlan)} over` : `${formatMoney(lineLeft)} left`}</p></div><p className="shrink-0 text-sm font-black text-slate-500">{formatMoney(linePlan)}</p></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${lineOver ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${linePercent}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-1 text-center"><div><p className="text-[9px] font-black uppercase text-slate-400">Plan</p><p className="text-xs font-black">{formatMoney(linePlan)}</p></div><div><p className="text-[9px] font-black uppercase text-slate-400">Used</p><p className="text-xs font-black">{formatMoney(lineOut)}</p></div><div><p className="text-[9px] font-black uppercase text-slate-400">Left</p><p className="text-xs font-black">{formatMoney(lineLeft)}</p></div></div></article>; })}</div></section>

      <section id="money-activity" className="money-activity-surface scroll-mt-24 rounded-[2rem] border border-white/58 bg-white/50 p-5 shadow-[0_20px_56px_rgba(5,53,56,0.09)] backdrop-blur-2xl sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Money activity</p><h2 className="mt-2 text-3xl font-black">What happened</h2></div><span className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-500">{currentActivity.length}</span></div><p className="mt-2 text-sm font-semibold text-slate-500">Only activity connected to this plan is counted here. A matching date by itself does not move older activity into this plan.</p><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setShowActivity((current) => { const next = !current; if (next) setShowAvailableActivity(false); return next; })} className="rounded-full bg-emerald-700 px-4 py-3.5 text-sm font-black text-white">{showActivity ? "Close activity" : "Review activity"}</button><button type="button" onClick={() => { setShowAddActivity((current) => !current); setShowActivity(true); setActivityNotice(""); }} className="rounded-full border border-emerald-200 bg-white px-4 py-3.5 text-sm font-black text-emerald-800">+ Add activity</button></div>

        {showAddActivity ? <form onSubmit={addManualActivity} className="mt-4 rounded-[1.5rem] bg-emerald-50 p-4"><p className="text-sm font-black">Add what happened</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => { setActivityDirection("outflow"); setActivityBudgetLineId(""); }} className={`rounded-full px-3 py-3 text-sm font-black ${activityDirection === "outflow" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>Money out</button><button type="button" onClick={() => { setActivityDirection("inflow"); setActivityBudgetLineId(""); }} className={`rounded-full px-3 py-3 text-sm font-black ${activityDirection === "inflow" ? "bg-emerald-700 text-white" : "bg-white text-slate-600"}`}>Money in</button></div><input type="date" min={activePeriod.period_start} max={activePeriod.period_end} value={activityDate} onChange={(event) => setActivityDate(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" /><div className="mt-3 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="text-xl font-black text-slate-400">$</span><input type="number" min="0.01" step="0.01" inputMode="decimal" value={activityAmount} onChange={(event) => setActivityAmount(event.target.value)} className="w-full bg-transparent px-3 py-4 text-2xl font-black outline-none" /></div>

          {activityDirection === "outflow" ? <div className="mt-4"><p className="text-sm font-black">Where did it go?</p><div className="mt-2 grid grid-cols-2 gap-2">{activeLines.map((line) => <button key={line.id} type="button" onClick={() => setActivityBudgetLineId(line.id)} className={`rounded-2xl border px-3 py-3 text-left text-sm font-black ${activityBudgetLineId === line.id ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-100 bg-white text-slate-700"}`}>{line.category_name}</button>)}</div><input value={activityDescription} onChange={(event) => setActivityDescription(event.target.value)} placeholder="Anything to remember? Optional" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" /></div> : <input value={activityDescription} onChange={(event) => setActivityDescription(event.target.value)} placeholder="Where did the money come from?" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />}

          <div className="mt-3 grid grid-cols-2 gap-2"><button type="submit" disabled={activityWorking} className="rounded-full bg-emerald-700 px-4 py-3 font-black text-white disabled:opacity-50">{activityWorking ? "Adding..." : "Add"}</button><button type="button" onClick={() => setShowAddActivity(false)} className="rounded-full border border-slate-200 bg-white px-4 py-3 font-black text-slate-600">Cancel</button></div>{activityNotice ? <p className="mt-2 text-sm font-bold text-slate-600">{activityNotice}</p> : null}</form> : null}

        {showActivity ? <div className="mt-5 space-y-5">
          <section>
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">This plan</p><h3 className="mt-1 text-xl font-black text-slate-900">Activity in this Money plan</h3></div><span className="text-sm font-black text-slate-500">{currentActivity.length}</span></div>
            <div className="mt-3 space-y-3">{activityRows.length ? activityRows.map((activity) => {
              const allocations = financialActivityAllocations.filter((item) => item.activity_record_type === activity.activity_record_type && item.activity_id === activity.activity_id && item.budget_period_id === activePeriod.id);
              return <ActivityCard key={`${activity.activity_record_type}-${activity.activity_id}`} activity={activity} allocations={allocations} budgetLines={activeLines} explanation={activity.activity_record_type === "imported" ? explanationByTransactionId.get(activity.activity_id) : undefined} canWriteContext={canWrite} canCategorize={activity.activity_direction === "outflow"} canLinkToPlan={false} onCreateContext={createContext} onUpdateContext={updateContext} onAllocate={allocateActivity} onUpdateManual={updateManualActivity} onArchiveManual={archiveManualActivity} onLinkToPlan={linkActivityToCurrentPlan} />;
            }) : <div className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-700">No activity belongs to this Money plan yet.</p><p className="mt-1 text-sm font-semibold text-slate-500">Older Budget activity stays with its original plan. Add new activity or choose something available below.</p></div>}</div>
          </section>

          {availableActivity.length ? <section className="rounded-[1.5rem] border border-sky-100 bg-sky-50/60 p-4">
            <button type="button" onClick={() => setShowAvailableActivity((current) => !current)} className="flex w-full items-start justify-between gap-3 text-left">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Available to add</p>
                <h3 className="mt-1 text-lg font-black text-sky-950">{showAvailableActivity ? "Activity from these dates that is not in a Budget yet" : `${availableActivity.length} item${availableActivity.length === 1 ? "" : "s"} available if you want them`}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-sky-900">{showAvailableActivity ? "These records are not counted in this plan until you choose to connect them." : "Kept out of the way until you choose to review it."}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-sky-800">{showAvailableActivity ? "Hide" : "View"}</span>
            </button>
            {showAvailableActivity ? <div className="mt-4 space-y-3">{availableActivity.slice(0, 12).map((activity) => <ActivityCard key={`available-${activity.activity_record_type}-${activity.activity_id}`} activity={activity} allocations={[]} budgetLines={activeLines} explanation={activity.activity_record_type === "imported" ? explanationByTransactionId.get(activity.activity_id) : undefined} canWriteContext={canWrite} canCategorize={activity.activity_direction === "outflow"} canLinkToPlan={activity.activity_direction === "inflow"} onCreateContext={createContext} onUpdateContext={updateContext} onAllocate={allocateActivity} onUpdateManual={updateManualActivity} onArchiveManual={archiveManualActivity} onLinkToPlan={linkActivityToCurrentPlan} />)}</div> : null}
          </section> : null}
        </div> : null}
      </section>
    </> : null}
  </section><MoneyBottomNav /></main></AuthGate>;
}
