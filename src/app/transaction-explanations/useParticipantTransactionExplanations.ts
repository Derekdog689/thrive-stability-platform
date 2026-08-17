"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type TransactionExplanationCategory =
  | "recognized_purchase"
  | "bill_or_essential"
  | "transfer"
  | "refund_or_reversal"
  | "shared_expense"
  | "medical_expense"
  | "cash_withdrawal_context"
  | "incorrect_or_unrecognized"
  | "other";

export type ParticipantTransactionExplanation = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  staged_transaction_id: string;
  explanation_category: TransactionExplanationCategory;
  explanation_text: string | null;
  status: "draft" | "submitted" | "needs_follow_up" | "resolved" | "archived";
  submitted_by: string;
  submitted_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionExplanationDraft = {
  explanationCategory: TransactionExplanationCategory;
  explanationText: string;
};

type SupportedPerson = {
  id: string;
  workspace_id: string;
  display_name: string;
  preferred_name: string | null;
};

type ProgramParticipation = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  status: string;
};

export type TransactionExplanationWriteResult =
  | {
      ok: true;
      row: ParticipantTransactionExplanation;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

const explanationSelect =
  "id, workspace_id, program_id, supported_person_id, staged_transaction_id, explanation_category, explanation_text, status, submitted_by, submitted_at, archived_at, created_at, updated_at";

export function useParticipantTransactionExplanations() {
  const [participant, setParticipant] = useState<SupportedPerson | null>(null);
  const [participation, setParticipation] =
    useState<ProgramParticipation | null>(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(
    null,
  );
  const [explanations, setExplanations] = useState<
    ParticipantTransactionExplanation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [workingTransactionId, setWorkingTransactionId] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  const explanationByTransactionId = useMemo(
    () =>
      new Map(
        explanations.map((explanation) => [
          explanation.staged_transaction_id,
          explanation,
        ]),
      ),
    [explanations],
  );

  const loadExplanations = useCallback(
    async (
      person: SupportedPerson,
      activeParticipation: ProgramParticipation,
    ) => {
      const result = await supabase
        .from("participant_transaction_explanations")
        .select(explanationSelect)
        .eq("supported_person_id", person.id)
        .eq("workspace_id", person.workspace_id)
        .eq("program_id", activeParticipation.program_id)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }

      return (
        (result.data as ParticipantTransactionExplanation[] | null) ?? []
      );
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      const sessionResult = await supabase.auth.getSession();
      const user = sessionResult.data.session?.user ?? null;

      if (!mounted) return;

      if (sessionResult.error || !user) {
        setErrorMessage(
          sessionResult.error?.message ??
            "Sign in to review your transaction context.",
        );
        setLoading(false);
        return;
      }

      setAuthenticatedUserId(user.id);

      const personResult = await supabase
        .from("supported_people")
        .select("id, workspace_id, display_name, preferred_name")
        .eq("auth_user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (!mounted) return;

      if (personResult.error) {
        setErrorMessage(personResult.error.message);
        setLoading(false);
        return;
      }

      const person = (personResult.data as SupportedPerson | null) ?? null;
      setParticipant(person);

      if (!person) {
        setLoading(false);
        return;
      }

      const participationResult = await supabase
        .from("program_participants")
        .select("id, workspace_id, program_id, supported_person_id, status")
        .eq("supported_person_id", person.id)
        .eq("workspace_id", person.workspace_id)
        .eq("status", "active")
        .maybeSingle();

      if (!mounted) return;

      if (participationResult.error) {
        setErrorMessage(participationResult.error.message);
        setLoading(false);
        return;
      }

      const activeParticipation =
        (participationResult.data as ProgramParticipation | null) ?? null;
      setParticipation(activeParticipation);

      if (!activeParticipation) {
        setLoading(false);
        return;
      }

      try {
        const rows = await loadExplanations(person, activeParticipation);

        if (!mounted) return;

        setExplanations(rows);
      } catch (error) {
        if (!mounted) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Your transaction context could not be loaded.",
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
  }, [loadExplanations]);

  async function refreshExplanations() {
    if (!participant || !participation) {
      setExplanations([]);
      return [];
    }

    try {
      const rows = await loadExplanations(participant, participation);
      setExplanations(rows);
      return rows;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your transaction context could not be refreshed.",
      );
      return [];
    }
  }

  async function createDraft(
    stagedTransactionId: string,
    draft: TransactionExplanationDraft,
  ): Promise<TransactionExplanationWriteResult> {
    setErrorMessage("");

    if (!authenticatedUserId || !participant || !participation) {
      return {
        ok: false,
        message: "Your participant and program connection is not ready.",
      };
    }

    const explanationText = draft.explanationText.trim();

    setWorkingTransactionId(stagedTransactionId);

    const payload = {
      workspace_id: participant.workspace_id,
      program_id: participation.program_id,
      supported_person_id: participant.id,
      staged_transaction_id: stagedTransactionId,
      explanation_category: draft.explanationCategory,
      explanation_text: explanationText || null,
      status: "draft",
      submitted_by: authenticatedUserId,
      submitted_at: null,
    };

    const result = await supabase
      .from("participant_transaction_explanations")
      .insert(payload)
      .select(explanationSelect)
      .single();

    setWorkingTransactionId(null);

    if (result.error) {
      return {
        ok: false,
        message:
          result.error.message ||
          "Your transaction context could not be saved.",
      };
    }

    const row = result.data as ParticipantTransactionExplanation;

    setExplanations((current) => [
      row,
      ...current.filter((item) => item.id !== row.id),
    ]);

    return {
      ok: true,
      row,
      message: "Your transaction context was saved.",
    };
  }

  async function updateDraft(
    explanation: ParticipantTransactionExplanation,
    draft: TransactionExplanationDraft,
   ): Promise<TransactionExplanationWriteResult> {
    setErrorMessage("");

    if (!authenticatedUserId || !participant || !participation) {
      return {
        ok: false,
        message: "Your participant and program connection is not ready.",
      };
    }

    if (
      explanation.status !== "draft" ||
      explanation.submitted_by !== authenticatedUserId
    ) {
      return {
        ok: false,
        message: "Only your own draft transaction context can be edited here.",
      };
    }

    const explanationText = draft.explanationText.trim();

    setWorkingTransactionId(explanation.staged_transaction_id);

    const result = await supabase
      .from("participant_transaction_explanations")
      .update({
        explanation_category: draft.explanationCategory,
        explanation_text: explanationText || null,
      })
      .eq("id", explanation.id)
      .eq("status", "draft")
      .eq("submitted_by", authenticatedUserId)
      .select(explanationSelect)
      .single();

    setWorkingTransactionId(null);

    if (result.error) {
      return {
        ok: false,
        message:
          result.error.message ||
          "Your transaction context could not be updated.",
      };
    }

    const row = result.data as ParticipantTransactionExplanation;

    setExplanations((current) =>
      current.map((item) => (item.id === row.id ? row : item)),
    );

    return {
      ok: true,
      row,
      message: "Your transaction context was updated.",
    };
  }

  async function submitDraft(
  explanation: ParticipantTransactionExplanation,
): Promise<TransactionExplanationWriteResult> {
  setErrorMessage("");

  if (!authenticatedUserId || !participant || !participation) {
    return {
      ok: false,
      message: "Your participant and program connection is not ready.",
    };
  }

  if (
    explanation.status !== "draft" ||
    explanation.submitted_by !== authenticatedUserId
  ) {
    return {
      ok: false,
      message: "Only your own draft transaction context can be submitted here.",
    };
  }

  setWorkingTransactionId(explanation.staged_transaction_id);

  const result = await supabase
    .from("participant_transaction_explanations")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", explanation.id)
    .eq("status", "draft")
    .eq("submitted_by", authenticatedUserId)
    .select(explanationSelect)
    .single();

  setWorkingTransactionId(null);

  if (result.error) {
    return {
      ok: false,
      message:
        result.error.message ||
        "Your transaction context could not be submitted.",
    };
  }

  const row = result.data as ParticipantTransactionExplanation;

  setExplanations((current) =>
    current.map((item) => (item.id === row.id ? row : item)),
  );

  return {
    ok: true,
    row,
    message: "Your transaction context was submitted.",
  };
}

  return {
    participant,
    participation,
    explanations,
    explanationByTransactionId,
    loading,
    errorMessage,
    workingTransactionId,
    canWrite: Boolean(authenticatedUserId && participant && participation),
    refreshExplanations,
    createDraft,
    updateDraft,
    submitDraft,
  };
}
