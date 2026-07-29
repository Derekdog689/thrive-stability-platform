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

const PERSON_D_AUTH_USER_ID =
  "d48b7268-9aa6-4498-a923-2851fd5232c9";

const PERSON_D_SUPPORTED_PERSON_ID =
  "71000000-0000-4000-8000-000000000009";

const CLIENT_PATH_TEST_ENABLED =
  process.env.NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST === "true";

export type WellnessWriteResult =
  | {
      ok: true;
      mode: "insert" | "update";
      row: WellnessCheckinRow;
    }
  | {
      ok: false;
      code:
        | "write_disabled"
        | "missing_identity"
        | "missing_overall_day"
        | "already_exists"
        | "not_allowed"
        | "connection_error"
        | "unknown";
      message: string;
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

function businessDateKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  const year = values.year;
  const month = values.month;
  const day = values.day;

  if (!year || !month || !day) {
    throw new Error("Unable to resolve the THRIVE business date.");
  }

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

  const today = useMemo(() => businessDateKey(), []);

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

  function mapWriteError(error: {
    code?: string | null;
    message?: string | null;
  }): WellnessWriteResult {
    if (error.code === "23505") {
      return {
        ok: false,
        code: "already_exists",
        message: "A check-in is already saved for today.",
      };
    }

    const message = error.message ?? "";

    if (
      message.includes("authenticated participant") ||
      message.includes("row-level security") ||
      message.includes("not authorized")
    ) {
      return {
        ok: false,
        code: "not_allowed",
        message: "This check-in could not be saved with the current access.",
      };
    }

    if (message.toLowerCase().includes("network")) {
      return {
        ok: false,
        code: "connection_error",
        message: "The Wellness connection is unavailable right now.",
      };
    }

    return {
      ok: false,
      code: "unknown",
      message: "The check-in could not be saved. Please try again.",
    };
  }

  async function refreshTodayCheckin() {
    if (!participant || !participation) {
      setTodayCheckin(null);
      return null;
    }

    const result = await supabase
      .from("participant_wellness_checkins")
      .select(
        "id, workspace_id, program_id, supported_person_id, checkin_date, overall_day, stress, sleep, energy, confidence, routine, recovery_support, support_needed, chosen_next_step, participant_note, status, created_at, updated_at, archived_at",
      )
      .eq("supported_person_id", participant.id)
      .eq("program_id", participation.program_id)
      .eq("workspace_id", participant.workspace_id)
      .eq("checkin_date", today)
      .eq("status", "active")
      .maybeSingle();

    if (result.error) {
      setErrorMessage(result.error.message);
      return null;
    }

    const row = (result.data as WellnessCheckinRow | null) ?? null;
    setTodayCheckin(row);
    return row;
  }

  async function executeInsertCandidate(
    draft: WellnessDraft,
  ): Promise<WellnessWriteResult> {
    const WRITE_EXECUTION_ENABLED =
      CLIENT_PATH_TEST_ENABLED &&
      authenticatedUserId === PERSON_D_AUTH_USER_ID &&
      participant?.id === PERSON_D_SUPPORTED_PERSON_ID;

    if (!WRITE_EXECUTION_ENABLED) {
      return {
        ok: false,
        code: "write_disabled",
        message: "Saving is still disabled while this workflow is under review.",
      };
    }

    const payload = buildInsertCandidate(draft);

    if (!participant || !participation || !authenticatedUserId) {
      return {
        ok: false,
        code: "missing_identity",
        message: "Your participant and program connection is not ready.",
      };
    }

    if (!draft.overallDay || !payload) {
      return {
        ok: false,
        code: "missing_overall_day",
        message: "Choose how today is going before saving.",
      };
    }

    const result = await supabase
      .from("participant_wellness_checkins")
      .insert(payload)
      .select(
        "id, workspace_id, program_id, supported_person_id, checkin_date, overall_day, stress, sleep, energy, confidence, routine, recovery_support, support_needed, chosen_next_step, participant_note, status, created_at, updated_at, archived_at",
      )
      .single();

    if (result.error) {
      if (result.error.code === "23505") {
        await refreshTodayCheckin();
      }

      return mapWriteError(result.error);
    }

    const row = result.data as WellnessCheckinRow;
    setTodayCheckin(row);

    return {
      ok: true,
      mode: "insert",
      row,
    };
  }

  async function executeSameDayUpdate(
    draft: WellnessDraft,
  ): Promise<WellnessWriteResult> {
    const WRITE_EXECUTION_ENABLED =
      CLIENT_PATH_TEST_ENABLED &&
      authenticatedUserId === PERSON_D_AUTH_USER_ID &&
      participant?.id === PERSON_D_SUPPORTED_PERSON_ID;

    if (!WRITE_EXECUTION_ENABLED) {
      return {
        ok: false,
        code: "write_disabled",
        message: "Updating is still disabled while this workflow is under review.",
      };
    }

    if (!todayCheckin) {
      return {
        ok: false,
        code: "missing_identity",
        message: "No saved check-in is available to update.",
      };
    }

    if (!draft.overallDay) {
      return {
        ok: false,
        code: "missing_overall_day",
        message: "Choose how today is going before updating.",
      };
    }

    const result = await supabase
      .from("participant_wellness_checkins")
      .update({
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
      })
      .eq("id", todayCheckin.id)
      .eq("checkin_date", today)
      .eq("status", "active")
      .select(
        "id, workspace_id, program_id, supported_person_id, checkin_date, overall_day, stress, sleep, energy, confidence, routine, recovery_support, support_needed, chosen_next_step, participant_note, status, created_at, updated_at, archived_at",
      )
      .single();

    if (result.error) {
      return mapWriteError(result.error);
    }

    const row = result.data as WellnessCheckinRow;
    setTodayCheckin(row);

    return {
      ok: true,
      mode: "update",
      row,
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
    refreshTodayCheckin,
    executeInsertCandidate,
    executeSameDayUpdate,
    writeEnabled:
      CLIENT_PATH_TEST_ENABLED &&
      authenticatedUserId === PERSON_D_AUTH_USER_ID &&
      participant?.id === PERSON_D_SUPPORTED_PERSON_ID,
    clientPathTestEnabled: CLIENT_PATH_TEST_ENABLED,
  };
}
