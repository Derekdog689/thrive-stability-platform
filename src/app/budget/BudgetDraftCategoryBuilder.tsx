"use client";

import { FormEvent, useMemo, useState } from "react";
import { BudgetLine, BudgetPeriod, formatMoney, toNumber } from "../useParticipantFinancial";
import { BudgetCategoryType, useParticipantBudgetBuilder } from "./useParticipantBudgetBuilder";

const starterCategories: Array<{ name: string; type: BudgetCategoryType }> = [
  { name: "Housing", type: "protected" },
  { name: "Electric", type: "protected" },
  { name: "Internet / cable", type: "protected" },
  { name: "Food & household", type: "protected" },
  { name: "Transportation", type: "flexible" },
  { name: "Car insurance", type: "protected" },
  { name: "Car registration", type: "protected" },
  { name: "Phone", type: "protected" },
  { name: "Medical / wellness", type: "support" },
  { name: "Personal", type: "flexible" },
  { name: "Entertainment", type: "flexible" },
  { name: "Savings / reserve", type: "reserve" },
  { name: "Emergency cushion", type: "reserve" },
];

const types: Array<{ value: BudgetCategoryType; label: string }> = [
  { value: "protected", label: "Essential" },
  { value: "flexible", label: "Flexible" },
  { value: "support", label: "Support" },
  { value: "reserve", label: "Reserve" },
];

type Props = {
  draftPeriod: BudgetPeriod;
  currentLines: BudgetLine[];
  refresh: () => Promise<void>;
};

type Draft = {
  categoryName: string;
  categoryType: BudgetCategoryType;
  plannedAmount: string;
};

const emptyDraft: Draft = { categoryName: "", categoryType: "protected", plannedAmount: "" };

export default function BudgetDraftCategoryBuilder({ draftPeriod, currentLines, refresh }: Props) {
  const { working, errorMessage, addLine, updateLine, activateBudget } = useParticipantBudgetBuilder();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [acknowledgeOverPlan, setAcknowledgeOverPlan] = useState(false);

  const expectedIncome = toNumber(draftPeriod.expected_income);
  const plannedTotal = useMemo(() => currentLines.filter((line) => line.is_active).reduce((sum, line) => sum + toNumber(line.planned_amount), 0), [currentLines]);
  const stillUnplanned = expectedIncome - plannedTotal;
  const isOverPlanned = plannedTotal > expectedIncome;
  const activeLines = currentLines.filter((line) => line.is_active);
  const existingNames = new Set(activeLines.map((line) => line.category_name.trim().toLowerCase()));

  async function saveCategory(event: FormEvent<HTMLFormElement>, line?: BudgetLine) {
    event.preventDefault();
    setNotice("");
    const name = draft.categoryName.trim();
    const amount = Number(draft.plannedAmount);
    if (!name) { setNotice("Choose or name a category."); return; }
    if (!Number.isFinite(amount) || amount < 0) { setNotice("Enter zero or more."); return; }
    const duplicate = activeLines.some((candidate) => candidate.id !== line?.id && candidate.category_name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) { setNotice("That category is already in your plan."); return; }

    const result = line
      ? await updateLine({ budgetLineId: line.id, categoryName: name, categoryType: draft.categoryType, plannedAmount: amount, isActive: true, sortOrder: line.sort_order })
      : await addLine({ budgetPeriodId: draftPeriod.id, categoryName: name, categoryType: draft.categoryType, plannedAmount: amount, sortOrder: currentLines.length });

    setNotice(result.ok ? "Saved." : result.message);
    if (!result.ok) return;
    setDraft(emptyDraft);
    setEditingId(null);
    await refresh();
  }

  async function removeCategory(line: BudgetLine) {
    const result = await updateLine({ budgetLineId: line.id, categoryName: line.category_name, categoryType: line.category_type as BudgetCategoryType, plannedAmount: toNumber(line.planned_amount), isActive: false, sortOrder: line.sort_order });
    setNotice(result.ok ? "Removed from this draft." : result.message);
    if (result.ok) {
      setEditingId(null);
      setDraft(emptyDraft);
      await refresh();
    }
  }

  async function activate() {
    setNotice("");
    if (activeLines.length === 0) { setNotice("Add at least one category first."); return; }
    if (isOverPlanned && !acknowledgeOverPlan) { setNotice(`Your plan is ${formatMoney(plannedTotal - expectedIncome)} above the income you entered.`); return; }
    const result = await activateBudget(draftPeriod.id, isOverPlanned ? acknowledgeOverPlan : false);
    setNotice(result.message);
    if (result.ok) await refresh();
  }

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/78 p-5 pb-28 shadow-sm backdrop-blur-2xl sm:p-7 sm:pb-28">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Build your plan</p>
          <h2 className="mt-1 text-3xl font-black">Pick what matters.</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">Draft</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Income</p><p className="mt-1 whitespace-nowrap text-lg font-black">{formatMoney(expectedIncome)}</p></div>
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Planned</p><p className="mt-1 whitespace-nowrap text-lg font-black">{formatMoney(plannedTotal)}</p></div>
        <div className={`rounded-2xl p-3 ${stillUnplanned < 0 ? "bg-amber-50" : "bg-emerald-50"}`}><p className={`text-[9px] font-black uppercase tracking-wide ${stillUnplanned < 0 ? "text-amber-700" : "text-emerald-700"}`}>{stillUnplanned < 0 ? "Over" : "Left"}</p><p className={`mt-1 whitespace-nowrap text-lg font-black ${stillUnplanned < 0 ? "text-amber-900" : "text-emerald-900"}`}>{formatMoney(Math.abs(stillUnplanned))}</p></div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black">Categories</p><p className="text-xs font-bold text-slate-400">Tap to add</p></div><span className="text-sm font-black text-slate-500">{activeLines.length} selected</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2">{starterCategories.map((starter) => {
          const used = existingNames.has(starter.name.toLowerCase());
          return <button key={starter.name} type="button" disabled={used} onClick={() => { setEditingId(null); setDraft({ categoryName: starter.name, categoryType: starter.type, plannedAmount: "" }); setNotice(""); }} className={`rounded-2xl border px-3 py-3 text-left text-sm font-black ${used ? "border-slate-100 bg-slate-100 text-slate-400" : draft.categoryName === starter.name ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-100 bg-emerald-50 text-emerald-950"}`}>{starter.name}</button>;
        })}</div>
      </div>

      <form onSubmit={(event) => void saveCategory(event)} className="mt-5 rounded-[1.7rem] bg-slate-50 p-4">
        <label className="text-sm font-black">Category<input value={draft.categoryName} onChange={(event) => setDraft((current) => ({ ...current, categoryName: event.target.value }))} placeholder="Choose above or type your own" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg" /></label>
        <div className="mt-4 grid grid-cols-2 gap-2">{types.map((type) => <button key={type.value} type="button" onClick={() => setDraft((current) => ({ ...current, categoryType: type.value }))} className={`rounded-full px-3 py-2.5 text-sm font-black ${draft.categoryType === type.value ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>{type.label}</button>)}</div>
        <label className="mt-4 block text-sm font-black">Amount<div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="text-xl font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={draft.plannedAmount} onChange={(event) => setDraft((current) => ({ ...current, plannedAmount: event.target.value }))} className="w-full bg-transparent px-3 py-4 text-2xl font-black outline-none" /></div></label>
        <button type="submit" disabled={working} className="mt-4 w-full rounded-full bg-emerald-700 px-5 py-3.5 text-base font-black text-white disabled:opacity-50">Add to plan</button>
      </form>

      {activeLines.length ? <div className="mt-5 space-y-3">{activeLines.map((line) => {
        const editing = editingId === line.id;
        if (editing) return <form key={line.id} onSubmit={(event) => void saveCategory(event, line)} className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4"><input value={draft.categoryName} onChange={(event) => setDraft((current) => ({ ...current, categoryName: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg font-black" /><div className="mt-3 flex items-center rounded-xl border border-slate-200 bg-white px-3"><span className="font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={draft.plannedAmount} onChange={(event) => setDraft((current) => ({ ...current, plannedAmount: event.target.value }))} className="w-full bg-transparent px-2 py-3 text-xl font-black outline-none" /></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="submit" className="rounded-full bg-emerald-700 px-4 py-3 font-black text-white">Save</button><button type="button" onClick={() => void removeCategory(line)} className="rounded-full border border-rose-200 bg-white px-4 py-3 font-black text-rose-700">Remove</button></div></form>;
        return <button key={line.id} type="button" onClick={() => { setEditingId(line.id); setDraft({ categoryName: line.category_name, categoryType: line.category_type as BudgetCategoryType, plannedAmount: String(toNumber(line.planned_amount)) }); setNotice(""); }} className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-white/90 p-4 text-left"><div><p className="text-lg font-black">{line.category_name}</p><p className="mt-1 text-sm font-bold text-slate-500">{formatMoney(line.planned_amount)}</p></div><span className="rounded-full bg-slate-50 px-3 py-2 text-sm font-black text-slate-500">Change</span></button>;
      })}</div> : null}

      {isOverPlanned ? <label className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950"><input type="checkbox" checked={acknowledgeOverPlan} onChange={(event) => setAcknowledgeOverPlan(event.target.checked)} className="mt-1 h-5 w-5" /><span>Use this plan even though it is {formatMoney(plannedTotal - expectedIncome)} above the income entered.</span></label> : null}

      {notice ? <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{notice}</p> : null}
      {errorMessage ? <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{errorMessage}</p> : null}

      <button type="button" disabled={working || activeLines.length === 0} onClick={() => void activate()} className="mt-5 w-full rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white disabled:opacity-40">Use this plan</button>
    </section>
  );
}
