"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import { useParticipantFinancial } from "../useParticipantFinancial";
import BudgetDraftCategoryBuilder from "../budget/BudgetDraftCategoryBuilder";

export default function BudgetBuilderTestPage() {
  const {
    budgetPeriods,
    budgetLines,
    loading,
    errorMessage,
    refresh,
  } = useParticipantFinancial();

  const draftPeriod =
    budgetPeriods.find((period) => period.status === "draft") ?? null;

  const currentLines = draftPeriod
    ? budgetLines.filter(
        (line) => line.budget_period_id === draftPeriod.id,
      )
    : [];

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Budget Builder candidate
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Draft category + planned amount test
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Review-only test route for the participant Budget Builder category step.
                This route does not activate a Budget or change bank evidence.
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading the draft Budget.
              </section>
            ) : null}

            {errorMessage ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">The draft Budget could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage && draftPeriod ? (
              <BudgetDraftCategoryBuilder
                draftPeriod={draftPeriod}
                currentLines={currentLines}
                refresh={refresh}
              />
            ) : null}

            {!loading && !errorMessage && !draftPeriod ? (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
                <p className="font-black">No participant draft is available.</p>
                <p className="mt-2 text-sm leading-6">
                  Create a draft through the ordinary Budget route before testing this category-builder candidate.
                </p>
              </section>
            ) : null}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
