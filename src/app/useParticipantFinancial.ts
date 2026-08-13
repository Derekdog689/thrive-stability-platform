"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type FinancialSource = {
  id: string;
  source_name: string;
  institution_name: string | null;
  source_type: string;
  account_mask: string | null;
  source_mode: string;
  status: string;
};

export type FinancialBatch = {
  id: string;
  financial_source_id: string;
  statement_period_start: string;
  statement_period_end: string;
  source_filename: string;
  source_row_count: number;
  import_status: string;
  source_lifecycle: string;
};

export type FinancialTransaction = {
  id: string;
  financial_source_id: string;
  import_batch_id: string;
  posted_date: string;
  transaction_date: string | null;
  transaction_type: string | null;
  merchant_name: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  amount: number | string;
  daily_posted_balance: number | string | null;
  transaction_lifecycle: string;
  parse_status: string;
};

export type BudgetPeriod = {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  expected_income: number | string;
  notes: string | null;
};

export type BudgetLine = {
  id: string;
  budget_period_id: string;
  category_name: string;
  category_type: string;
  planned_amount: number | string;
  derived_actual_amount: number | string;
  derived_remaining_amount: number | string;
  sort_order: number;
  is_active: boolean;
};

type SupportedPerson = {
  id: string;
  preferred_name: string | null;
  display_name: string;
};

type ProgramParticipant = {
  program_id: string;
  workspace_id: string;
  status: string;
};

export function toNumber(
  value: number | string | null | undefined,
) {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoney(
  value: number | string,
) {
  return toNumber(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatDate(
  value: string | null | undefined,
) {
  if (!value) return "Not available";

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function preferredActiveBudgetPeriod(
  periods: BudgetPeriod[],
) {
  const today = localDateKey();
  const activePeriods = periods.filter(
    (period) => period.status === "active",
  );

  const current = activePeriods
    .filter(
      (period) =>
        period.period_start <= today &&
        period.period_end >= today,
    )
    .sort((a, b) =>
      b.period_start.localeCompare(a.period_start),
    );

  if (current[0]) {
    return current[0];
  }

  const upcoming = activePeriods
    .filter((period) => period.period_start > today)
    .sort((a, b) =>
      a.period_start.localeCompare(b.period_start),
    );

  if (upcoming[0]) {
    return upcoming[0];
  }

  const past = activePeriods
    .filter((period) => period.period_end < today)
    .sort((a, b) =>
      b.period_end.localeCompare(a.period_end),
    );

  return past[0] ?? null;
}

export function useParticipantFinancial() {
  const [participant, setParticipant] =
    useState<SupportedPerson | null>(null);

  const [activeProgramId, setActiveProgramId] =
    useState<string | null>(null);

  const [sources, setSources] =
    useState<FinancialSource[]>([]);

  const [batches, setBatches] =
    useState<FinancialBatch[]>([]);

  const [transactions, setTransactions] =
    useState<FinancialTransaction[]>([]);

  const [budgetPeriods, setBudgetPeriods] =
    useState<BudgetPeriod[]>([]);

  const [budgetLines, setBudgetLines] =
    useState<BudgetLine[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function load() {
    setLoading(true);
    setErrorMessage("");

    const sessionResult =
      await supabase.auth.getSession();

    const user =
      sessionResult.data.session?.user ?? null;

    if (sessionResult.error || !user) {
      setErrorMessage(
        sessionResult.error?.message ??
          "Sign in to view your THRIVE information.",
      );

      setLoading(false);
      return;
    }

    const personResult = await supabase
      .from("supported_people")
      .select(
        "id, preferred_name, display_name",
      )
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (personResult.error) {
      setErrorMessage(
        personResult.error.message,
      );

      setLoading(false);
      return;
    }

    const person =
      (personResult.data as
        | SupportedPerson
        | null) ?? null;

    setParticipant(person);

    const [
      sourceResult,
      batchResult,
      transactionResult,
      periodResult,
      programParticipantResult,
    ] = await Promise.all([
      supabase.rpc(
        "get_my_financial_sources_v1",
      ),

      supabase.rpc(
        "get_my_financial_batches_v1",
      ),

      supabase.rpc(
        "get_my_financial_transactions_v2",
      ),

      supabase
        .from("participant_budget_periods")
        .select(
          "id, period_start, period_end, status, expected_income, notes",
        )
        .order("period_start", {
          ascending: false,
        }),

      supabase
        .from("program_participants")
        .select(
          "program_id, workspace_id, status",
        )
        .eq("status", "active"),
    ]);

    const firstError =
      sourceResult.error ??
      batchResult.error ??
      transactionResult.error ??
      periodResult.error ??
      programParticipantResult.error;

    if (firstError) {
      setErrorMessage(firstError.message);
      setLoading(false);
      return;
    }

    const activePrograms =
      (programParticipantResult.data ??
        []) as ProgramParticipant[];

    if (activePrograms.length === 1) {
      setActiveProgramId(
        activePrograms[0].program_id,
      );
    } else {
      setActiveProgramId(null);
    }

    const periods =
      (periodResult.data ??
        []) as BudgetPeriod[];

    const preferredActive =
      preferredActiveBudgetPeriod(periods);

    const orderedPeriods = preferredActive
      ? [
          preferredActive,
          ...periods.filter(
            (period) => period.id !== preferredActive.id,
          ),
        ]
      : periods;

    setSources(
      (sourceResult.data ??
        []) as FinancialSource[],
    );

    setBatches(
      (batchResult.data ??
        []) as FinancialBatch[],
    );

    setTransactions(
      (transactionResult.data ??
        []) as FinancialTransaction[],
    );

    setBudgetPeriods(orderedPeriods);

    if (periods.length > 0) {
      const periodIds = periods.map(
        (period) => period.id,
      );

    const lineResults = await Promise.all(
  periodIds.map((budgetPeriodId) =>
    supabase.rpc("get_my_budget_lines_v2", {
      p_budget_period_id: budgetPeriodId,
    }),
  ),
);

     const lineErrors = lineResults
  .map((result) => result.error)
  .filter((error) => error);

if (lineErrors.length > 0) {
  setErrorMessage(
    lineErrors[0]?.message ??
      "Budget lines could not be loaded.",
  );

  setLoading(false);
  return;
}

setBudgetLines(
  lineResults.flatMap(
    (result) => result.data ?? [],
  ) as BudgetLine[],
);
    } else {
      setBudgetLines([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const participantName =
    participant?.preferred_name ??
    participant?.display_name ??
    "Participant";

  const totalOutflow = useMemo(
    () =>
      transactions.reduce(
        (sum, transaction) => {
          const amount = toNumber(
            transaction.amount,
          );

          return amount < 0
            ? sum + Math.abs(amount)
            : sum;
        },
        0,
      ),
    [transactions],
  );

  const latestBatch = useMemo(
    () =>
      [...batches].sort((a, b) =>
        b.statement_period_end.localeCompare(
          a.statement_period_end,
        ),
      )[0] ?? null,
    [batches],
  );

  return {
    participant,
    participantName,
    activeProgramId,
    sources,
    batches,
    transactions,
    budgetPeriods,
    budgetLines,
    totalOutflow,
    latestBatch,
    loading,
    errorMessage,
    refresh: load,
  };
}
