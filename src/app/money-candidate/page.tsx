"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthGate from "../AuthGate";
import {
  formatDate,
  formatMoney,
  toNumber,
  useParticipantFinancial,
} from "../useParticipantFinancial";
import ActiveBudgetEditor from "../budget/ActiveBudgetEditor";
import BudgetDraftCategoryBuilder from "../budget/BudgetDraftCategoryBuilder";
import { useParticipantBudgetBuilder } from "../budget/useParticipantBudgetBuilder";
import {
  ParticipantTransactionExplanation,
  TransactionExplanationCategory,
  useParticipantTransactionExplanations,
} from "../transaction-explanations/useParticipantTransactionExplanations";
import {
  ParticipantTransactionAllocation,
  useParticipantTransactionAllocations,
} from "../transaction-allocations/useParticipantTransactionAllocations";

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

function MoneyBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "☼" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "♡" },
  ];

  return <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[1.8rem] border border-white/70 bg-white/90 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:bottom-5"><div className="grid grid-cols-5 gap-1">{items.map((item) => <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center transition ${item.href === "/budget" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"}`}><span className="text-xl font-black leading-none">{item.icon}</span><span className="mt-1 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">{item.label}</span></Link>)}</div></nav>;
}

function TransactionCard({
  transaction,
  explanation,
  allocations,
  budgetLines,
  canWriteContext,
  canConnectPlan,
  contextWorking,
  allocationWorking,
  onCreateContext,
  onUpdateContext,
  onAllocate,
}: {
  transaction: any;
  explanation: ParticipantTransactionExplanation | undefined;
  allocations: ParticipantTransactionAllocation[];
  budgetLines: any[];
  canWriteContext: boolean;
  canConnectPlan: boolean;
  contextWorking: boolean;
  allocationWorking: boolean;
  onCreateContext: (transactionId: string, category: TransactionExplanationCategory, note: string) => Promise<{ ok: boolean; message: string }>;
  onUpdateContext: (explanation: ParticipantTransactionExplanation, category: TransactionExplanationCategory, note: string) => Promise<{ ok: boolean; message: string }>;
  onAllocate: (transactionId: string, budgetLineId: string, amount: number) => Promise<{ ok: boolean; message: string }>;
}) {
  const [showContext, setShowContext] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [category, setCategory] = useState<TransactionExplanationCategory>(explanation?.explanation_category ?? "recognized_purchase");
  const [note, setNote] = useState(explanation?.explanation_text ?? "");
  const [notice, setNotice] = useState("");

  const activeAllocations = allocations.filter((item) => item.status === "active");
  const assigned = activeAllocations.reduce((sum, item) => sum + toNumber(item.allocated_amount), 0);
  const total = Math.abs(toNumber(transaction.amount));
  const unassigned = Math.max(total - assigned, 0);

  async function saveContext() {
    setNotice("");
    const result = explanation && explanation.status === "draft"
      ? await onUpdateContext(explanation, category, note)
      : await onCreateContext(transaction.id, category, note);
    setNotice(result.message);
    if (result.ok) setShowContext(false);
  }

  async function connect(line: any) {
    if (unassigned <= 0 || !canConnectPlan) return;
    setNotice("");
    const result = await onAllocate(transaction.id, line.id, unassigned);
    setNotice(result.message);
    if (result.ok) setShowPlan(false);
  }

  return <article className="rounded-[1.5rem] border border-slate-100 bg-white/90 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{transaction.merchant_name ?? "Merchant not provided"}</p><p className="mt-1 truncate text-xs font-semibold text-slate-500">{formatDate(transaction.posted_date)}{transaction.category_name ? ` · ${transaction.category_name}` : ""}</p></div><p className="shrink-0 text-base font-black">{formatMoney(transaction.amount)}</p></div>

    {explanation ? <div className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2.5"><p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Your context</p><p className="mt-1 text-sm font-black text-emerald-950">{contextChoices.find((choice) => choice.value === explanation.explanation_category)?.label ?? "Saved context"}</p>{explanation.explanation_text ? <p className="mt-1 text-xs leading-5 text-slate-600">{explanation.explanation_text}</p> : null}</div> : null}

    {activeAllocations.length ? <div className="mt-3 flex flex-wrap gap-2">{activeAllocations.map((item) => <span key={item.allocation_id} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{item.budget_category_name} · {formatMoney(item.allocated_amount)}</span>)}</div> : null}

    <div className={`mt-3 grid gap-2 ${canConnectPlan ? "grid-cols-2" : "grid-cols-1"}`}><button type="button" disabled={!canWriteContext || contextWorking || (explanation?.status != null && explanation.status !== "draft")} onClick={() => { setShowContext((current) => !current); setShowPlan(false); setNotice(""); }} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700 disabled:opacity-40">{explanation ? "Edit context" : "Add context"}</button>{canConnectPlan ? <button type="button" disabled={allocationWorking || unassigned <= 0 || budgetLines.length === 0} onClick={() => { setShowPlan((current) => !current); setShowContext(false); setNotice(""); }} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700 disabled:opacity-40">{unassigned > 0 ? "Connect to plan" : "Connected"}</button> : null}</div>

    {showContext ? <div className="mt-3 rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">What was this?</p><div className="mt-2 flex flex-wrap gap-2">{contextChoices.map((choice) => <button key={choice.value} type="button" onClick={() => setCategory(choice.value)} className={`rounded-full px-3 py-2 text-xs font-black ${category === choice.value ? "bg-emerald-700 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{choice.label}</button>)}</div><label className="mt-3 block text-xs font-black text-slate-500">Anything to add? <span className="font-normal">Optional</span><textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-800" /></label><button type="button" disabled={contextWorking} onClick={() => void saveContext()} className="mt-3 w-full rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Save context</button></div> : null}

    {showPlan ? <div className="mt-3 rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Which part of your plan?</p><p className="mt-1 text-xs text-slate-500">{formatMoney(unassigned)} not connected yet</p><div className="mt-3 grid grid-cols-2 gap-2">{budgetLines.map((line) => <button key={line.id} type="button" disabled={allocationWorking} onClick={() => void connect(line)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-black text-slate-700 disabled:opacity-50">{line.category_name}</button>)}</div></div> : null}

    {notice ? <p className="mt-3 text-xs font-bold text-slate-600">{notice}</p> : null}
  </article>;
}

export default function MoneyCandidatePage() {
  const {
    activeProgramId,
    budgetPeriods,
    budgetLines,
    financialActivity,
    transactions,
    loading,
    errorMessage,
    refresh,
  } = useParticipantFinancial();
  const {
    working: budgetWorking,
    errorMessage: budgetWriteError,
    createDraft: createBudgetDraft,
  } = useParticipantBudgetBuilder();
  const {
    explanationByTransactionId,
    canWrite,
    workingTransactionId,
    createDraft,
    updateDraft,
  } = useParticipantTransactionExplanations();
  const {
    allocationsByTransactionId,
    workingTransactionId: allocationWorkingTransactionId,
    allocateTransaction,
  } = useParticipantTransactionAllocations();

  const [newBudgetDraft, setNewBudgetDraft] = useState({
    periodStart: "",
    periodEnd: "",
    expectedIncome: "",
    notes: "",
  });
  const [budgetNotice, setBudgetNotice] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const activePeriod = budgetPeriods.find((period) => period.status === "active") ?? null;
  const draftPeriod = budgetPeriods.find((period) => period.status === "draft") ?? null;
  const activeLines = activePeriod ? budgetLines.filter((line) => line.budget_period_id === activePeriod.id && line.is_active) : [];
  const draftLines = draftPeriod ? budgetLines.filter((line) => line.budget_period_id === draftPeriod.id && line.is_active) : [];
  const currentTransactions = activePeriod ? transactions.filter((transaction) => transaction.posted_date >= activePeriod.period_start && transaction.posted_date <= activePeriod.period_end).slice(0, 8) : [];
  const activityTransactions = currentTransactions.length > 0 ? currentTransactions : transactions.slice(0, 8);
  const showingRecentActivity = currentTransactions.length === 0 && activityTransactions.length > 0;

  const planned = activeLines.reduce((sum, line) => sum + toNumber(line.planned_amount), 0);
  const out = activeLines.reduce((sum, line) => sum + toNumber(line.derived_actual_amount), 0);
  const remaining = activeLines.reduce((sum, line) => sum + toNumber(line.derived_remaining_amount), 0);
  const overPlan = Math.max(out - planned, 0);
  const usedPercent = planned > 0 ? Math.max(0, Math.min(100, Math.round((out / planned) * 100))) : 0;
  const incomeIn = activePeriod ? financialActivity.filter((activity) => activity.activity_direction === "inflow" && activity.activity_date >= activePeriod.period_start && activity.activity_date <= activePeriod.period_end).reduce((sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)), 0) : 0;

  const state = overPlan > 0 ? { label: `${formatMoney(overPlan)} over plan`, dot: "bg-amber-500", text: "text-amber-900", panel: "bg-amber-50 border-amber-200" } : remaining === 0 && planned > 0 ? { label: "Plan fully used", dot: "bg-slate-400", text: "text-slate-700", panel: "bg-slate-50 border-slate-200" } : { label: `${formatMoney(remaining)} left in the plan`, dot: "bg-emerald-500", text: "text-emerald-900", panel: "bg-emerald-50 border-emerald-100" };

  async function handleCreateBudgetDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBudgetNotice("");

    if (!activeProgramId) {
      setBudgetNotice("THRIVE could not identify one active program for this plan.");
      return;
    }
    if (!newBudgetDraft.periodStart || !newBudgetDraft.periodEnd) {
      setBudgetNotice("Choose a start and end date.");
      return;
    }
    if (newBudgetDraft.periodStart > newBudgetDraft.periodEnd) {
      setBudgetNotice("The start date needs to come before the end date.");
      return;
    }

    const expectedIncome = Number(newBudgetDraft.expectedIncome);
    if (!Number.isFinite(expectedIncome) || expectedIncome < 0) {
      setBudgetNotice("Enter expected income of zero or more.");
      return;
    }

    const result = await createBudgetDraft({
      programId: activeProgramId,
      periodStart: newBudgetDraft.periodStart,
      periodEnd: newBudgetDraft.periodEnd,
      expectedIncome,
      notes: newBudgetDraft.notes,
    });
    setBudgetNotice(result.message);
    if (!result.ok) return;
    await refresh();
  }

  async function createContext(transactionId: string, category: TransactionExplanationCategory, note: string) {
    const result = await createDraft(transactionId, { explanationCategory: category, explanationText: note });
    return { ok: result.ok, message: result.message };
  }

  async function updateContext(explanation: ParticipantTransactionExplanation, category: TransactionExplanationCategory, note: string) {
    const result = await updateDraft(explanation, { explanationCategory: category, explanationText: note });
    return { ok: result.ok, message: result.message };
  }

  async function connectTransaction(transactionId: string, budgetLineId: string, amount: number) {
    const result = await allocateTransaction(transactionId, budgetLineId, amount);
    if (result.ok) await refresh();
    return result;
  }

  return <AuthGate><main className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,rgba(167,243,208,0.30),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(254,240,138,0.25),transparent_24%),linear-gradient(180deg,#edf7f1_0%,#eef5f7_48%,#edf1f4_100%)] px-3 pb-40 pt-3 text-slate-950 sm:px-6 sm:pt-6"><section className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
    <header className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/46 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-9"><div className="pointer-events-none absolute -right-12 top-8 h-48 w-48 rounded-full border-[24px] border-sky-100/65" /><div className="pointer-events-none absolute -left-16 bottom-[-5rem] h-56 w-56 rounded-full bg-emerald-200/45" /><div className="relative"><div className="flex items-center justify-between gap-3"><Link href="/" className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-lg font-black shadow-sm">T</div><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-800">DSS Enterprises</p><p className="text-sm font-black">THRIVE</p></div></Link><span className="rounded-full bg-white/75 px-4 py-2 text-sm font-black text-emerald-900 shadow-sm">$ Money</span></div><div className="mt-10 max-w-3xl sm:mt-14"><p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">Money</p><h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-emerald-950 sm:text-7xl">What does your money look like?</h1><p className="mt-4 text-lg font-bold text-slate-600">See the plan. See what happened.</p></div></div></header>

    {loading ? <section className="rounded-[2rem] bg-white/75 p-6 shadow-sm">Loading money.</section> : null}
    {errorMessage ? <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6"><p className="font-black">Money could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}

    {!loading && !errorMessage && !activePeriod && !draftPeriod ? <section className="rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-sm backdrop-blur-xl sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">New plan</p><h2 className="mt-2 text-3xl font-black">Start with the basics.</h2></div><div className="flex gap-1.5"><span className="h-1.5 w-8 rounded-full bg-emerald-600" /><span className="h-1.5 w-8 rounded-full bg-slate-200" /></div></div><form onSubmit={handleCreateBudgetDraft} className="mt-5 grid gap-4"><div className="grid grid-cols-2 gap-3"><label className="text-sm font-black">Start<input type="date" value={newBudgetDraft.periodStart} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, periodStart: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 font-normal" /></label><label className="text-sm font-black">End<input type="date" value={newBudgetDraft.periodEnd} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, periodEnd: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 font-normal" /></label></div><label className="text-sm font-black">Expected income<div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={newBudgetDraft.expectedIncome} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, expectedIncome: event.target.value }))} className="w-full bg-transparent px-3 py-3 text-xl font-black outline-none" /></div></label><label className="text-sm font-black">Anything to remember? <span className="font-normal text-slate-400">Optional</span><textarea rows={2} value={newBudgetDraft.notes} onChange={(event) => setNewBudgetDraft((current) => ({ ...current, notes: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal" /></label>{(budgetNotice || budgetWriteError) ? <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{budgetNotice || budgetWriteError}</p> : null}<button type="submit" disabled={budgetWorking || !activeProgramId} className="rounded-full bg-emerald-700 px-5 py-3.5 font-black text-white disabled:opacity-50">Continue to categories</button></form></section> : null}

    {!loading && !errorMessage && draftPeriod ? <BudgetDraftCategoryBuilder draftPeriod={draftPeriod} currentLines={draftLines} refresh={refresh} /> : null}

    {!loading && !errorMessage && activePeriod ? <>
      <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl"><div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Right now</p><p className="mt-2 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">{formatMoney(Math.max(remaining, 0))}</p><p className="mt-1 text-lg font-bold text-slate-500">left in the plan</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">Active plan</span></div><div className={`mt-6 flex items-center gap-3 rounded-full border px-4 py-3 ${state.panel}`}><span className={`h-3.5 w-3.5 rounded-full ${state.dot}`} /><p className={`font-black ${state.text}`}>{state.label}</p></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${overPlan > 0 ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${usedPercent}%` }} /></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Plan</p><p className="mt-1 whitespace-nowrap text-lg font-black">{formatMoney(planned)}</p></div><div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Out</p><p className="mt-1 whitespace-nowrap text-lg font-black">{formatMoney(out)}</p></div><div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Income in</p><p className="mt-1 whitespace-nowrap text-lg font-black">{formatMoney(incomeIn)}</p></div></div></div></section>

      <ActiveBudgetEditor activePeriod={activePeriod} currentLines={activeLines} refresh={refresh} />

      <section className="rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-7"><div className="flex items-end justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Your categories</p><h2 className="mt-2 text-3xl font-black">Where the money is going</h2></div><span className="text-sm font-black text-slate-500">{activeLines.length}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{activeLines.map((line) => { const linePlan = toNumber(line.planned_amount); const lineOut = toNumber(line.derived_actual_amount); const lineLeft = toNumber(line.derived_remaining_amount); const linePercent = linePlan > 0 ? Math.max(0, Math.min(100, Math.round((lineOut / linePlan) * 100))) : 0; const lineOver = lineOut > linePlan; return <article key={line.id} className="rounded-[1.5rem] border border-slate-100 bg-white/85 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{line.category_name}</p><p className={`mt-1 text-sm font-bold ${lineOver ? "text-amber-800" : "text-slate-500"}`}>{lineOver ? `${formatMoney(lineOut - linePlan)} over` : `${formatMoney(lineLeft)} left`}</p></div><p className="shrink-0 text-sm font-black text-slate-500">{formatMoney(linePlan)}</p></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${lineOver ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${linePercent}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-1 text-center"><div><p className="text-[9px] font-black uppercase text-slate-400">Plan</p><p className="text-xs font-black">{formatMoney(linePlan)}</p></div><div><p className="text-[9px] font-black uppercase text-slate-400">Used</p><p className="text-xs font-black">{formatMoney(lineOut)}</p></div><div><p className="text-[9px] font-black uppercase text-slate-400">Left</p><p className="text-xs font-black">{formatMoney(lineLeft)}</p></div></div></article>; })}</div></section>

      <section className="rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Account activity</p><h2 className="mt-2 text-3xl font-black">Review what happened</h2></div><span className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-500">{transactions.length}</span></div><p className="mt-2 text-sm font-semibold text-slate-500">See imported activity, add your context, and connect eligible transactions to this plan.</p><button type="button" onClick={() => setShowActivity((current) => !current)} className="mt-5 w-full rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white">{showActivity ? "Close activity" : "Review account activity"}</button>

        {showActivity ? <div className="mt-5 space-y-3">{showingRecentActivity ? <div className="rounded-2xl bg-amber-50 p-4"><p className="text-sm font-black text-amber-950">No imported transactions fall inside this plan period yet.</p><p className="mt-1 text-sm font-semibold text-amber-800">Showing recent imported activity instead. You can add context here. Plan connection appears only when a transaction belongs inside this plan period.</p></div> : null}{activityTransactions.length ? activityTransactions.map((transaction) => { const insidePlan = !!activePeriod && transaction.posted_date >= activePeriod.period_start && transaction.posted_date <= activePeriod.period_end; return <TransactionCard key={transaction.id} transaction={transaction} explanation={explanationByTransactionId.get(transaction.id)} allocations={allocationsByTransactionId.get(transaction.id) ?? []} budgetLines={activeLines} canWriteContext={canWrite} canConnectPlan={insidePlan} contextWorking={workingTransactionId === transaction.id} allocationWorking={allocationWorkingTransactionId === transaction.id} onCreateContext={createContext} onUpdateContext={updateContext} onAllocate={connectTransaction} />; }) : <div className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-700">No imported account activity is available yet.</p><p className="mt-1 text-sm font-semibold text-slate-500">When imported transactions are available, they will appear here without changing the original bank record.</p></div>}</div> : null}
      </section>
    </> : null}
  </section><MoneyBottomNav /></main></AuthGate>;
}
