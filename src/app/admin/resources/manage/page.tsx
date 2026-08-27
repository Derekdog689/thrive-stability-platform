"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../../useAdminAccess";

type ResourceRow = {
  id: string;
  resource_name: string;
  plain_language_purpose: string;
  status: string;
};

type VisibilityRow = {
  resource_id: string;
  status: string;
};

export default function ResourceMaintenanceIndexPage() {
  const { state, membership, canAccessSystemAdmin, errorMessage } = useAdminAccess();
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [visibility, setVisibility] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const load = useCallback(async () => {
    if (!canAccessSystemAdmin || !membership) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    const resourceResult = await supabase
      .from("resources")
      .select("id, resource_name, plain_language_purpose, status")
      .order("created_at", { ascending: false });

    if (resourceResult.error) {
      setPageError(resourceResult.error.message);
      setLoading(false);
      return;
    }

    const rows = (resourceResult.data as ResourceRow[] | null) ?? [];
    setResources(rows);

    if (rows.length > 0) {
      const visibilityResult = await supabase
        .from("resource_visibility")
        .select("resource_id, status")
        .eq("workspace_id", membership.workspace_id)
        .in("resource_id", rows.map((row) => row.id));

      if (visibilityResult.error) {
        setPageError(visibilityResult.error.message);
        setLoading(false);
        return;
      }

      setVisibility(
        new Map(
          ((visibilityResult.data as VisibilityRow[] | null) ?? []).map((row) => [
            row.resource_id,
            row.status,
          ]),
        ),
      );
    }

    setLoading(false);
  }, [canAccessSystemAdmin, membership]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === "checking" || loading) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black">Loading Resource maintenance</h1>
        </section>
      </main>
    );
  }

  if (!canAccessSystemAdmin) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black">Resource maintenance not available</h1>
          <p className="mt-3 text-slate-600">{errorMessage || "THRIVE Admin access is required."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase text-emerald-700">THRIVE Admin · Resources</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Maintain Resources</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Add authority, official access, participant guidance, and factual verification before deciding whether a Resource is ready to activate.
          </p>
          <Link href="/admin/resources" className="mt-6 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            Back to Resource Library
          </Link>
        </header>

        {pageError ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
            <p className="font-black">Resources could not be loaded</p>
            <p className="mt-2 break-words text-sm">{pageError}</p>
          </section>
        ) : null}

        <section>
          <p className="text-sm font-bold uppercase text-emerald-700">Current library</p>
          <h2 className="mt-1 text-3xl font-black">Choose a Resource</h2>
          <div className="mt-4 grid gap-4">
            {resources.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">No Resources are available in this workspace.</div>
            ) : (
              resources.map((resource) => (
                <article key={resource.id} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Canonical · {resource.status}</span>
                    <span className={`rounded-full px-3 py-1 ${visibility.get(resource.id) === "active" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
                      Visibility · {visibility.get(resource.id) ?? "not mapped"}
                    </span>
                  </div>
                  <h3 className="mt-3 break-words text-2xl font-black">{resource.resource_name}</h3>
                  <p className="mt-2 max-w-3xl leading-6 text-slate-600">{resource.plain_language_purpose}</p>
                  <Link href={`/admin/resources/${resource.id}`} className="mt-5 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">
                    Maintain Resource
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
