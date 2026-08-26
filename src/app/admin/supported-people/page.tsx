"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../useAdminAccess";

type SupportedPersonRow = {
  id: string;
  workspace_id: string;
  auth_user_id: string | null;
  display_name: string;
  preferred_name: string | null;
  status: "active" | "paused" | "archived" | string;
  external_reference: string | null;
  created_at: string;
};

type ParticipationRow = {
  id: string;
  program_id: string;
  supported_person_id: string;
  status: "active" | "inactive" | "completed" | string;
};

type ProgramRow = {
  id: string;
  program_name: string;
};

function displayPersonName(person: SupportedPersonRow) {
  return person.preferred_name?.trim() || person.display_name;
}

export default function SupportedPeopleAdminPage() {
  const {
    state,
    membership,
    errorMessage: accessError,
    canAccessSystemAdmin,
  } = useAdminAccess();

  const [people, setPeople] = useState<SupportedPersonRow[]>([]);
  const [participations, setParticipations] = useState<ParticipationRow[]>([]);
  const [program, setProgram] = useState<ProgramRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingPersonId, setWorkingPersonId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [externalReference, setExternalReference] = useState("");

  const loadData = useCallback(async () => {
    if (!canAccessSystemAdmin || !membership) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    const programResult = await supabase
      .from("programs")
      .select("id, program_name")
      .eq("workspace_id", membership.workspace_id)
      .eq("program_type", "stability_support")
      .eq("status", "active")
      .maybeSingle();

    if (programResult.error) {
      setPageError(programResult.error.message);
      setLoading(false);
      return;
    }

    const activeProgram = (programResult.data as ProgramRow | null) ?? null;
    setProgram(activeProgram);

    if (!activeProgram) {
      setPageError(
        "The active THRIVE Stability Support program could not be found for this workspace.",
      );
      setLoading(false);
      return;
    }

    const [peopleResult, participationResult] = await Promise.all([
      supabase
        .from("supported_people")
        .select(
          "id, workspace_id, auth_user_id, display_name, preferred_name, status, external_reference, created_at",
        )
        .eq("workspace_id", membership.workspace_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("program_participants")
        .select("id, program_id, supported_person_id, status")
        .eq("workspace_id", membership.workspace_id)
        .eq("program_id", activeProgram.id),
    ]);

    if (peopleResult.error || participationResult.error) {
      setPageError(
        peopleResult.error?.message ??
          participationResult.error?.message ??
          "Supported People could not be loaded.",
      );
      setLoading(false);
      return;
    }

    setPeople((peopleResult.data as SupportedPersonRow[] | null) ?? []);
    setParticipations(
      (participationResult.data as ParticipationRow[] | null) ?? [],
    );
    setLoading(false);
  }, [canAccessSystemAdmin, membership]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const participationByPerson = useMemo(() => {
    return new Map(
      participations.map((participation) => [
        participation.supported_person_id,
        participation,
      ]),
    );
  }, [participations]);

  async function createSupportedPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAccessSystemAdmin || !membership) return;

    const cleanDisplayName = displayName.trim();
    const cleanPreferredName = preferredName.trim();
    const cleanExternalReference = externalReference.trim();

    if (!cleanDisplayName) {
      setPageError("Display name is required.");
      return;
    }

    setCreating(true);
    setPageError("");
    setNotice("");

    const result = await supabase
      .from("supported_people")
      .insert({
        workspace_id: membership.workspace_id,
        auth_user_id: null,
        display_name: cleanDisplayName,
        preferred_name: cleanPreferredName || null,
        status: "active",
        external_reference: cleanExternalReference || null,
        created_by: membership.user_id,
      })
      .select(
        "id, workspace_id, auth_user_id, display_name, preferred_name, status, external_reference, created_at",
      )
      .single();

    setCreating(false);

    if (result.error) {
      setPageError(result.error.message);
      return;
    }

    const created = result.data as SupportedPersonRow;
    setPeople((current) => [created, ...current]);
    setDisplayName("");
    setPreferredName("");
    setExternalReference("");
    setNotice(
      `${displayPersonName(created)} was added. Activate program participation to finish this onboarding stage.`,
    );
  }

  async function activateParticipation(person: SupportedPersonRow) {
    if (!canAccessSystemAdmin || !membership || !program) return;

    const existing = participationByPerson.get(person.id);
    if (existing) return;

    setWorkingPersonId(person.id);
    setPageError("");
    setNotice("");

    const result = await supabase
      .from("program_participants")
      .insert({
        workspace_id: membership.workspace_id,
        program_id: program.id,
        supported_person_id: person.id,
        participant_role: "supported_person",
        status: "active",
        created_by: membership.user_id,
      })
      .select("id, program_id, supported_person_id, status")
      .single();

    setWorkingPersonId(null);

    if (result.error) {
      setPageError(result.error.message);
      return;
    }

    const created = result.data as ParticipationRow;
    setParticipations((current) => [created, ...current]);
    setNotice(
      `${displayPersonName(person)} is now active in ${program.program_name}.`,
    );
  }

  if (state === "checking" || loading) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-emerald-700">
            THRIVE Admin
          </p>
          <h1 className="mt-2 text-3xl font-black">Loading Supported People</h1>
        </section>
      </main>
    );
  }

  if (state === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
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
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
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
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-emerald-700">
            THRIVE Admin · Supported People
          </p>
          <h1 className="mt-2 text-4xl font-black">Onboarding and participation</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Add the minimum identity information THRIVE needs, then activate the
            person in the Stability Support program. App access is linked separately.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700"
          >
            Back to THRIVE Admin
          </Link>
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
          <p className="text-sm font-bold uppercase text-emerald-700">Add person</p>
          <h2 className="mt-2 text-2xl font-black">Start with what Admin knows</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            THRIVE supplies the workspace, program, supported-person role,
            creation lineage, and timestamps. No authentication account is created here.
          </p>

          <form onSubmit={createSupportedPerson} className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Display name
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={160}
                required
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
                placeholder="Full or operational display name"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Preferred name
              <input
                value={preferredName}
                onChange={(event) => setPreferredName(event.target.value)}
                maxLength={120}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
                placeholder="Optional"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              External reference
              <input
                value={externalReference}
                onChange={(event) => setExternalReference(event.target.value)}
                maxLength={160}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none focus:border-emerald-600"
                placeholder="Optional operational reference"
              />
            </label>

            <button
              type="submit"
              disabled={creating || !displayName.trim()}
              className="w-fit rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? "Adding person..." : "Add supported person"}
            </button>
          </form>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-sm font-bold uppercase text-emerald-700">Current people</p>
            <h2 className="mt-1 text-3xl font-black">Supported People</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {people.length} record{people.length === 1 ? "" : "s"} in this THRIVE workspace.
            </p>
          </div>

          {people.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              No supported people are currently available.
            </div>
          ) : (
            <div className="grid gap-4">
              {people.map((person) => {
                const participation = participationByPerson.get(person.id);
                const needsActivation = !participation;

                return (
                  <article
                    key={person.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {person.status}
                        </p>
                        <h3 className="mt-2 text-2xl font-black">
                          {displayPersonName(person)}
                        </h3>
                        {person.preferred_name &&
                        person.preferred_name.trim() !== person.display_name.trim() ? (
                          <p className="mt-1 text-sm text-slate-500">
                            Display: {person.display_name}
                          </p>
                        ) : null}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          person.auth_user_id
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {person.auth_user_id ? "App access linked" : "No app access yet"}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-slate-500">Program participation</dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {participation
                            ? `${program?.program_name ?? "THRIVE Stability Support"} · ${participation.status}`
                            : "Needs program activation"}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-bold text-slate-500">External reference</dt>
                        <dd className="mt-1 font-semibold text-slate-900">
                          {person.external_reference || "None"}
                        </dd>
                      </div>
                    </dl>

                    {needsActivation ? (
                      <button
                        type="button"
                        disabled={workingPersonId === person.id || !program}
                        onClick={() => void activateParticipation(person)}
                        className="mt-5 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {workingPersonId === person.id
                          ? "Activating..."
                          : "Activate in THRIVE Stability Support"}
                      </button>
                    ) : null}
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
