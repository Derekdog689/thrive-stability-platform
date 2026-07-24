"use client";


import { useEffect, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ProgramContextPanel from "../ProgramContextPanel";
import WorkspaceContextPanel from "../WorkspaceContextPanel";
import { supabase } from "@/lib/supabaseClient";
import ThriveSidebar from "../ThriveSidebar";

const SELECTED_WORKSPACE_STORAGE_KEY = "thrive:selectedWorkspaceId";
const SELECTED_PROGRAM_STORAGE_KEY = "thrive:selectedProgramId";

type BudgetCategory = {
  id: string;
  workspace_id: string;
  program_id: string;
  category_name: string;
  category_type: string;
  planned_amount: number | string;
  spent_amount: number | string;
  remaining_amount: number | string;
  sort_order: number;
  is_active: boolean;
};

type WorkspaceEventDetail = {
  workspaceId?: string;
};

type ProgramEventDetail = {
  programId?: string;
};

function toNumber(value: number | string) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatMoney(value: number | string) {
  return toNumber(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatCategoryType(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BudgetPage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Select a workspace and program to load budget categories.",
  );

  useEffect(() => {
    const savedWorkspaceId =
      window.localStorage.getItem(SELECTED_WORKSPACE_STORAGE_KEY) ?? "";
    const savedProgramId =
      window.localStorage.getItem(SELECTED_PROGRAM_STORAGE_KEY) ?? "";

    setSelectedWorkspaceId(savedWorkspaceId);
    setSelectedProgramId(savedProgramId);

    function handleSelectedWorkspaceChanged(event: Event) {
      const customEvent = event as CustomEvent<WorkspaceEventDetail>;
      setSelectedWorkspaceId(customEvent.detail.workspaceId ?? "");
    }

    function handleSelectedProgramChanged(event: Event) {
      const customEvent = event as CustomEvent<ProgramEventDetail>;
      setSelectedProgramId(customEvent.detail.programId ?? "");
    }

    window.addEventListener(
      "thrive:selectedWorkspaceChanged",
      handleSelectedWorkspaceChanged,
    );

    window.addEventListener(
      "thrive:selectedProgramChanged",
      handleSelectedProgramChanged,
    );

    return () => {
      window.removeEventListener(
        "thrive:selectedWorkspaceChanged",
        handleSelectedWorkspaceChanged,
      );

      window.removeEventListener(
        "thrive:selectedProgramChanged",
        handleSelectedProgramChanged,
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBudgetCategories() {
      if (!selectedWorkspaceId || !selectedProgramId) {
        setCategories([]);
        setStatusMessage(
          "Select a workspace and program to load budget categories.",
        );
        return;
      }

      setIsLoading(true);
      setStatusMessage("Loading budget categories through authenticated RLS.");

      const { data, error } = await supabase
        .from("budget_categories")
        .select(
          "id, workspace_id, program_id, category_name, category_type, planned_amount, spent_amount, remaining_amount, sort_order, is_active",
        )
        .eq("workspace_id", selectedWorkspaceId)
        .eq("program_id", selectedProgramId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        setCategories([]);
        setStatusMessage(`Budget category load error: ${error.message}`);
        setIsLoading(false);
        return;
      }

      setCategories(data ?? []);
      setStatusMessage("Live mock/test budget categories loaded through RLS.");
      setIsLoading(false);
    }

    void loadBudgetCategories();

    return () => {
      isMounted = false;
    };
  }, [selectedWorkspaceId, selectedProgramId]);

  const totals = useMemo(() => {
    return categories.reduce(
      (summary, category) => {
        const planned = toNumber(category.planned_amount);
        const spent = toNumber(category.spent_amount);
        const remaining = toNumber(category.remaining_amount);
        const type = category.category_type.toLowerCase();

        summary.planned += planned;
        summary.spent += spent;
        summary.remaining += remaining;

        if (type === "protected") {
          summary.protected += remaining;
        }

        if (type === "flexible") {
          summary.flexible += remaining;
        }

        if (type === "reserve") {
          summary.reserve += remaining;
        }

        return summary;
      },
      {
        planned: 0,
        spent: 0,
        remaining: 0,
        protected: 0,
        flexible: 0,
        reserve: 0,
      },
    );
  }, [categories]);

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
  <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
    <ThriveSidebar />

    <section className="space-y-6">
          <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  THRIVE budget
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Protect essentials. See what remains.
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  This read-only workspace displays live mock/test budget
                  categories visible through authenticated Supabase Row Level
                  Security for the selected workspace and program.
                </p>
              </div>

             
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">
                Development data notice
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Current amounts are mock/test records only. No real bank,
                beneficiary, trust, clinical, recovery, or private case data is
                authorized in this route.
              </p>
            </div>
          </header>

          <WorkspaceContextPanel />
          <ProgramContextPanel />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-emerald-700 p-5 text-white shadow-sm">
              <p className="text-sm font-bold text-emerald-100">
                Planned total
              </p>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(totals.planned)}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Spent total</p>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(totals.spent)}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">
                Remaining total
              </p>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(totals.remaining)}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">
                Protected remaining
              </p>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(totals.protected)}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">
                Flexible remaining
              </p>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(totals.flexible)}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">
                Reserve remaining
              </p>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(totals.reserve)}
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Category detail
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Budget categories
                </h2>
              </div>

              <p className="text-sm font-semibold text-slate-500">
                {categories.length} active categor
                {categories.length === 1 ? "y" : "ies"}
              </p>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  Loading budget categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  {statusMessage}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <article
                      key={category.id}
                      className="rounded-3xl border border-slate-100 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-black">
                            {category.category_name}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {formatCategoryType(category.category_type)}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          Active
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="font-semibold text-slate-500">
                            Planned
                          </span>
                          <span className="font-black text-slate-900">
                            {formatMoney(category.planned_amount)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="font-semibold text-slate-500">
                            Spent
                          </span>
                          <span className="font-black text-slate-900">
                            {formatMoney(category.spent_amount)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 border-t border-slate-100 pt-3 text-sm">
                          <span className="font-semibold text-slate-500">
                            Remaining
                          </span>
                          <span className="font-black text-emerald-700">
                            {formatMoney(category.remaining_amount)}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-5 text-xs font-semibold text-slate-400">
              {statusMessage}
            </p>
          </section>

          <footer className="rounded-3xl bg-slate-950 p-5 text-sm leading-6 text-slate-200">
            THRIVE supports budgeting, organization, visibility, and approved
            support planning. It does not provide legal, fiduciary, clinical,
            bankruptcy, credit-repair, investment, or crisis-service authority.
          </footer>
        </section>
        </section>
      </main>
    </AuthGate>
  );
}