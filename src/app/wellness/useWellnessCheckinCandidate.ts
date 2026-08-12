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

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  const shiftedYear = date.getUTCFullYear();
  const shiftedMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const shiftedDay = String(date.getUTCDate()).padStart(2, "0");

  return `${shiftedYear}-${shiftedMonth}-${shiftedDay}`;
}

export function useWellnessCheckinCandidate() {
  const [participant, setParticipant] =
    useState<SupportedPerson | null>(null);

  const [participation, setParticipation] =
    useState<ProgramParticipation | null>(null);

  const [todayCheckins, setTodayCheckins] =
    useState<WellnessCheckinRow[]>([]);

  const todayCheckin = todayCheckins[0] ?? null;
  const [recentCheckins, setRecentCheckins] =
  useState<WellnessCheckinRow[]>([]);

  const [authenticatedUserId, setAuthenticatedUserId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = useMemo(() => businessDateKey(), []);
  const recentWindowStart = useMemo(
  () => shiftDateKey(today, -6),
  [today],
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
.order("created_at", { ascending: false });

      if (!mounted) return;

      if (checkinResult.error) {
        setErrorMessage(checkinResult.error.message);
        setLoading(false);
        return;
      }

    setTodayCheckins(
  (checkinResult.data as WellnessCheckinRow[] | null) ?? [],
);

const recentCheckinsResult = await supabase
  .from("participant_wellness_checkins")
  .select(
    "id, workspace_id, program_id, supported_person_id, checkin_date, overall_day, stress, sleep, energy, confidence, routine, recovery_support, support_needed, chosen_next_step, participant_note, status, created_at, updated_at, archived_at",
  )
  .eq("supported_person_id", person.id)
  .eq("program_id", activeParticipation.program_id)
  .eq("workspace_id", person.workspace_id)
  .gte("checkin_date", recentWindowStart)
  .lte("checkin_date", today)
  .eq("status", "active")
  .order("checkin_date", { ascending: false })
  .order("created_at", { ascending: false });

if (!mounted) return;

if (recentCheckinsResult.error) {
  setErrorMessage(recentCheckinsResult.error.message);
  setLoading(false);
  return;
}

setRecentCheckins(
  (recentCheckinsResult.data as WellnessCheckinRow[] | null) ?? [],
);

setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [recentWindowStart, today]);

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
    setTodayCheckins([]);
    return [];
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
    .order("created_at", { ascending: false });

  if (result.error) {
    setErrorMessage(result.error.message);
    return [];
  }

  const rows =
    (result.data as WellnessCheckinRow[] | null) ?? [];

  setTodayCheckins(rows);

  return rows;
}

  async function executeInsertCandidate(
    draft: WellnessDraft,
  ): Promise<WellnessWriteResult> {
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

setTodayCheckins((current) => [
  row,
  ...current.filter(
    (checkin) => checkin.id !== row.id,
  ),
]);

setRecentCheckins((current) => [
  row,
  ...current.filter(
    (checkin) => checkin.id !== row.id,
  ),
]);

    return {
      ok: true,
      mode: "insert",
      row,
    };
  }

  async function executeSameDayUpdate(
    draft: WellnessDraft,
  ): Promise<WellnessWriteResult> {
    void draft;

    return {
      ok: false,
      code: "write_disabled",
      message: "Editing today's saved check-in is not available yet.",
    };
  }

  return {
    participant,
    participation,
    todayCheckins,
    todayCheckin,
    recentCheckins,
    today,
    loading,
    errorMessage,
    buildInsertCandidate,
    refreshTodayCheckin,
    executeInsertCandidate,
    executeSameDayUpdate,
    writeEnabled: Boolean(
      authenticatedUserId &&
        participant &&
        participation,
    ),
    clientPathTestEnabled: false,
  };
}
