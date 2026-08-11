"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BudgetLine,
  BudgetPeriod,
  formatMoney,
  toNumber,
} from "../useParticipantFinancial";
import {
  BudgetCategoryType,
  useParticipantBudgetBuilder,
} from "./useParticipantBudgetBuilder";

const starterCategories: Array<{
  name: string;
  type: BudgetCategoryType;
}> = [
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

const categoryTypes: Array<{
  value: BudgetCategoryType;
  label: string;
  detail: string;
}> = [
  {
    value: "protected",
    label: "Essential",
    detail: "Something you want to protect first.",
  },
  {
    value: "flexible",
    label: "Flexible",
    detail: "Something you can adjust as life changes.",
  },
  {
    value: "support",
    label: "Support / wellness",
    detail: "Something connected to stability, care, or support.",
  },
  {
    value: "reserve",
    label: "Reserve",
    detail: "Money you want to keep available for later.",
  },
];

type Props = {
  draftPeriod: BudgetPeriod;
  currentLines: BudgetLine[];
  refresh: () => Promise<void>;
};

type EditDraft = {
  categoryName: string;
  categoryType: BudgetCategoryType;
  plannedAmount: string;
};

export default function BudgetDraftCategoryBuilder({
  draftPeriod,
  currentLines,
  refresh,
}: Props) {
  const {
    working,
    errorMessage,
    addLine,
    updateLine,
  } = useParticipantBudgetBuilder();

  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] =
    useState<BudgetCategoryType>("protected");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [notice, setNotice] = useState("");
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({
    categoryName: "",
    categoryType: "protected",
    plannedAmount: "",
  });
  const [editNotice, setEditNotice] = useState("");

  const expectedIncome = toNumber(draftPeriod.expected_income);

  const plannedTotal = useMemo(
    () =>
      currentLines.reduce(
        (sum, line) => sum + toNumber(line.planned_amount),
        0,
      ),
    [currentLines],
  );

  const actualTotal = useMemo(
    () =>
      currentLines.reduce(
        (sum, line) => sum + toNumber(line.actual_amount),
        0,
      ),
    [currentLines],
  );

  const remainingTotal = useMemo(
    () =>
      currentLines.reduce(
        (sum, line) => sum + toNumber(line.remaining_amount),
        0,
      ),
    [currentLines],
  );

  const abovePlanTotal = Math.max(actualTotal - plannedTotal, 0);
  const stillUnplanned = expectedIncome - plannedTotal;

  const existingNames = useMemo(
    () =>
      new Set(
        currentLines.map((line) =>
          line.category_name.trim().toLowerCase(),
        ),
      ),
    [currentLines],
  );

  function chooseStarter(
    name: string,
    type: BudgetCategoryType,
  ) {
    setCategoryName(name);
    setCategoryType(type);
    setPlannedAmount("");
    setNotice("");
  }

  async function handleAddCategory(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setNotice("");

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setNotice("Enter a category name.");
      return;
    }

    if (existingNames.has(trimmedName.toLowerCase())) {
      setNotice("That category is already part of this plan.");
      return;
    }

    const amount = Number(plannedAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      setNotice("Enter a planned amount of zero or more.");
      return;
    }

    const result = await addLine({
      budgetPeriodId: draftPeriod.id,
      categoryName: trimmedName,
      categoryType,
      plannedAmount: amount,
      sortOrder: currentLines.length,
    });

    setNotice(result.message);

    if (!result.ok) {
      return;
    }

    setCategoryName("");
    setCategoryType("protected");
    setPlannedAmount("");
    await refresh();
  }

  function beginEditing(line: BudgetLine) {
    setEditingLineId(line.id);
    setEditNotice("");
    setEditDraft({
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount: String(toNumber(line.planned_amount)),
    });
  }

  function cancelEditing() {
    setEditingLineId(null);
    setEditNotice("");
  }

  async function handleSaveEdit(
    event: FormEvent<HTMLFormElement>,
    line: BudgetLine,
  ) {
    event.preventDefault();
    setEditNotice("");

    const trimmedName = editDraft.categoryName.trim();

    if (!trimmedName) {
      setEditNotice("Enter a category name.");
      return;
    }

    const duplicateName = currentLines.some(
      (candidate) =>
        candidate.id !== line.id &&
        candidate.category_name.trim().toLowerCase() ===
          trimmedName.toLowerCase(),
    );

    if (duplicateName) {
      setEditNotice("That category name is already part of this plan.");
      return;
    }

    const amount = Number(editDraft.plannedAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      setEditNotice("Enter a planned amount of zero or more.");
      return;
    }

    const result = await updateLine({
      budgetLineId: line.id,
      categoryName: trimmedName,
      categoryType: editDraft.categoryType,
      plannedAmount: amount,
      isActive: true,
      sortOrder: line.sort_order,
    });

    setEditNotice(result.message);

    if (!result.ok) {
      return;
    }

    setEditingLineId(null);
    await refresh();
  }

  async function handleDeactivate(line: BudgetLine) {
    setEditNotice("");

    const result = await updateLine({
      budgetLineId: line.id,
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount: toNumber(line.planned_amount),
      isActive: false,
      sortOrder: line.sort_order,
    });

    setEditNotice(result.message);

    if (!result.ok) {
      return;
    }

    setEditingLineId(null);
    await refresh();
  }

  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
        Build your draft
      </p>

      <h2 className="mt-2 text-2xl font-black">
        Choose the parts of your plan.
      </h2>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Starter categories are optional. Choose one that fits or type your own.
        You decide the planned amount. THRIVE does not fill in participant dollar
        amounts for you.
      </p>

      <div
        className={`mt-6 grid gap-4 ${
          abovePlanTotal > 0 ? "sm:grid-cols-2 xl:grid-cols-5" : "sm:grid-cols-3"
        }`}
      >
        <div className="rounded-2xl bg-emerald-700 p-5 text-white">
          <p className="text-sm font-bold text-emerald-100">Expected income</p>
          <p className="mt-2 text-3xl font-black">{formatMoney(expectedIncome)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-500">Planned so far</p>
          <p className="mt-2 text-3xl font-black">{formatMoney(plannedTotal)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-500">Still unplanned</p>
          <p className="mt-2 text-3xl font-black">{formatMoney(stillUnplanned)}</p>
          {stillUnplanned < 0 ? (
            <p className="mt-2 text-sm font-semibold text-amber-800">
              Your draft is {formatMoney(Math.abs(stillUnplanned))} above the
              income you entered. You can keep working on the draft.
            </p>
          ) : null}
        </div>

        {abovePlanTotal > 0 ? (
          <>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Remaining</p>
              <p className="mt-2 text-3xl font-black">{formatMoney(remainingTotal)}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-800">Above plan by</p>
              <p className="mt-2 text-3xl font-black text-amber-950">
                {formatMoney(abovePlanTotal)}
              </p>
              <p className="mt-2 text-sm text-amber-900">
                Recorded activity is above the amount currently planned.
              </p>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-7">
        <p className="text-sm font-black">Starter categories</p>
        <p className="mt-1 text-sm text-slate-500">
          Choosing one only fills the category name and type. It does not save
          anything until you add it to your plan.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {starterCategories.map((starter) => {
            const alreadyUsed = existingNames.has(starter.name.toLowerCase());
            return (
              <button
                key={starter.name}
                type="button"
                disabled={working || alreadyUsed}
                onClick={() => chooseStarter(starter.name, starter.type)}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {starter.name}
              </button>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleAddCategory}
        className="mt-7 grid gap-5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-6"
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <label className="text-sm font-black">
            Category name
            <input
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              disabled={working}
              placeholder="Type your own or choose above"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
            />
          </label>

          <label className="text-sm font-black">
            Type
            <select
              value={categoryType}
              onChange={(event) =>
                setCategoryType(event.target.value as BudgetCategoryType)
              }
              disabled={working}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
            >
              {categoryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-black">
            Planned amount
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4">
              <span aria-hidden="true" className="font-black text-slate-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={plannedAmount}
                onChange={(event) => setPlannedAmount(event.target.value)}
                disabled={working}
                required
                placeholder="0.00"
                className="w-full bg-transparent px-3 py-3 font-normal outline-none"
              />
            </div>
          </label>
        </div>

        <p className="text-sm text-slate-600">
          {categoryTypes.find((type) => type.value === categoryType)?.detail}
        </p>

        {errorMessage ? (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-950">
            {errorMessage}
          </p>
        ) : null}

        {notice ? (
          <p role="status" aria-live="polite" className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700">
            {notice}
          </p>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={working}
            className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working ? "Adding category..." : "Add to my plan"}
          </button>
        </div>
      </form>

      {currentLines.length > 0 ? (
        <div className="mt-7">
          <p className="text-sm font-black">Currently in this draft</p>
          <div className="mt-3 grid gap-3">
            {currentLines.map((line) => {
              const planned = toNumber(line.planned_amount);
              const actual = toNumber(line.actual_amount);
              const remaining = toNumber(line.remaining_amount);
              const abovePlanAmount = Math.max(actual - planned, 0);
              const isEditing = editingLineId === line.id;

              return (
                <div key={line.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                  {isEditing ? (
                    <form onSubmit={(event) => handleSaveEdit(event, line)} className="grid gap-4">
                      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
                        <label className="text-sm font-black">
                          Category name
                          <input
                            type="text"
                            value={editDraft.categoryName}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, categoryName: event.target.value }))
                            }
                            disabled={working}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                          />
                        </label>

                        <label className="text-sm font-black">
                          Type
                          <select
                            value={editDraft.categoryType}
                            onChange={(event) =>
                              setEditDraft((current) => ({
                                ...current,
                                categoryType: event.target.value as BudgetCategoryType,
                              }))
                            }
                            disabled={working}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                          >
                            {categoryTypes.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </label>

                        <label className="text-sm font-black">
                          Planned amount
                          <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4">
                            <span aria-hidden="true" className="font-black text-slate-500">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={editDraft.plannedAmount}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, plannedAmount: event.target.value }))
                              }
                              disabled={working}
                              required
                              className="w-full bg-transparent px-3 py-3 font-normal outline-none"
                            />
                          </div>
                        </label>
                      </div>

                      {editNotice ? (
                        <p role="status" aria-live="polite" className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                          {editNotice}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={working}
                          className="rounded-2xl bg-emerald-700 px-5 py-2 font-black text-white disabled:opacity-60"
                        >
                          {working ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          type="button"
                          disabled={working}
                          onClick={cancelEditing}
                          className="rounded-2xl border border-slate-300 bg-white px-5 py-2 font-black text-slate-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => void handleDeactivate(line)}
                          className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-2 font-black text-amber-950 disabled:opacity-60"
                        >
                          Remove from current plan
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{line.category_name}</p>
                          <p className="mt-1 text-xs font-semibold capitalize text-slate-500">
                            {line.category_type.replaceAll("_", " ")}
                          </p>
                        </div>
                        <p className="font-black">{formatMoney(planned)} planned</p>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="font-semibold text-slate-500">Recorded</p>
                          <p className="mt-1 font-black">{formatMoney(actual)}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="font-semibold text-slate-500">Remaining</p>
                          <p className="mt-1 font-black">{formatMoney(remaining)}</p>
                        </div>
                        <div className={abovePlanAmount > 0 ? "rounded-xl border border-amber-200 bg-amber-50 p-3" : "rounded-xl bg-slate-50 p-3"}>
                          <p className={abovePlanAmount > 0 ? "font-semibold text-amber-800" : "font-semibold text-slate-500"}>Above plan by</p>
                          <p className={abovePlanAmount > 0 ? "mt-1 font-black text-amber-950" : "mt-1 font-black"}>
                            {formatMoney(abovePlanAmount)}
                          </p>
                        </div>
                      </div>

                      {abovePlanAmount > 0 ? (
                        <p className="mt-3 text-sm leading-6 text-amber-900">
                          Recorded activity is {formatMoney(abovePlanAmount)} above the amount currently planned for {line.category_name}.
                        </p>
                      ) : null}

                      <button
                        type="button"
                        disabled={working}
                        onClick={() => beginEditing(line)}
                        className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900 disabled:opacity-60"
                      >
                        Edit category
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-7 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          No categories have been added to this draft yet.
        </p>
      )}
    </section>
  );
}
