"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AdminAccessState =
  | "checking"
  | "allowed"
  | "denied"
  | "signed-out"
  | "error";

export type AdminWorkspaceMembership = {
  id: string;
  workspace_id: string;
  user_id: string;
  member_role: "admin" | "support" | string;
  status: string;
};

export function useAdminAccess() {
  const [state, setState] = useState<AdminAccessState>("checking");
  const [membership, setMembership] =
    useState<AdminWorkspaceMembership | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      setState("checking");
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError) {
        setState("error");
        setErrorMessage(userError.message);
        return;
      }

      if (!user) {
        setMembership(null);
        setState("signed-out");
        return;
      }

      const { data, error } = await supabase
        .from("workspace_members")
        .select("id, workspace_id, user_id, member_role, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .in("member_role", ["admin", "support"])
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setState("error");
        setErrorMessage(error.message);
        return;
      }

      if (!data) {
        setMembership(null);
        setState("denied");
        return;
      }

      setMembership(data as AdminWorkspaceMembership);
      setState("allowed");
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    state,
    membership,
    errorMessage,
    canAccessAdmin: state === "allowed",
  };
}