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

const emptyLineDraft: LineDraft = {
  categoryName: "",
  categoryType: "protected",
  plannedAmount: "",
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
    completeBudget,
  } = useParticipantBudgetBuilder();

  const [open, setOpen] = useState(false);
  const [periodDraft, setPeriodDraft] = useState({
    expectedIncome: String(toNumber(activePeriod.expected_income)),
    notes: activePeriod.notes ?? "",
  });
  const [periodNotice, setPeriodNotice] = useState("");
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineDraft, setLineDraft] = useState<LineDraft>(emptyLineDraft);
  const [lineNotice, setLineNotice] = useState("");
  const [addingLine, setAddingLine] = useState(false);
  const [newLineDraft, setNewLineDraft] = useState<LineDraft>(emptyLineDraft);
  const [newLineNotice, setNewLineNotice] = useState("");

  const activeLines = useMemo(
    () => currentLines.filter((line) => line.is_active),
    [currentLines],
  );

  const plannedTotal = activeLines.reduce(
    (sum, line) => sum + toNumber(line.planned_amount),
    0,
  );
  const unplannedAmount = Math.max(
    toNumber(activePeriod.expected_income) - plannedTotal,
    0,
  );

  const existingNames = new Set(
    currentLines.map((line) => line.category_name.trim().toLowerCase()),
  );

  function resetPeriodDraft() {
    setPeriodDraft({
      expectedIncome: String(toNumber(activePeriod.expected_income)),
      notes: activePeriod.notes ?? "",
    });
    setPeriodNotice("");
  }

  function closeEditor() {
    resetPeriodDraft();
    setEditingLineId(null);
    setLineNotice("");
    setAddingLine(false);
    setNewLineDraft(emptyLineDraft);
    setNewLineNotice("");
    setOpen(false);
  }

  async function handleCompleteBudget() {
    setPeriodNotice("");

    const confirmed = window.confirm(
      "Complete this Budget? The plan will become read-only, but transaction allocation corrections will remain available for 45 days.",
    );

    if (!confirmed) return;

    const result = await completeBudget(activePeriod.id);
    setPeriodNotice(result.message);

    if (!result.ok) return;

    setOpen(false);
    await refresh();
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
    if (!result.ok) return;

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

    if (existingNames.has(categoryName.toLowerCase())) {
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
    if (!result.ok) return;

    setNewLineDraft(emptyLineDraft);
    setAddingLine(false);
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
    setLineDraft(emptyLineDraft);
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
    if (!result.ok) return;

    setEditingLineId(null);
    setLineDraft(emptyLineDraft);
    await refresh();
  }

  async function handleDeactivate(line: BudgetLine) {
    setLineNotice("");

    const confirmed = window.confirm(
      `Remove ${line.category_name} from the active plan? Its history will be preserved.`,
    );

    if (!confirmed) return;

    const result = await updateLine({
      budgetLineId: line.id,
      categoryName: line.category_name,
      categoryType: line.category_type as BudgetCategoryType,
      plannedAmount: toNumber(line.planned_amount),
      isActive: false,
      sortOrder: line.sort_order,
    });

    setLineNotice(result.message);
    if (!result.ok) return;

    setEditingLineId(null);
    setLineDraft(emptyLineDraft);
    await refresh();
  }

  if (!open) {
    return (
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Active plan
            </p>
            <h2 className="mt-2 text-2xl font-black">Your plan can still change.</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Adjust expected income or category amounts when your plan changes.
              Recorded account activity stays separate.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={working}
              onClick={() => {
                resetPeriodDraft();
                setOpen(true);
              }}
              className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-black text-emerald-900 disabled:opacity-60"
            >
              Edit plan
            </button>

            <button
              type="button"
              disabled={working}
              onClick={handleCompleteBudget}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 disabled:opacity-60"
            >
              {working ? "Completing..." : "Complete Budget"}
            </button>
          </div>
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
          <h2 className="mt-2 text-2xl font-black">Change the plan, not the record.</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Edit what you expect to have available and how much you want planned in
            each category. Imported transactions are not edited here.
          </p>
        </div>

        <button
          type="button"
          disabled={working}
          onClick={closeEditor}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-60"
        >
          Close editor
        </button>
      </div>

      <form
        onSubmit={handleSavePeriod}
        className="mt-6 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">
            Expected income
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
              rows={2}
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

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>Budget dates stay fixed after the plan is created.</span>
          <span>
            {formatMoney(plannedTotal)} planned · {formatMoney(unplannedAmount)} unplanned
          </span>
        </div>

        {periodNotice ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700"
          >
            {periodNotice}
          </p>
        ) : null}

        {errorMessage ? (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-950"
          >
            {errorMessage}
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

      <div className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black">Categories in this plan</p>
            <p className="mt-1 text-sm text-slate-500">
              Change the name, type, or planned amount. Current activity remains visible
              in the Budget summary below after you close the editor.
            </p>
          </div>

          <button
            type="button"
            disabled={working || addingLine}
            onClick={() => {
              setNewLineDraft(emptyLineDraft);
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
            className="mt-4 grid gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-5"
          >
            <div>
              <p className="text-sm font-black">Starter categories</p>
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
                  setNewLineDraft(emptyLineDraft);
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

        <div className="mt-4 divide-y divide-slate-100 rounded-3xl border border-slate-100">
          {activeLines.map((line) => {
            const isEditing = editingLineId === line.id;

            return (
              <article key={line.id} className="p-4 sm:p-5">
                {!isEditing ? (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black">{line.category_name}</h3>
                      <p className="mt-1 text-sm capitalize text-slate-500">
                        {line.category_type.replaceAll("_", " ")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <p className="font-black">{formatMoney(line.planned_amount)}</p>
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => beginLineEdit(line)}
                        className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900 disabled:opacity-60"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(event) => handleSaveLine(event, line)}
                    className="grid gap-4"
                  >
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

                    {lineNotice ? (
                      <p
                        role="status"
                        aria-live="polite"
                        className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                      >
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
      </div>
    </section>
  );
}
