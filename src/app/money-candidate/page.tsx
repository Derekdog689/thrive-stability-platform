"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthGate from "../AuthGate";
import { BudgetLine, formatMoney, toNumber, useParticipantFinancial } from "../useParticipantFinancial";
import { BudgetCategoryType, useParticipantBudgetBuilder } from "../budget/useParticipantBudgetBuilder";

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

function CategoryEditor({ line, working, onSaved }: { line: BudgetLine; working: boolean; onSaved: () => Promise<void> }) {
  const { updateLine } = useParticipantBudgetBuilder();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(toNumber(line.planned_amount)));
  const [notice, setNotice] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const plannedAmount = Number(amount);
    if (!Number.isFinite(plannedAmount) || plannedAmount < 0) {
      setNotice("Enter zero or more.");
      return;
    }

    const result = await updateLine({
      budgetLineId: line.id,
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount,
      isActive: true,
      sortOrder: line.sort_order,
    });

    if (!result.ok) {
      setNotice(result.message);
      return;
    }

    setOpen(false);
    await onSaved();
  }

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="mt-4 w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">Change amount</button>;
  }

  return <form onSubmit={save} className="mt-4 rounded-2xl bg-slate-50 p-3"><div className="flex items-center rounded-xl border border-slate-200 bg-white px-3"><span className="font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full bg-transparent px-2 py-3 text-lg font-black outline-none" /></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="submit" disabled={working} className="rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Save</button><button type="button" onClick={() => { setOpen(false); setAmount(String(toNumber(line.planned_amount))); setNotice(""); }} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600">Cancel</button></div>{notice ? <p className="mt-2 text-xs font-bold text-rose-700">{notice}</p> : null}</form>;
}

export default function MoneyCandidatePage() {
  const { budgetPeriods, budgetLines, financialActivity, loading, errorMessage, refresh } = useParticipantFinancial();
  const { working, errorMessage: writeError, updatePeriod, completeBudget } = useParticipantBudgetBuilder();
  const [showAdjust, setShowAdjust] = useState(false);
  const [incomeDraft, setIncomeDraft] = useState("");
  const [notice, setNotice] = useState("");

  const activePeriod = budgetPeriods.find((period) => period.status === "active") ?? null;
  const activeLines = activePeriod ? budgetLines.filter((line) => line.budget_period_id === activePeriod.id && line.is_active) : [];

  const planned = activeLines.reduce((sum, line) => sum + toNumber(line.planned_amount), 0);
  const out = activeLines.reduce((sum, line) => sum + toNumber(line.derived_actual_amount), 0);
  const remaining = activeLines.reduce((sum, line) => sum + toNumber(line.derived_remaining_amount), 0);
  const overPlan = Math.max(out - planned, 0);
  const usedPercent = planned > 0 ? Math.max(0, Math.min(100, Math.round((out / planned) * 100))) : 0;
  const incomeIn = activePeriod ? financialActivity.filter((activity) => activity.activity_direction === "inflow" && activity.activity_date >= activePeriod.period_start && activity.activity_date <= activePeriod.period_end).reduce((sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)), 0) : 0;

  const state = overPlan > 0 ? { label: `${formatMoney(overPlan)} over plan`, dot: "bg-amber-500", text: "text-amber-900", panel: "bg-amber-50 border-amber-200" } : remaining === 0 && planned > 0 ? { label: "Plan fully used", dot: "bg-slate-400", text: "text-slate-700", panel: "bg-slate-50 border-slate-200" } : { label: `${formatMoney(remaining)} remaining`, dot: "bg-emerald-500", text: "text-emerald-900", panel: "bg-emerald-50 border-emerald-100" };

  async function saveIncome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePeriod) return;
    setNotice("");
    const expectedIncome = Number(incomeDraft);
    if (!Number.isFinite(expectedIncome) || expectedIncome < 0) {
      setNotice("Enter zero or more.");
      return;
    }
    const result = await updatePeriod({ budgetPeriodId: activePeriod.id, expectedIncome, notes: activePeriod.notes ?? "" });
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    await refresh();
    setNotice("");
  }

  async function finishBudget() {
    if (!activePeriod) return;
    const confirmed = window.confirm("Complete this Budget? The plan will become read-only.");
    if (!confirmed) return;
    const result = await completeBudget(activePeriod.id);
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    await refresh();
  }

  return <AuthGate><main className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,rgba(167,243,208,0.30),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(254,240,138,0.25),transparent_24%),linear-gradient(180deg,#edf7f1_0%,#eef5f7_48%,#edf1f4_100%)] px-3 pb-32 pt-3 text-slate-950 sm:px-6 sm:pt-6"><section className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
    <header className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/46 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-9"><div className="pointer-events-none absolute -right-12 top-8 h-48 w-48 rounded-full border-[24px] border-sky-100/65" /><div className="pointer-events-none absolute -left-16 bottom-[-5rem] h-56 w-56 rounded-full bg-emerald-200/45" /><div className="relative"><div className="flex items-center justify-between gap-3"><Link href="/" className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-lg font-black shadow-sm">T</div><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-800">DSS Enterprises</p><p className="text-sm font-black">THRIVE</p></div></Link><span className="rounded-full bg-white/75 px-4 py-2 text-sm font-black text-emerald-900 shadow-sm">$ Money</span></div><div className="mt-14 max-w-3xl sm:mt-20"><p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">Money</p><h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-emerald-950 sm:text-7xl">What does your money look like?</h1><p className="mt-4 text-lg font-bold text-slate-600">See the plan. See what happened.</p></div></div></header>

    {loading ? <section className="rounded-[2rem] bg-white/75 p-6 shadow-sm">Loading money.</section> : null}
    {errorMessage ? <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6"><p className="font-black">Money could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}

    {!loading && !errorMessage && activePeriod ? <>
      <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl"><div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Right now</p><p className={`mt-2 text-5xl font-black tracking-tight sm:text-6xl ${remaining < 0 ? "text-amber-900" : "text-slate-950"}`}>{formatMoney(remaining)}</p><p className="mt-1 text-lg font-bold text-slate-500">remaining</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">Active plan</span></div>
        <div className={`mt-6 flex items-center gap-3 rounded-full border px-4 py-3 ${state.panel}`}><span className={`h-3.5 w-3.5 rounded-full ${state.dot}`} /><p className={`font-black ${state.text}`}>{state.label}</p></div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${overPlan > 0 ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${usedPercent}%` }} /></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Plan</p><p className="mt-1 whitespace-nowrap text-lg font-black sm:text-xl">{formatMoney(planned)}</p></div><div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Out</p><p className="mt-1 whitespace-nowrap text-lg font-black sm:text-xl">{formatMoney(out)}</p></div><div className="min-w-0 rounded-2xl bg-slate-50 p-2.5"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Income in</p><p className="mt-1 whitespace-nowrap text-lg font-black sm:text-xl">{formatMoney(incomeIn)}</p></div></div>
        <button type="button" onClick={() => { setShowAdjust((current) => !current); setIncomeDraft(String(toNumber(activePeriod.expected_income))); setNotice(""); }} className="mt-5 w-full rounded-full bg-emerald-700 px-5 py-3.5 font-black text-white">{showAdjust ? "Close changes" : "Adjust plan"}</button>
      </div></section>

      {showAdjust ? <section className="rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-sm backdrop-blur-2xl sm:p-7"><div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"><p className="text-sm font-black text-slate-600"><span className="text-emerald-700">1 of 2</span> · Money available</p><div className="flex gap-1.5" aria-hidden="true"><span className="h-1.5 w-9 rounded-full bg-emerald-600" /><span className="h-1.5 w-9 rounded-full bg-slate-200" /></div></div><h2 className="mt-5 text-3xl font-black">Adjust the plan.</h2><p className="mt-2 text-sm font-semibold text-slate-500">Change only what needs changing.</p>
        <form onSubmit={saveIncome} className="mt-5 rounded-[1.5rem] bg-slate-50 p-4"><label className="text-sm font-black">Expected income<div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={incomeDraft} onChange={(event) => setIncomeDraft(event.target.value)} className="w-full bg-transparent px-3 py-3 text-xl font-black outline-none" /></div></label><button type="submit" disabled={working} className="mt-3 w-full rounded-full bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-50">Save income</button></form>
        <div className="mt-6 flex items-center justify-between gap-3 border-b border-slate-100 pb-3"><p className="text-sm font-black text-slate-600"><span className="text-emerald-700">2 of 2</span> · Categories</p><div className="flex gap-1.5" aria-hidden="true"><span className="h-1.5 w-9 rounded-full bg-emerald-600" /><span className="h-1.5 w-9 rounded-full bg-emerald-600" /></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{activeLines.map((line) => <article key={line.id} className="rounded-[1.5rem] border border-slate-100 bg-white/90 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{line.category_name}</p><p className="mt-1 text-sm font-bold text-slate-500">Planned {formatMoney(line.planned_amount)}</p></div><p className="text-sm font-black text-slate-400">{formatMoney(line.derived_remaining_amount)} left</p></div><CategoryEditor line={line} working={working} onSaved={refresh} /></article>)}</div>
        {(notice || writeError) ? <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{notice || writeError}</p> : null}
        <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-600">More plan controls</summary><div className="border-t border-slate-200 p-4"><p className="text-sm text-slate-500">Completing a Budget makes the plan read-only.</p><button type="button" disabled={working} onClick={() => void finishBudget()} className="mt-3 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 disabled:opacity-50">Complete Budget</button></div></details>
      </section> : null}

      {!showAdjust ? <section className="rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-7"><div className="flex items-end justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Your plan</p><h2 className="mt-2 text-3xl font-black">Where the money is going</h2></div><span className="text-sm font-black text-slate-500">{activeLines.length} categories</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{activeLines.map((line) => { const linePlan = toNumber(line.planned_amount); const lineOut = toNumber(line.derived_actual_amount); const lineLeft = toNumber(line.derived_remaining_amount); const linePercent = linePlan > 0 ? Math.max(0, Math.min(100, Math.round((lineOut / linePlan) * 100))) : 0; const lineOver = lineOut > linePlan; return <article key={line.id} className="rounded-[1.5rem] border border-slate-100 bg-white/80 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{line.category_name}</p><p className={`mt-1 text-sm font-bold ${lineOver ? "text-amber-800" : "text-slate-500"}`}>{lineOver ? `${formatMoney(lineOut - linePlan)} over` : `${formatMoney(lineLeft)} left`}</p></div><p className="shrink-0 text-sm font-black text-slate-500">{formatMoney(linePlan)}</p></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${lineOver ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${linePercent}%` }} /></div></article>; })}</div></section> : null}
    </> : null}

    {!loading && !errorMessage && !activePeriod ? <section className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-sm backdrop-blur-xl"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Money</p><h2 className="mt-2 text-3xl font-black">No active plan yet.</h2><p className="mt-3 text-slate-600">Start with a plan, then THRIVE can show what remains and what has been recorded against it.</p></section> : null}
  </section><MoneyBottomNav /></main></AuthGate>;
}
