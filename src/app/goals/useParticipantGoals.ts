"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type GoalProgressStatus =
  | "not_started"
  | "in_progress"
  | "paused"
  | "completed"
  | "archived";

export type ParticipantGoal = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  title: string;
  why_it_matters: string | null;
  next_step: string;
  goal_area: string | null;
  progress_status: GoalProgressStatus;
  ownership_source: "participant" | "staff_suggestion";
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
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

export type GoalDraft = {
  title: string;
  whyItMatters: string;
  nextStep: string;
  goalArea: string;
};

type GoalMutationResult =
  | { ok: true; row: ParticipantGoal }
  | { ok: false; message: string };

const GOAL_SELECT =
  "id, workspace_id, program_id, supported_person_id, title, why_it_matters, next_step, goal_area, progress_status, ownership_source, created_by, created_at, updated_at, archived_at";

export function useParticipantGoals() {
  const [participant, setParticipant] = useState<SupportedPerson | null>(null);
  const [participation, setParticipation] =
    useState<ProgramParticipation | null>(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(
    null,
  );
  const [goals, setGoals] = useState<ParticipantGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const sessionResult = await supabase.auth.getSession();
    const user = sessionResult.data.session?.user ?? null;

    if (sessionResult.error || !user) {
      setErrorMessage(
        sessionResult.error?.message ?? "Sign in to review your goals.",
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

    if (personResult.error) {
      setErrorMessage(personResult.error.message);
      setLoading(false);
      return;
    }

    const person = (personResult.data as SupportedPerson | null) ?? null;
    setParticipant(person);

    if (!person) {
      setParticipation(null);
      setGoals([]);
      setLoading(false);
      return;
    }

    const participationResult = await supabase
      .from("program_participants")
      .select("id, workspace_id, program_id, supported_person_id, status")
      .eq("supported_person_id", person.id)
      .eq("workspace_id", person.workspace_id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (participationResult.error) {
      setErrorMessage(participationResult.error.message);
      setLoading(false);
      return;
    }

    const activeParticipation =
      (participationResult.data as ProgramParticipation | null) ?? null;
    setParticipation(activeParticipation);

    if (!activeParticipation) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const goalsResult = await supabase
      .from("participant_goals")
      .select(GOAL_SELECT)
      .eq("supported_person_id", person.id)
      .eq("workspace_id", person.workspace_id)
      .eq("program_id", activeParticipation.program_id)
      .order("created_at", { ascending: false });

    if (goalsResult.error) {
      setErrorMessage(goalsResult.error.message);
      setLoading(false);
      return;
    }

    setGoals((goalsResult.data ?? []) as ParticipantGoal[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const participantName =
    participant?.preferred_name ?? participant?.display_name ?? "Participant";

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.progress_status !== "archived"),
    [goals],
  );

  const archivedGoals = useMemo(
    () => goals.filter((goal) => goal.progress_status === "archived"),
    [goals],
  );

  async function createGoal(draft: GoalDraft): Promise<GoalMutationResult> {
    if (!authenticatedUserId || !participant || !participation) {
      return {
        ok: false,
        message: "Your participant and program connection is not available.",
      };
    }

    const title = draft.title.trim();
    const nextStep = draft.nextStep.trim();

    if (!title || !nextStep) {
      return {
        ok: false,
        message: "Add a goal title and one next step before saving.",
      };
    }

    setWorking(true);

    const response = await supabase
      .from("participant_goals")
      .insert({
        workspace_id: participant.workspace_id,
        program_id: participation.program_id,
        supported_person_id: participant.id,
        title,
        why_it_matters: draft.whyItMatters.trim() || null,
        next_step: nextStep,
        goal_area: draft.goalArea.trim() || null,
        progress_status: "not_started",
        ownership_source: "participant",
        created_by: authenticatedUserId,
      })
      .select(GOAL_SELECT)
      .single();

    setWorking(false);

    if (response.error || !response.data) {
      return {
        ok: false,
        message: response.error?.message ?? "The goal could not be saved.",
      };
    }

    const row = response.data as ParticipantGoal;
    setGoals((current) => [row, ...current]);
    return { ok: true, row };
  }

  async function updateGoal(
    goalId: string,
    changes: Partial<{
      title: string;
      why_it_matters: string | null;
      next_step: string;
      goal_area: string | null;
      progress_status: Exclude<GoalProgressStatus, "archived">;
    }>,
  ): Promise<GoalMutationResult> {
    setWorking(true);

    const response = await supabase
      .from("participant_goals")
      .update(changes)
      .eq("id", goalId)
      .select(GOAL_SELECT)
      .single();

    setWorking(false);

    if (response.error || !response.data) {
      return {
        ok: false,
        message: response.error?.message ?? "The goal could not be updated.",
      };
    }

    const row = response.data as ParticipantGoal;
    setGoals((current) =>
      current.map((goal) => (goal.id === goalId ? row : goal)),
    );
    return { ok: true, row };
  }

  async function archiveGoal(goalId: string): Promise<GoalMutationResult> {
    setWorking(true);

    const response = await supabase
      .from("participant_goals")
      .update({ progress_status: "archived" })
      .eq("id", goalId)
      .select(GOAL_SELECT)
      .single();

    setWorking(false);

    if (response.error || !response.data) {
      return {
        ok: false,
        message: response.error?.message ?? "The goal could not be archived.",
      };
    }

    const row = response.data as ParticipantGoal;
    setGoals((current) =>
      current.map((goal) => (goal.id === goalId ? row : goal)),
    );
    return { ok: true, row };
  }

  return {
    participant,
    participantName,
    participation,
    goals,
    activeGoals,
    archivedGoals,
    loading,
    working,
    errorMessage,
    reload: load,
    createGoal,
    updateGoal,
    archiveGoal,
  };
}