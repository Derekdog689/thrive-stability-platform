"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type BudgetCategoryType =
  | "protected"
  | "flexible"
  | "support"
  | "reserve";

export type CreateBudgetDraftInput = {
  programId: string;
  periodStart: string;
  periodEnd: string;
  expectedIncome: number;
  notes?: string;
};

export type UpdateBudgetPeriodInput = {
  budgetPeriodId: string;
  expectedIncome: number;
  notes?: string;
};

export type AddBudgetLineInput = {
  budgetPeriodId: string;
  categoryName: string;
  categoryType: BudgetCategoryType;
  plannedAmount: number;
  sortOrder?: number;
};

export type UpdateBudgetLineInput = {
  budgetLineId: string;
  categoryName: string;
  categoryType: BudgetCategoryType;
  plannedAmount: number;
  isActive: boolean;
  sortOrder?: number;
};

type ActionResult<T = undefined> = {
  ok: boolean;
  message: string;
  data?: T;
};

export function useParticipantBudgetBuilder() {
  const [working, setWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function createDraft(
    input: CreateBudgetDraftInput,
  ): Promise<ActionResult<string>> {
    setWorking(true);
    setErrorMessage("");

    const result = await supabase.rpc("create_my_budget_draft_v1", {
      p_program_id: input.programId,
      p_period_start: input.periodStart,
      p_period_end: input.periodEnd,
      p_expected_income: input.expectedIncome,
      p_notes: input.notes?.trim() || null,
    });

    setWorking(false);

    if (result.error) {
      setErrorMessage(result.error.message);

      return {
        ok: false,
        message: result.error.message,
      };
    }

    return {
      ok: true,
      message: "Your Budget draft was created.",
      data: result.data as string,
    };
  }

  async function updatePeriod(
    input: UpdateBudgetPeriodInput,
  ): Promise<ActionResult> {
    setWorking(true);
    setErrorMessage("");

    const result = await supabase.rpc("update_my_budget_period_v1", {
      p_budget_period_id: input.budgetPeriodId,
      p_expected_income: input.expectedIncome,
      p_notes: input.notes?.trim() || null,
    });

    setWorking(false);

    if (result.error) {
      setErrorMessage(result.error.message);

      return {
        ok: false,
        message: result.error.message,
      };
    }

    return {
      ok: true,
      message: "Your Budget was saved.",
    };
  }

  async function addLine(
    input: AddBudgetLineInput,
  ): Promise<ActionResult<string>> {
    setWorking(true);
    setErrorMessage("");

    const result = await supabase.rpc("add_my_budget_line_v1", {
      p_budget_period_id: input.budgetPeriodId,
      p_category_name: input.categoryName.trim(),
      p_category_type: input.categoryType,
      p_planned_amount: input.plannedAmount,
      p_sort_order: input.sortOrder ?? 0,
    });

    setWorking(false);

    if (result.error) {
      setErrorMessage(result.error.message);

      return {
        ok: false,
        message: result.error.message,
      };
    }

    return {
      ok: true,
      message: "Budget category added.",
      data: result.data as string,
    };
  }

  async function updateLine(
    input: UpdateBudgetLineInput,
  ): Promise<ActionResult> {
    setWorking(true);
    setErrorMessage("");

    const result = await supabase.rpc("update_my_budget_line_v1", {
      p_budget_line_id: input.budgetLineId,
      p_category_name: input.categoryName.trim(),
      p_category_type: input.categoryType,
      p_planned_amount: input.plannedAmount,
      p_is_active: input.isActive,
      p_sort_order: input.sortOrder ?? 0,
    });

    setWorking(false);

    if (result.error) {
      setErrorMessage(result.error.message);

      return {
        ok: false,
        message: result.error.message,
      };
    }

    return {
      ok: true,
      message: input.isActive
        ? "Budget category updated."
        : "Budget category removed from the current plan.",
    };
  }

  async function activateBudget(
    budgetPeriodId: string,
    acknowledgeOverPlan = false,
  ): Promise<ActionResult> {
    setWorking(true);
    setErrorMessage("");

    const result = await supabase.rpc("activate_my_budget_v1", {
      p_budget_period_id: budgetPeriodId,
      p_acknowledge_over_plan: acknowledgeOverPlan,
    });

    setWorking(false);

    if (result.error) {
      setErrorMessage(result.error.message);

      return {
        ok: false,
        message: result.error.message,
      };
    }

    return {
      ok: true,
      message: "Your Budget plan is now active.",
    };
  }

  async function completeBudget(
    budgetPeriodId: string,
  ): Promise<ActionResult> {
    setWorking(true);
    setErrorMessage("");

    const result = await supabase.rpc("complete_my_budget_v1", {
      p_budget_period_id: budgetPeriodId,
    });

    setWorking(false);

    if (result.error) {
      setErrorMessage(result.error.message);

      return {
        ok: false,
        message: result.error.message,
      };
    }

    return {
      ok: true,
      message: "Your Budget period was completed.",
    };
  }

  return {
    working,
    errorMessage,
    createDraft,
    updatePeriod,
    addLine,
    updateLine,
    activateBudget,
    completeBudget,
  };
}
