"use client";

import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  formatDate,
  formatMoney,
  toNumber,
  useParticipantFinancial,
} from "../useParticipantFinancial";
import {
  ParticipantTransactionExplanation,
  TransactionExplanationCategory,
  TransactionExplanationDraft,
  useParticipantTransactionExplanations,
} from "../transaction-explanations/useParticipantTransactionExplanations";
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
      label: "No activity yet",
      detail: "No planned or recorded amount is connected for this category.",
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
      detail:
        "The currently planned amount has been fully matched by recorded activity.",
    };
  }

  if (planned > 0 && actual / planned >= 0.8) {
    return {
      label: "Most of the plan is used",
      detail:
        "A smaller portion of the current planned amount remains available.",
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
    detail:
      "The planned amount is available and no recorded activity is connected yet.",
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

export default function BudgetPage() {
  const {
    activeProgramId,
    budgetPeriods,
    budgetLines,
    transactions,
    latestBatch,
    totalOutflow,
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

  const currentPeriod = draftPeriod ?? activePeriod;

  const currentLines = currentPeriod
    ? budgetLines.filter((line) => line.budget_period_id === currentPeriod.id)
    : [];

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

    if (!result.ok) {
      return;
    }

    await refresh();

    setNewBudgetDraft({
      periodStart: "",
      periodEnd: "",
      expectedIncome: "",
      notes: "",
    });
  }

  const plannedTotal = currentLines.reduce(
    (sum, line) => sum + toNumber(line.planned_amount),
    0,
  );

  const actualTotal = currentLines.reduce(
    (sum, line) => sum + toNumber(line.actual_amount),
    0,
  );

  const remainingTotal = currentLines.reduce(
    (sum, line) => sum + toNumber(line.remaining_amount),
    0,
  );

  const overallStatus = getBudgetStatus(
    plannedTotal,
    actualTotal,
    remainingTotal,
  );

  const explanationStatusMessage = useMemo(() => {
    if (explanationsLoading) {
      return "Loading your transaction context.";
    }

    if (explanationErrorMessage) {
      return explanationErrorMessage;
    }

    return "";
  }, [explanationErrorMessage, explanationsLoading]);

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
                Protect essentials. See what remains.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Compare your current plan with connected account activity.
              </p>
            </header>

            {loading && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Budget.
              </section>
            )}

            {errorMessage && (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">
                  Budget information could not be loaded.
                </p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            )}

            {!loading && !errorMessage && (
              <>
                {!draftPeriod && !activePeriod ? (
                  <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Build your next plan
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Start with what you expect to have available.
                    </h2>
                    <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                      Enter the period and expected income yourself. You will choose
                      the parts of your plan in the next step.
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
                          Enter what you expect to have available during this plan period.
                        </span>
                        <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4">
                          <span
                            aria-hidden="true"
                            className="font-black text-slate-500"
                          >
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
                          THRIVE needs one active program before a participant Budget can be created.
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
                          {budgetWorking
                            ? "Building your plan..."
                            : "Build my plan"}
                        </button>
                      </div>
                    </form>
                  </section>
                ) : draftPeriod ? (
                  <BudgetDraftCategoryBuilder
                    draftPeriod={draftPeriod}
                    currentLines={currentLines}
                    refresh={refresh}
                  />
                ) : null}

                {activePeriod && !draftPeriod ? (
                  <ActiveBudgetEditor
                    activePeriod={activePeriod}
                    currentLines={currentLines}
                    refresh={refresh}
                  />
                ) : null}

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Current picture
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        {overallStatus.label}
                      </h2>
                      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                        {overallStatus.detail}
                      </p>
                    </div>

                    {currentPeriod ? (
                      <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black capitalize text-emerald-900">
                        {currentPeriod.status}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-emerald-700 p-6 text-white">
                      <p className="text-sm font-bold text-emerald-100">
                        Planned
                      </p>
                      <p className="mt-3 text-4xl font-black">
                        {formatMoney(plannedTotal)}
                      </p>
                      <p className="mt-2 text-sm text-emerald-100">
                        Amount currently set aside across this plan
                      </p>
                    </div>

                  <div className="rounded-2xl bg-slate-50 p-6">
  <p className="text-sm font-bold text-slate-500">
    Expected income
  </p>
  <p className="mt-3 text-4xl font-black">
    {formatMoney(currentPeriod?.expected_income ?? 0)}
  </p>
  <p className="mt-2 text-sm text-slate-500">
    Amount you expect to have available during this plan
  </p>
</div>

                    <div className="rounded-2xl bg-slate-50 p-6">
                      <p className="text-sm font-bold text-slate-500">
                        Recorded activity
                      </p>
                      <p className="mt-3 text-4xl font-black">
                        {formatMoney(actualTotal)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Amount currently recorded for this plan
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-6">
                      <p className="text-sm font-bold text-slate-500">
                        Remaining
                      </p>
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
                      {currentPeriod
                        ? `${formatDate(currentPeriod.period_start)} to ${formatDate(
                            currentPeriod.period_end,
                          )}`
                        : "No current participant budget period is available yet"}
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Your categories
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    See how each part of the plan is going
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    These labels describe connected numbers only. They do not judge the
                    reason for a transaction or what it means about you.
                  </p>

                  {currentLines.length > 0 ? (
                    <div className="mt-6 grid gap-4">
                      {currentLines.map((line) => {
                        const planned = toNumber(line.planned_amount);
                        const actual = toNumber(line.actual_amount);
                        const remaining = toNumber(line.remaining_amount);
                        const status = getBudgetStatus(
                          planned,
                          actual,
                          remaining,
                        );
                        const usedPercent =
                          planned > 0
                            ? Math.max(
                                0,
                                Math.min(
                                  100,
                                  Math.round((actual / planned) * 100),
                                ),
                              )
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
                                <h3 className="mt-2 text-xl font-black">
                                  {line.category_name}
                                </h3>
                                <p className="mt-1 text-sm capitalize text-slate-500">
                                  {line.category_type.replaceAll("_", " ")}
                                </p>
                              </div>

                              <p className="text-lg font-black">
                                {formatMoney(line.remaining_amount)} remaining
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
                                <p className="mt-1 font-black">
                                  {formatMoney(line.planned_amount)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="font-bold text-slate-500">
                                  Recorded activity
                                </p>
                                <p className="mt-1 font-black">
                                  {formatMoney(line.actual_amount)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="font-bold text-slate-500">Remaining</p>
                                <p className="mt-1 font-black">
                                  {formatMoney(line.remaining_amount)}
                                </p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <p className="font-black">
                        Your Budget plan has not been created yet.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Connected account activity can still be reviewed below.
                      </p>
                    </div>
                  )}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Recent account activity
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {transactions.length} posted transactions
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    Recorded outflow: {formatMoney(totalOutflow)}
                    {latestBatch
                      ? ` for the latest available period ending ${formatDate(
                          latestBatch.statement_period_end,
                        )}.`
                      : "."}
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                    A displayed transaction is account evidence. It does not establish intent,
                    responsibility, relapse, incapacity, or misuse.
                  </p>

                  {explanationStatusMessage ? (
                    <p
                      role={explanationErrorMessage ? "alert" : "status"}
                      className="mt-3 text-sm font-semibold text-slate-600"
                    >
                      {explanationStatusMessage}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-3">
                    {transactions.slice(0, 8).map((transaction) => {
                      const explanation = explanationByTransactionId.get(
                        transaction.id,
                      );

                      return (
                        <article
                          key={transaction.id}
                          className="rounded-2xl border border-slate-100 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-black">
                                {transaction.merchant_name ??
                                  "Merchant not provided"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {formatDate(transaction.posted_date)}
                                {transaction.category_name
                                  ? ` · ${transaction.category_name}`
                                  : ""}
                              </p>
                            </div>

                            <p className="font-black">
                              {formatMoney(transaction.amount)}
                            </p>
                          </div>

                          <TransactionContextPanel
                            transactionId={transaction.id}
                            explanation={explanation}
                            canWrite={canWrite}
                            working={workingTransactionId === transaction.id}
                            onCreate={createDraft}
                            onUpdate={updateDraft}
                          />
                        </article>
                      );
                    })}

                    {transactions.length === 0 && (
                      <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                        No participant-owned transaction records are connected to this account.
                      </p>
                    )}
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
            )}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
