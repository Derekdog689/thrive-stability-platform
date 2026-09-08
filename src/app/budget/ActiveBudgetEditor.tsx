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

const categoryTypes: Array<{ value: BudgetCategoryType; label: string }> = [
  { value: "protected", label: "Essential" },
  { value: "flexible", label: "Flexible" },
  { value: "support", label: "Support" },
  { value: "reserve", label: "Reserve" },
];

type Props = {
  activePeriod: BudgetPeriod;
  currentLines: BudgetLine[];
  refresh: () => Promise<void>;
};

type LineDraft = {
  categoryName: string;
  categoryType: BudgetCategoryType;
  plannedAmount: string;
};

const emptyLineDraft: LineDraft = {
  categoryName: "",
  categoryType: "protected",
  plannedAmount: "",
};

export default function ActiveBudgetEditor({ activePeriod, currentLines, refresh }: Props) {
  const { working, errorMessage, updatePeriod, addLine, updateLine, completeBudget } = useParticipantBudgetBuilder();
  const [open, setOpen] = useState(false);
  const [periodDraft, setPeriodDraft] = useState({ expectedIncome: String(toNumber(activePeriod.expected_income)), notes: activePeriod.notes ?? "" });
  const [periodNotice, setPeriodNotice] = useState("");
  const [addingLine, setAddingLine] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [replacingLineId, setReplacingLineId] = useState<string | null>(null);
  const [lineDraft, setLineDraft] = useState<LineDraft>(emptyLineDraft);
  const [lineNotice, setLineNotice] = useState("");

  const activeLines = useMemo(() => currentLines.filter((line) => line.is_active), [currentLines]);
  const plannedTotal = activeLines.reduce((sum, line) => sum + toNumber(line.planned_amount), 0);
  const unplannedAmount = Math.max(toNumber(activePeriod.expected_income) - plannedTotal, 0);
  const existingNames = new Set(currentLines.filter((line) => line.is_active).map((line) => line.category_name.trim().toLowerCase()));

  function resetLineWork() {
    setAddingLine(false);
    setEditingLineId(null);
    setReplacingLineId(null);
    setLineDraft(emptyLineDraft);
    setLineNotice("");
  }

  function closeEditor() {
    setOpen(false);
    resetLineWork();
    setPeriodNotice("");
  }

  async function savePeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expectedIncome = Number(periodDraft.expectedIncome);
    if (!Number.isFinite(expectedIncome) || expectedIncome < 0) {
      setPeriodNotice("Enter zero or more.");
      return;
    }
    const result = await updatePeriod({ budgetPeriodId: activePeriod.id, expectedIncome, notes: periodDraft.notes });
    setPeriodNotice(result.ok ? "Saved." : result.message);
    if (result.ok) await refresh();
  }

  async function addNewLine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const categoryName = lineDraft.categoryName.trim();
    const plannedAmount = Number(lineDraft.plannedAmount);
    if (!categoryName) { setLineNotice("Choose or name a category."); return; }
    if (!Number.isFinite(plannedAmount) || plannedAmount < 0) { setLineNotice("Enter zero or more."); return; }
    if (existingNames.has(categoryName.toLowerCase())) { setLineNotice("That category is already in your plan."); return; }

    const result = await addLine({ budgetPeriodId: activePeriod.id, categoryName, categoryType: lineDraft.categoryType, plannedAmount, sortOrder: currentLines.length });
    setLineNotice(result.ok ? "Added." : result.message);
    if (!result.ok) return;
    resetLineWork();
    await refresh();
  }

  async function saveAmount(event: FormEvent<HTMLFormElement>, line: BudgetLine) {
    event.preventDefault();
    const plannedAmount = Number(lineDraft.plannedAmount);
    if (!Number.isFinite(plannedAmount) || plannedAmount < 0) { setLineNotice("Enter zero or more."); return; }

    const result = await updateLine({
      budgetLineId: line.id,
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount,
      isActive: true,
      sortOrder: line.sort_order,
    });

    setLineNotice(result.ok ? "Saved." : result.message);
    if (!result.ok) return;
    resetLineWork();
    await refresh();
  }

  async function removeLine(line: BudgetLine) {
    if (!window.confirm(`Remove ${line.category_name} from this plan? Its history stays saved.`)) return;
    const result = await updateLine({ budgetLineId: line.id, categoryName: line.category_name, categoryType: line.category_type as BudgetCategoryType, plannedAmount: toNumber(line.planned_amount), isActive: false, sortOrder: line.sort_order });
    setLineNotice(result.ok ? "Removed from this plan." : result.message);
    if (result.ok) {
      resetLineWork();
      await refresh();
    }
  }

  async function replaceLine(line: BudgetLine, replacement: { name: string; type: BudgetCategoryType }) {
    if (existingNames.has(replacement.name.toLowerCase())) {
      setLineNotice("That category is already in your plan.");
      return;
    }

    const confirmed = window.confirm(`Replace ${line.category_name} with ${replacement.name}? ${line.category_name} will stay in history.`);
    if (!confirmed) return;

    setLineNotice("");
    const addResult = await addLine({
      budgetPeriodId: activePeriod.id,
      categoryName: replacement.name,
      categoryType: replacement.type,
      plannedAmount: toNumber(line.planned_amount),
      sortOrder: line.sort_order,
    });

    if (!addResult.ok) {
      setLineNotice(addResult.message);
      return;
    }

    const removeResult = await updateLine({
      budgetLineId: line.id,
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount: toNumber(line.planned_amount),
      isActive: false,
      sortOrder: line.sort_order,
    });

    if (!removeResult.ok) {
      setLineNotice(`The new category was added, but ${line.category_name} could not be removed. ${removeResult.message}`);
      await refresh();
      return;
    }

    resetLineWork();
    await refresh();
  }

  async function complete() {
    if (!window.confirm("Complete this Budget? The plan will become read-only.")) return;
    const result = await completeBudget(activePeriod.id);
    setPeriodNotice(result.message);
    if (result.ok) {
      setOpen(false);
      await refresh();
    }
  }

  if (!open) {
    return (
      <section className="rounded-[2rem] border border-white/80 bg-white/72 p-5 shadow-sm backdrop-blur-xl sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Your plan</p>
            <h2 className="mt-2 text-3xl font-black">Need to change something?</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">Active</span>
        </div>
        <button type="button" disabled={working} onClick={() => setOpen(true)} className="mt-5 w-full rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white disabled:opacity-50">Adjust plan</button>
        <details className="mt-3 rounded-2xl border border-slate-200 bg-white/70">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-600">More</summary>
          <div className="border-t border-slate-100 p-4"><button type="button" disabled={working} onClick={() => void complete()} className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-50">Complete Budget</button></div>
        </details>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/78 p-5 pb-28 shadow-sm backdrop-blur-2xl sm:p-7 sm:pb-28">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Adjust plan</p><h2 className="mt-1 text-3xl font-black">Change what changed.</h2></div>
        <button type="button" onClick={closeEditor} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600">Close</button>
      </div>

      <form onSubmit={savePeriod} className="mt-5 rounded-[1.7rem] bg-slate-50 p-4">
        <div className="flex items-center justify-between"><p className="text-sm font-black">Money available</p><span className="text-xs font-black text-slate-400">1 of 2</span></div>
        <div className="mt-3 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="text-xl font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={periodDraft.expectedIncome} onChange={(event) => setPeriodDraft((current) => ({ ...current, expectedIncome: event.target.value }))} className="w-full bg-transparent px-3 py-4 text-2xl font-black outline-none" /></div>
        <details className="mt-3"><summary className="cursor-pointer text-sm font-black text-slate-500">Add a note</summary><textarea rows={2} value={periodDraft.notes} onChange={(event) => setPeriodDraft((current) => ({ ...current, notes: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base" /></details>
        <div className="mt-3 flex items-center justify-between text-sm font-bold text-slate-500"><span>{formatMoney(plannedTotal)} planned</span><span>{formatMoney(unplannedAmount)} unplanned</span></div>
        <button type="submit" disabled={working} className="mt-4 w-full rounded-full bg-emerald-700 px-5 py-3.5 text-base font-black text-white disabled:opacity-50">Save</button>
        {periodNotice ? <p className="mt-2 text-sm font-bold text-slate-600">{periodNotice}</p> : null}
      </form>

      <div className="mt-6 flex items-center justify-between gap-3"><div><p className="text-sm font-black">Categories</p><p className="text-xs font-bold text-slate-400">2 of 2</p></div><button type="button" onClick={() => { resetLineWork(); setAddingLine(true); }} className="rounded-full bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-800">+ Add</button></div>

      {addingLine ? <form onSubmit={(event) => void addNewLine(event)} className="mt-4 rounded-[1.7rem] bg-emerald-50 p-4"><p className="text-sm font-black">Pick a category</p><div className="mt-3 grid grid-cols-2 gap-2">{starterCategories.map((starter) => { const used = existingNames.has(starter.name.toLowerCase()); return <button key={starter.name} type="button" disabled={used} onClick={() => setLineDraft({ categoryName: starter.name, categoryType: starter.type, plannedAmount: "" })} className={`rounded-2xl border px-3 py-3 text-left text-sm font-black ${lineDraft.categoryName === starter.name ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-100 bg-white text-emerald-950"} disabled:opacity-35`}>{starter.name}</button>; })}</div>
        <label className="mt-4 block text-sm font-black">Or name your own<input value={lineDraft.categoryName} onChange={(event) => setLineDraft((current) => ({ ...current, categoryName: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg" /></label>
        <div className="mt-4 grid grid-cols-2 gap-2">{categoryTypes.map((type) => <button key={type.value} type="button" onClick={() => setLineDraft((current) => ({ ...current, categoryType: type.value }))} className={`rounded-full px-3 py-2.5 text-sm font-black ${lineDraft.categoryType === type.value ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>{type.label}</button>)}</div>
        <label className="mt-4 block text-sm font-black">Amount<div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="text-xl font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={lineDraft.plannedAmount} onChange={(event) => setLineDraft((current) => ({ ...current, plannedAmount: event.target.value }))} className="w-full bg-transparent px-3 py-4 text-2xl font-black outline-none" /></div></label>
        <div className="mt-4 grid grid-cols-2 gap-2"><button type="submit" disabled={working} className="rounded-full bg-emerald-700 px-4 py-3 font-black text-white">Add</button><button type="button" onClick={resetLineWork} className="rounded-full border border-slate-200 bg-white px-4 py-3 font-black text-slate-600">Cancel</button></div>
        {lineNotice ? <p className="mt-2 text-sm font-bold text-rose-700">{lineNotice}</p> : null}</form> : null}

      <div className="mt-4 space-y-3">{activeLines.map((line) => {
        const editing = editingLineId === line.id;
        const replacing = replacingLineId === line.id;

        if (editing) return <form key={line.id} onSubmit={(event) => void saveAmount(event, line)} className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Active category</p><p className="mt-1 text-xl font-black">{line.category_name}</p></div><button type="button" onClick={() => void removeLine(line)} className="rounded-full px-3 py-2 text-xs font-black text-rose-700">Remove</button></div><label className="mt-4 block text-sm font-black">Planned amount<div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-3"><span className="font-black text-slate-400">$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={lineDraft.plannedAmount} onChange={(event) => setLineDraft((current) => ({ ...current, plannedAmount: event.target.value }))} className="w-full bg-transparent px-2 py-3 text-xl font-black outline-none" /></div></label><div className="mt-3 grid grid-cols-2 gap-2"><button type="submit" className="rounded-full bg-emerald-700 px-4 py-3 font-black text-white">Save</button><button type="button" onClick={resetLineWork} className="rounded-full border border-slate-200 bg-white px-4 py-3 font-black text-slate-600">Cancel</button></div><button type="button" onClick={() => { setEditingLineId(null); setReplacingLineId(line.id); setLineNotice(""); }} className="mt-3 w-full rounded-full border border-emerald-200 bg-white px-4 py-3 text-sm font-black text-emerald-800">Replace category</button></form>;

        if (replacing) return <div key={line.id} className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Replace</p><p className="mt-1 text-xl font-black">{line.category_name}</p></div><button type="button" onClick={resetLineWork} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600">Cancel</button></div><p className="mt-4 text-sm font-black">Choose the new category</p><div className="mt-3 grid grid-cols-2 gap-2">{starterCategories.map((starter) => { const used = existingNames.has(starter.name.toLowerCase()); return <button key={starter.name} type="button" disabled={used || working} onClick={() => void replaceLine(line, starter)} className="rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-left text-sm font-black text-emerald-950 disabled:opacity-35">{starter.name}</button>; })}</div>{lineNotice ? <p className="mt-3 text-sm font-bold text-rose-700">{lineNotice}</p> : null}</div>;

        return <button key={line.id} type="button" onClick={() => { resetLineWork(); setEditingLineId(line.id); setLineDraft({ categoryName: line.category_name, categoryType: line.category_type as BudgetCategoryType, plannedAmount: String(toNumber(line.planned_amount)) }); }} className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-white/90 p-4 text-left"><div><p className="text-lg font-black">{line.category_name}</p><p className="mt-1 text-sm font-bold text-slate-500">{formatMoney(line.planned_amount)} planned</p></div><span className="rounded-full bg-slate-50 px-3 py-2 text-sm font-black text-slate-500">Change</span></button>;
      })}</div>

      {errorMessage ? <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{errorMessage}</p> : null}
    </section>
  );
}
