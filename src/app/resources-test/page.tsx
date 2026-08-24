"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const WORKSPACE_ID = "71000000-0000-4000-8000-000000000001";
const PROGRAM_ID = "71000000-0000-4000-8000-000000000002";
const RESOURCE_ID = "834492d1-1a8b-45b3-a260-280e680e110f";
const RESOURCE_NAME = "SYNTHETIC RESOURCES RLS TEST ONLY";
const RESOURCE_SLUG = "synthetic-resources-rls-test-only";
const SUPPORT_DENIAL_SLUG = "synthetic-resources-support-denial-only";
const PARTICIPANT_DENIAL_SLUG = "synthetic-resources-participant-denial-only";
const ORGANIZATION_NAME = "SYNTHETIC RESOURCES TEST AUTHORITY ONLY";
const ACCESS_PATH_LABEL = "Synthetic official starting point";
const ACCESS_PATH_URL = "https://example.org/thrive-resources-synthetic-test";
const GUIDANCE_HEADING = "Synthetic test resource";

type ActorKind = "admin" | "support" | "participant" | "other" | "signed-out";
type ResourceRow = { id: string; resource_name: string; resource_slug: string; status: string };
type SupportedPerson = { id: string; workspace_id: string; auth_user_id: string | null; status: string };
type Membership = { id: string; workspace_id: string; user_id: string; member_role: string; status: string };
type Result = { id: string; expected: string; observed: string; passed: boolean; detail?: string };

const tests = [
  ["R01", "Admin creates/reconciles fixed draft"],
  ["R02", "Support non-admin admin-RPC attempt is denied"],
  ["R03", "Participant admin-RPC attempt is denied"],
  ["R04", "Admin adds synthetic authority organization"],
  ["R05", "Admin adds fixed active access path"],
  ["R06", "Admin adds fixed plain-language guidance"],
  ["R07", "Admin adds verification evidence"],
  ["R08", "Admin activates after required evidence exists"],
  ["R09", "Participant reads visible Resource through RLS"],
  ["R10", "Participant direct canonical write is denied"],
  ["R11", "Support non-admin canonical mutation is denied"],
  ["R12", "Participant links visible Resource to own submitted Support request"],
  ["R13", "Cross-resource path mismatch remains deferred unless safe fixture exists"],
  ["R14", "Admin pauses workspace visibility for closeout"],
] as const;

function errText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String((error as { message?: unknown }).message ?? "Unknown error");
  return String(error ?? "Unknown error");
}

export default function ResourcesTestPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [actor, setActor] = useState<ActorKind>("signed-out");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [person, setPerson] = useState<SupportedPerson | null>(null);
  const [resource, setResource] = useState<ResourceRow | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Loading authenticated context...");
  const [results, setResults] = useState<Result[]>([]);

  const record = useCallback((next: Result) => {
    setResults((current) => [next, ...current.filter((item) => item.id !== next.id)]);
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

  const classify = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setActor("signed-out");
      setMembership(null);
      setPerson(null);
      setResource(null);
      setStatus("Signed out. Use a controlled synthetic test login.");
      return;
    }

    const userId = nextSession.user.id;
    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("id, workspace_id, user_id, member_role, status")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (memberError) {
      setActor("other");
      setStatus(`Membership check failed: ${memberError.message}`);
      return;
    }

    if (member) {
      const nextMember = member as Membership;
      setMembership(nextMember);
      setPerson(null);
      setActor(nextMember.member_role === "admin" ? "admin" : nextMember.member_role === "support" ? "support" : "other");
      setStatus(`Authenticated ${nextMember.member_role} context loaded from live membership.`);
      await loadResource();
      return;
    }

    const { data: supportedPerson, error: personError } = await supabase
      .from("supported_people")
      .select("id, workspace_id, auth_user_id, status")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("auth_user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (personError) {
      setActor("other");
      setStatus(`Supported-person check failed: ${personError.message}`);
      return;
    }

    if (supportedPerson) {
      setMembership(null);
      setPerson(supportedPerson as SupportedPerson);
      setActor("participant");
      setStatus("Authenticated participant context loaded from live supported-person identity.");
      await loadResource();
      return;
    }

    setActor("other");
    setMembership(null);
    setPerson(null);
    setResource(null);
    setStatus("Authenticated user is not a controlled actor for this route.");
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
      void classify(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setConfirmed(false);
      setResults([]);
      void classify(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [classify]);

  const actorLabel = useMemo(() => {
    if (actor === "admin") return "Workspace administrator";
    if (actor === "support") return "Support member (non-admin)";
    if (actor === "participant") return "Supported-person participant";
    if (actor === "signed-out") return "Signed out";
    return "Unrecognized / locked";
  }, [actor]);

  function available(id: string) {
    if (!session || actor === "signed-out" || actor === "other") return false;
    if (["R01", "R04", "R05", "R06", "R07", "R08", "R14"].includes(id)) return actor === "admin";
    if (["R02", "R11"].includes(id)) return actor === "support";
    if (["R03", "R09", "R10", "R12"].includes(id)) return actor === "participant";
    return id === "R13";
  }

  async function run(id: string) {
    if (!session || !confirmed || busy || !available(id)) return;
    setBusy(true);
    setStatus(`Running ${id} through the current authenticated browser session...`);

    try {
      if (id === "R01") {
        if (actor !== "admin") throw new Error("R01 is admin-only.");
        const existing = await loadResource();
        if (existing) {
          record({
            id,
            expected: "Exactly one synthetic draft Resource; visibility remains governed by RPC-only lifecycle",
            observed: `Existing fixture reconciled as ${existing.status}. No duplicate creation attempted.`,
            passed: existing.status === "draft",
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
        record({ id, expected: "Draft Resource created through admin RPC", observed: `RPC returned ${String(data)}; Resource status ${created?.status ?? "missing"}`, passed: created?.status === "draft", detail: String(data ?? "") });
        return;
      }

      if (id === "R02" || id === "R03") {
        const needed = id === "R02" ? "support" : "participant";
        if (actor !== needed) throw new Error(`${id} requires ${needed} actor.`);
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
        record({ id, expected: "Denied with no Resource created", observed: error ? `Denied: ${error.message}` : `Unexpected success: ${String(data)}`, passed: Boolean(error) });
        return;
      }

      if (id === "R11") {
        if (actor !== "support") throw new Error("R11 requires Support actor.");
        const { error } = await supabase.rpc("admin_update_resource_details", {
          p_resource_id: RESOURCE_ID,
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
        record({ id, expected: "Support non-admin mutation denied", observed: error ? `Denied: ${error.message}` : "Unexpected RPC success", passed: Boolean(error) });
        return;
      }

      const current = resource ?? (await loadResource());
      if (!current) throw new Error("Synthetic Resource is not visible to this actor or has not been created.");

      if (id === "R04") {
        if (actor !== "admin") throw new Error("R04 is admin-only.");
        const { data, error } = await supabase.rpc("admin_add_resource_organization", {
          p_resource_id: current.id,
          p_organization_name: ORGANIZATION_NAME,
          p_organization_type: "other_verified",
          p_official_website_url: "https://example.org/",
          p_country_code: "US",
          p_role_type: "primary_authority",
          p_is_primary: true,
        });
        if (error) throw error;
        record({ id, expected: "Organization + primary authority role created", observed: `Organization id ${String(data)}`, passed: Boolean(data) });
        return;
      }

      if (id === "R05") {
        if (actor !== "admin") throw new Error("R05 is admin-only.");
        const { data: existing } = await supabase.from("resource_access_paths").select("id").eq("resource_id", current.id).eq("label", ACCESS_PATH_LABEL).is("archived_at", null).maybeSingle();
        if (existing) {
          record({ id, expected: "One fixed active access path", observed: "Existing access path reconciled; no duplicate insert attempted.", passed: true, detail: existing.id });
          return;
        }
        const { data, error } = await supabase.from("resource_access_paths").insert({
          resource_id: current.id,
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
        }).select("id, status").single();
        if (error) throw error;
        record({ id, expected: "Admin access-path insert succeeds", observed: `Created ${data.id} (${data.status})`, passed: data.status === "active" });
        return;
      }

      if (id === "R06") {
        if (actor !== "admin") throw new Error("R06 is admin-only.");
        const { data: existing } = await supabase.from("resource_guidance_sections").select("id").eq("resource_id", current.id).eq("heading", GUIDANCE_HEADING).is("archived_at", null).maybeSingle();
        if (existing) {
          record({ id, expected: "One fixed active guidance row", observed: "Existing guidance reconciled; no duplicate insert attempted.", passed: true, detail: existing.id });
          return;
        }
        const { data, error } = await supabase.from("resource_guidance_sections").insert({
          resource_id: current.id,
          section_type: "what_this_is",
          heading: GUIDANCE_HEADING,
          content: "This is controlled RLS validation only.",
          sort_order: 1,
          status: "active",
          created_by: session.user.id,
        }).select("id, status").single();
        if (error) throw error;
        record({ id, expected: "Admin guidance insert succeeds", observed: `Created ${data.id} (${data.status})`, passed: data.status === "active" });
        return;
      }

      if (id === "R07") {
        if (actor !== "admin") throw new Error("R07 is admin-only.");
        const { data: existing } = await supabase.from("resource_verifications").select("id").eq("resource_id", current.id).eq("verification_status", "verified").eq("verified_by", session.user.id).maybeSingle();
        if (existing) {
          record({ id, expected: "One verified evidence row", observed: "Existing verification reconciled; no duplicate insert attempted.", passed: true, detail: existing.id });
          return;
        }
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase.from("resource_verifications").insert({
          resource_id: current.id,
          verification_scope: "resource_identity",
          verification_status: "verified",
          verified_on: today,
          verified_by: session.user.id,
          source_url: "https://example.org/",
          verification_note: "Synthetic Resources RLS validation only.",
        }).select("id, verification_status").single();
        if (error) throw error;
        record({ id, expected: "Admin verification insert succeeds", observed: `Created ${data.id} (${data.verification_status})`, passed: data.verification_status === "verified" });
        return;
      }

      if (id === "R08") {
        if (actor !== "admin") throw new Error("R08 is admin-only.");
        const { error } = await supabase.rpc("admin_activate_resource", { p_resource_id: current.id, p_workspace_id: WORKSPACE_ID, p_program_id: null });
        if (error) throw error;
        const refreshed = await loadResource();
        record({ id, expected: "Activation RPC succeeds and Resource becomes active", observed: `Resource status ${refreshed?.status ?? "missing"}. Visibility status is intentionally not directly readable by authenticated browser role.`, passed: refreshed?.status === "active" });
        return;
      }

      if (id === "R09") {
        if (actor !== "participant") throw new Error("R09 requires participant actor.");
        const { data: resourceData, error: resourceError } = await supabase.from("resources").select("id, resource_name, status").eq("resource_slug", RESOURCE_SLUG);
        if (resourceError) throw resourceError;
        const { data: paths, error: pathError } = await supabase.from("resource_access_paths").select("id, label, status").eq("resource_id", current.id);
        if (pathError) throw pathError;
        const { data: guidance, error: guidanceError } = await supabase.from("resource_guidance_sections").select("id, heading, status").eq("resource_id", current.id);
        if (guidanceError) throw guidanceError;
        const { data: verifications, error: verificationError } = await supabase.from("resource_verifications").select("id").eq("resource_id", current.id);
        const hiddenMaintenance = !verificationError && (verifications ?? []).length === 0;
        record({
          id,
          expected: "Resource/path/guidance visible; verification maintenance hidden",
          observed: `resource=${resourceData?.length ?? 0}, paths=${paths?.length ?? 0}, guidance=${guidance?.length ?? 0}, verificationRows=${verifications?.length ?? 0}${verificationError ? `, verificationError=${verificationError.message}` : ""}`,
          passed: (resourceData?.length ?? 0) === 1 && (paths?.length ?? 0) >= 1 && (guidance?.length ?? 0) >= 1 && hiddenMaintenance,
        });
        return;
      }

      if (id === "R10") {
        if (actor !== "participant") throw new Error("R10 requires participant actor.");
        const { error } = await supabase.from("resources").update({ plain_language_purpose: "THIS UPDATE MUST BE DENIED" }).eq("id", current.id);
        record({ id, expected: "Direct canonical update denied", observed: error ? `Denied: ${error.message}` : "Unexpected update success", passed: Boolean(error) });
        return;
      }

      if (id === "R12") {
        if (actor !== "participant" || !person) throw new Error("R12 requires participant actor.");
        const { data: request, error: requestError } = await supabase.from("support_requests")
          .select("id, workspace_id, program_id, supported_person_id, status, created_by")
          .eq("workspace_id", WORKSPACE_ID)
          .eq("program_id", PROGRAM_ID)
          .eq("supported_person_id", person.id)
          .eq("created_by", session.user.id)
          .eq("status", "submitted")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (requestError) throw requestError;
        if (!request) throw new Error("No participant-created submitted Support request is available for R12.");

        const { data: path, error: pathError } = await supabase.from("resource_access_paths").select("id").eq("resource_id", current.id).eq("status", "active").order("sort_order", { ascending: true }).limit(1).maybeSingle();
        if (pathError) throw pathError;
        if (!path) throw new Error("No active Resource access path is available for R12.");

        const { data: existing, error: existingError } = await supabase.from("support_request_links").select("id").eq("support_request_id", request.id).eq("resource_id", current.id).is("archived_at", null).maybeSingle();
        if (existingError) throw existingError;
        if (existing) {
          record({ id, expected: "One Resource-context Support link", observed: "Existing synthetic link reconciled; duplicate insert refused.", passed: true, detail: existing.id });
          return;
        }

        const { data, error } = await supabase.from("support_request_links").insert({
          workspace_id: WORKSPACE_ID,
          program_id: PROGRAM_ID,
          supported_person_id: person.id,
          support_request_id: request.id,
          resource_id: current.id,
          resource_access_path_id: path.id,
          created_by: session.user.id,
        }).select("id, resource_id, resource_access_path_id").single();
        if (error) throw error;
        record({ id, expected: "Visible Resource + matching path link succeeds", observed: `Created Support link ${data.id}`, passed: data.resource_id === current.id && data.resource_access_path_id === path.id });
        return;
      }

      if (id === "R13") {
        record({ id, expected: "Deferred unless safe second-resource fixture exists", observed: "Deferred by approved boundary; no extra Resource manufactured.", passed: true });
        return;
      }

      if (id === "R14") {
        if (actor !== "admin") throw new Error("R14 is admin-only.");
        const { error } = await supabase.rpc("admin_pause_resource_visibility", { p_resource_id: current.id, p_workspace_id: WORKSPACE_ID, p_program_id: null });
        if (error) throw error;
        record({ id, expected: "Pause RPC succeeds; Resource/history preserved", observed: "Pause RPC succeeded. Visibility status is intentionally not directly readable by authenticated browser role; closeout verification is external/read-only plus participant invisibility check.", passed: true });
        return;
      }

      throw new Error(`Unknown test ${id}`);
    } catch (error) {
      record({ id, expected: tests.find(([testId]) => testId === id)?.[1] ?? "Reviewed behavior", observed: `Error: ${errText(error)}`, passed: false });
    } finally {
      setBusy(false);
      setStatus(`Finished ${id}. Review evidence before the next action.`);
      await loadResource();
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Hidden test route · mock/synthetic only</p>
          <h1 className="mt-2 text-3xl font-black">THRIVE Resources Authenticated RLS Test</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Normal authenticated browser sessions only. This is not participant or admin Resources product UI.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-black">Authenticated actor</h2>
            <p className="mt-3 text-sm"><b>Status:</b> {session ? "Signed in" : "Signed out"}</p>
            <p className="mt-2 break-all text-sm"><b>Email:</b> {session?.user.email ?? "None"}</p>
            <p className="mt-2 break-all text-sm"><b>UUID:</b> {session?.user.id ?? "None"}</p>
            <p className="mt-2 text-sm"><b>Observed role:</b> {actorLabel}</p>
            {membership ? <p className="mt-2 text-sm"><b>Membership role:</b> {membership.member_role}</p> : null}
            {person ? <p className="mt-2 break-all text-sm"><b>Supported person:</b> {person.id}</p> : null}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-black">Fixed test scope</h2>
            <p className="mt-3 break-all text-sm"><b>Workspace:</b> {WORKSPACE_ID}</p>
            <p className="mt-2 break-all text-sm"><b>Program:</b> {PROGRAM_ID}</p>
            <p className="mt-2 text-sm"><b>Fixture:</b> {RESOURCE_NAME}</p>
            <p className="mt-2 break-all text-sm"><b>Current visible fixture:</b> {resource ? `${resource.status} · ${resource.id}` : "Not visible to this actor / not created"}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-black">Execution guard</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Nothing runs automatically. Direct `resource_visibility` reads are intentionally absent because lifecycle visibility is RPC-governed and not directly selectable by authenticated users.</p>
          <label className="mt-4 flex gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            <span>I understand this is controlled synthetic testing and I will run only the reviewed action for the current actor.</span>
          </label>
          <p className="mt-3 text-sm font-semibold text-cyan-300">{status}</p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-black">Fixed test actions</h2>
          <div className="mt-4 space-y-3">
            {tests.map(([id, label]) => {
              const allowed = available(id);
              const prior = results.find((item) => item.id === id);
              return (
                <div key={id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black text-cyan-300">{id}</p>
                      <p className="mt-1 font-bold">{label}</p>
                      <p className="mt-1 text-xs text-slate-500">{allowed ? `Available for ${actorLabel}` : `Locked for ${actorLabel}`}</p>
                    </div>
                    <button type="button" onClick={() => void run(id)} disabled={!confirmed || busy || !allowed} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-black disabled:opacity-30">{busy ? "Working..." : `Run ${id}`}</button>
                  </div>
                  {prior ? (
                    <div className={`mt-4 rounded-xl border p-3 text-sm ${prior.passed ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"}`}>
                      <p className="font-black">{prior.passed ? "PASS / expected behavior" : "STOP / review required"}</p>
                      <p className="mt-2"><b>Expected:</b> {prior.expected}</p>
                      <p className="mt-1"><b>Observed:</b> {prior.observed}</p>
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
          <p className="mt-1">If an expected denial succeeds, an unexpected row appears, or observed behavior differs from the reviewed expectation, stop before the next action.</p>
        </section>
      </div>
    </main>
  );
}
