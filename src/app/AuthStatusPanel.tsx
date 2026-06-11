"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthState = {
  status: "checking" | "authenticated" | "not-authenticated";
  email: string | null;
  userId: string | null;
};

export default function AuthStatusPanel() {
  const [authState, setAuthState] = useState<AuthState>({
    status: "checking",
    email: null,
    userId: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (session?.user) {
        setAuthState({
          status: "authenticated",
          email: session.user.email ?? null,
          userId: session.user.id,
        });
        return;
      }

      setAuthState({
        status: "not-authenticated",
        email: null,
        userId: null,
      });
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState({
          status: "authenticated",
          email: session.user.email ?? null,
          userId: session.user.id,
        });
        return;
      }

      setAuthState({
        status: "not-authenticated",
        email: null,
        userId: null,
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (authState.status === "checking") {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
        Auth status: Checking session...
      </div>
    );
  }

  if (authState.status === "authenticated") {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        <p>Auth status: Signed in</p>
        <p className="mt-1 break-all text-xs">Email: {authState.email}</p>
        <p className="mt-1 break-all text-xs">User ID: {authState.userId}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/login"
            className="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-800"
          >
            Login page
          </a>
          <a
            href="/workspace-test"
            className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white"
          >
            Workspace test
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
      <p>Auth status: Not signed in</p>
      <a
        href="/login"
        className="mt-3 inline-block rounded-xl bg-amber-700 px-3 py-2 text-xs font-black text-white"
      >
        Go to login
      </a>
    </div>
  );
}