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

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default function MyProgramPage() {
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
                Your THRIVE plan.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                See the program supporting your current THRIVE experience.
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
              <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Program status
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  No active THRIVE program is available yet
                </h2>
                <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                  When a program is connected to your account, its purpose and
                  current status will appear here.
                </p>
              </section>
            )}

            {!loading && !errorMessage && person && participation && program && (
              <>
                <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                    Your program
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{participantName}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    This is the program currently available to you in THRIVE.
                  </p>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        What this program supports
                      </p>
                      <h2 className="mt-2 text-3xl font-black">
                        {program.program_name}
                      </h2>
                    </div>

                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
                      {formatLabel(program.status)}
                    </span>
                  </div>

                  <p className="mt-6 max-w-3xl leading-7 text-slate-700">
                    {program.description ??
                      "A plain-language description of this program is not available yet."}
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Program focus
                      </p>
                      <p className="mt-2 text-lg font-black">
                        {formatLabel(program.program_type)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Your participation
                      </p>
                      <p className="mt-2 text-lg font-black">
                        {formatLabel(participation.participant_role)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Current status
                      </p>
                      <p className="mt-2 text-lg font-black">
                        {formatLabel(participation.status)}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      What you can review here
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Your current program summary
                    </h2>
                    <p className="mt-3 leading-7 text-slate-600">
                      This page shows the program connected to you and the
                      status of your participation.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      What comes next
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Use THRIVE one step at a time
                    </h2>
                    <p className="mt-3 leading-7 text-slate-600">
                      Visit Today, Budget, Wellness, Goals, or Support when you
                      are ready to focus on a specific part of your plan.
                    </p>
                  </div>
                </section>
              </>
            )}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
