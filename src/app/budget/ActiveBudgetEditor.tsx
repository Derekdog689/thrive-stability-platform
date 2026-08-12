"use client";

import { FormEvent, useState } from "react";
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
}> = [
  { value: "protected", label: "Essential" },
  { value: "flexible", label: "Flexible" },
  { value: "support", label: "Support / wellness" },
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

export default function ActiveBudgetEditor({
  activePeriod,
  currentLines,
  refresh,
}: Props) {
 const {
  working,
  errorMessage,
  updatePeriod,
  addLine,
  updateLine,
} = useParticipantBudgetBuilder();

  const [open, setOpen] = useState(false);
  const [periodDraft, setPeriodDraft] = useState({
    expectedIncome: String(toNumber(activePeriod.expected_income)),
    notes: activePeriod.notes ?? "",
  });
  const [periodNotice, setPeriodNotice] = useState("");
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineDraft, setLineDraft] = useState<LineDraft>({
    categoryName: "",
    categoryType: "protected",
    plannedAmount: "",
  });
  const [newLineDraft, setNewLineDraft] = useState<LineDraft>({
  categoryName: "",
  categoryType: "protected",
  plannedAmount: "",
});
  const [lineNotice, setLineNotice] = useState("");
  const [newLineNotice, setNewLineNotice] = useState("");
  const [addingLine, setAddingLine] = useState(false);
  const existingNames = new Set(
  currentLines.map((line) =>
    line.category_name.trim().toLowerCase(),
  ),
);

  function resetPeriodDraft() {
    setPeriodDraft({
      expectedIncome: String(toNumber(activePeriod.expected_income)),
      notes: activePeriod.notes ?? "",
    });
    setPeriodNotice("");
  }

  async function handleSavePeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPeriodNotice("");

    const expectedIncome = Number(periodDraft.expectedIncome);

    if (!Number.isFinite(expectedIncome) || expectedIncome < 0) {
      setPeriodNotice("Enter an expected income of zero or more.");
      return;
    }

    const result = await updatePeriod({
      budgetPeriodId: activePeriod.id,
      expectedIncome,
      notes: periodDraft.notes,
    });

    setPeriodNotice(result.message);

    if (!result.ok) {
      return;
    }

    await refresh();
  }

  async function handleAddLine(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setNewLineNotice("");

  const categoryName = newLineDraft.categoryName.trim();

  if (!categoryName) {
    setNewLineNotice("Enter a category name.");
    return;
  }

  const duplicateName = currentLines.some(
    (candidate) =>
      candidate.category_name.trim().toLowerCase() ===
      categoryName.toLowerCase(),
  );

  if (duplicateName) {
    setNewLineNotice("That category name is already part of this plan.");
    return;
  }

  const plannedAmount = Number(newLineDraft.plannedAmount);

  if (!Number.isFinite(plannedAmount) || plannedAmount < 0) {
    setNewLineNotice("Enter a planned amount of zero or more.");
    return;
  }

  const result = await addLine({
    budgetPeriodId: activePeriod.id,
    categoryName,
    categoryType: newLineDraft.categoryType,
    plannedAmount,
    sortOrder: currentLines.length,
  });

  setNewLineNotice(result.message);

  if (!result.ok) {
    return;
  }

  setNewLineDraft({
    categoryName: "",
    categoryType: "protected",
    plannedAmount: "",
  });

  await refresh();
}

  function beginLineEdit(line: BudgetLine) {
    setEditingLineId(line.id);
    setLineNotice("");
    setLineDraft({
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount: String(toNumber(line.planned_amount)),
    });
  }

  function cancelLineEdit() {
    setEditingLineId(null);
    setLineNotice("");
  }

  async function handleSaveLine(
    event: FormEvent<HTMLFormElement>,
    line: BudgetLine,
  ) {
    event.preventDefault();
    setLineNotice("");

    const categoryName = lineDraft.categoryName.trim();

    if (!categoryName) {
      setLineNotice("Enter a category name.");
      return;
    }

    const duplicateName = currentLines.some(
      (candidate) =>
        candidate.id !== line.id &&
        candidate.category_name.trim().toLowerCase() ===
          categoryName.toLowerCase(),
    );

    if (duplicateName) {
      setLineNotice("That category name is already part of this plan.");
      return;
    }

    const plannedAmount = Number(lineDraft.plannedAmount);

    if (!Number.isFinite(plannedAmount) || plannedAmount < 0) {
      setLineNotice("Enter a planned amount of zero or more.");
      return;
    }

    const result = await updateLine({
      budgetLineId: line.id,
      categoryName,
      categoryType: lineDraft.categoryType,
      plannedAmount,
      isActive: true,
      sortOrder: line.sort_order,
    });

    setLineNotice(result.message);

    if (!result.ok) {
      return;
    }

    setEditingLineId(null);
    await refresh();
  }

  async function handleDeactivate(line: BudgetLine) {
    setLineNotice("");

    const result = await updateLine({
      budgetLineId: line.id,
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount: toNumber(line.planned_amount),
      isActive: false,
      sortOrder: line.sort_order,
    });

    setLineNotice(result.message);

    if (!result.ok) {
      return;
    }

    setEditingLineId(null);
    await refresh();
  }

  if (!open) {
    return (
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          Active plan
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Your plan can still change.</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Update what you expect to have available or adjust the categories you
              planned. Recorded account activity stays separate and is not edited here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetPeriodDraft();
              setOpen(true);
            }}
            className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-black text-emerald-900"
          >
            Edit active plan
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Edit active plan
          </p>
          <h2 className="mt-2 text-2xl font-black">Adjust the plan you are using.</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Changes update your plan only. They do not change imported transactions,
            recorded activity, or the Budget period dates.
          </p>
        </div>
        <button
          type="button"
          disabled={working}
          onClick={() => {
            resetPeriodDraft();
            setEditingLineId(null);
            setLineNotice("");
            setOpen(false);
          }}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-60"
        >
          Close editor
        </button>
      </div>

      <form
        onSubmit={handleSavePeriod}
        className="mt-6 grid gap-5 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">
            Expected income
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4">
              <span aria-hidden="true" className="font-black text-slate-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                required
                disabled={working}
                value={periodDraft.expectedIncome}
                onChange={(event) =>
                  setPeriodDraft((current) => ({
                    ...current,
                    expectedIncome: event.target.value,
                  }))
                }
                className="w-full bg-transparent px-3 py-3 font-normal outline-none"
              />
            </div>
          </label>

          <label className="text-sm font-black">
            Anything you want to remember?
            <textarea
              rows={3}
              disabled={working}
              value={periodDraft.notes}
              onChange={(event) =>
                setPeriodDraft((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
            />
          </label>
        </div>

        <p className="text-sm text-slate-500">
          Period dates stay fixed after the plan is created.
        </p>

        {periodNotice ? (
          <p role="status" aria-live="polite" className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700">
            {periodNotice}
          </p>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={working}
            className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-60"
          >
            {working ? "Saving..." : "Save plan details"}
          </button>
        </div>
      </form>
        <div className="mt-7 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
  <div>
    <p className="text-sm font-black">Categories in this active plan</p>
    <p className="mt-1 text-sm leading-6 text-slate-500">
      Planned amounts can change. Recorded and remaining amounts are shown for
      context and are not directly editable.
    </p>
  </div>

  <button
    type="button"
    disabled={working}
    onClick={() => {
      setNewLineNotice("");
      setAddingLine(true);
    }}
    className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900 disabled:opacity-60"
  >
    Add category
  </button>
</div>
{addingLine ? (
  <form
    onSubmit={handleAddLine}
    className="grid gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-5"
  >
    <div>
  <p className="text-sm font-black">Starter categories</p>
  <p className="mt-1 text-sm text-slate-600">
    Choose one to fill the category name and type, or enter your own below.
  </p>

  <div className="mt-3 flex flex-wrap gap-2">
    {starterCategories.map((starter) => {
      const alreadyUsed = existingNames.has(starter.name.toLowerCase());

      return (
        <button
          key={starter.name}
          type="button"
          disabled={working || alreadyUsed}
          onClick={() => {
            setNewLineDraft({
              categoryName: starter.name,
              categoryType: starter.type,
              plannedAmount: "",
            });
            setNewLineNotice("");
          }}
          className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starter.name}
        </button>
      );
    })}
  </div>
</div>

    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
      <label className="text-sm font-black">
        Category name
        <input
          type="text"
          required
          disabled={working}
          value={newLineDraft.categoryName}
          onChange={(event) =>
            setNewLineDraft((current) => ({
              ...current,
              categoryName: event.target.value,
            }))
          }
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
        />
      </label>

      <label className="text-sm font-black">
        Type
        <select
          disabled={working}
          value={newLineDraft.categoryType}
          onChange={(event) =>
            setNewLineDraft((current) => ({
              ...current,
              categoryType: event.target.value as BudgetCategoryType,
            }))
          }
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
          <span aria-hidden="true" className="font-black text-slate-500">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            required
            disabled={working}
            value={newLineDraft.plannedAmount}
            onChange={(event) =>
              setNewLineDraft((current) => ({
                ...current,
                plannedAmount: event.target.value,
              }))
            }
            className="w-full bg-transparent px-3 py-3 font-normal outline-none"
          />
        </div>
      </label>
    </div>

    {newLineNotice ? (
      <p
        role="status"
        aria-live="polite"
        className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700"
      >
        {newLineNotice}
      </p>
    ) : null}

    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        disabled={working}
        className="rounded-2xl bg-emerald-700 px-5 py-2 font-black text-white disabled:opacity-60"
      >
        {working ? "Saving..." : "Save new category"}
      </button>

      <button
        type="button"
        disabled={working}
        onClick={() => {
          setNewLineDraft({
            categoryName: "",
            categoryType: "protected",
            plannedAmount: "",
          });
          setNewLineNotice("");
          setAddingLine(false);
        }}
        className="rounded-2xl border border-slate-300 bg-white px-5 py-2 font-black text-slate-700 disabled:opacity-60"
      >
        Cancel
      </button>
    </div>
  </form>
) : null}

        {currentLines.map((line) => {
          const isEditing = editingLineId === line.id;

          return (
            <article key={line.id} className="rounded-3xl border border-slate-100 p-5">
              {!isEditing ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black">{line.category_name}</h3>
                      <p className="mt-1 text-sm capitalize text-slate-500">
                        {line.category_type.replaceAll("_", " ")}
                      </p>
                    </div>
                    <p className="font-black">{formatMoney(line.planned_amount)} planned</p>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-500">Recorded</p>
                      <p className="mt-1 font-black">{formatMoney(line.actual_amount)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-500">Remaining</p>
                      <p className="mt-1 font-black">{formatMoney(line.remaining_amount)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-500">Above plan by</p>
                      <p className="mt-1 font-black">
                        {formatMoney(Math.max(toNumber(line.actual_amount) - toNumber(line.planned_amount), 0))}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={working}
                    onClick={() => beginLineEdit(line)}
                    className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900 disabled:opacity-60"
                  >
                    Edit category
                  </button>
                </>
              ) : (
                <form onSubmit={(event) => handleSaveLine(event, line)} className="grid gap-4">
                  <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
                    <label className="text-sm font-black">
                      Category name
                      <input
                        type="text"
                        required
                        disabled={working}
                        value={lineDraft.categoryName}
                        onChange={(event) =>
                          setLineDraft((current) => ({
                            ...current,
                            categoryName: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                      />
                    </label>

                    <label className="text-sm font-black">
                      Type
                      <select
                        disabled={working}
                        value={lineDraft.categoryType}
                        onChange={(event) =>
                          setLineDraft((current) => ({
                            ...current,
                            categoryType: event.target.value as BudgetCategoryType,
                          }))
                        }
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
                          required
                          disabled={working}
                          value={lineDraft.plannedAmount}
                          onChange={(event) =>
                            setLineDraft((current) => ({
                              ...current,
                              plannedAmount: event.target.value,
                            }))
                          }
                          className="w-full bg-transparent px-3 py-3 font-normal outline-none"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-500">Recorded activity</p>
                      <p className="mt-1 font-black">{formatMoney(line.actual_amount)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-500">Current remaining</p>
                      <p className="mt-1 font-black">{formatMoney(line.remaining_amount)}</p>
                    </div>
                  </div>

                  {errorMessage ? (
                    <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-950">
                      {errorMessage}
                    </p>
                  ) : null}

                  {lineNotice ? (
                    <p role="status" aria-live="polite" className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                      {lineNotice}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={working}
                      className="rounded-2xl bg-emerald-700 px-5 py-2 font-black text-white disabled:opacity-60"
                    >
                      {working ? "Saving..." : "Save category"}
                    </button>
                    <button
                      type="button"
                      disabled={working}
                      onClick={cancelLineEdit}
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
                      Remove from active plan
                    </button>
                  </div>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
