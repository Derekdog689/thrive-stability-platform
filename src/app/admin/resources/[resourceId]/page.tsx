"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../../useAdminAccess";

type ResourceRow = {
  id: string;
  resource_name: string;
  category: string;
  plain_language_purpose: string;
  participant_boundary_note: string | null;
  status: string;
};

type VisibilityRow = {
  id: string;
  resource_id: string;
  workspace_id: string;
  program_id: string | null;
  scope_type: string;
  status: string;
};

type OrganizationRow = {
  id: string;
  organization_name: string;
  organization_type: string;
  official_website_url: string | null;
  country_code: string | null;
};

type OrganizationRoleRow = {
  id: string;
  organization_id: string;
  role_type: string;
  is_primary: boolean;
  status: string;
};

type AccessPathRow = {
  id: string;
  organization_id: string | null;
  path_type: string;
  label: string;
  plain_language_instruction: string | null;
  url: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
  status: string;
};

type GuidanceRow = {
  id: string;
  section_type: string;
  heading: string;
  content: string;
  source_access_path_id: string | null;
  status: string;
};

type VerificationRow = {
  id: string;
  verification_scope: string;
  verification_status: string;
  verified_on: string;
  verified_by: string;
  source_url: string | null;
  verification_note: string | null;
  next_review_on: string | null;
};

const organizationTypes = [
  ["government", "Government"],
  ["nonprofit", "Nonprofit"],
  ["university", "University"],
  ["institution", "Institution"],
  ["professional_association", "Professional association"],
  ["other_verified", "Other verified organization"],
] as const;

const organizationRoles = [
  ["primary_authority", "Primary authority"],
  ["service_provider", "Service provider"],
  ["local_maintainer", "Local maintainer"],
  ["listing_source", "Listing source"],
  ["research_source", "Research source"],
  ["other", "Other"],
] as const;

const accessPathTypes = [
  ["landing_page", "Official landing page"],
  ["direct_action", "Direct action"],
  ["instructions", "Instructions"],
  ["finder", "Finder"],
  ["office_locator", "Office locator"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["document", "Document"],
  ["fallback", "Fallback"],
  ["other", "Other"],
] as const;

const guidanceTypes = [
  ["what_this_is", "What this is"],
  ["start_here", "Start here"],
  ["what_you_can_do", "What you can do"],
  ["how_it_works", "How it works"],
  ["what_to_have_ready", "What to have ready"],
  ["important_note", "Important note"],
  ["fallback", "Fallback"],
  ["need_help", "Need help"],
  ["other", "Other"],
] as const;

const verificationScopes = [
  ["resource_identity", "Resource identity"],
  ["official_domain", "Official domain"],
  ["access_path", "Access path"],
  ["contact_information", "Contact information"],
  ["published_guidance", "Published guidance"],
  ["service_area", "Service area"],
  ["other", "Other"],
] as const;

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function labelFor(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([id]) => id === value)?.[1] ?? value;
}

export default function ResourceMaintenancePage() {
  const params = useParams<{ resourceId: string }>();
  const resourceId = params.resourceId;
  const { state, membership, errorMessage: accessError, canAccessSystemAdmin } = useAdminAccess();

  const [resource, setResource] = useState<ResourceRow | null>(null);
  const [visibility, setVisibility] = useState<VisibilityRow | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [roles, setRoles] = useState<OrganizationRoleRow[]>([]);
  const [accessPaths, setAccessPaths] = useState<AccessPathRow[]>([]);
  const [guidance, setGuidance] = useState<GuidanceRow[]>([]);
  const [verifications, setVerifications] = useState<VerificationRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("government");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgRole, setOrgRole] = useState("primary_authority");

  const [pathType, setPathType] = useState("landing_page");
  const [pathLabel, setPathLabel] = useState("");
  const [pathInstruction, setPathInstruction] = useState("");
  const [pathUrl, setPathUrl] = useState("");
  const [pathPhone, setPathPhone] = useState("");
  const [pathEmail, setPathEmail] = useState("");
  const [pathOrganizationId, setPathOrganizationId] = useState("");

  const [guidanceType, setGuidanceType] = useState("start_here");
  const [guidanceHeading, setGuidanceHeading] = useState("");
  const [guidanceContent, setGuidanceContent] = useState("");
  const [guidanceSourcePathId, setGuidanceSourcePathId] = useState("");

  const [verificationScope, setVerificationScope] = useState("resource_identity");
  const [verifiedOn, setVerifiedOn] = useState(todayIso());
  const [verificationSourceUrl, setVerificationSourceUrl] = useState("");
  const [verificationNote, setVerificationNote] = useState("");
  const [nextReviewOn, setNextReviewOn] = useState("");

  const loadData = useCallback(async () => {
    if (!canAccessSystemAdmin || !membership || !resourceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    const userResult = await supabase.auth.getUser();
    const userId = userResult.data.user?.id ?? null;
    setCurrentUserId(userId);

    const [resourceResult, visibilityResult, roleResult, pathResult, guidanceResult, verificationResult] =
      await Promise.all([
        supabase
          .from("resources")
          .select("id, resource_name, category, plain_language_purpose, participant_boundary_note, status")
          .eq("id", resourceId)
          .maybeSingle(),
        supabase
          .from("resource_visibility")
          .select("id, resource_id, workspace_id, program_id, scope_type, status")
          .eq("resource_id", resourceId)
          .eq("workspace_id", membership.workspace_id)
          .maybeSingle(),
        supabase
          .from("resource_organization_roles")
          .select("id, organization_id, role_type, is_primary, status")
          .eq("resource_id", resourceId)
          .order("created_at", { ascending: true }),
        supabase
          .from("resource_access_paths")
          .select("id, organization_id, path_type, label, plain_language_instruction, url, phone, email, is_primary, status")
          .eq("resource_id", resourceId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("resource_guidance_sections")
          .select("id, section_type, heading, content, source_access_path_id, status")
          .eq("resource_id", resourceId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("resource_verifications")
          .select("id, verification_scope, verification_status, verified_on, verified_by, source_url, verification_note, next_review_on")
          .eq("resource_id", resourceId)
          .order("verified_on", { ascending: false }),
      ]);

    const firstError =
      resourceResult.error ??
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

    const resourceRow = resourceResult.data as ResourceRow | null;
    if (!resourceRow) {
      setPageError("Resource not found or not available to this Admin.");
      setLoading(false);
      return;
    }

    const roleRows = (roleResult.data as OrganizationRoleRow[] | null) ?? [];
    const organizationIds = [...new Set(roleRows.map((row) => row.organization_id))];
    let organizationRows: OrganizationRow[] = [];

    if (organizationIds.length > 0) {
      const organizationResult = await supabase
        .from("resource_organizations")
        .select("id, organization_name, organization_type, official_website_url, country_code")
        .in("id", organizationIds);
      if (organizationResult.error) {
        setPageError(organizationResult.error.message);
        setLoading(false);
        return;
      }
      organizationRows = (organizationResult.data as OrganizationRow[] | null) ?? [];
    }

    setResource(resourceRow);
    setVisibility((visibilityResult.data as VisibilityRow | null) ?? null);
    setRoles(roleRows);
    setOrganizations(organizationRows);
    setAccessPaths((pathResult.data as AccessPathRow[] | null) ?? []);
    setGuidance((guidanceResult.data as GuidanceRow[] | null) ?? []);
    setVerifications((verificationResult.data as VerificationRow[] | null) ?? []);
    setLoading(false);
  }, [canAccessSystemAdmin, membership, resourceId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const organizationById = useMemo(
    () => new Map(organizations.map((row) => [row.id, row])),
    [organizations],
  );

  const activeRoles = roles.filter((row) => row.status === "active");
  const activePaths = accessPaths.filter((row) => row.status === "active");
  const activeGuidance = guidance.filter((row) => row.status === "active");
  const currentAdminVerifications = verifications.filter(
    (row) => row.verification_status === "verified" && row.verified_by === currentUserId,
  );
  const activationReady =
    activeRoles.length > 0 && activePaths.length > 0 && currentAdminVerifications.length > 0;

  async function addOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resource || !orgName.trim()) return;
    setWorking("organization");
    setPageError("");
    setNotice("");

    const { error } = await supabase.rpc("admin_add_resource_organization", {
      p_resource_id: resource.id,
      p_organization_name: orgName.trim(),
      p_organization_type: orgType,
      p_official_website_url: orgWebsite.trim() || null,
      p_country_code: "US",
      p_role_type: orgRole,
      p_is_primary: activeRoles.length === 0,
    });

    setWorking(null);
    if (error) {
      setPageError(error.message);
      return;
    }

    setOrgName("");
    setOrgWebsite("");
    setNotice("Authority organization linked to this Resource.");
    await loadData();
  }

  async function addAccessPath(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resource || !currentUserId || !pathLabel.trim()) return;
    if (!pathUrl.trim() && !pathPhone.trim() && !pathEmail.trim()) {
      setPageError("Add at least one reachable URL, phone number, or email address.");
      return;
    }

    setWorking("path");
    setPageError("");
    setNotice("");

    const { error } = await supabase.from("resource_access_paths").insert({
      resource_id: resource.id,
      organization_id: pathOrganizationId || null,
      path_type: pathType,
      label: pathLabel.trim(),
      plain_language_instruction: pathInstruction.trim() || null,
      url: pathUrl.trim() || null,
      phone: pathPhone.trim() || null,
      email: pathEmail.trim() || null,
      country_code: "US",
      state_code: null,
      locality_text: null,
      sort_order: activePaths.length,
      is_primary: activePaths.length === 0,
      status: "active",
      created_by: currentUserId,
    });

    setWorking(null);
    if (error) {
      setPageError(error.message);
      return;
    }

    setPathLabel("");
    setPathInstruction("");
    setPathUrl("");
    setPathPhone("");
    setPathEmail("");
    setNotice("Official access path added. The Resource is still unpublished until activation.");
    await loadData();
  }

  async function addGuidance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resource || !currentUserId || !guidanceHeading.trim() || !guidanceContent.trim()) return;

    setWorking("guidance");
    setPageError("");
    setNotice("");

    const { error } = await supabase.from("resource_guidance_sections").insert({
      resource_id: resource.id,
      section_type: guidanceType,
      heading: guidanceHeading.trim(),
      content: guidanceContent.trim(),
      source_access_path_id: guidanceSourcePathId || null,
      sort_order: activeGuidance.length,
      status: "active",
      created_by: currentUserId,
    });

    setWorking(null);
    if (error) {
      setPageError(error.message);
      return;
    }

    setGuidanceHeading("");
    setGuidanceContent("");
    setNotice("THRIVE guidance added. It does not publish the Resource by itself.");
    await loadData();
  }

  async function addVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resource || !currentUserId || !verifiedOn) return;
    if (nextReviewOn && nextReviewOn < verifiedOn) {
      setPageError("Next review date cannot be before the verification date.");
      return;
    }

    setWorking("verification");
    setPageError("");
    setNotice("");

    const { error } = await supabase.from("resource_verifications").insert({
      resource_id: resource.id,
      access_path_id: null,
      organization_id: null,
      verification_scope: verificationScope,
      verification_status: "verified",
      verified_on: verifiedOn,
      verified_by: currentUserId,
      source_url: verificationSourceUrl.trim() || null,
      verification_note: verificationNote.trim() || null,
      next_review_on: nextReviewOn || null,
    });

    setWorking(null);
    if (error) {
      setPageError(error.message);
      return;
    }

    setVerificationSourceUrl("");
    setVerificationNote("");
    setNextReviewOn("");
    setNotice("Verification record saved as an Admin-authored factual check.");
    await loadData();
  }

  async function activateResource() {
    if (!resource || !membership || !visibility || !activationReady) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Activate ${resource.resource_name}? This will set the canonical Resource and its current workspace visibility to active, making it available to eligible participants.`,
      )
    ) {
      return;
    }

    setWorking("activation");
    setPageError("");
    setNotice("");

    const { error } = await supabase.rpc("admin_activate_resource", {
      p_resource_id: resource.id,
      p_workspace_id: membership.workspace_id,
      p_program_id: visibility.program_id,
    });

    setWorking(null);
    if (error) {
      setPageError(error.message);
      return;
    }

    setNotice("Resource activated. Its current workspace visibility is now active.");
    await loadData();
  }

  if (state === "checking" || loading) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase text-emerald-700">THRIVE Admin · Resources</p>
          <h1 className="mt-2 text-3xl font-black">Loading Resource maintenance</h1>
        </section>
      </main>
    );
  }

  if (state === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black">THRIVE Admin access required</h1>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white">
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  if (!canAccessSystemAdmin || !resource) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase text-slate-500">THRIVE Admin</p>
          <h1 className="mt-2 text-3xl font-black">Resource maintenance not available</h1>
          <p className="mt-3 text-slate-600">{pageError || accessError || "This Resource is not available to this Admin."}</p>
        </section>
      </main>
    );
  }

  const fieldClass =
    "w-full min-w-0 max-w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef4ef] px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="min-w-0 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase text-emerald-700">THRIVE Admin · Resource maintenance</p>
          <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{resource.resource_name}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">{resource.plain_language_purpose}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Canonical · {resource.status}</span>
            <span className={`rounded-full px-3 py-1 ${visibility?.status === "active" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
              Visibility · {visibility?.status ?? "not mapped"}
            </span>
          </div>
          <Link href="/admin/resources" className="mt-6 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            Back to Resource Library
          </Link>
        </header>

        {pageError ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
            <p className="font-black">This action could not be completed</p>
            <p className="mt-2 break-words text-sm">{pageError}</p>
          </section>
        ) : null}

        {notice ? (
          <section role="status" aria-live="polite" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            {notice}
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase text-emerald-700">Readiness</p>
          <h2 className="mt-2 text-2xl font-black">What this Resource has</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <p>{activeRoles.length > 0 ? "✓" : "○"} Authority organization</p>
            <p>{activePaths.length > 0 ? "✓" : "○"} Official access path</p>
            <p>{currentAdminVerifications.length > 0 ? "✓" : "○"} Current Admin verification</p>
            <p>{activeGuidance.length > 0 ? "✓" : "○"} THRIVE guidance</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The database requires an active organization relationship, an active official access path, and a verification recorded by the activating Admin. Guidance is strongly preferred for participant usefulness but is not itself an activation prerequisite.
          </p>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase text-emerald-700">1 · Authority</p>
          <h2 className="mt-2 text-2xl font-black">Who owns or publishes the information?</h2>
          {activeRoles.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {activeRoles.map((role) => {
                const organization = organizationById.get(role.organization_id);
                return (
                  <div key={role.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-black">{organization?.organization_name ?? "Linked organization"}</p>
                    <p className="mt-1 text-sm text-slate-600">{labelFor(organizationRoles, role.role_type)}{role.is_primary ? " · primary" : ""}</p>
                    {organization?.official_website_url ? <p className="mt-1 break-all text-sm text-slate-500">{organization.official_website_url}</p> : null}
                  </div>
                );
              })}
            </div>
          ) : null}
          <form onSubmit={addOrganization} className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Organization name<input className={fieldClass} value={orgName} onChange={(e) => setOrgName(e.target.value)} required placeholder="Official organization name" /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Organization type<select className={fieldClass} value={orgType} onChange={(e) => setOrgType(e.target.value)}>{organizationTypes.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Role<select className={fieldClass} value={orgRole} onChange={(e) => setOrgRole(e.target.value)}>{organizationRoles.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Official website<input className={fieldClass} value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} inputMode="url" placeholder="https://..." /></label>
            <button disabled={working === "organization" || !orgName.trim()} className="w-fit rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-40 sm:col-span-2">{working === "organization" ? "Saving..." : "Add authority organization"}</button>
          </form>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase text-emerald-700">2 · Access</p>
          <h2 className="mt-2 text-2xl font-black">How can someone reach the official source?</h2>
          {activePaths.length > 0 ? <div className="mt-4 grid gap-3">{activePaths.map((path) => <div key={path.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-black">{path.label}</p><p className="mt-1 text-sm text-slate-600">{labelFor(accessPathTypes,path.path_type)}{path.is_primary ? " · primary" : ""}</p><p className="mt-2 break-all text-sm text-slate-500">{path.url || path.phone || path.email}</p></div>)}</div> : null}
          <form onSubmit={addAccessPath} className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Path type<select className={fieldClass} value={pathType} onChange={(e) => setPathType(e.target.value)}>{accessPathTypes.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Authority organization<select className={fieldClass} value={pathOrganizationId} onChange={(e) => setPathOrganizationId(e.target.value)}><option value="">Not linked</option>{organizations.map((org) => <option key={org.id} value={org.id}>{org.organization_name}</option>)}</select></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Label<input className={fieldClass} value={pathLabel} onChange={(e) => setPathLabel(e.target.value)} required placeholder="Apply online, official information page, call..." /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Plain-language instruction<textarea className={fieldClass} value={pathInstruction} onChange={(e) => setPathInstruction(e.target.value)} rows={2} placeholder="Optional short instruction for the participant" /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">URL<input className={fieldClass} value={pathUrl} onChange={(e) => setPathUrl(e.target.value)} inputMode="url" placeholder="https://..." /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Phone<input className={fieldClass} value={pathPhone} onChange={(e) => setPathPhone(e.target.value)} inputMode="tel" placeholder="Optional" /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Email<input className={fieldClass} value={pathEmail} onChange={(e) => setPathEmail(e.target.value)} inputMode="email" placeholder="Optional" /></label>
            <button disabled={working === "path" || !pathLabel.trim()} className="w-fit rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-40 sm:col-span-2">{working === "path" ? "Saving..." : "Add official access path"}</button>
          </form>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase text-emerald-700">3 · Guidance</p>
          <h2 className="mt-2 text-2xl font-black">What should THRIVE explain?</h2>
          {activeGuidance.length > 0 ? <div className="mt-4 grid gap-3">{activeGuidance.map((section) => <div key={section.id} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase text-emerald-700">{labelFor(guidanceTypes,section.section_type)}</p><p className="mt-1 font-black">{section.heading}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{section.content}</p></div>)}</div> : null}
          <form onSubmit={addGuidance} className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Section type<select className={fieldClass} value={guidanceType} onChange={(e) => setGuidanceType(e.target.value)}>{guidanceTypes.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Source access path<select className={fieldClass} value={guidanceSourcePathId} onChange={(e) => setGuidanceSourcePathId(e.target.value)}><option value="">Not linked</option>{activePaths.map((path) => <option key={path.id} value={path.id}>{path.label}</option>)}</select></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Heading<input className={fieldClass} value={guidanceHeading} onChange={(e) => setGuidanceHeading(e.target.value)} required placeholder="Start here" /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Guidance<textarea className={fieldClass} value={guidanceContent} onChange={(e) => setGuidanceContent(e.target.value)} required rows={4} placeholder="Plain-language participant guidance based on verified facts" /></label>
            <button disabled={working === "guidance" || !guidanceHeading.trim() || !guidanceContent.trim()} className="w-fit rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-40 sm:col-span-2">{working === "guidance" ? "Saving..." : "Add THRIVE guidance"}</button>
          </form>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase text-emerald-700">4 · Verification</p>
          <h2 className="mt-2 text-2xl font-black">Record what Admin actually checked</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">This records a factual verification event. It does not establish participant eligibility, need, urgency, or recommendation.</p>
          {verifications.length > 0 ? <div className="mt-4 grid gap-3">{verifications.map((verification) => <div key={verification.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-black">{labelFor(verificationScopes,verification.verification_scope)} · {verification.verification_status}</p><p className="mt-1 text-sm text-slate-600">Verified {verification.verified_on}{verification.next_review_on ? ` · review by ${verification.next_review_on}` : ""}</p>{verification.verification_note ? <p className="mt-2 text-sm leading-6 text-slate-600">{verification.verification_note}</p> : null}</div>)}</div> : null}
          <form onSubmit={addVerification} className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">What was checked?<select className={fieldClass} value={verificationScope} onChange={(e) => setVerificationScope(e.target.value)}>{verificationScopes.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Verified on<input className={fieldClass} type="date" value={verifiedOn} onChange={(e) => setVerifiedOn(e.target.value)} required /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Source URL<input className={fieldClass} value={verificationSourceUrl} onChange={(e) => setVerificationSourceUrl(e.target.value)} inputMode="url" placeholder="Optional official source used for the check" /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Verification note<textarea className={fieldClass} value={verificationNote} onChange={(e) => setVerificationNote(e.target.value)} rows={3} placeholder="What was actually verified?" /></label>
            <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-700">Next review<input className={fieldClass} type="date" value={nextReviewOn} onChange={(e) => setNextReviewOn(e.target.value)} /></label>
            <button disabled={working === "verification" || !verifiedOn} className="w-fit self-end rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{working === "verification" ? "Saving..." : "Record verification"}</button>
          </form>
        </section>

        <section className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${activationReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-sm font-bold uppercase text-emerald-800">5 · Availability</p>
          <h2 className="mt-2 text-2xl font-black">{resource.status === "active" ? "Resource is active" : activationReady ? "Ready for Admin activation" : "Not ready to activate"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {resource.status === "active"
              ? `Canonical status is active and workspace visibility is ${visibility?.status ?? "not mapped"}.`
              : activationReady
                ? "The installed activation requirements are present. Activating will also turn on this workspace visibility."
                : "Complete the authority organization, official access path, and current Admin verification before activation is available."}
          </p>
          {resource.status !== "active" ? (
            <button type="button" onClick={() => void activateResource()} disabled={!activationReady || working === "activation"} className="mt-5 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
              {working === "activation" ? "Activating..." : "Activate Resource and visibility"}
            </button>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-slate-600">Activation makes the Resource available to eligible participants in this workspace. It does not infer eligibility or take action on anyone's behalf.</p>
        </section>
      </section>
    </main>
  );
}
