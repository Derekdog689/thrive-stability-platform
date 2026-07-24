"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthState = {
  status: "checking" | "authenticated" | "not-authenticated";
  email: string | null;
};

export default function AuthStatusPanel() {
  const [authState, setAuthState] = useState<AuthState>({
    status: "checking",
    email: null,
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
        });
        return;
      }

      setAuthState({
        status: "not-authenticated",
        email: null,
      });
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState({
          status: "authenticated",
          email: session.user.email ?? null,
        });
        return;
      }

      setAuthState({
        status: "not-authenticated",
        email: null,
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

        {authState.email && (
          <p className="mt-1 break-all text-xs">
            Email: {authState.email}
          </p>
        )}

        <div className="mt-3">
          <a
            href="/login"
            className="inline-block rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-800"
          >
            Login page
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