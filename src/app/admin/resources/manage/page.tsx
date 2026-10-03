"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../../useAdminAccess";

type ResourceRow = {
  id: string;
  resource_name: string;
  plain_language_purpose: string;
  category: string;
  service_area_text: string | null;
  verification_cadence: string;
  status: string;
};

type VisibilityRow = {
  resource_id: string;
  status: string;
};

function compactCadence(value: string) {
  if (value === "fast_changing") return "90-day review";
  if (value === "moderate") return "6-month review";
  if (value === "stable") return "12-month review";
  return value;
}

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
      .select("id, resource_name, plain_language_purpose, category, service_area_text, verification_cadence, status")
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
        <section className="mx-auto max-w-[1500px] rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">Loading Resource maintenance</h1>
        </section>
      </main>
    );
  }

  if (!canAccessSystemAdmin) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-[1500px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">Resource maintenance not available</h1>
          <p className="mt-3 text-slate-600">{errorMessage || "THRIVE Admin access is required."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef4ef] px-4 py-6 text-slate-950 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-[1500px] space-y-5">
        <header className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">THRIVE Admin · Resources</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Maintain Resources</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Pick a Resource, make the change, and get back to work.
              </p>
            </div>
            <Link href="/admin/resources" className="inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">
              Back to Resource Library
            </Link>
          </div>
        </header>

        {pageError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
            <p className="font-black">Resources could not be loaded</p>
            <p className="mt-1 break-words text-sm">{pageError}</p>
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Current library</p>
              <h2 className="mt-1 text-2xl font-black">Choose a Resource</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">{resources.length} Resources</p>
          </div>

          {resources.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              No Resources are available in this workspace.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-wide">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      {resource.status}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 ${
                        visibility.get(resource.id) === "active"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {visibility.get(resource.id) ?? "not mapped"}
                    </span>
                  </div>

                  <h3 className="mt-3 break-words text-lg font-black leading-tight">
                    {resource.resource_name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-600">
                    {resource.plain_language_purpose}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <p className="truncate">{resource.service_area_text || "Service area not specified"}</p>
                    <p>{compactCadence(resource.verification_cadence)}</p>
                  </div>

                  <Link
                    href={`/admin/resources/${resource.id}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Maintain
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
