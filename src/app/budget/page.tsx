"use client";

import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  BudgetLine,
  BudgetPeriod,
  FinancialTransaction,
  formatDate,
  formatMoney,
  getBudgetCorrectionClosesAt,
  getBudgetLifecycleView,
  toNumber,
  useParticipantFinancial,
} from "../useParticipantFinancial";
import {
  ParticipantTransactionExplanation,
  TransactionExplanationCategory,
  TransactionExplanationDraft,
  useParticipantTransactionExplanations,
} from "../transaction-explanations/useParticipantTransactionExplanations";
import {
  ParticipantTransactionAllocation,
  useParticipantTransactionAllocations,
} from "../transaction-allocations/useParticipantTransactionAllocations";
import ActiveBudgetEditor from "./ActiveBudgetEditor";
import BudgetDraftCategoryBuilder from "./BudgetDraftCategoryBuilder";
import { useParticipantBudgetBuilder } from "./useParticipantBudgetBuilder";

const explanationCategories: Array<{
  value: TransactionExplanationCategory;
  label: string;
}> = [
  { value: "recognized_purchase", label: "Recognized purchase" },
  { value: "bill_or_essential", label: "Bill or essential" },
  { value: "transfer", label: "Transfer" },
  { value: "refund_or_reversal", label: "Refund or reversal" },
  { value: "shared_expense", label: "Shared expense" },
  { value: "medical_expense", label: "Medical expense" },
  { value: "cash_withdrawal_context", label: "Cash withdrawal context" },
  {
    value: "incorrect_or_unrecognized",
    label: "Incorrect or unrecognized",
  },
  { value: "other", label: "Other" },
];

const emptyExplanationDraft: TransactionExplanationDraft = {
  explanationCategory: "recognized_purchase",
  explanationText: "",
};

function getBudgetStatus(planned: number, actual: number, remaining: number) {
  if (planned <= 0 && actual <= 0) {
    return {
      label: "Plan available",
      detail: "Nothing has been recorded against this part of the plan yet.",
    };
  }

  if (remaining < 0 || actual > planned) {
    return {
      label: "Above the current plan",
      detail:
        "Recorded activity is higher than the amount currently planned for this category.",
    };
  }

  if (planned > 0 && remaining === 0) {
    return {
      label: "Plan fully used",
      detail: "The amount planned for this category has been fully used.",
    };
  }

  if (planned > 0 && actual / planned >= 0.8) {
    return {
      label: "Most of the plan is used",
      detail: "A smaller portion of this planned amount remains.",
    };
  }

  if (actual > 0) {
    return {
      label: "Within the current plan",
      detail: "Recorded activity remains within the amount currently planned.",
    };
  }

  return {
    label: "Plan available",
    detail: "This planned amount is still available.",
  };
}

function labelExplanationCategory(value: TransactionExplanationCategory) {
  return (
    explanationCategories.find((category) => category.value === value)?.label ??
    value.replaceAll("_", " ")
  );
}

function TransactionContextPanel({
  transactionId,
  explanation,
  canWrite,
  working,
  onCreate,
  onUpdate,
}: {
  transactionId: string;
  explanation: ParticipantTransactionExplanation | undefined;
  canWrite: boolean;
  working: boolean;
  onCreate: (
    transactionId: string,
    draft: TransactionExplanationDraft,
  ) => Promise<{ ok: boolean; message: string }>;
  onUpdate: (
    explanation: ParticipantTransactionExplanation,
    draft: TransactionExplanationDraft,
  ) => Promise<{ ok: boolean; message: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<TransactionExplanationDraft>({
    explanationCategory:
      explanation?.explanation_category ??
      emptyExplanationDraft.explanationCategory,
    explanationText: explanation?.explanation_text ?? "",
  });

  const editable = explanation?.status === "draft";

  function resetDraft() {
    setDraft({
      explanationCategory:
        explanation?.explanation_category ??
        emptyExplanationDraft.explanationCategory,
      explanationText: explanation?.explanation_text ?? "",
    });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const result = explanation
      ? await onUpdate(explanation, draft)
      : await onCreate(transactionId, draft);

    setNotice(result.message);

    if (result.ok) {
      setEditing(false);
    }
  }

  if (explanation && !editing) {
    return (
      <section className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
              Your context
            </p>
            <p className="mt-2 font-black">
              {labelExplanationCategory(explanation.explanation_category)}
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-900">
            {explanation.status.replaceAll("_", " ")}
          </span>
        </div>

        {explanation.explanation_text ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {explanation.explanation_text}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            No additional note was added.
          </p>
        )}

        {editable && canWrite ? (
          <button
            type="button"
            disabled={working}
            onClick={() => {
              resetDraft();
              setNotice("");
              setEditing(true);
            }}
            className="mt-4 rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-900 disabled:opacity-60"
          >
            Edit context
          </button>
        ) : null}
      </section>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        disabled={!canWrite || working}
        onClick={() => {
          resetDraft();
          setNotice("");
          setEditing(true);
        }}
        className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900 disabled:opacity-60"
      >
        Add context
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
    >
      <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
        Your context
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Add your own context to this account record. This does not change the
        imported transaction.
      </p>

      <label className="mt-4 block text-sm font-black">
        Context type
        <select
          value={draft.explanationCategory}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              explanationCategory:
                event.target.value as TransactionExplanationCategory,
            }))
          }
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
        >
          {explanationCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-black">
        Anything you want to add?
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Optional. Use your own words.
        </span>
        <textarea
          value={draft.explanationText}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              explanationText: event.target.value,
            }))
          }
          rows={4}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={working}
          className="rounded-2xl bg-emerald-700 px-5 py-2 font-black text-white disabled:opacity-60"
        >
          {working
            ? "Saving..."
            : explanation
              ? "Save changes"
              : "Save context"}
        </button>
        <button
          type="button"
          disabled={working}
          onClick={() => {
            resetDraft();
            setNotice("");
            setEditing(false);
          }}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-2 font-black text-slate-700 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      {notice ? (
        <p
          role={
            notice.includes("saved") || notice.includes("updated")
              ? "status"
              : "alert"
          }
          aria-live="polite"
          className="mt-3 text-sm font-semibold text-slate-700"
        >
          {notice}
        </p>
      ) : null}
    </form>
  );
}

function BudgetRelationshipPanel({
  transaction,
  activePeriod,
  budgetLines,
  allocations,
  working,
  onAllocate,
}: {
  transaction: FinancialTransaction;
  activePeriod: BudgetPeriod | null;
  budgetLines: BudgetLine[];
  allocations: ParticipantTransactionAllocation[];
  working: boolean;
  onAllocate: (
    stagedTransactionId: string,
    budgetLineId: string,
    allocatedAmount: number,
  ) => Promise<{ ok: boolean; message: string }>;
}) {
  const [selectedBudgetLineId, setSelectedBudgetLineId] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [notice, setNotice] = useState("");

  const activeAllocations = allocations.filter(
    (allocation) => allocation.status === "active",
  );

  const assignedTotal = activeAllocations.reduce(
    (sum, allocation) => sum + toNumber(allocation.allocated_amount),
    0,
  );

  const transactionAmount = Math.abs(toNumber(transaction.amount));
  const unassignedAmount = Math.max(transactionAmount - assignedTotal, 0);

  const transactionFallsInsideActiveBudget = Boolean(
    activePeriod &&
      transaction.posted_date >= activePeriod.period_start &&
      transaction.posted_date <= activePeriod.period_end,
  );

  const canAllocate = Boolean(
    activePeriod &&
      transactionFallsInsideActiveBudget &&
      budgetLines.length > 0 &&
      unassignedAmount > 0,
  );

  async function handleAllocate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const amount = toNumber(allocationAmount);

    if (!selectedBudgetLineId) {
      setNotice("Choose a Budget category.");
      return;
    }

    if (amount <= 0) {
      setNotice("Enter an amount greater than zero.");
      return;
    }

    if (amount > unassignedAmount) {
      setNotice(
        "The amount cannot be greater than the unassigned transaction amount.",
      );
      return;
    }

    const result = await onAllocate(
      transaction.id,
      selectedBudgetLineId,
      amount,
    );

    setNotice(result.message);

    if (result.ok) {
      setSelectedBudgetLineId("");
      setAllocationAmount("");
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-600">
        Budget relationship
      </p>

      {activeAllocations.length > 0 ? (
        <div className="mt-3 space-y-2">
          {activeAllocations.map((allocation) => (
            <div
              key={allocation.allocation_id}
              className="rounded-xl bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  {allocation.budget_category_name}
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatMoney(allocation.allocated_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No current Budget relationship is recorded for this transaction.
        </p>
      )}

      {canAllocate ? (
        <form onSubmit={handleAllocate} className="mt-4">
          <p className="text-sm leading-6 text-slate-600">
            Connect this transaction to the active Budget. This does not change
            the bank record.
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-black">
              Budget category
              <select
                value={selectedBudgetLineId}
                onChange={(event) => {
                  setSelectedBudgetLineId(event.target.value);
                  setNotice("");
                }}
                disabled={working}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
              >
                <option value="">Choose a category</option>
                {budgetLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.category_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-black">
              Amount to assign
              <input
                type="number"
                min="0"
                step="0.01"
                max={unassignedAmount}
                value={allocationAmount}
                onChange={(event) => {
                  setAllocationAmount(event.target.value);
                  setNotice("");
                }}
                disabled={working}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={working}
              className="rounded-2xl bg-emerald-700 px-5 py-2 font-black text-white disabled:opacity-60"
            >
              {working ? "Applying..." : "Apply to Budget"}
            </button>
            <p className="text-sm text-slate-500">
              {formatMoney(unassignedAmount)} not yet connected to this Budget.
            </p>
          </div>

          {notice ? (
            <p
              role={notice.includes("saved") ? "status" : "alert"}
              aria-live="polite"
              className="mt-3 text-sm font-semibold text-slate-700"
            >
              {notice}
            </p>
          ) : null}
        </form>
      ) : activePeriod && transactionFallsInsideActiveBudget ? (
        <p className="mt-3 text-sm text-slate-500">
          This transaction is already fully connected to the active Budget or
          no active category is available.
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          This is not part of an open Budget, so Budget editing is not available.
        </p>
      )}
    </section>
  );
}

function BudgetSummary({
  period,
  lines,
  latestBalanceTransaction,
  latestBalanceSource,
}: {
  period: BudgetPeriod;
  lines: BudgetLine[];
  latestBalanceTransaction: FinancialTransaction | null;
  latestBalanceSource: {
    source_name: string | null;
    account_mask: string | null;
  } | null;
}) {

  const plannedTotal = lines.reduce(
    (sum, line) => sum + toNumber(line.planned_amount),
    0,
  );
  const actualTotal = lines.reduce(
    (sum, line) => sum + toNumber(line.derived_actual_amount),
    0,
  );
  const remainingTotal = lines.reduce(
    (sum, line) => sum + toNumber(line.derived_remaining_amount),
    0,
  );
  const status = getBudgetStatus(plannedTotal, actualTotal, remainingTotal);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Current Budget
          </p>
          <h2 className="mt-2 text-2xl font-black">{status.label}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            {status.detail}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
          Active
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-emerald-700 p-6 text-white">
          <p className="text-sm font-bold text-emerald-100">Planned</p>
          <p className="mt-3 text-4xl font-black">{formatMoney(plannedTotal)}</p>
          <p className="mt-2 text-sm text-emerald-100">
            Amount currently set aside across this plan
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-bold text-slate-500">Expected income</p>
          <p className="mt-3 text-4xl font-black">
            {formatMoney(period.expected_income)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Amount you expect to have available during this plan
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-bold text-slate-500">Recorded activity</p>
          <p className="mt-3 text-4xl font-black">{formatMoney(actualTotal)}</p>
          <p className="mt-2 text-sm text-slate-500">
            Amount currently connected to this plan
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-bold text-slate-500">Remaining</p>
          <p className="mt-3 text-4xl font-black">
            {formatMoney(remainingTotal)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Amount left within the current plan
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 p-5">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Budget period
        </p>
        <p className="mt-2 font-black">
          {formatDate(period.period_start)} to {formatDate(period.period_end)}
        </p>
      </div>

      {latestBalanceTransaction ? (
  <div className="mt-4 rounded-2xl border border-slate-100 p-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Connected account
        </p>
        <p className="mt-2 font-black">
          {latestBalanceSource?.source_name ?? "Connected account"}
        </p>
        {latestBalanceSource?.account_mask ? (
          <p className="mt-1 text-sm text-slate-500">
            Account ending {latestBalanceSource.account_mask}
          </p>
        ) : null}
      </div>

      <div className="text-left sm:text-right">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Latest posted balance
        </p>
        <p className="mt-1 text-2xl font-black">
          {latestBalanceTransaction.daily_posted_balance != null
            ? formatMoney(latestBalanceTransaction.daily_posted_balance)
            : "Not available"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Observed {formatDate(latestBalanceTransaction.posted_date)}
        </p>
      </div>
    </div>
  </div>
) : null}

    </section>
  );
}

function BudgetCategorySummary({ lines }: { lines: BudgetLine[] }) {
  if (lines.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
        Your categories
      </p>
      <h2 className="mt-2 text-2xl font-black">See how each part is going</h2>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        These numbers describe the current plan and connected activity. They do
        not judge why a transaction happened or what it means about you.
      </p>

      <div className="mt-6 grid gap-4">
        {lines.map((line) => {
          const planned = toNumber(line.planned_amount);
          const actual = toNumber(line.derived_actual_amount);
          const remaining = toNumber(line.derived_remaining_amount);
          const status = getBudgetStatus(planned, actual, remaining);
          const usedPercent =
            planned > 0
              ? Math.max(0, Math.min(100, Math.round((actual / planned) * 100)))
              : 0;

          return (
            <article
              key={line.id}
              className="rounded-3xl border border-slate-100 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    {status.label}
                  </p>
                  <h3 className="mt-2 text-xl font-black">{line.category_name}</h3>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {line.category_type.replaceAll("_", " ")}
                  </p>
                </div>
                <p className="text-lg font-black">
                  {formatMoney(line.derived_remaining_amount)} remaining
                </p>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {status.detail}
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${usedPercent}%` }}
                  aria-label={`${usedPercent}% of the planned amount recorded`}
                />
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-500">Planned</p>
                  <p className="mt-1 font-black">{formatMoney(line.planned_amount)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-500">Recorded activity</p>
                  <p className="mt-1 font-black">
                    {formatMoney(line.derived_actual_amount)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-500">Remaining</p>
                  <p className="mt-1 font-black">
                    {formatMoney(line.derived_remaining_amount)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BudgetHistorySection({ periods }: { periods: BudgetPeriod[] }) {
  if (periods.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        Budget history
      </p>
      <h2 className="mt-2 text-2xl font-black">Recent Budgets</h2>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Completed Budgets remain part of your history. They are read-only unless
        you deliberately enter an approved correction process.
      </p>

      <div className="mt-6 grid gap-3">
        {periods.map((period) => {
          const lifecycle = getBudgetLifecycleView(period);
          const correctionClosesAt = getBudgetCorrectionClosesAt(period);

          return (
            <article
              key={period.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-black">
                    {formatDate(period.period_start)} to {formatDate(period.period_end)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Completed Budget</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">
                  Completed
                </span>
              </div>

              {lifecycle === "recent_history" && correctionClosesAt ? (
                <p className="mt-3 text-sm text-slate-500">
                  If something needs correction, the correction period remains
                  available until{" "}
                  {correctionClosesAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  .
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  This Budget is part of your read-only history.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function BudgetPage() {
  const {
    activeProgramId,
    sources,
    budgetPeriods,
    budgetLines,
    transactions,
    loading,
    errorMessage,
    refresh,
  } = useParticipantFinancial();

  const {
    explanationByTransactionId,
    loading: explanationsLoading,
    errorMessage: explanationErrorMessage,
    workingTransactionId,
    canWrite,
    createDraft,
    updateDraft,
  } = useParticipantTransactionExplanations();

  const {
    allocationsByTransactionId,
    loading: allocationsLoading,
    errorMessage: allocationErrorMessage,
    workingTransactionId: allocationWorkingTransactionId,
    allocateTransaction,
  } = useParticipantTransactionAllocations();

  const {
    working: budgetWorking,
    errorMessage: budgetWriteErrorMessage,
    createDraft: createBudgetDraft,
  } = useParticipantBudgetBuilder();

  const [newBudgetDraft, setNewBudgetDraft] = useState({
    periodStart: "",
    periodEnd: "",
    expectedIncome: "",
    notes: "",
  });
  const [budgetNotice, setBudgetNotice] = useState("");

  const activePeriod =
    budgetPeriods.find((period) => period.status === "active") ?? null;
  const draftPeriod =
    budgetPeriods.find((period) => period.status === "draft") ?? null;
  const hasOpenBudget = Boolean(activePeriod || draftPeriod);

  const activeLines = activePeriod
    ? budgetLines.filter(
        (line) => line.budget_period_id === activePeriod.id && line.is_active,
      )
    : [];

  const draftLines = draftPeriod
    ? budgetLines.filter((line) => line.budget_period_id === draftPeriod.id)
    : [];

  const completedPeriods = budgetPeriods.filter(
    (period) => period.status === "completed" || period.status === "archived",
  );

  const currentBudgetTransactions = activePeriod
  ? transactions.filter(
      (transaction) =>
        transaction.posted_date >= activePeriod.period_start &&
        transaction.posted_date <= activePeriod.period_end,
    )
  : [];

  const latestBalanceTransaction = transactions.reduce(
    (latest, transaction) => {
      if (transaction.daily_posted_balance == null) return latest;
      if (!latest) return transaction;
      return transaction.posted_date > latest.posted_date ? transaction : latest;
    },
    null as FinancialTransaction | null,
  );

  const latestBalanceSource = latestBalanceTransaction
    ? sources.find(
        (source) => source.id === latestBalanceTransaction.financial_source_id,
      ) ?? null
    : null;

  const explanationStatusMessage = useMemo(() => {
    if (explanationsLoading) return "Loading your transaction context.";
    if (explanationErrorMessage) return explanationErrorMessage;
    return "";
  }, [explanationErrorMessage, explanationsLoading]);

  async function allocateTransactionAndRefresh(
    stagedTransactionId: string,
    budgetLineId: string,
    allocatedAmount: number,
  ) {
    const result = await allocateTransaction(
      stagedTransactionId,
      budgetLineId,
      allocatedAmount,
    );

    if (result.ok) {
      await refresh();
    }

    return result;
  }

  async function handleCreateBudgetDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBudgetNotice("");

    if (!activeProgramId) {
      setBudgetNotice(
        "THRIVE could not identify one active program for this Budget.",
      );
      return;
    }

    if (!newBudgetDraft.periodStart || !newBudgetDraft.periodEnd) {
      setBudgetNotice("Enter a start date and end date for the plan.");
      return;
    }

    if (newBudgetDraft.periodStart > newBudgetDraft.periodEnd) {
      setBudgetNotice("The plan start date must be before the end date.");
      return;
    }

    const expectedIncome = Number(newBudgetDraft.expectedIncome);

    if (!Number.isFinite(expectedIncome) || expectedIncome < 0) {
      setBudgetNotice("Enter an expected income of zero or more.");
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
    setNewBudgetDraft({
      periodStart: "",
      periodEnd: "",
      expectedIncome: "",
      notes: "",
    });
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Budget
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Make a plan. See what happened. Choose what comes next.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Your Budget is your plan. Connected account activity can help you
                compare the plan with what actually happened.
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Budget.
              </section>
            ) : null}

            {errorMessage ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Budget information could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage ? (
              <>
                {!hasOpenBudget ? (
                  <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Start your next Budget
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      You do not have a current Budget open.
                    </h2>
                    <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                      Start a new plan when you are ready. Your completed Budgets
                      remain available below as read-only history.
                    </p>

                    <form
                      onSubmit={handleCreateBudgetDraft}
                      className="mt-6 grid gap-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-black">
                          Plan start
                          <input
                            type="date"
                            value={newBudgetDraft.periodStart}
                            onChange={(event) =>
                              setNewBudgetDraft((current) => ({
                                ...current,
                                periodStart: event.target.value,
                              }))
                            }
                            disabled={budgetWorking}
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                          />
                        </label>

                        <label className="text-sm font-black">
                          Plan end
                          <input
                            type="date"
                            value={newBudgetDraft.periodEnd}
                            onChange={(event) =>
                              setNewBudgetDraft((current) => ({
                                ...current,
                                periodEnd: event.target.value,
                              }))
                            }
                            disabled={budgetWorking}
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                          />
                        </label>
                      </div>

                      <label className="text-sm font-black">
                        Expected income
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          What do you expect to have available during this plan?
                        </span>
                        <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4">
                          <span aria-hidden="true" className="font-black text-slate-500">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={newBudgetDraft.expectedIncome}
                            onChange={(event) =>
                              setNewBudgetDraft((current) => ({
                                ...current,
                                expectedIncome: event.target.value,
                              }))
                            }
                            disabled={budgetWorking}
                            required
                            placeholder="0.00"
                            className="w-full bg-transparent px-3 py-3 font-normal outline-none"
                          />
                        </div>
                      </label>

                      <label className="text-sm font-black">
                        Anything you want to remember?
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Optional. This is your own note about the plan.
                        </span>
                        <textarea
                          value={newBudgetDraft.notes}
                          onChange={(event) =>
                            setNewBudgetDraft((current) => ({
                              ...current,
                              notes: event.target.value,
                            }))
                          }
                          disabled={budgetWorking}
                          rows={3}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                        />
                      </label>

                      {!activeProgramId ? (
                        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
                          THRIVE needs one active program before a Budget can be created.
                        </p>
                      ) : null}

                      {budgetWriteErrorMessage ? (
                        <p
                          role="alert"
                          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-950"
                        >
                          {budgetWriteErrorMessage}
                        </p>
                      ) : null}

                      {budgetNotice ? (
                        <p
                          role="status"
                          aria-live="polite"
                          className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                        >
                          {budgetNotice}
                        </p>
                      ) : null}

                      <div>
                        <button
                          type="submit"
                          disabled={budgetWorking || !activeProgramId}
                          className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {budgetWorking ? "Building your plan..." : "Build my Budget"}
                        </button>
                      </div>
                    </form>
                  </section>
                ) : null}

                {draftPeriod ? (
                  <BudgetDraftCategoryBuilder
                    draftPeriod={draftPeriod}
                    currentLines={draftLines}
                    refresh={refresh}
                  />
                ) : null}

                {activePeriod && !draftPeriod ? (
                  <>
                    <ActiveBudgetEditor
                      activePeriod={activePeriod}
                      currentLines={activeLines}
                      refresh={refresh}
                    />
                    <BudgetSummary
                      period={activePeriod}
                      lines={activeLines}
                      latestBalanceTransaction={latestBalanceTransaction}
                      latestBalanceSource={latestBalanceSource}
                    />
                    <BudgetCategorySummary lines={activeLines} />
                  </>
                ) : null}

                {!hasOpenBudget ? (
                  <BudgetHistorySection periods={completedPeriods} />
                ) : null}

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Recent account activity
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {currentBudgetTransactions.length} posted transactions
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    Activity shown here is limited to this Budget period.
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                    A displayed transaction is account evidence. It does not establish
                    intent, responsibility, relapse, incapacity, or misuse.
                  </p>

                  {explanationStatusMessage ? (
                    <p
                      role={explanationErrorMessage ? "alert" : "status"}
                      className="mt-3 text-sm font-semibold text-slate-600"
                    >
                      {explanationStatusMessage}
                    </p>
                  ) : null}

                  {allocationsLoading ? (
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      Loading Budget relationships.
                    </p>
                  ) : null}

                  {allocationErrorMessage ? (
                    <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">
                      {allocationErrorMessage}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-3">
                    {currentBudgetTransactions.slice(0, 8).map((transaction) => {
                      const explanation = explanationByTransactionId.get(transaction.id);
                      const transactionAllocations =
                        allocationsByTransactionId.get(transaction.id) ?? [];

                      return (
                        <article
                          key={transaction.id}
                          className="rounded-2xl border border-slate-100 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-black">
                                {transaction.merchant_name ?? "Merchant not provided"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {formatDate(transaction.posted_date)}
                                {transaction.category_name
                                  ? ` · ${transaction.category_name}`
                                  : ""}
                              </p>
                            </div>
                            <p className="font-black">{formatMoney(transaction.amount)}</p>
                          </div>

                          <TransactionContextPanel
                            transactionId={transaction.id}
                            explanation={explanation}
                            canWrite={canWrite}
                            working={workingTransactionId === transaction.id}
                            onCreate={createDraft}
                            onUpdate={updateDraft}
                          />

                          <BudgetRelationshipPanel
                            transaction={transaction}
                            activePeriod={activePeriod}
                            budgetLines={activeLines}
                            allocations={transactionAllocations}
                            working={
                              allocationWorkingTransactionId === transaction.id
                            }
                            onAllocate={allocateTransactionAndRefresh}
                          />
                        </article>
                      );
                    })}

                    {currentBudgetTransactions.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                        No imported account activity is available for this Budget period yet.
                      </p>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-3xl bg-slate-950 p-6 text-white">
                  <p className="font-black text-emerald-300">
                    Transaction-context boundary
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Bank evidence and your context remain separate. Adding context does not
                    change the imported transaction, establish intent, create a clinical or
                    fiduciary conclusion, create consent, or trigger Trust Engine action.
                  </p>
                </section>
              </>
            ) : null}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
