"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const THRIVE_PERSONAL_STABILITY_WORKSPACE_ID =
  "211d2c03-e2ac-4205-96b2-9a821b8bc6bd";

export type ThriveAccountPurpose =
  | "checking"
  | "admin"
  | "support"
  | "participant"
  | "unconfigured"
  | "conflict"
  | "signed-out"
  | "error";

export function useThriveAccountPurpose() {
  const [purpose, setPurpose] = useState<ThriveAccountPurpose>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const resolvePurpose = useCallback(async () => {
    setPurpose("checking");
    setErrorMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setEmail(null);
      setPurpose("error");
      setErrorMessage(sessionError.message);
      return;
    }

    if (!session?.user) {
      setEmail(null);
      setPurpose("signed-out");
      return;
    }

    const user = session.user;
    setEmail(user.email ?? null);

    const [membershipResult, personResult] = await Promise.all([
      supabase
        .from("workspace_members")
        .select("id, member_role, status")
        .eq("workspace_id", THRIVE_PERSONAL_STABILITY_WORKSPACE_ID)
        .eq("user_id", user.id)
        .eq("status", "active")
        .in("member_role", ["admin", "support"]),
      supabase
        .from("supported_people")
        .select("id, workspace_id, status")
        .eq("workspace_id", THRIVE_PERSONAL_STABILITY_WORKSPACE_ID)
        .eq("auth_user_id", user.id)
        .eq("status", "active"),
    ]);

    if (membershipResult.error || personResult.error) {
      setPurpose("error");
      setErrorMessage(
        membershipResult.error?.message ??
          personResult.error?.message ??
          "THRIVE account purpose could not be resolved.",
      );
      return;
    }

    const memberships = membershipResult.data ?? [];
    const people = personResult.data ?? [];

    const hasAdmin = memberships.some(
      (membership) => membership.member_role === "admin",
    );
    const hasSupport = memberships.some(
      (membership) => membership.member_role === "support",
    );

    let hasParticipant = false;

    if (people.length === 1) {
      const participationResult = await supabase
        .from("program_participants")
        .select("id, status")
        .eq("workspace_id", THRIVE_PERSONAL_STABILITY_WORKSPACE_ID)
        .eq("supported_person_id", people[0].id)
        .eq("status", "active");

      if (participationResult.error) {
        setPurpose("error");
        setErrorMessage(participationResult.error.message);
        return;
      }

      hasParticipant = (participationResult.data ?? []).length === 1;
    } else if (people.length > 1) {
      setPurpose("conflict");
      return;
    }

    const purposeCount = [hasAdmin, hasSupport, hasParticipant].filter(Boolean)
      .length;

    if (purposeCount > 1) {
      setPurpose("conflict");
      return;
    }

    if (hasAdmin) {
      setPurpose("admin");
      return;
    }

    if (hasSupport) {
      setPurpose("support");
      return;
    }

    if (hasParticipant) {
      setPurpose("participant");
      return;
    }

    setPurpose("unconfigured");
  }, []);

  useEffect(() => {
    void resolvePurpose();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolvePurpose();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [resolvePurpose]);

  return {
    purpose,
    email,
    errorMessage,
    refresh: resolvePurpose,
  };
}
