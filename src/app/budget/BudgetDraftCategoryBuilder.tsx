"use client";

import { FormEvent, useMemo, useState } from "react";
import { BudgetLine, BudgetPeriod, formatMoney, toNumber } from "../useParticipantFinancial";
import { BudgetCategoryType, useParticipantBudgetBuilder } from "./useParticipantBudgetBuilder";

const categoryGroups: Array<{
  title: string;
  note: string;
  items: Array<{ name: string; type: BudgetCategoryType }>;
}> = [
  {
    title: "Must cover",
    note: "Start with the basics.",
    items: [
      { name: "Housing", type: "protected" },
      { name: "Food & household", type: "protected" },
      { name: "Electric", type: "protected" },
      { name: "Transportation", type: "flexible" },
    ],
  },
  {
    title: "Needs attention",
    note: "Things that may come due.",
    items: [
      { name: "Car insurance", type: "protected" },
      { name: "Car registration", type: "protected" },
      { name: "Phone", type: "protected" },
      { name: "Medical / wellness", type: "support" },
      { name: "Internet / cable", type: "protected" },
    ],
  },
  {
    title: "Flexible",
    note: "Things you can adjust.",
    items: [
      { name: "Personal", type: "flexible" },
      { name: "Entertainment", type: "flexible" },
    ],
  },
  {
    title: "Protect",
    note: "Money you want to keep available.",
    items: [
      { name: "Savings / reserve", type: "reserve" },
      { name: "Emergency cushion", type: "reserve" },
    ],
  },
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
  const { working, errorMessage, updatePeriod, addLine, updateLine, activateBudget } = useParticipantBudgetBuilder();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [acknowledgeOverPlan, setAcknowledgeOverPlan] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [moneyAvailable, setMoneyAvailable] = useState(String(toNumber(draftPeriod.expected_income)));
  const [incomeConfirmed, setIncomeConfirmed] = useState(
    currentLines.some((line) => line.is_active) || toNumber(draftPeriod.expected_income) > 0,
  );
  const [incomeNotice, setIncomeNotice] = useState("");

  const expectedIncome = toNumber(draftPeriod.expected_income);
  const plannedTotal = useMemo(
    () => currentLines.filter((line) => line.is_active).reduce((sum, line) => sum + toNumber(line.planned_amount), 0),
    [currentLines],
  );
  const stillUnplanned = expectedIncome - plannedTotal;
  const isOverPlanned = plannedTotal > expectedIncome;
  const activeLines = currentLines.filter((line) => line.is_active);
  const existingNames = new Set(activeLines.map((line) => line.category_name.trim().toLowerCase()));

  async function saveMoneyAvailable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIncomeNotice("");

    const amount = Number(moneyAvailable);
    if (!Number.isFinite(amount) || amount < 0) {
      setIncomeNotice("Enter zero or more.");
      return;
    }

    const result = await updatePeriod({
      budgetPeriodId: draftPeriod.id,
      expectedIncome: amount,
      notes: draftPeriod.notes ?? "",
    });

    if (!result.ok) {
      setIncomeNotice(result.message);
      return;
    }

    await refresh();
    setIncomeConfirmed(true);
    setIncomeNotice(amount === 0 ? "$0 saved. Continue if that is right for this plan." : "Money available saved.");
  }

  function chooseCategory(name: string, type: BudgetCategoryType) {
    setEditingId(null);
    setDraft({ categoryName: name, categoryType: type, plannedAmount: "" });
    setNotice("");
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>, line?: BudgetLine) {
    event.preventDefault();
    setNotice("");
    const name = draft.categoryName.trim();
    const amount = Number(draft.plannedAmount);

    if (!name) { setNotice("Choose or name a category."); return; }
    if (!Number.isFinite(amount) || amount < 0) { setNotice("Enter zero or more."); return; }

    const duplicate = activeLines.some(
      (candidate) => candidate.id !== line?.id && candidate.category_name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) { setNotice("That category is already in your plan."); return; }

    const result = line
      ? await updateLine({
          budgetLineId: line.id,
          categoryName: name,
          categoryType: draft.categoryType,
          plannedAmount: amount,
          isActive: true,
          sortOrder: line.sort_order,
        })
      : await addLine({
          budgetPeriodId: draftPeriod.id,
          categoryName: name,
          categoryType: draft.categoryType,
          plannedAmount: amount,
          sortOrder: currentLines.length,
        });

    setNotice(result.ok ? "Saved." : result.message);
    if (!result.ok) return;

    setDraft(emptyDraft);
    setEditingId(null);
    await refresh();
  }

  async function removeCategory(line: BudgetLine) {
    const result = await updateLine({
      budgetLineId: line.id,
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount: toNumber(line.planned_amount),
      isActive: false,
      sortOrder: line.sort_order,
    });

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
    if (isOverPlanned && !acknowledgeOverPlan) {
      setNotice(`Your plan is ${formatMoney(plannedTotal - expectedIncome)} above the income you entered.`);
      return;
    }

    const result = await activateBudget(draftPeriod.id, isOverPlanned ? acknowledgeOverPlan : false);
    setNotice(result.message);
    if (result.ok) await refresh();
  }

  const visibleGroups = showMoreCategories ? categoryGroups : categoryGroups.slice(0, 1);

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/78 p-5 pb-28 shadow-sm backdrop-blur-2xl sm:p-7 sm:pb-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Continue your plan</p>
          <h2 className="mt-2 text-4xl font-black leading-tight text-slate-950">
            {incomeConfirmed ? "What needs to be covered?" : "How much money is coming in?"}
          </h2>
          <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-slate-600">
            {incomeConfirmed
              ? "Pick what matters first. You can add more later."
              : "Enter what you expect for this plan. Zero is okay if that is accurate."}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">Draft</span>
      </div>

      {!incomeConfirmed ? (
        <form onSubmit={saveMoneyAvailable} className="mt-6 rounded-[1.7rem] border border-sky-100 bg-sky-50/80 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">Step 1 · Money available</p>
          <label className="mt-3 block text-xl font-black text-sky-950">
            Expected income
            <div className="mt-3 flex items-center rounded-2xl border border-sky-200 bg-white px-4">
              <span className="text-3xl font-black text-sky-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={moneyAvailable}
                onChange={(event) => setMoneyAvailable(event.target.value)}
                className="w-full bg-transparent px-3 py-4 text-3xl font-black text-slate-950 outline-none"
              />
            </div>
          </label>
          <p className="mt-3 text-base font-semibold leading-6 text-sky-800">
            Use the amount you expect during this plan period. You can change it later.
          </p>
          {incomeNotice ? <p className="mt-3 rounded-2xl bg-white/75 p-3 text-base font-bold text-sky-900">{incomeNotice}</p> : null}
          <button
            type="submit"
            disabled={working}
            className="mt-4 w-full rounded-full bg-sky-700 px-5 py-4 text-lg font-black text-white disabled:opacity-50"
          >
            Save & continue
          </button>
        </form>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Income</p>
              <p className="mt-2 whitespace-nowrap text-xl font-black">{formatMoney(expectedIncome)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Planned</p>
              <p className="mt-2 whitespace-nowrap text-xl font-black">{formatMoney(plannedTotal)}</p>
            </div>
            <div className={`rounded-2xl p-4 ${stillUnplanned < 0 ? "bg-amber-50" : "bg-emerald-50"}`}>
              <p className={`text-xs font-black uppercase tracking-wide ${stillUnplanned < 0 ? "text-amber-800" : "text-emerald-800"}`}>
                {stillUnplanned < 0 ? "Over" : "Left"}
              </p>
              <p className={`mt-2 whitespace-nowrap text-xl font-black ${stillUnplanned < 0 ? "text-amber-950" : "text-emerald-950"}`}>
                {formatMoney(Math.abs(stillUnplanned))}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setMoneyAvailable(String(expectedIncome)); setIncomeNotice(""); setIncomeConfirmed(false); }}
            className="mt-3 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-base font-black text-slate-600"
          >
            Change money available
          </button>
        </>
      )}

      {incomeConfirmed ? <div className="mt-7">
        {visibleGroups.map((group) => (
          <div key={group.title} className="mt-5 first:mt-0">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black text-slate-950">{group.title}</h3>
                <p className="mt-1 text-base font-semibold text-slate-500">{group.note}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {group.items.map((starter) => {
                const used = existingNames.has(starter.name.toLowerCase());
                const selected = draft.categoryName === starter.name;

                return (
                  <button
                    key={starter.name}
                    type="button"
                    disabled={used}
                    onClick={() => chooseCategory(starter.name, starter.type)}
                    className={`min-h-16 rounded-2xl border px-4 py-4 text-left text-base font-black transition ${used
                      ? "border-slate-100 bg-slate-100 text-slate-400"
                      : selected
                        ? "border-emerald-700 bg-emerald-700 text-white shadow-md"
                        : "border-emerald-100 bg-emerald-50 text-emerald-950"}`}
                  >
                    {starter.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowMoreCategories((current) => !current)}
          className="mt-4 w-full rounded-full border border-slate-200 bg-white px-5 py-3.5 text-base font-black text-slate-700"
        >
          {showMoreCategories ? "Show fewer choices" : "More categories"}
        </button>
      </div>

      <form onSubmit={(event) => void saveCategory(event)} className="mt-6 rounded-[1.7rem] bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-slate-500">Selected category</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{draft.categoryName || "Choose one above"}</p>
          </div>
          {draft.categoryName ? <button type="button" onClick={() => setDraft(emptyDraft)} className="text-sm font-black text-slate-500">Clear</button> : null}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-base font-black text-slate-600">Use a custom category</summary>
          <input
            value={draft.categoryName}
            onChange={(event) => setDraft((current) => ({ ...current, categoryName: event.target.value }))}
            placeholder="Name your own"
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {types.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, categoryType: type.value }))}
                className={`rounded-full px-3 py-3 text-base font-black ${draft.categoryType === type.value ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </details>

        <label className="mt-5 block text-lg font-black">
          Amount
          <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4">
            <span className="text-2xl font-black text-slate-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={draft.plannedAmount}
              onChange={(event) => setDraft((current) => ({ ...current, plannedAmount: event.target.value }))}
              className="w-full bg-transparent px-3 py-4 text-3xl font-black outline-none"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={working || !draft.categoryName}
          className="mt-4 w-full rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white disabled:opacity-40"
        >
          Add to plan
        </button>
      </form>

      {activeLines.length ? (
        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Your plan so far</p>
              <h3 className="mt-1 text-2xl font-black">{activeLines.length} selected</h3>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {activeLines.map((line) => {
              const editing = editingId === line.id;
              if (editing) {
                return (
                  <form key={line.id} onSubmit={(event) => void saveCategory(event, line)} className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xl font-black">{line.category_name}</p>
                    <div className="mt-3 flex items-center rounded-xl border border-slate-200 bg-white px-3">
                      <span className="font-black text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={draft.plannedAmount}
                        onChange={(event) => setDraft((current) => ({ ...current, plannedAmount: event.target.value }))}
                        className="w-full bg-transparent px-2 py-3 text-2xl font-black outline-none"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="submit" className="rounded-full bg-emerald-700 px-4 py-3 font-black text-white">Save</button>
                      <button type="button" onClick={() => void removeCategory(line)} className="rounded-full border border-rose-200 bg-white px-4 py-3 font-black text-rose-700">Remove</button>
                    </div>
                  </form>
                );
              }

              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => {
                    setEditingId(line.id);
                    setDraft({
                      categoryName: line.category_name,
                      categoryType: line.category_type as BudgetCategoryType,
                      plannedAmount: String(toNumber(line.planned_amount)),
                    });
                    setNotice("");
                  }}
                  className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-white/90 p-4 text-left"
                >
                  <div>
                    <p className="text-lg font-black">{line.category_name}</p>
                    <p className="mt-1 text-base font-bold text-slate-500">{formatMoney(line.planned_amount)}</p>
                  </div>
                  <span className="rounded-full bg-slate-50 px-3 py-2 text-sm font-black text-slate-500">Change</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isOverPlanned ? (
        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-base font-bold text-amber-950">
          <input
            type="checkbox"
            checked={acknowledgeOverPlan}
            onChange={(event) => setAcknowledgeOverPlan(event.target.checked)}
            className="mt-1 h-5 w-5"
          />
          <span>Use this plan even though it is {formatMoney(plannedTotal - expectedIncome)} above the income entered.</span>
        </label>
      ) : null}

      {notice ? <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-base font-bold text-slate-700">{notice}</p> : null}
      {errorMessage ? <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-base font-bold text-rose-800">{errorMessage}</p> : null}

      <button
        type="button"
        disabled={working || activeLines.length === 0}
        onClick={() => void activate()}
        className="mt-6 w-full rounded-full bg-emerald-700 px-5 py-4 text-xl font-black text-white disabled:opacity-40"
      >
        Use this plan
      </button>
      </div> : null}
    </section>
  );
}
