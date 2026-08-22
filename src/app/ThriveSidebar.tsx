"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ThriveNavigation from "./ThriveNavigation";

export default function ThriveSidebar() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("THRIVE sign out failed:", error.message);
      setSigningOut(false);
      return;
    }

    window.location.assign("/login");
  }

  return (
    <aside className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-3 lg:mb-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-lg font-black text-white">
            T
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              DSS Enterprises
            </p>
            <h1 className="text-xl font-black">THRIVE</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? "Signing out..." : "Log out"}
        </button>
      </div>

      <div className="mt-5 min-w-0 max-w-full lg:mt-0">
        <ThriveNavigation />
      </div>

      <div className="mt-5 min-w-0 max-w-full rounded-2xl bg-slate-950 p-4 text-white lg:mt-8">
        <p className="text-xs font-bold uppercase text-emerald-300">
          Guardrail
        </p>

        <p className="mt-2 break-words text-sm leading-6 text-slate-200">
          Support tool only. Not legal, clinical, fiduciary, credit repair,
          bankruptcy, or investment advice.
        </p>
      </div>
    </aside>
  );
}