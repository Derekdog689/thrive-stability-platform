"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";

type SupportedPersonRow = {
  id: string;
  workspace_id: string;
  preferred_name: string | null;
  display_name: string;
  status: string;
};

type ParticipationRow = {
  id: string;
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  participant_role: string;
  status: string;
};

type ProgramRow = {
  id: string;
  workspace_id: string;
  program_name: string;
  program_type: string;
  status: string;
  description: string | null;
};

export default function MyProgramPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<SupportedPersonRow | null>(null);
  const [participation, setParticipation] =
    useState<ParticipationRow | null>(null);
  const [program, setProgram] = useState<ProgramRow | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadMyProgram() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      const user = sessionData.session?.user ?? null;

      if (sessionError || !user) {
        setLoading(false);
        setErrorMessage(
          sessionError?.message ?? "Sign in to view your program.",
        );
        return;
      }

      setEmail(user.email ?? "");

      const personResponse = await supabase
        .from("supported_people")
        .select("id, workspace_id, preferred_name, display_name, status")
        .eq("auth_user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (!mounted) return;

      if (personResponse.error) {
        setLoading(false);
        setErrorMessage(personResponse.error.message);
        return;
      }

      if (!personResponse.data) {
        setLoading(false);
        return;
      }

      const personRow = personResponse.data as SupportedPersonRow;
      setPerson(personRow);

      const participationResponse = await supabase
        .from("program_participants")
        .select(
          "id, workspace_id, program_id, supported_person_id, participant_role, status",
        )
        .eq("supported_person_id", personRow.id)
        .eq("workspace_id", personRow.workspace_id)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (participationResponse.error) {
        setLoading(false);
        setErrorMessage(participationResponse.error.message);
        return;
      }

      if (!participationResponse.data) {
        setLoading(false);
        return;
      }

      const participationRow =
        participationResponse.data as ParticipationRow;
      setParticipation(participationRow);

      const programResponse = await supabase
        .from("programs")
        .select(
          "id, workspace_id, program_name, program_type, status, description",
        )
        .eq("id", participationRow.program_id)
        .eq("workspace_id", participationRow.workspace_id)
        .eq("status", "active")
        .maybeSingle();

      if (!mounted) return;

      if (programResponse.error) {
        setLoading(false);
        setErrorMessage(programResponse.error.message);
        return;
      }

      setProgram((programResponse.data as ProgramRow | null) ?? null);
      setLoading(false);
    }

    void loadMyProgram();

    return () => {
      mounted = false;
    };
  }, []);

  const participantName = useMemo(
    () => person?.preferred_name ?? person?.display_name ?? "Participant",
    [person],
  );

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                My Program
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Your active THRIVE program.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                See the program connected to your active participation.
              </p>
            </header>

            {loading && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your program.
              </section>
            )}

            {errorMessage && (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Your program could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            )}

            {!loading && !errorMessage && (!person || !participation || !program) && (
              <>
                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <p className="font-black">
                    No active participant-linked program is available.
                  </p>
                  <p className="mt-2 break-all text-sm text-slate-600">
                    Signed in as {email}
                  </p>
                </section>

                <section className="rounded-3xl bg-slate-950 p-6 text-white">
                  <p className="font-black text-emerald-300">
                    Participant-safe boundary
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    This page does not create programs, change participation,
                    expose other participants, display financial records, or
                    provide Trust Engine controls.
                  </p>
                </section>
              </>
            )}

            {!loading && !errorMessage && person && participation && program && (
              <>
                <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                    Welcome
                  </p>
                  <p className="mt-2 text-2xl font-black">{participantName}</p>
                  <p className="mt-2 text-sm text-slate-700">{email}</p>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Active program
                      </p>
                      <h2 className="mt-2 text-3xl font-black">
                        {program.program_name}
                      </h2>
                    </div>

                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
                      {program.status}
                    </span>
                  </div>

                  <p className="mt-6 max-w-3xl leading-7 text-slate-700">
                    {program.description ??
                      "A participant-safe program description is not available yet."}
                  </p>

                  <dl className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <dt className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Program type
                      </dt>
                      <dd className="mt-2 text-lg font-black capitalize">
                        {program.program_type.replaceAll("_", " ")}
                      </dd>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <dt className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Program status
                      </dt>
                      <dd className="mt-2 text-lg font-black capitalize">
                        {program.status}
                      </dd>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <dt className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Your role
                      </dt>
                      <dd className="mt-2 text-lg font-black capitalize">
                        {participation.participant_role.replaceAll("_", " ")}
                      </dd>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <dt className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Participation status
                      </dt>
                      <dd className="mt-2 text-lg font-black capitalize">
                        {participation.status}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-3xl bg-slate-950 p-6 text-white">
                  <p className="font-black text-emerald-300">
                    Participant-safe boundary
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    This page shows only your active program and participation
                    summary. It does not display UUIDs, raw JSON,
                    other-participant data, workspace administration,
                    financial evidence, Trust controls, or write actions.
                  </p>
                </section>
              </>
            )}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
