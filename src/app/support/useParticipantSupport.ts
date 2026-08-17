"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type SupportRequestStatus =
  | "submitted"
  | "withdrawn"
  | "acknowledged"
  | "in_progress"
  | "waiting_for_participant"
  | "completed"
  | "archived";

export type ParticipantSupportCategory =
  | "budget_money"
  | "transaction_understanding"
  | "wellness_support"
  | "goal_support"
  | "program_question"
  | "other";

export type ContactPreference =
  | "in_app"
  | "phone"
  | "text"
  | "email"
  | "no_preference";

export type ParticipantSupportRequest = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  participant_category: ParticipantSupportCategory;
  participant_message: string;
  requested_support: string | null;
  contact_preference: ContactPreference | null;
  status: SupportRequestStatus;
  created_at: string;
  updated_at: string;
};

export type ParticipantSupportStatusEvent = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  support_request_id: string;
  event_type: "status_changed";
  from_status: SupportRequestStatus | null;
  to_status: SupportRequestStatus | null;
  changed_at: string;
  change_note: string | null;
};

export type SupportRequestDraft = {
  participantCategory: ParticipantSupportCategory;
  participantMessage: string;
  requestedSupport: string;
  contactPreference: ContactPreference;
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

export type SupportCreateResult =
  | { ok: true; row: ParticipantSupportRequest; message: string }
  | { ok: false; message: string };

const requestSelect =
  "id, workspace_id, program_id, supported_person_id, participant_category, participant_message, requested_support, contact_preference, status, created_at, updated_at";

const statusEventSelect =
  "id, workspace_id, program_id, supported_person_id, support_request_id, event_type, from_status, to_status, changed_at, change_note";

export function useParticipantSupport() {
  const [participant, setParticipant] = useState<SupportedPerson | null>(null);
  const [participation, setParticipation] =
    useState<ProgramParticipation | null>(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<ParticipantSupportRequest[]>([]);
  const [statusEvents, setStatusEvents] = useState<
  ParticipantSupportStatusEvent[]
>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const participantName = useMemo(
    () =>
      participant?.preferred_name?.trim() ||
      participant?.display_name?.trim() ||
      "Participant",
    [participant],
  );

  const loadRequests = useCallback(
    async (person: SupportedPerson, activeParticipation: ProgramParticipation) => {
      const result = await supabase
        .from("support_requests")
        .select(requestSelect)
        .eq("supported_person_id", person.id)
        .eq("workspace_id", person.workspace_id)
        .eq("program_id", activeParticipation.program_id)
        .order("created_at", { ascending: false });

      if (result.error) throw result.error;
      return (result.data as ParticipantSupportRequest[] | null) ?? [];
    },
    [],
  );

const loadStatusEvents = useCallback(
  async (person: SupportedPerson, activeParticipation: ProgramParticipation) => {
    const result = await supabase
      .from("support_request_status_events")
      .select(statusEventSelect)
      .eq("supported_person_id", person.id)
      .eq("workspace_id", person.workspace_id)
      .eq("program_id", activeParticipation.program_id)
      .eq("event_type", "status_changed")
      .order("changed_at", { ascending: true });

    if (result.error) throw result.error;

    return (
      (result.data as ParticipantSupportStatusEvent[] | null) ?? []
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
            "Sign in to review your Support requests.",
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
  const [requestRows, eventRows] = await Promise.all([
    loadRequests(person, activeParticipation),
    loadStatusEvents(person, activeParticipation),
  ]);

  if (!mounted) return;

  setRequests(requestRows);
  setStatusEvents(eventRows);
} catch (error) {
        if (!mounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Your Support requests could not be loaded.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [loadRequests, loadStatusEvents]);

  async function refreshRequests() {
    if (!participant || !participation) {
      setRequests([]);
      return [];
    }

   try {
  const [requestRows, eventRows] = await Promise.all([
    loadRequests(participant, participation),
    loadStatusEvents(participant, participation),
  ]);

  setRequests(requestRows);
  setStatusEvents(eventRows);

  return requestRows;
} catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your Support requests could not be refreshed.",
      );
      return [];
    }
  }

  async function createRequest(
    draft: SupportRequestDraft,
  ): Promise<SupportCreateResult> {
    setErrorMessage("");

    if (!authenticatedUserId || !participant || !participation) {
      return {
        ok: false,
        message: "Your participant and program connection is not ready.",
      };
    }

    const participantMessage = draft.participantMessage.trim();
    const requestedSupport = draft.requestedSupport.trim();

    if (!participantMessage) {
      return {
        ok: false,
        message: "Describe what you need help with before sending the request.",
      };
    }

    if (participantMessage.length > 4000) {
      return {
        ok: false,
        message: "Keep the request to 4,000 characters or fewer.",
      };
    }

    if (requestedSupport.length > 2000) {
      return {
        ok: false,
        message: "Keep the requested support to 2,000 characters or fewer.",
      };
    }

    setWorking(true);

    const payload = {
      workspace_id: participant.workspace_id,
      program_id: participation.program_id,
      supported_person_id: participant.id,
      participant_category: draft.participantCategory,
      participant_message: participantMessage,
      requested_support: requestedSupport || null,
      contact_preference: draft.contactPreference,
      status: "submitted",
      created_by: authenticatedUserId,
    };

    const result = await supabase
      .from("support_requests")
      .insert(payload)
      .select(requestSelect)
      .single();

    setWorking(false);

    if (result.error) {
      return {
        ok: false,
        message:
          result.error.message ||
          "Your Support request could not be sent. Please try again.",
      };
    }

    const row = result.data as ParticipantSupportRequest;

    setRequests((current) => [
      row,
      ...current.filter((request) => request.id !== row.id),
    ]);

    return {
      ok: true,
      row,
      message: "Your Support request was sent.",
    };
  }

async function withdrawRequest(request: ParticipantSupportRequest) {
  setErrorMessage("");

  if (!authenticatedUserId || !participant || !participation) {
    return {
      ok: false,
      message: "Your participant and program connection is not ready.",
    };
  }

  if (request.status !== "submitted") {
    return {
      ok: false,
      message: "Only a newly submitted Support request can be withdrawn.",
    };
  }

  setWorking(true);

  const withdrawnAt = new Date().toISOString();

  const result = await supabase
    .from("support_requests")
    .update({
      status: "withdrawn",
      withdrawn_at: withdrawnAt,
    })
    .eq("id", request.id)
    .eq("supported_person_id", participant.id)
    .eq("workspace_id", participant.workspace_id)
    .eq("program_id", participation.program_id)
    .eq("status", "submitted")
    .select(requestSelect)
    .single();

  setWorking(false);

  if (result.error) {
    return {
      ok: false,
      message:
        result.error.message ||
        "Your Support request could not be withdrawn.",
    };
  }

  await refreshRequests();

  return {
    ok: true,
    row: result.data as ParticipantSupportRequest,
    message: "Your Support request was withdrawn.",
  };
}

 return {
  participant,
  participation,
  participantName,
  requests,
  statusEvents,
  loading,
  working,
  errorMessage,
  canCreate: Boolean(authenticatedUserId && participant && participation),
  refreshRequests,
  createRequest,
  withdrawRequest,
};
}
