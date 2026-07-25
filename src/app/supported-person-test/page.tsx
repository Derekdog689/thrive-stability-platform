"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PageState =
  | "checking"
  | "signed-out"
  | "loading"
  | "ready"
  | "error";

type SupportedPersonRecord = {
  id: string;
  workspace_id: string;
  auth_user_id: string | null;
  display_name: string;
  preferred_name: string | null;
  status: string;
  external_reference: string | null;
  created_at: string;
};

type ProgramParticipantRecord = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  participant_role: string;
  status: string;
  created_at: string;
};

const SELECTED_WORKSPACE_STORAGE_KEY = "thrive:selectedWorkspaceId";
const SELECTED_PROGRAM_STORAGE_KEY = "thrive:selectedProgramId";

export default function SupportedPersonTestPage() {
  const [pageState, setPageState] = useState<PageState>("checking");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");

  const [supportedPeople, setSupportedPeople] = useState<
    SupportedPersonRecord[]
  >([]);
  const [participants, setParticipants] = useState<
    ProgramParticipantRecord[]
  >([]);

  const [message, setMessage] = useState(
    "Checking authenticated Supabase session.",
  );

  const loadVisibleRecords = useCallback(
    async (workspaceId: string, programId: string) => {
      setPageState("loading");
      setMessage(
        "Loading supported-person and participation rows through authenticated RLS.",
      );

      let supportedPeopleQuery = supabase
        .from("supported_people")
        .select(
          "id, workspace_id, auth_user_id, display_name, preferred_name, status, external_reference, created_at",
        )
        .order("created_at", { ascending: true });

      if (workspaceId) {
        supportedPeopleQuery = supportedPeopleQuery.eq(
          "workspace_id",
          workspaceId,
        );
      }

      const {
        data: supportedPeopleData,
        error: supportedPeopleError,
      } = await supportedPeopleQuery;

      if (supportedPeopleError) {
        setSupportedPeople([]);
        setParticipants([]);
        setPageState("error");
        setMessage(
          `Supported-person query failed: ${supportedPeopleError.message}`,
        );
        return;
      }

      let participantQuery = supabase
        .from("program_participants")
        .select(
          "id, workspace_id, program_id, supported_person_id, participant_role, status, created_at",
        )
        .order("created_at", { ascending: true });

      if (workspaceId) {
        participantQuery = participantQuery.eq("workspace_id", workspaceId);
      }

      if (programId) {
        participantQuery = participantQuery.eq("program_id", programId);
      }

      const { data: participantData, error: participantError } =
        await participantQuery;

      if (participantError) {
        setSupportedPeople(supportedPeopleData ?? []);
        setParticipants([]);
        setPageState("error");
        setMessage(
          `Participation query failed: ${participantError.message}`,
        );
        return;
      }

      setSupportedPeople(supportedPeopleData ?? []);
      setParticipants(participantData ?? []);
      setPageState("ready");
      setMessage(
        "Authenticated RLS queries completed. Visible rows are shown below.",
      );
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    async function initializePage() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError || !sessionData.session?.user) {
        setPageState("signed-out");
        setEmail("");
        setUserId("");
        setMessage("Sign in before running supported-person RLS tests.");
        return;
      }

      const workspaceId =
        window.localStorage.getItem(SELECTED_WORKSPACE_STORAGE_KEY) ?? "";
      const programId =
        window.localStorage.getItem(SELECTED_PROGRAM_STORAGE_KEY) ?? "";

      setEmail(sessionData.session.user.email ?? "");
      setUserId(sessionData.session.user.id);
      setSelectedWorkspaceId(workspaceId);
      setSelectedProgramId(programId);

      await loadVisibleRecords(workspaceId, programId);
    }

    void initializePage();

    return () => {
      isMounted = false;
    };
  }, [loadVisibleRecords]);

  if (pageState === "checking") {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Supported-Person RLS Test
          </h1>
          <p className="mt-4 text-sm text-slate-600">{message}</p>
        </section>
      </main>
    );
  }

  if (pageState === "signed-out") {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl border border-amber-100 bg-amber-50 p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Supported-person RLS test
          </p>
          <h1 className="mt-2 text-4xl font-black text-amber-950">
            Sign-in required
          </h1>
          <p className="mt-4 text-sm text-amber-900">{message}</p>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
          >
            Go to login
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Supported-Person RLS Test
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Temporary read-only route for authenticated RLS verification.
            It does not create, update, archive, complete, or delete records.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <p className="text-sm font-black text-emerald-950">
            Authenticated session
          </p>
          <p className="mt-3 break-all text-sm font-semibold text-emerald-900">
            Email: {email || "not available"}
          </p>
          <p className="mt-1 break-all text-sm font-semibold text-emerald-900">
            User ID: {userId}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Workspace context
            </p>
            <p className="mt-3 break-all text-sm font-semibold text-slate-800">
              {selectedWorkspaceId || "No workspace selected"}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Program context
            </p>
            <p className="mt-3 break-all text-sm font-semibold text-slate-800">
              {selectedProgramId || "No program selected"}
            </p>
          </div>
        </div>

        <div
          className={`rounded-3xl border p-5 text-sm font-semibold shadow-sm ${
            pageState === "error"
              ? "border-red-100 bg-red-50 text-red-900"
              : "border-emerald-100 bg-emerald-50 text-emerald-900"
          }`}
        >
          {message}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">
                Visible supported-person rows
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Row count: {supportedPeople.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadVisibleRecords(
                  selectedWorkspaceId,
                  selectedProgramId,
                )
              }
              disabled={pageState === "loading"}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 disabled:opacity-50"
            >
              Reload authenticated queries
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {supportedPeople.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                No supported-person rows are visible to this user.
              </div>
            ) : (
              supportedPeople.map((person) => (
                <div
                  key={person.id}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">
                        {person.display_name}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Preferred name: {person.preferred_name ?? "none"}
                      </p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      {person.status}
                    </div>
                  </div>

                  <p className="mt-3 break-all text-xs font-semibold text-slate-500">
                    Supported-person ID: {person.id}
                  </p>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                    Workspace ID: {person.workspace_id}
                  </p>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                    Linked auth user: {person.auth_user_id ?? "none"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    External reference: {person.external_reference ?? "none"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            Visible participation rows
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Row count: {participants.length}
          </p>

          <div className="mt-5 space-y-3">
            {participants.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                No participation rows are visible to this user.
              </div>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-black">
                      Participation record
                    </p>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      {participant.participant_role} / {participant.status}
                    </div>
                  </div>

                  <p className="mt-3 break-all text-xs font-semibold text-slate-500">
                    Participation ID: {participant.id}
                  </p>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                    Supported-person ID: {participant.supported_person_id}
                  </p>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                    Program ID: {participant.program_id}
                  </p>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                    Workspace ID: {participant.workspace_id}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-emerald-300">
            Temporary test boundary
          </p>
          <p className="mt-3 text-sm leading-6">
            Use controlled test identities and test records only. Do not use
            Johnny, real financial observations, clinical information,
            recovery information, legal information, Trust Engine data, or
            private case information.
          </p>
        </div>
      </section>
    </main>
  );
}
