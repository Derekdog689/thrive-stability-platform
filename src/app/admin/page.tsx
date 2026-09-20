"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "./useAdminAccess";

type AdminSnapshot = {
  peopleTotal: number;
  peopleActive: number;
  peoplePaused: number;
  accessUnlinkedRaw: number;
  supportNeedsAction: number;
  resourcesVisible: number;
};

const emptySnapshot: AdminSnapshot = {
  peopleTotal: 0,
  peopleActive: 0,
  peoplePaused: 0,
  accessUnlinkedRaw: 0,
  supportNeedsAction: 0,
  resourcesVisible: 0,
};

export default function AdminHomePage() {
  const router = useRouter();
  const { state, membership, errorMessage, canAccessSystemAdmin } = useAdminAccess();
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    if (state === "allowed" && membership?.member_role === "support") {
      router.replace("/admin/support");
    }
  }, [state, membership?.member_role, router]);

  useEffect(() => {
    if (!canAccessSystemAdmin || !membership) {
      setSummaryLoading(false);
      return;
    }

    const workspaceId = membership.workspace_id;
    let cancelled = false;

    async function loadSnapshot() {
      setSummaryLoading(true);

      const [
        peopleTotalResult,
        peopleActiveResult,
        peoplePausedResult,
        accessResult,
        supportResult,
        resourcesResult,
      ] = await Promise.all([
        supabase.from("supported_people").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("supported_people").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "active"),
        supabase.from("supported_people").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "paused"),
        supabase.rpc("admin_list_unlinked_auth_accounts", { p_workspace_id: workspaceId }),
        supabase.from("support_requests").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).in("status", ["submitted", "acknowledged", "in_progress"]),
        supabase.from("resource_visibility").select("resource_id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "active"),
      ]);

      if (cancelled) return;

      setSnapshot({
        peopleTotal: peopleTotalResult.count ?? 0,
        peopleActive: peopleActiveResult.count ?? 0,
        peoplePaused: peoplePausedResult.count ?? 0,
        accessUnlinkedRaw: Array.isArray(accessResult.data) ? accessResult.data.length : 0,
        supportNeedsAction: supportResult.count ?? 0,
        resourcesVisible: resourcesResult.count ?? 0,
      });
      setSummaryLoading(false);
    }

    void loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, [canAccessSystemAdmin, membership]);

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">DSS Enterprises</p>
            <h1 className="mt-2 text-3xl font-black">Checking THRIVE Admin access</h1>
          </div>
        </section>
      </main>
    );
  }

  if (state === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">THRIVE Admin access required</h1>
            <p className="mt-3 text-slate-600">Sign in with an authorized admin account to continue.</p>
            <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">Go to login</Link>
          </div>
        </section>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">THRIVE Admin could not load</h1>
            <p className="mt-3 text-slate-600">{errorMessage || "The access check could not be completed."}</p>
          </div>
        </section>
      </main>
    );
  }

  if (state === "allowed" && membership?.member_role === "support") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">THRIVE Review</p>
            <h1 className="mt-2 text-3xl font-black">Opening your Review workspace</h1>
          </div>
        </section>
      </main>
    );
  }

  if (!canAccessSystemAdmin || state === "denied") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-slate-500">THRIVE Admin</p>
            <h1 className="mt-2 text-3xl font-black">Admin access not available</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">This account does not have an active THRIVE admin workspace membership.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4ef] px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">DSS Enterprises</p>
          <h1 className="mt-1 text-3xl font-black">THRIVE Admin</h1>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-slate-600">
            See what needs attention and manage THRIVE.
          </p>
        </header>

        <section>
          <div className="mb-4">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Needs attention</p>
            <h2 className="mt-1 text-2xl font-black">Current work</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/admin/support" className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-300">
              <p className="text-sm font-bold uppercase text-emerald-700">Support</p>
              <p className="mt-1 text-3xl font-black">{summaryLoading ? "…" : snapshot.supportNeedsAction}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">requests currently need review or follow-through</p>
              <p className="mt-3 font-black text-emerald-800">Review support →</p>
            </Link>

            <Link href="/admin/app-access" className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm transition hover:border-cyan-300">
              <p className="text-sm font-bold uppercase text-cyan-700">App access</p>
              <p className="mt-1 text-3xl font-black">{summaryLoading ? "…" : snapshot.accessUnlinkedRaw}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">confirmed unlinked accounts need classification or access review</p>
              <p className="mt-3 font-black text-cyan-800">Review access →</p>
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Environment</p>
            <h2 className="mt-1 text-2xl font-black">At a glance</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/supported-people" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase text-slate-500">People</p>
              <p className="mt-2 text-2xl font-black">{summaryLoading ? "Loading…" : snapshot.peopleTotal + " records"}</p>
              <p className="mt-2 text-sm text-slate-600">
                {summaryLoading ? " " : snapshot.peopleActive + " active · " + snapshot.peoplePaused + " paused"}
              </p>
            </Link>

            <Link href="/admin/resources" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase text-slate-500">Resources</p>
              <p className="mt-2 text-2xl font-black">{summaryLoading ? "Loading…" : snapshot.resourcesVisible + " visible"}</p>
              <p className="mt-2 text-sm text-slate-600">participant-visible resource inventory</p>
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Manage</p>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Link href="/admin/supported-people" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black hover:border-emerald-300">People →</Link>
            <Link href="/admin/app-access" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black hover:border-cyan-300">App access →</Link>
            <Link href="/admin/support" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black hover:border-emerald-300">Support →</Link>
            <Link href="/admin/resources" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black hover:border-emerald-300">Resources →</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
