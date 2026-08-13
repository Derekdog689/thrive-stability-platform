"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ParticipantTransactionAllocation = {
  allocation_id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  staged_transaction_id: string;
  budget_period_id: string;
  budget_line_id: string;
  budget_category_name: string;
  budget_category_type: string;
  allocated_amount: number | string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  archived_at: string | null;
 };
 export type TransactionAllocationWriteResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

 export function useParticipantTransactionAllocations() {
  const [allocations, setAllocations] = useState<
    ParticipantTransactionAllocation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [workingTransactionId, setWorkingTransactionId] = useState<
    string | null
  >(null);

  const [errorMessage, setErrorMessage] = useState("");

  const allocationsByTransactionId = useMemo(() => {
    const grouped = new Map<
      string,
      ParticipantTransactionAllocation[]
    >();

    for (const allocation of allocations) {
      const current =
        grouped.get(allocation.staged_transaction_id) ?? [];

      grouped.set(allocation.staged_transaction_id, [
        ...current,
        allocation,
      ]);
    }

    return grouped;
  }, [allocations]);
const loadAllocations = useCallback(async () => {
  const result = await supabase.rpc(
    "get_my_transaction_allocations_v1",
  );

  if (result.error) {
    throw result.error;
  }

  return (
    (result.data as ParticipantTransactionAllocation[] | null) ?? []
  );
 }, []);


 useEffect(() => {
  let mounted = true;

  async function load() {
    setLoading(true);
    setErrorMessage("");

    try {
      const rows = await loadAllocations();

      if (!mounted) return;

      setAllocations(rows);
    } catch (error) {
      if (!mounted) return;

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your Budget allocations could not be loaded.",
      );
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  void load();

  return () => {
    mounted = false;
  };
 }, [loadAllocations]);

 async function refreshAllocations() {
  setErrorMessage("");

  try {
    const rows = await loadAllocations();

    setAllocations(rows);

    return rows;
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Your Budget allocations could not be refreshed.",
    );

    return [];
  }
 }
 async function allocateTransaction(
  stagedTransactionId: string,
  budgetLineId: string,
  allocatedAmount: number,
 ): Promise<TransactionAllocationWriteResult> {
  setErrorMessage("");
  setWorkingTransactionId(stagedTransactionId);

  const result = await supabase.rpc(
    "allocate_my_transaction_v1",
    {
      p_staged_transaction_id: stagedTransactionId,
      p_budget_line_id: budgetLineId,
      p_allocated_amount: allocatedAmount,
    },
  );

  setWorkingTransactionId(null);

  if (result.error) {
    return {
      ok: false,
      message:
        result.error.message ||
        "Your Budget allocation could not be saved.",
    };
  }

  await refreshAllocations();

  return {
    ok: true,
    message: "Your Budget allocation was saved.",
  };
 }

 async function updateAllocation(
  allocationId: string,
  stagedTransactionId: string,
  allocatedAmount: number,
 ): Promise<TransactionAllocationWriteResult> {
  setErrorMessage("");
  setWorkingTransactionId(stagedTransactionId);

  const result = await supabase.rpc(
    "update_my_transaction_allocation_v1",
    {
      p_allocation_id: allocationId,
      p_allocated_amount: allocatedAmount,
    },
  );

  setWorkingTransactionId(null);

  if (result.error) {
    return {
      ok: false,
      message:
        result.error.message ||
        "Your Budget allocation could not be updated.",
    };
  }

  await refreshAllocations();

  return {
    ok: true,
    message: "Your Budget allocation was updated.",
  };
 }

 async function archiveAllocation(
  allocationId: string,
  stagedTransactionId: string,
 ): Promise<TransactionAllocationWriteResult> {
  setErrorMessage("");
  setWorkingTransactionId(stagedTransactionId);

  const result = await supabase.rpc(
    "archive_my_transaction_allocation_v1",
    {
      p_allocation_id: allocationId,
    },
  );

  setWorkingTransactionId(null);

  if (result.error) {
    return {
      ok: false,
      message:
        result.error.message ||
        "Your Budget allocation could not be archived.",
    };
  }

  await refreshAllocations();

 return {
  ok: true,
  message: "Your Budget allocation was archived.",
  };
 }
 return {
  allocations,
  allocationsByTransactionId,
  loading,
  errorMessage,
  workingTransactionId,
  refreshAllocations,
  allocateTransaction,
  updateAllocation,
  archiveAllocation,
 };
}
