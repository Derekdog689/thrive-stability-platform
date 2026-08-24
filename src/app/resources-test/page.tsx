"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const WORKSPACE_ID = "71000000-0000-4000-8000-000000000001";
const PROGRAM_ID = "71000000-0000-4000-8000-000000000002";
const RESOURCE_NAME = "SYNTHETIC RESOURCES RLS TEST ONLY";
const RESOURCE_SLUG = "synthetic-resources-rls-test-only";
const SUPPORT_DENIAL_SLUG = "synthetic-resources-support-denial-only";
const PARTICIPANT_DENIAL_SLUG = "synthetic-resources-participant-denial-only";
const ORGANIZATION_NAME = "SYNTHETIC RESOURCES TEST AUTHORITY ONLY";
const ACCESS_PATH_LABEL = "Synthetic official starting point";
const ACCESS_PATH_URL = "https://example.org/thrive-resources-synthetic-test";
const GUIDANCE_HEADING = "Synthetic test resource";

type ActorKind = "admin" | "support" | "participant" | "other" | "signed-out";

type Membership = {
  id: string;
  workspace_id: string;
  user_id: string;
  member_role: string;
  status: string;
};

type SupportedPerson = {
  id: string;
  workspace_id: string;
  auth_user_id: string | null;
  status: string;
};

type ResourceRow = {
  id: string;
  resource_name: string;
  resource_slug: string;
  status: string;
};

type TestResult = {
  id: string;
  expected: string;
  observed: string;
  passed: boolean;
  detail?: string;
};

const tests = [
  ["R01", "Admin creates fixed draft + paused visibility"],
  ["R02", "Support non-admin admin-RPC attempt is denied"],
  ["R03", "Participant admin-RPC attempt is denied"],
  ["R04", "Admin adds synthetic authority organization"],
  ["R05", "Admin adds fixed active access path"],
  ["R06", "Admin adds fixed plain-language guidance"],
  ["R07", "Admin adds verification evidence"],
  ["R08", "Admin activates only after required evidence exists"],
  ["R09", "Participant reads visible Resource through RLS"],
  ["R10", "Participant direct canonical write is denied"],
  ["R11", "Support non-admin canonical mutation is denied"],
  ["R12", "Participant links visible Resource to own submitted Support request"],
  ["R13", "Cross-resource path mismatch remains deferred unless safe fixture exists"],
  ["R14", "Admin pauses workspace visibility for closeout"],
] as const;

function messageFromError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }
  return String(error ?? "Unknown error");
}

export default function ResourcesTestPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [actor, setActor] = useState<ActorKind>("signed-out");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [supportedPerson, setSupportedPerson] = useState<SupportedPerson | null>(null);
  const [resource, setResource] = useState<ResourceRow | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("Loading authenticated context...");

  const recordResult = useCallback((result: TestResult) => {
    setResults((current) => [result, ...current.filter((item) => item.id !== result.id)]);
  }, []);

  const loadResource = useCallback(async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("id, resource_name, resource_slug, status")
      .eq("resource_slug", RESOURCE_SLUG)
      .maybeSingle();

    if (error) {
      setResource(null);
      return null;
    }

    const next = (data as ResourceRow | null) ?? null;
    setResource(next);
    return next;
  }, []);

  const loadActorContext = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setActor("signed-out");
      setMembership(null);
      setSupportedPerson(null);
      setResource(null);
      setStatus("Signed out. Sign in with a controlled synthetic test account.");
      return;
    }

    const userId = nextSession.user.id;

    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("id, workspace_id, user_id, member_role, status")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (memberError) {
      setStatus(`Membership check failed: ${memberError.message}`);
      setActor("other");
      return;
    }

    if (memberData) {
      const member = memberData as Membership;
      setMembership(member);
      setSupportedPerson(null);
      if (member.member_role === "admin") setActor("admin");
      else if (member.member_role === "support") setActor("support");
      else setActor("other");
      setStatus(`Authenticated ${member.member_role} context loaded from live membership.`);
      await loadResource();
      return;
    }

    const { data: personData, error: personError } = await supabase
      .from("supported_people")
      .select("id, workspace_id, auth_user_id, status")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("auth_user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (personError) {
      setStatus(`Supported-person check failed: ${personError.message}`);
      setActor("other");
      return;
    }

    if (personData) {
      setSupportedPerson(personData as SupportedPerson);
      setMembership(null);
      setActor("participant");
      setStatus("Authenticated participant context loaded from live supported-person identity.");
      await loadResource();
      return;
    }

    setMembership(null);
    setSupportedPerson(null);
    setActor("other");
    setResource(null);
    setStatus("Authenticated user is not one of the controlled actors for this route.");
  }, [loadResource]);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setStatus(`Session error: ${error.message}`);
        return;
      }
      setSession(data.session);
      void loadActorContext(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setConfirmed(false);
      setResults([]);
      void loadActorContext(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadActorContext]);

  const actorLabel = useMemo(() => {
    if (actor === "admin") return "Workspace administrator";
    if (actor === "support") return "Support member (non-admin)";
    if (actor === "participant") return "Supported-person participant";
    if (actor === "signed-out") return "Signed out";
    return "Unrecognized / not authorized for test actions";
  }, [actor]);

  async function run(id: string) {
    if (!session || !confirmed || busy) return;

    setBusy(true);
    setStatus(`Running ${id} through the current authenticated browser session...`);

    try {
      if (id === "R01") {
        if (actor !== "admin") throw new Error("R01 is admin-only in this harness.");

        const existing = await loadResource();
        if (existing) {
          recordResult({
            id,
            expected: "One new draft Resource and paused visibility",
            observed: `Fixture already exists with status ${existing.status}; duplicate creation refused.`,
            passed: false,
            detail: existing.id,
          });
          return;
        }

        const { data, error } = await supabase.rpc("admin_create_resource_draft", {
          p_workspace_id: WORKSPACE_ID,
          p_program_id: null,
          p_scope_type: "workspace",
          p_resource_name: RESOURCE_NAME,
          p_resource_slug: RESOURCE_SLUG,
          p_category: "other_not_sure",
          p_subcategory: "synthetic_testing",
          p_plain_language_purpose: "Controlled authenticated Resources RLS validation only.",
          p_participant_boundary_note: "Synthetic test record only. Not participant guidance.",
          p_country_code: "US",
          p_state_code: "FL",
          p_county_name: null,
          p_service_area_text: "Controlled THRIVE synthetic workspace only",
          p_audience_text: "Synthetic authenticated test actors only",
          p_verification_cadence: "stable",
        });

        if (error) throw error;
        const created = await loadResource();
        const { data: visibility, error: visibilityError } = await supabase
          .from("resource_visibility")
          .select("id, resource_id, workspace_id, scope_type, status")
          .eq("resource_id", String(data))
          .eq("workspace_id", WORKSPACE_ID)
          .maybeSingle();
        if (visibilityError) throw visibilityError;

        const passed = Boolean(created?.status === "draft" && visibility?.status === "paused");
        recordResult({
          id,
          expected: "draft Resource + paused workspace visibility",
          observed: `${created?.status ?? "missing"} Resource + ${visibility?.status ?? "missing"} visibility`,
          passed,
          detail: String(data ?? "No resource id returned"),
        });
        return;
      }

      if (id === "R02" || id === "R03") {
        const expectedActor = id === "R02" ? "support" : "participant";
        if (actor !== expectedActor) throw new Error(`${id} requires the ${expectedActor} synthetic actor.`);
        const denialSlug = id === "R02" ? SUPPORT_DENIAL_SLUG : PARTICIPANT_DENIAL_SLUG;

        const { data, error } = await supabase.rpc("admin_create_resource_draft", {
          p_workspace_id: WORKSPACE_ID,
          p_program_id: null,
          p_scope_type: "workspace",
          p_resource_name: `${id} SYNTHETIC DENIAL ONLY`,
          p_resource_slug: denialSlug,
          p_category: "other_not_sure",
          p_subcategory: "synthetic_testing",
          p_plain_language_purpose: "Expected-denial Resources RLS test only.",
          p_participant_boundary_note: "Must not be created.",
          p_country_code: "US",
          p_state_code: "FL",
          p_county_name: null,
          p_service_area_text: "Synthetic denial test",
          p_audience_text: "Synthetic denial test",
          p_verification_cadence: "stable",
        });

        recordResult({
          id,
          expected: "Denied with no Resource created",
          observed: error ? `Denied: ${error.message}` : `Unexpected success: ${String(data)}`,
          passed: Boolean(error),
        });
        return;
      }

      const currentResource = resource ?? (await loadResource());
      if (!currentResource) throw new Error("Create the fixed synthetic Resource with R01 first.");

      if (id === "R04") {
        if (actor !== "admin") throw new Error("R04 is admin-only.");
        const { data, error } = await supabase.rpc("admin_add_resource_organization", {
          p_resource_id: currentResource.id,
          p_organization_name: ORGANIZATION_NAME,
          p_organization_type: "other_verified",
          p_official_website_url: "https://example.org/",
          p_country_code: "US",
          p_role_type: "primary_authority",
          p_is_primary: true,
        });
        if (error) throw error;
        recordResult({ id, expected: "Organization + primary authority role created", observed: `Organization id ${String(data)}`, passed: Boolean(data) });
        return;
      }

      if (id === "R05") {
        if (actor !== "admin") throw new Error("R05 is admin-only.");
        const { data: existing } = await supabase
          .from("resource_access_paths")
          .select("id")
          .eq("resource_id", currentResource.id)
          .eq("label", ACCESS_PATH_LABEL)
          .is("archived_at", null)
          .maybeSingle();
        if (existing) {
          recordResult({ id, expected: "One active fixed access path", observed: "Access path already exists; duplicate insert refused.", passed: false });
          return;
        }
        const { data, error } = await supabase
          .from("resource_access_paths")
          .insert({
            resource_id: currentResource.id,
            organization_id: null,
            path_type: "landing_page",
            label: ACCESS_PATH_LABEL,
            plain_language_instruction: "Synthetic test path only.",
            url: ACCESS_PATH_URL,
            country_code: "US",
            state_code: "FL",
            sort_order: 1,
            is_primary: true,
            status: "active",
            created_by: session.user.id,
          })
          .select("id, status")
          .single();
        if (error) throw error;
        recordResult({ id, expected: "Admin insert succeeds", observed: `Created access path ${data.id} (${data.status})`, passed: data.status === "active" });
        return;
      }

      if (id === "R06") {
        if (actor !== "admin") throw new Error("R06 is admin-only.");
        const { data: existing } = await supabase
          .from("resource_guidance_sections")
          .select("id")
          .eq("resource_id", currentResource.id)
          .eq("heading", GUIDANCE_HEADING)
          .is("archived_at", null)
          .maybeSingle();
        if (existing) {
          recordResult({ id, expected: "One active fixed guidance row", observed: "Guidance already exists; duplicate insert refused.", passed: false });
          return;
        }
        const { data, error } = await supabase
          .from("resource_guidance_sections")
          .insert({
            resource_id: currentResource.id,
            section_type: "what_this_is",
            heading: GUIDANCE_HEADING,
            content: "This is controlled RLS validation only.",
            sort_order: 1,
            status: "active",
            created_by: session.user.id,
          })
          .select("id, status")
          .single();
        if (error) throw error;
        recordResult({ id, expected: "Admin guidance insert succeeds", observed: `Created guidance ${data.id} (${data.status})`, passed: data.status === "active" });
        return;
      }

      if (id === "R07") {
        if (actor !== "admin") throw new Error("R07 is admin-only.");
        const { data: existing } = await supabase
          .from("resource_verifications")
          .select("id")
          .eq("resource_id", currentResource.id)
          .eq("verification_status", "verified")
          .eq("verified_by", session.user.id)
          .maybeSingle();
        if (existing) {
          recordResult({ id, expected: "One verified evidence row", observed: "Verification already exists; duplicate insert refused.", passed: false });
          return;
        }
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("resource_verifications")
          .insert({
            resource_id: currentResource.id,
            verification_scope: "resource_identity",
            verification_status: "verified",
            verified_on: today,
            verified_by: session.user.id,
            source_url: "https://example.org/",
            verification_note: "Synthetic Resources RLS validation only.",
          })
          .select("id, verification_status")
          .single();
        if (error) throw error;
        recordResult({ id, expected: "Admin verification insert succeeds", observed: `Created verification ${data.id} (${data.verification_status})`, passed: data.verification_status === "verified" });
        return;
      }

      if (id === "R08") {
        if (actor !== "admin") throw new Error("R08 is admin-only.");
        const { error } = await supabase.rpc("admin_activate_resource", {
          p_resource_id: currentResource.id,
          p_workspace_id: WORKSPACE_ID,
          p_program_id: null,
        });
        if (error) throw error;
        const refreshed = await loadResource();
        const { data: visibility, error: visibilityError } = await supabase
          .from("resource_visibility")
          .select("status")
          .eq("resource_id", currentResource.id)
          .eq("workspace_id", WORKSPACE_ID)
          .maybeSingle();
        if (visibilityError) throw visibilityError;
        const passed = refreshed?.status === "active" && visibility?.status === "active";
        recordResult({ id, expected: "Resource active + visibility active", observed: `${refreshed?.status ?? "missing"} Resource + ${visibility?.status ?? "missing"} visibility`, passed });
        return;
      }

      if (id === "R09") {
        if (actor !== "participant") throw new Error("R09 requires the participant synthetic actor.");
        const { data: resourceData, error: resourceError } = await supabase
          .from("resources")
          .select("id, resource_name, status")
          .eq("resource_slug", RESOURCE_SLUG);
        if (resourceError) throw resourceError;
        const visible = (resourceData ?? []).length === 1;
        const { data: pathData, error: pathError } = await supabase
          .from("resource_access_paths")
          .select("id, label, status")
          .eq("resource_id", currentResource.id);
        if (pathError) throw pathError;
        const { data: guidanceData, error: guidanceError } = await supabase
          .from("resource_guidance_sections")
          .select("id, heading, status")
          .eq("resource_id", currentResource.id);
        if (guidanceError) throw guidanceError;
        const { data: verificationData, error: verificationError } = await supabase
          .from("resource_verifications")
          .select("id")
          .eq("resource_id", currentResource.id);
        const maintenanceHidden = !verificationError && (verificationData ?? []).length === 0;
        recordResult({
          id,
          expected: "Active Resource/path/guidance visible; verification maintenance hidden",
          observed: `resource=${visible ? 1 : 0}, paths=${pathData?.length ?? 0}, guidance=${guidanceData?.length ?? 0}, verificationRows=${verificationData?.length ?? 0}${verificationError ? `, verificationError=${verificationError.message}` : ""}`,
          passed: visible && (pathData?.length ?? 0) >= 1 && (guidanceData?.length ?? 0) >= 1 && maintenanceHidden,
        });
        return;
      }

      if (id === "R10") {
        if (actor !== "participant") throw new Error("R10 requires the participant synthetic actor.");
        const { error } = await supabase
          .from("resources")
          .update({ plain_language_purpose: "THIS UPDATE MUST BE DENIED" })
          .eq("id", currentResource.id);
        recordResult({ id, expected: "Direct canonical update denied", observed: error ? `Denied: ${error.message}` : "Unexpected update success", passed: Boolean(error) });
        return;
      }

      if (id === "R11") {
        if (actor !== "support") throw new Error("R11 requires the Support non-admin synthetic actor.");
        const { error } = await supabase.rpc("admin_update_resource_details", {
          p_resource_id: currentResource.id,
          p_resource_name: RESOURCE_NAME,
          p_category: "other_not_sure",
          p_subcategory: "synthetic_testing",
          p_plain_language_purpose: "THIS SUPPORT MUTATION MUST BE DENIED",
          p_participant_boundary_note: "Synthetic test record only.",
          p_country_code: "US",
          p_state_code: "FL",
          p_county_name: null,
          p_service_area_text: "Synthetic test",
          p_audience_text: "Synthetic test",
          p_verification_cadence: "stable",
        });
        recordResult({ id, expected: "Support non-admin mutation denied", observed: error ? `Denied: ${error.message}` : "Unexpected RPC success", passed: Boolean(error) });
        return;
      }

      if (id === "R12") {
        if (actor !== "participant" || !supportedPerson) throw new Error("R12 requires the participant synthetic actor.");

        const { data: request, error: requestError } = await supabase
          .from("support_requests")
          .select("id, workspace_id, program_id, supported_person_id, status, created_by")
          .eq("workspace_id", WORKSPACE_ID)
          .eq("program_id", PROGRAM_ID)
          .eq("supported_person_id", supportedPerson.id)
          .eq("created_by", session.user.id)
          .eq("status", "submitted")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (requestError) throw requestError;
        if (!request) throw new Error("No participant-created submitted Support request is currently available for R12.");

        const { data: path, error: pathError } = await supabase
          .from("resource_access_paths")
          .select("id")
          .eq("resource_id", currentResource.id)
          .eq("status", "active")
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (pathError) throw pathError;
        if (!path) throw new Error("No active visible access path is available for R12.");

        const { data: existing, error: existingError } = await supabase
          .from("support_request_links")
          .select("id")
          .eq("support_request_id", request.id)
          .eq("resource_id", currentResource.id)
          .is("archived_at", null)
          .maybeSingle();
        if (existingError) throw existingError;
        if (existing) {
          recordResult({ id, expected: "One Resource-context Support link", observed: "Synthetic link already exists; duplicate insert refused.", passed: false, detail: existing.id });
          return;
        }

        const { data, error } = await supabase
          .from("support_request_links")
          .insert({
            workspace_id: WORKSPACE_ID,
            program_id: PROGRAM_ID,
            supported_person_id: supportedPerson.id,
            support_request_id: request.id,
            resource_id: currentResource.id,
            resource_access_path_id: path.id,
            created_by: session.user.id,
          })
          .select("id, resource_id, resource_access_path_id")
          .single();
        if (error) throw error;
        recordResult({ id, expected: "Visible Resource + matching path link succeeds", observed: `Created Support link ${data.id}`, passed: data.resource_id === currentResource.id && data.resource_access_path_id === path.id });
        return;
      }

      if (id === "R13") {
        recordResult({ id, expected: "Deferred unless safe second-resource fixture exists", observed: "Deferred by candidate boundary; no extra Resource manufactured.", passed: true });
        return;
      }

      if (id === "R14") {
        if (actor !== "admin") throw new Error("R14 is admin-only.");
        const { error } = await supabase.rpc("admin_pause_resource_visibility", {
          p_resource_id: currentResource.id,
          p_workspace_id: WORKSPACE_ID,
          p_program_id: null,
        });
        if (error) throw error;
        const { data: visibility, error: visibilityError } = await supabase
          .from("resource_visibility")
          .select("status")
          .eq("resource_id", currentResource.id)
          .eq("workspace_id", WORKSPACE_ID)
          .maybeSingle();
        if (visibilityError) throw visibilityError;
        recordResult({ id, expected: "Visibility paused; record preserved", observed: `Visibility status ${visibility?.status ?? "missing"}`, passed: visibility?.status === "paused" });
        return;
      }

      throw new Error(`Unknown test id ${id}`);
    } catch (error) {
      recordResult({
        id,
        expected: tests.find(([testId]) => testId === id)?.[1] ?? "Reviewed test behavior",
        observed: `Error: ${messageFromError(error)}`,
        passed: false,
      });
    } finally {
      setBusy(false);
      setStatus(`Finished ${id}. Review observed evidence before any next action.`);
      await loadResource();
    }
  }

  function isAvailable(id: string) {
    if (!session || actor === "other" || actor === "signed-out") return false;
    if (["R01", "R04", "R05", "R06", "R07", "R08", "R14"].includes(id)) return actor === "admin";
    if (["R02", "R11"].includes(id)) return actor === "support";
    if (["R03", "R09", "R10", "R12"].includes(id)) return actor === "participant";
    return id === "R13";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Hidden test route · mock/synthetic only</p>
          <h1 className="mt-2 text-3xl font-black">THRIVE Resources Authenticated RLS Test</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            This route exists only to prove the installed Resources RLS/RPC model through normal authenticated browser sessions. It is not Resources product UI and is intentionally absent from navigation.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-black">Authenticated actor</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="font-bold text-slate-400">Status</dt><dd>{session ? "Signed in" : "Signed out"}</dd></div>
              <div><dt className="font-bold text-slate-400">Email</dt><dd className="break-all">{session?.user.email ?? "None"}</dd></div>
              <div><dt className="font-bold text-slate-400">UUID</dt><dd className="break-all">{session?.user.id ?? "None"}</dd></div>
              <div><dt className="font-bold text-slate-400">Observed role</dt><dd>{actorLabel}</dd></div>
              {membership ? <div><dt className="font-bold text-slate-400">Membership role</dt><dd>{membership.member_role}</dd></div> : null}
              {supportedPerson ? <div><dt className="font-bold text-slate-400">Supported person</dt><dd className="break-all">{supportedPerson.id}</dd></div> : null}
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-black">Fixed test scope</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="font-bold text-slate-400">Workspace</dt><dd className="break-all">{WORKSPACE_ID}</dd></div>
              <div><dt className="font-bold text-slate-400">Program</dt><dd className="break-all">{PROGRAM_ID}</dd></div>
              <div><dt className="font-bold text-slate-400">Fixture</dt><dd>{RESOURCE_NAME}</dd></div>
              <div><dt className="font-bold text-slate-400">Current visible fixture</dt><dd>{resource ? `${resource.status} · ${resource.id}` : "Not visible to this actor / not created"}</dd></div>
            </dl>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-black">Execution guard</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Nothing runs automatically. Each action uses the current signed-in browser session. No delete, service role, arbitrary UUID, SQL input, or generic RPC selection exists here.
          </p>
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
            <span>I understand this is the controlled Resources authenticated test route and I will run only the reviewed action for the currently signed-in synthetic actor.</span>
          </label>
          <p className="mt-3 text-sm font-semibold text-cyan-300">{status}</p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-black">Fixed test actions</h2>
          <div className="mt-4 space-y-3">
            {tests.map(([id, label]) => {
              const available = isAvailable(id);
              const prior = results.find((item) => item.id === id);
              return (
                <div key={id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-cyan-300">{id}</p>
                      <p className="mt-1 font-bold">{label}</p>
                      <p className="mt-1 text-xs text-slate-500">{available ? `Available for current actor: ${actorLabel}` : `Locked for current actor: ${actorLabel}`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void run(id)}
                      disabled={!confirmed || busy || !available}
                      className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {busy ? "Working..." : `Run ${id}`}
                    </button>
                  </div>
                  {prior ? (
                    <div className={`mt-4 rounded-xl border p-3 text-sm ${prior.passed ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"}`}>
                      <p className="font-black">{prior.passed ? "PASS / expected behavior" : "STOP / review required"}</p>
                      <p className="mt-2"><span className="font-bold">Expected:</span> {prior.expected}</p>
                      <p className="mt-1"><span className="font-bold">Observed:</span> {prior.observed}</p>
                      {prior.detail ? <p className="mt-1 break-all text-xs text-slate-400">{prior.detail}</p> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm leading-6 text-rose-100">
          <p className="font-black">Stop rule</p>
          <p className="mt-1">If any expected denial succeeds, any unexpected row appears, or an action returns behavior outside the reviewed result, stop. Do not run the next test until the state is reconciled.</p>
        </section>
      </div>
    </main>
  );
}
