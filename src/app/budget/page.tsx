"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import {
  BudgetLine,
  BudgetPeriod,
  FinancialActivity,
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

function BudgetBottomNav() {
  const items = [
    { href: "/", icon: "⌂", label: "Today" },
    { href: "/wellness", icon: "◌", label: "Wellness" },
    { href: "/goals", icon: "◎", label: "Goals" },
    { href: "/budget", icon: "$", label: "Money", active: true },
    { href: "/support", icon: "◯", label: "Support" },
  ];

  return (
    <nav className="fixed bottom-2 left-1/2 z-50 flex w-[calc(100%-1rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-white/70 bg-white/95 p-1.5 shadow-xl backdrop-blur">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex min-w-0 flex-1 flex-col items-center rounded-xl px-1 py-1.5 text-[9px] font-black uppercase tracking-wide ${
            item.active ? "bg-emerald-700 text-white" : "text-slate-600"
          }`}
        >
          <span className="text-sm leading-none">{item.icon}</span>
          <span className="mt-1 truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

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
  onSubmit,
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
  onSubmit: (
    explanation: ParticipantTransactionExplanation,
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

  async function handleSubmit() {
    if (!explanation) return;

    setNotice("");

    const confirmed = window.confirm(
      "Submit this transaction context? You will no longer be able to edit it here.",
    );

    if (!confirmed) return;

    const result = await onSubmit(explanation);
    setNotice(result.message);
  }

  if (explanation && !editing) {
    return (
      <section className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-800">
              Your context
            </p>
            <p className="mt-1 text-sm font-black">
              {labelExplanationCategory(explanation.explanation_category)}
            </p>
          </div>

          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-emerald-900">
            {explanation.status.replaceAll("_", " ")}
          </span>
        </div>

        {explanation.explanation_text ? (
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">
            {explanation.explanation_text}
          </p>
        ) : null}

        {editable && canWrite ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={working}
              onClick={() => {
                resetDraft();
                setNotice("");
                setEditing(true);
              }}
              className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-black text-emerald-900 disabled:opacity-60"
            >
              Edit context
            </button>

            <button
              type="button"
              disabled={working}
              onClick={() => void handleSubmit()}
              className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
            >
              {working ? "Submitting..." : "Submit context"}
            </button>
          </div>
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
        className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-900 disabled:opacity-60"
      >
        Add context
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3"
    >
      <p className="text-[10px] font-black uppercase tracking-wide text-emerald-800">
        Your context
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Add your own context. The imported transaction stays unchanged.
      </p>

      <label className="mt-3 block text-xs font-black">
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
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"
        >
          {explanationCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-xs font-black">
        Anything you want to add?
        <textarea
          value={draft.explanationText}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              explanationText: event.target.value,
            }))
          }
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={working}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
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
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 disabled:opacity-60"
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
          className="mt-2 text-xs font-semibold text-slate-700"
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
    <details className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <summary className="cursor-pointer text-xs font-black text-slate-700">
        Budget connection
      </summary>

      {activeAllocations.length > 0 ? (
        <div className="mt-3 space-y-2">
          {activeAllocations.map((allocation) => (
            <div
              key={allocation.allocation_id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
            >
              <span className="text-xs font-semibold text-slate-700">
                {allocation.budget_category_name}
              </span>
              <span className="text-xs font-black text-slate-900">
                {formatMoney(allocation.allocated_amount)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs leading-5 text-slate-600">
          No Budget connection is recorded for this transaction.
        </p>
      )}

      {canAllocate ? (
        <form onSubmit={handleAllocate} className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
              Category
              <select
                value={selectedBudgetLineId}
                onChange={(event) => {
                  setSelectedBudgetLineId(event.target.value);
                  setNotice("");
                }}
                disabled={working}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-xs font-normal normal-case tracking-normal disabled:opacity-60"
              >
                <option value="">Choose</option>
                {budgetLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.category_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
              Amount
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
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-xs font-normal normal-case tracking-normal disabled:opacity-60"
              />
            </label>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={working}
              className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
            >
              {working ? "Applying..." : "Apply"}
            </button>
            <p className="text-[11px] text-slate-500">
              {formatMoney(unassignedAmount)} unassigned
            </p>
          </div>

          {notice ? (
            <p
              role={notice.includes("saved") ? "status" : "alert"}
              aria-live="polite"
              className="mt-2 text-xs font-semibold text-slate-700"
            >
              {notice}
            </p>
          ) : null}
        </form>
      ) : activePeriod && transactionFallsInsideActiveBudget ? (
        <p className="mt-2 text-xs text-slate-500">
          This transaction is fully connected or no active category is available.
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Budget editing is not available for this transaction.
        </p>
      )}
    </details>
  );
}

function BudgetSummary({
  period,
  lines,
  financialActivity,
  latestBalanceTransaction,
  latestBalanceSource,
}: {
  period: BudgetPeriod;
  lines: BudgetLine[];
  financialActivity: FinancialActivity[];
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

  const receivedIncome = financialActivity
    .filter(
      (activity) =>
        activity.activity_direction === "inflow" &&
        activity.activity_date >= period.period_start &&
        activity.activity_date <= period.period_end,
    )
    .reduce(
      (sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)),
      0,
    );

  const stillExpectedIncome = Math.max(
    toNumber(period.expected_income) - receivedIncome,
    0,
  );
  const status = getBudgetStatus(plannedTotal, actualTotal, remainingTotal);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            Current plan
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">{status.label}</h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-900">
          Active
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-emerald-700 p-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-100">Planned</p>
          <p className="mt-1 text-2xl font-black">{formatMoney(plannedTotal)}</p>
        </div>
        <div className="rounded-2xl bg-[#f3eee5] p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-[#98613f]">Activity</p>
          <p className="mt-1 text-2xl font-black">{formatMoney(actualTotal)}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Remaining</p>
          <p className="mt-1 text-2xl font-black">{formatMoney(remainingTotal)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Income in</p>
          <p className="mt-1 text-2xl font-black">{formatMoney(receivedIncome)}</p>
          <p className="mt-1 text-[10px] text-slate-500">
            {formatMoney(stillExpectedIncome)} still expected
          </p>
        </div>
      </div>

      <details className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <summary className="cursor-pointer text-xs font-black text-slate-700">
          Plan details
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-500">Period</p>
            <p className="mt-1 font-black">
              {formatDate(period.period_start)} to {formatDate(period.period_end)}
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-500">Expected income</p>
            <p className="mt-1 font-black">{formatMoney(period.expected_income)}</p>
          </div>
        </div>

        {latestBalanceTransaction ? (
          <div className="mt-3 border-t border-slate-200 pt-3 text-xs">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-bold text-slate-500">Connected account</p>
                <p className="mt-1 font-black">
                  {latestBalanceSource?.source_name ?? "Connected account"}
                  {latestBalanceSource?.account_mask
                    ? ` · ${latestBalanceSource.account_mask}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-500">Posted balance</p>
                <p className="mt-1 font-black">
                  {latestBalanceTransaction.daily_posted_balance != null
                    ? formatMoney(latestBalanceTransaction.daily_posted_balance)
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </details>
    </section>
  );
}

function BudgetCategorySummary({ lines }: { lines: BudgetLine[] }) {
  if (lines.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
        Your categories
      </p>
      <h2 className="mt-1 font-serif text-2xl font-semibold">See where things stand.</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
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
              className="min-w-0 rounded-2xl border border-slate-100 bg-[#fbfcfb] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{line.category_name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {status.label}
                  </p>
                </div>
                <p className="whitespace-nowrap text-xs font-black text-emerald-800">
                  {formatMoney(remaining)} left
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${usedPercent}%` }}
                  aria-label={`${usedPercent}% of the planned amount recorded`}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Plan</p>
                  <p className="mt-0.5 text-[11px] font-black">{formatMoney(planned)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Used</p>
                  <p className="mt-0.5 text-[11px] font-black">{formatMoney(actual)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Left</p>
                  <p className="mt-0.5 text-[11px] font-black">{formatMoney(remaining)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <details className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
        <summary className="cursor-pointer text-xs font-black text-slate-600">
          About these numbers
        </summary>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          These numbers show the current plan and connected activity. They do not explain why a transaction happened or what it means about you.
        </p>
      </details>
    </section>
  );
}

function BudgetHistorySection({ periods }: { periods: BudgetPeriod[] }) {
  if (periods.length === 0) return null;

  return (
    <details className="rounded-3xl bg-white p-4 shadow-sm">
      <summary className="cursor-pointer font-black">Past Budgets ({periods.length})</summary>
      <div className="mt-3 grid gap-2">
        {periods.map((period) => {
          const lifecycle = getBudgetLifecycleView(period);
          const correctionClosesAt = getBudgetCorrectionClosesAt(period);

          return (
            <article
              key={period.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black">
                  {formatDate(period.period_start)} to {formatDate(period.period_end)}
                </p>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-600">
                  Completed
                </span>
              </div>

              {lifecycle === "recent_history" && correctionClosesAt ? (
                <p className="mt-2 text-xs text-slate-500">
                  Correction period available until{" "}
                  {correctionClosesAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  .
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </details>
  );
}

export default function BudgetPage() {
  const {
    activeProgramId,
    sources,
    budgetPeriods,
    budgetLines,
    transactions,
    financialActivity,
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
    submitDraft,
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
    (period) => period.status === "completed",
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
      <main className="min-h-screen bg-[#e8f0eb] px-3 pb-24 pt-4 text-slate-950">
        <section className="mx-auto max-w-md space-y-3">
          <header className="overflow-hidden rounded-[1.8rem] bg-[#174f45] text-white shadow-sm">
            <div className="relative px-5 py-6">
              <div className="absolute right-3 top-0 h-32 w-32 rounded-full bg-[#d5a25d]/35 blur-2xl" />
              <p className="relative text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
                Money
              </p>
              <h1 className="relative mt-2 font-serif text-3xl font-semibold leading-tight">
                See the plan. See what happened.
              </h1>
              <p className="relative mt-2 text-sm text-emerald-50">
                Choose what comes next.
              </p>
            </div>
          </header>

          {loading ? (
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              Loading your Budget.
            </section>
          ) : null}

          {errorMessage ? (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
              <p className="font-black">Budget information could not be loaded.</p>
              <p className="mt-2 text-sm">{errorMessage}</p>
            </section>
          ) : null}

          {!loading && !errorMessage ? (
            <>
              {!hasOpenBudget ? (
                <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Start a plan
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    What do you want this money to do?
                  </h2>

                  <form
                    onSubmit={handleCreateBudgetDraft}
                    className="mt-4 grid gap-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs font-black">
                        Start
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
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"
                        />
                      </label>

                      <label className="text-xs font-black">
                        End
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
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"
                        />
                      </label>
                    </div>

                    <label className="text-xs font-black">
                      Expected income
                      <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-3">
                        <span aria-hidden="true" className="font-black text-slate-500">$</span>
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
                          className="w-full bg-transparent px-2 py-2.5 font-normal outline-none"
                        />
                      </div>
                    </label>

                    <label className="text-xs font-black">
                      Note <span className="font-normal text-slate-400">optional</span>
                      <textarea
                        value={newBudgetDraft.notes}
                        onChange={(event) =>
                          setNewBudgetDraft((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        disabled={budgetWorking}
                        rows={2}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"
                      />
                    </label>

                    {!activeProgramId ? (
                      <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
                        THRIVE needs one active program before a Budget can be created.
                      </p>
                    ) : null}

                    {budgetWriteErrorMessage ? (
                      <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-950">
                        {budgetWriteErrorMessage}
                      </p>
                    ) : null}

                    {budgetNotice ? (
                      <p role="status" aria-live="polite" className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                        {budgetNotice}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={budgetWorking || !activeProgramId}
                      className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {budgetWorking ? "Building your plan..." : "Build my Budget"}
                    </button>
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
                    financialActivity={financialActivity}
                    latestBalanceTransaction={latestBalanceTransaction}
                    latestBalanceSource={latestBalanceSource}
                  />
                  <BudgetCategorySummary lines={activeLines} />
                </>
              ) : null}

              {!hasOpenBudget ? (
                <BudgetHistorySection periods={completedPeriods} />
              ) : null}

              <details className="rounded-3xl bg-white p-4 shadow-sm">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                        Account activity
                      </p>
                      <h2 className="mt-1 text-lg font-black">
                        {currentBudgetTransactions.length === 0
                          ? "Nothing posted here yet"
                          : `${currentBudgetTransactions.length} posted transaction${currentBudgetTransactions.length === 1 ? "" : "s"}`}
                      </h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">View</span>
                  </div>
                </summary>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  {explanationStatusMessage ? (
                    <p role={explanationErrorMessage ? "alert" : "status"} className="text-xs font-semibold text-slate-600">
                      {explanationStatusMessage}
                    </p>
                  ) : null}

                  {allocationsLoading ? (
                    <p className="text-xs font-semibold text-slate-600">Loading Budget connections.</p>
                  ) : null}

                  {allocationErrorMessage ? (
                    <p role="alert" className="text-xs font-semibold text-rose-700">{allocationErrorMessage}</p>
                  ) : null}

                  <div className="mt-3 space-y-3">
                    {currentBudgetTransactions.slice(0, 8).map((transaction) => {
                      const explanation = explanationByTransactionId.get(transaction.id);
                      const transactionAllocations = allocationsByTransactionId.get(transaction.id) ?? [];

                      return (
                        <article key={transaction.id} className="rounded-2xl border border-slate-100 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black">
                                {transaction.merchant_name ?? "Merchant not provided"}
                              </p>
                              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                {formatDate(transaction.posted_date)}
                                {transaction.category_name ? ` · ${transaction.category_name}` : ""}
                              </p>
                            </div>
                            <p className="whitespace-nowrap text-sm font-black">{formatMoney(transaction.amount)}</p>
                          </div>

                          <TransactionContextPanel
                            transactionId={transaction.id}
                            explanation={explanation}
                            canWrite={canWrite}
                            working={workingTransactionId === transaction.id}
                            onCreate={createDraft}
                            onUpdate={updateDraft}
                            onSubmit={submitDraft}
                          />

                          <BudgetRelationshipPanel
                            transaction={transaction}
                            activePeriod={activePeriod}
                            budgetLines={activeLines}
                            allocations={transactionAllocations}
                            working={allocationWorkingTransactionId === transaction.id}
                            onAllocate={allocateTransactionAndRefresh}
                          />
                        </article>
                      );
                    })}

                    {currentBudgetTransactions.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                        No imported account activity is available for this Budget period yet.
                      </p>
                    ) : null}
                  </div>

                  <details className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <summary className="cursor-pointer text-xs font-black text-slate-600">
                      About account activity
                    </summary>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      Bank activity is evidence of what posted. It does not establish intent, responsibility, relapse, incapacity, misuse, consent, or any Trust Engine action. Your added context remains separate from the imported record.
                    </p>
                  </details>
                </div>
              </details>
            </>
          ) : null}
        </section>
        <BudgetBottomNav />
      </main>
    </AuthGate>
  );
}
