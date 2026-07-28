"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type WellnessCheckinRow = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  checkin_date: string;
  overall_day: string;
  stress: string | null;
  sleep: string | null;
  energy: string | null;
  confidence: string | null;
  routine: string | null;
  recovery_support: string | null;
  support_needed: string | null;
  chosen_next_step: string | null;
  participant_note: string | null;
  status: string;
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

export type WellnessDraft = {
  overallDay: string | null;
  stress: string | null;
  sleep: string | null;
  energy: string | null;
  confidence: string | null;
  routine: string | null;
  recoverySupport: string | null;
  supportNeeded: string | null;
  chosenNextStep: string | null;
  participantNote: string;
};

export type WellnessInsertCandidate = {
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  checkin_date: string;
  overall_day: string;
  stress: string | null;
  sleep: string | null;
  energy: string | null;
  confidence: string | null;
  routine: string | null;
  recovery_support: string | null;
  support_needed: string | null;
  chosen_next_step: string | null;
  participant_note: string | null;
  status: "active";
  created_by: string;
};

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useWellnessCheckinCandidate() {
  const [participant, setParticipant] = useState<SupportedPerson | null>(null);
  const [participation, setParticipation] =
    useState<ProgramParticipation | null>(null);
  const [todayCheckin, setTodayCheckin] =
    useState<WellnessCheckinRow | null>(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = useMemo(() => localDateKey(), []);

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
            "Sign in to review the Wellness check-in connection.",
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
        .select(
          "id, workspace_id, program_id, supported_person_id, status",
        )
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

      const checkinResult = await supabase
        .from("participant_wellness_checkins")
        .select(
          "id, workspace_id, program_id, supported_person_id, checkin_date, overall_day, stress, sleep, energy, confidence, routine, recovery_support, support_needed, chosen_next_step, participant_note, status, created_at, updated_at, archived_at",
        )
        .eq("supported_person_id", person.id)
        .eq("program_id", activeParticipation.program_id)
        .eq("workspace_id", person.workspace_id)
        .eq("checkin_date", today)
        .eq("status", "active")
        .maybeSingle();

      if (!mounted) return;

      if (checkinResult.error) {
        setErrorMessage(checkinResult.error.message);
        setLoading(false);
        return;
      }

      setTodayCheckin(
        (checkinResult.data as WellnessCheckinRow | null) ?? null,
      );
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [today]);

  function buildInsertCandidate(
    draft: WellnessDraft,
  ): WellnessInsertCandidate | null {
    if (
      !authenticatedUserId ||
      !participant ||
      !participation ||
      !draft.overallDay
    ) {
      return null;
    }

    return {
      workspace_id: participant.workspace_id,
      program_id: participation.program_id,
      supported_person_id: participant.id,
      checkin_date: today,
      overall_day: draft.overallDay,
      stress: draft.stress,
      sleep: draft.sleep,
      energy: draft.energy,
      confidence: draft.confidence,
      routine: draft.routine,
      recovery_support: draft.recoverySupport,
      support_needed: draft.supportNeeded,
      chosen_next_step: draft.chosenNextStep,
      participant_note: draft.participantNote.trim() || null,
      status: "active",
      created_by: authenticatedUserId,
    };
  }

  return {
    participant,
    participation,
    todayCheckin,
    today,
    loading,
    errorMessage,
    buildInsertCandidate,
    writeEnabled: false as const,
  };
}
