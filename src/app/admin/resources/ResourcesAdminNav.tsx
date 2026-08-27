"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResourcesAdminNav() {
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

  const linkClass =
    "inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700";

  return (
    <nav
      className="mx-auto flex max-w-6xl flex-wrap gap-2"
      aria-label="Resources admin"
    >
      <Link href="/admin" className={linkClass}>
        THRIVE Admin
      </Link>
      <Link href="/admin/resources" className={linkClass}>
        Resource Library
      </Link>
      <Link href="/admin/resources/manage" className={linkClass}>
        Maintain Resources
      </Link>
      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={signingOut}
        className={`${linkClass} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {signingOut ? "Signing out..." : "Log out"}
      </button>
    </nav>
  );
}
