"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

function formatMoney(value: number | string) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "$0.00";
  }

  return numericValue.toLocaleString("en-US", {
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

export default function BudgetCategoriesDashboardCard() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [statusMessage, setStatusMessage] = useState("Select a workspace and program.");
  const [isLoading, setIsLoading] = useState(false);

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
    async function loadBudgetCategories() {
      if (!selectedWorkspaceId || !selectedProgramId) {
        setCategories([]);
        setStatusMessage("Select a workspace and program.");
        return;
      }

      setIsLoading(true);
      setStatusMessage("Loading budget categories...");

      const { data, error } = await supabase
        .from("budget_categories")
        .select(
          "id, workspace_id, program_id, category_name, category_type, planned_amount, spent_amount, remaining_amount, sort_order, is_active",
        )
        .eq("workspace_id", selectedWorkspaceId)
        .eq("program_id", selectedProgramId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        setCategories([]);
        setStatusMessage(`Budget category load error: ${error.message}`);
        setIsLoading(false);
        return;
      }

      setCategories(data ?? []);
      setStatusMessage("Live budget categories loaded.");
      setIsLoading(false);
    }

    void loadBudgetCategories();
  }, [selectedWorkspaceId, selectedProgramId]);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase text-emerald-700">Budget guardrails</p>
      <h3 className="text-2xl font-black">Budget categories</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Live mock budget categories loaded through authenticated Supabase RLS for the selected workspace and program.
      </p>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="rounded-2xl border border-slate-100 p-4 text-sm font-semibold text-slate-500">
            Loading categories...
          </p>
        ) : categories.length === 0 ? (
          <p className="rounded-2xl border border-slate-100 p-4 text-sm font-semibold text-slate-500">
            {statusMessage}
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-slate-100 p-4"
            >
              <div className="flex justify-between gap-4 font-bold">
                <span>{category.category_name}</span>
                <span>{formatMoney(category.remaining_amount)} left</span>
              </div>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {formatCategoryType(category.category_type)}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-500">
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="uppercase tracking-wide">Planned</p>
                  <p className="mt-1 text-slate-800">
                    {formatMoney(category.planned_amount)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="uppercase tracking-wide">Spent</p>
                  <p className="mt-1 text-slate-800">
                    {formatMoney(category.spent_amount)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="uppercase tracking-wide">Remaining</p>
                  <p className="mt-1 text-slate-800">
                    {formatMoney(category.remaining_amount)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">
        {statusMessage}
      </p>
    </div>
  );
}
