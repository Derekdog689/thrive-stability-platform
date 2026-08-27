"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../useAdminAccess";

type ResourceRow = {
  id: string;
  resource_name: string;
  resource_slug: string;
  category: string;
  subcategory: string | null;
  plain_language_purpose: string;
  participant_boundary_note: string | null;
  country_code: string | null;
  state_code: string | null;
  county_name: string | null;
  service_area_text: string | null;
  audience_text: string | null;
  verification_cadence: string;
  status: string;
  created_at: string;
};

type VisibilityRow = {
  id: string;
  resource_id: string;
  workspace_id: string;
  program_id: string | null;
  scope_type: string;
  status: string;
};

type CountRow = { resource_id: string };

type Readiness = {
  organizationRoles: number;
  accessPaths: number;
  guidanceSections: number;
  verifications: number;
};

const categories = [
  ["food_basic_needs", "Food & basic needs"],
  ["identification_documents", "Identification & documents"],
  ["recovery_community_support", "Recovery & community support"],
  ["employment_education", "Employment & education"],
  ["transportation", "Transportation"],
  ["housing_information", "Housing information"],
  ["health_wellness_navigation", "Health & wellness navigation"],
  ["financial_education", "Financial education"],
  ["government_programs_benefits", "Government programs & benefits"],
  ["other_not_sure", "Other / not sure"],
] as const;

const cadences = [
  ["fast_changing", "Fast changing · review about every 90 days"],
  ["moderate", "Moderate · review about every 6 months"],
  ["stable", "Stable · review about every 12 months"],
] as const;

function categoryLabel(value: string) {
  return categories.find(([id]) => id === value)?.[1] ?? value;
}

function cadenceLabel(value: string) {
  return cadences.find(([id]) => id === value)?.[1] ?? value;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function buildReadinessMap(rows: CountRow[]) {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.resource_id, (map.get(row.resource_id) ?? 0) + 1);
  }
  return map;
}

export default function ResourcesAdminPage() {
  const {
    state,
    membership,
    errorMessage: accessError,
    canAccessSystemAdmin,
  } = useAdminAccess();

  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [visibility, setVisibility] = useState<VisibilityRow[]>([]);
  const [readiness, setReadiness] = useState<Map<string, Readiness>>(new Map());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [workingResourceId, setWorkingResourceId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const [resourceName, setResourceName] = useState("");
  const [category, setCategory] = useState("other_not_sure");
  const [purpose, setPurpose] = useState("");
  const [boundaryNote, setBoundaryNote] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [verificationCadence, setVerificationCadence] = useState("moderate");

  const loadData = useCallback(async () => {
    if (!canAccessSystemAdmin || !membership) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    const resourceResult = await supabase
      .from("resources")
      .select(
        "id, resource_name, resource_slug, category, subcategory, plain_language_purpose, participant_boundary_note, country_code, state_code, county_name, service_area_text, audience_text, verification_cadence, status, created_at",
      )
      .order("created_at", { ascending: false });

    if (resourceResult.error) {
      setPageError(resourceResult.error.message);
      setLoading(false);
      return;
    }

    const resourceRows = (resourceResult.data as ResourceRow[] | null) ?? [];
    setResources(resourceRows);

    if (resourceRows.length === 0) {
      setVisibility([]);
      setReadiness(new Map());
      setLoading(false);
      return;
    }

    const resourceIds = resourceRows.map((resource) => resource.id);

    const [visibilityResult, roleResult, pathResult, guidanceResult, verificationResult] =
      await Promise.all([
        supabase
          .from("resource_visibility")
          .select("id, resource_id, workspace_id, program_id, scope_type, status")
          .eq("workspace_id", membership.workspace_id)
          .in("resource_id", resourceIds),
        supabase
          .from("resource_organization_roles")
          .select("resource_id")
          .in("resource_id", resourceIds)
          .eq("status", "active"),
        supabase
          .from("resource_access_paths")
          .select("resource_id")
          .in("resource_id", resourceIds)
          .eq("status", "active"),
        supabase
          .from("resource_guidance_sections")
          .select("resource_id")
          .in("resource_id", resourceIds)
          .eq("status", "active"),
        supabase
          .from("resource_verifications")
          .select("resource_id")
          .in("resource_id", resourceIds)
          .eq("verification_status", "verified"),
      ]);

    const firstError =
      visibilityResult.error ??
      roleResult.error ??
      pathResult.error ??
      guidanceResult.error ??
      verificationResult.error;

    if (firstError) {
      setPageError(firstError.message);
      setLoading(false);
      return;
    }

    setVisibility((visibilityResult.data as VisibilityRow[] | null) ?? []);

    const roleMap = buildReadinessMap((roleResult.data as CountRow[] | null) ?? []);
    const pathMap = buildReadinessMap((pathResult.data as CountRow[] | null) ?? []);
    const guidanceMap = buildReadinessMap(
      (guidanceResult.data as CountRow[] | null) ?? [],
    );
    const verificationMap = buildReadinessMap(
      (verificationResult.data as CountRow[] | null) ?? [],
    );

    const nextReadiness = new Map<string, Readiness>();
    for (const resource of resourceRows) {
      nextReadiness.set(resource.id, {
        organizationRoles: roleMap.get(resource.id) ?? 0,
        accessPaths: pathMap.get(resource.id) ?? 0,
        guidanceSections: guidanceMap.get(resource.id) ?? 0,
        verifications: verificationMap.get(resource.id) ?? 0,
      });
    }
    setReadiness(nextReadiness);
    setLoading(false);
  }, [canAccessSystemAdmin, membership]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibilityByResource = useMemo(() => {
    const map = new Map<string, VisibilityRow>();
    for (const row of visibility) {
      if (!map.has(row.resource_id)) map.set(row.resource_id, row);
    }
    return map;
  }, [visibility]);

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAccessSystemAdmin || !membership) return;

    const cleanName = resourceName.trim();
    const cleanPurpose = purpose.trim();
    if (!cleanName || !cleanPurpose) {
      setPageError("Resource name and plain-language purpose are required.");
      return;
    }

    const baseSlug = slugify(cleanName) || "resource";
    const suffix =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().slice(0, 8)
        : Date.now().toString(36);
    const generatedSlug = `${baseSlug}-${suffix}`;

    setCreating(true);
    setPageError("");
    setNotice("");

    const { data, error } = await supabase.rpc("admin_create_resource_draft", {
      p_workspace_id: membership.workspace_id,
      p_program_id: null,
      p_scope_type: "workspace",
      p_resource_name: cleanName,
      p_resource_slug: generatedSlug,
      p_category: category,
      p_subcategory: null,
      p_plain_language_purpose: cleanPurpose,
      p_participant_boundary_note: boundaryNote.trim() || null,
      p_country_code: "US",
      p_state_code: stateCode.trim().toUpperCase() || null,
      p_county_name: null,
      p_service_area_text: serviceArea.trim() || null,
      p_audience_text: null,
      p_verification_cadence: verificationCadence,
    });

    setCreating(false);

    if (error) {
      setPageError(error.message);
      return;
    }

    setResourceName("");
    setCategory("other_not_sure");
    setPurpose("");
    setBoundaryNote("");
    setStateCode("");
    setServiceArea("");
    setVerificationCadence("moderate");
    setNotice(
      "Resource draft created with paused workspace visibility. It is not participant-visible. Content setup and verification remain separate.",
    );
    await loadData();
  }

  async function changeVisibility(resource: ResourceRow, action: "pause" | "resume") {
    if (!canAccessSystemAdmin || !membership) return;
    const mapping = visibilityByResource.get(resource.id);
    if (!mapping) {
      setPageError("No workspace visibility mapping is available for this Resource.");
      return;
    }

    const target = action === "pause" ? "paused" : "active";
    if (mapping.status === target) return;

    if (
      action === "resume" &&
      resource.status !== "active"
    ) {
      setPageError(
        "Only an active canonical Resource can resume participant visibility. Finish content setup and activation first.",
      );
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.confirm(
        action === "pause"
          ? `Pause participant visibility for ${resource.resource_name}? The Resource and history will be preserved.`
          : `Make ${resource.resource_name} visible again in this workspace? Canonical content will not be changed.`,
      )
    ) {
      return;
    }

    setWorkingResourceId(resource.id);
    setPageError("");
    setNotice("");

    const rpcName =
      action === "pause"
        ? "admin_pause_resource_visibility"
        : "admin_resume_resource_visibility";

    const { error } = await supabase.rpc(rpcName, {
      p_resource_id: resource.id,
      p_workspace_id: membership.workspace_id,
      p_program_id: mapping.program_id,
    });

    setWorkingResourceId(null);

    if (error) {
      setPageError(error.message);
      return;
    }

    setNotice(
      action === "pause"
        ? `${resource.resource_name} is now hidden from participants in this workspace. Nothing was deleted.`
        : `${resource.resource_name} is now visible to eligible participants in this workspace.`,
    );
    await loadData();
  }

  if (state === "checking" || loading) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-6xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-emerald-700">THRIVE Admin</p>
          <h1 className="mt-2 text-3xl font-black">Loading Resource Library</h1>
        </section>
      </main>
    );
  }

  if (state === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-6xl rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">THRIVE Admin access required</h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  if (!canAccessSystemAdmin) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-500">THRIVE Admin</p>
          <h1 className="mt-2 text-3xl font-black">Admin access not available</h1>
          <p className="mt-3 text-slate-600">
            {accessError || "This workflow requires an active THRIVE admin membership."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-emerald-700">
            THRIVE Admin · Resources
          </p>
          <h1 className="mt-2 text-4xl font-black">Resource Library</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Maintain the canonical DSS Resource library and control whether an
            already-active Resource is visible in this THRIVE workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700"
            >
              Back to THRIVE Admin
            </Link>
            <Link
              href="/resources"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700"
            >
              View participant Resources
            </Link>
          </div>
        </header>

        {pageError ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
            <p className="font-black">This action could not be completed</p>
            <p className="mt-2 break-words text-sm">{pageError}</p>
          </section>
        ) : null}

        {notice ? (
          <section
            role="status"
            aria-live="polite"
            className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950"
          >
            {notice}
          </section>
        ) : null}

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-emerald-700">Add Resource</p>
          <h2 className="mt-2 text-2xl font-black">Create a safe draft</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            A new Resource starts as a canonical draft with paused workspace
            visibility. THRIVE generates its technical URL slug and records the
            current Admin as creator. Draft creation does not publish anything.
          </p>

          <form onSubmit={createDraft} className="mt-6 grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
              Resource name
              <input
                value={resourceName}
                onChange={(event) => setResourceName(event.target.value)}
                required
                maxLength={180}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
                placeholder="Example: Florida SNAP starting point"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
              >
                {categories.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Verification cadence
              <select
                value={verificationCadence}
                onChange={(event) => setVerificationCadence(event.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
              >
                {cadences.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
              Plain-language purpose
              <textarea
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                required
                rows={3}
                maxLength={900}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
                placeholder="What useful starting point does this Resource give the participant?"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
              Participant boundary note
              <textarea
                value={boundaryNote}
                onChange={(event) => setBoundaryNote(event.target.value)}
                rows={2}
                maxLength={700}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
                placeholder="Optional factual boundary or reminder about outside authority"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              State
              <input
                value={stateCode}
                onChange={(event) => setStateCode(event.target.value)}
                maxLength={2}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal uppercase text-slate-950 outline-none focus:border-emerald-600"
                placeholder="FL"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Service area
              <input
                value={serviceArea}
                onChange={(event) => setServiceArea(event.target.value)}
                maxLength={240}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
                placeholder="Optional, e.g. Florida statewide"
              />
            </label>

            <button
              type="submit"
              disabled={creating || !resourceName.trim() || !purpose.trim()}
              className="w-fit rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 lg:col-span-2"
            >
              {creating ? "Creating draft..." : "Create Resource draft"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="text-sm font-black uppercase tracking-wide">C1 boundary</p>
          <p className="mt-2 max-w-4xl text-sm leading-6">
            Draft creation and visibility are available here. Authority organizations,
            access paths, THRIVE guidance, verification records, and canonical
            activation are maintained in the next Resources slice. Visibility never
            establishes eligibility, recommendation, diagnosis, urgency, or priority.
          </p>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-sm font-bold uppercase text-emerald-700">Canonical library</p>
            <h2 className="mt-1 text-3xl font-black">Resources</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {resources.length} canonical Resource{resources.length === 1 ? "" : "s"} available to this Admin through current RLS.
            </p>
          </div>

          {resources.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              No canonical Resources are currently available to this Admin.
            </div>
          ) : (
            <div className="grid gap-4">
              {resources.map((resource) => {
                const mapping = visibilityByResource.get(resource.id);
                const signals = readiness.get(resource.id) ?? {
                  organizationRoles: 0,
                  accessPaths: 0,
                  guidanceSections: 0,
                  verifications: 0,
                };
                const activationReady =
                  signals.organizationRoles > 0 &&
                  signals.accessPaths > 0 &&
                  signals.verifications > 0;
                const working = workingResourceId === resource.id;

                return (
                  <article
                    key={resource.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                            Canonical · {resource.status}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 ${
                              mapping?.status === "active"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            Visibility · {mapping?.status ?? "not mapped"}
                          </span>
                        </div>
                        <h3 className="mt-3 text-2xl font-black">{resource.resource_name}</h3>
                        <p className="mt-1 text-sm font-semibold text-emerald-800">
                          {categoryLabel(resource.category)}
                        </p>
                        <p className="mt-3 max-w-3xl leading-6 text-slate-600">
                          {resource.plain_language_purpose}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
                      <div>
                        <dt className="font-bold text-slate-500">Visibility scope</dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {mapping
                            ? mapping.scope_type === "workspace"
                              ? "This workspace"
                              : "Program-specific"
                            : "No mapping"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">Service area</dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {resource.service_area_text || resource.state_code || "Not specified"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">Review cadence</dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {cadenceLabel(resource.verification_cadence)}
                        </dd>
                      </div>
                    </dl>

                    <section className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-black text-slate-900">Content readiness</p>
                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <p>{signals.organizationRoles > 0 ? "✓" : "○"} Authority organization</p>
                        <p>{signals.accessPaths > 0 ? "✓" : "○"} Official access path</p>
                        <p>{signals.verifications > 0 ? "✓" : "○"} Verification record</p>
                        <p>{signals.guidanceSections > 0 ? "✓" : "○"} THRIVE guidance</p>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {resource.status === "active"
                          ? "Canonical Resource is already active. Visibility may be paused or resumed independently."
                          : activationReady
                            ? "Core activation prerequisites are present. Canonical activation is intentionally deferred to C2."
                            : "Draft remains unpublished while content setup is incomplete."}
                      </p>
                    </section>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {mapping?.status === "active" ? (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => void changeVisibility(resource, "pause")}
                          className="rounded-2xl border border-amber-400 bg-white px-4 py-3 text-sm font-bold text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {working ? "Updating..." : "Pause participant visibility"}
                        </button>
                      ) : null}

                      {mapping?.status === "paused" && resource.status === "active" ? (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => void changeVisibility(resource, "resume")}
                          className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {working ? "Updating..." : "Resume participant visibility"}
                        </button>
                      ) : null}

                      {resource.status !== "active" ? (
                        <span className="inline-flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                          Canonical activation comes in C2
                        </span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
