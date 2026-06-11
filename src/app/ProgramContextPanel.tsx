"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ProgramRecord = {
  id: string;
  workspace_id: string;
  program_name: string;
  program_type: string;
  status: string;
  description: string | null;
};

type PanelState =
  | "checking"
  | "signed-out"
  | "waiting"
  | "loading"
  | "ready"
  | "error";

const SELECTED_WORKSPACE_STORAGE_KEY = "thrive:selectedWorkspaceId";
const SELECTED_PROGRAM_STORAGE_KEY = "thrive:selectedProgramId";

export default function ProgramContextPanel() {
  const [panelState, setPanelState] = useState<PanelState>("checking");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [message, setMessage] = useState<string>("Checking program context.");

  useEffect(() => {
    let isMounted = true;

    async function initializeProgramContext() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError || !sessionData.session?.user) {
        setPanelState("signed-out");
        setSelectedWorkspaceId("");
        setPrograms([]);
        setSelectedProgramId("");
        setMessage("Sign in before loading program context.");
        return;
      }

      const storedWorkspaceId = window.localStorage.getItem(
        SELECTED_WORKSPACE_STORAGE_KEY,
      );

      if (!storedWorkspaceId) {
        setPanelState("waiting");
        setSelectedWorkspaceId("");
        setPrograms([]);
        setSelectedProgramId("");
        setMessage("Select a workspace before loading program context.");
        return;
      }

      setSelectedWorkspaceId(storedWorkspaceId);
      await loadProgramsForWorkspace(storedWorkspaceId);
    }

    function handleSelectedWorkspaceChanged(event: Event) {
      const customEvent = event as CustomEvent<{ workspaceId?: string }>;
      const nextWorkspaceId = customEvent.detail?.workspaceId ?? "";

      if (!nextWorkspaceId) {
        setPanelState("waiting");
        setSelectedWorkspaceId("");
        setPrograms([]);
        setSelectedProgramId("");
        setMessage("No active workspace selected.");
        return;
      }

      setSelectedWorkspaceId(nextWorkspaceId);
      void loadProgramsForWorkspace(nextWorkspaceId);
    }

    initializeProgramContext();

    window.addEventListener(
      "thrive:selectedWorkspaceChanged",
      handleSelectedWorkspaceChanged,
    );

    return () => {
      isMounted = false;
      window.removeEventListener(
        "thrive:selectedWorkspaceChanged",
        handleSelectedWorkspaceChanged,
      );
    };
  }, []);

  async function loadProgramsForWorkspace(workspaceId: string) {
    if (!workspaceId) {
      setPanelState("waiting");
      setPrograms([]);
      setSelectedProgramId("");
      setMessage("Select a workspace before loading program context.");
      return;
    }

    setPanelState("loading");
    setMessage("Loading visible programs through authenticated RLS path.");

    const { data, error } = await supabase
      .from("programs")
      .select("id, workspace_id, program_name, program_type, status, description")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      setPanelState("error");
      setPrograms([]);
      setSelectedProgramId("");
      setMessage(error.message);
      return;
    }

    const visiblePrograms = data ?? [];
    const savedProgramId = window.localStorage.getItem(
      SELECTED_PROGRAM_STORAGE_KEY,
    );

    const savedProgramStillVisible = visiblePrograms.some(
      (program) => program.id === savedProgramId,
    );

    const nextSelectedProgramId =
      savedProgramStillVisible && savedProgramId
        ? savedProgramId
        : visiblePrograms[0]?.id ?? "";

    setPrograms(visiblePrograms);
    setSelectedProgramId(nextSelectedProgramId);

    if (nextSelectedProgramId) {
      window.localStorage.setItem(
        SELECTED_PROGRAM_STORAGE_KEY,
        nextSelectedProgramId,
      );
      broadcastSelectedProgram(nextSelectedProgramId);
    } else {
      window.localStorage.removeItem(SELECTED_PROGRAM_STORAGE_KEY);
      broadcastSelectedProgram("");
    }

    setPanelState("ready");
    setMessage(
      visiblePrograms.length > 0
        ? "Program context loaded through authenticated RLS path."
        : "No active programs are visible for this selected workspace.",
    );
  }

  function broadcastSelectedProgram(nextProgramId: string) {
    window.dispatchEvent(
      new CustomEvent("thrive:selectedProgramChanged", {
        detail: { programId: nextProgramId },
      }),
    );
  }

  function handleProgramChange(nextProgramId: string) {
    setSelectedProgramId(nextProgramId);

    if (nextProgramId) {
      window.localStorage.setItem(SELECTED_PROGRAM_STORAGE_KEY, nextProgramId);
    } else {
      window.localStorage.removeItem(SELECTED_PROGRAM_STORAGE_KEY);
    }

    broadcastSelectedProgram(nextProgramId);
  }

  const selectedProgram = programs.find(
    (program) => program.id === selectedProgramId,
  );

  if (panelState === "checking" || panelState === "loading") {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Program context
        </p>
        <h2 className="mt-2 text-2xl font-black">Loading program access</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    );
  }

  if (panelState === "signed-out") {
    return (
      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
          Program context
        </p>
        <h2 className="mt-2 text-2xl font-black text-amber-950">
          Sign-in required
        </h2>
        <p className="mt-3 text-sm leading-6 text-amber-900">{message}</p>
      </div>
    );
  }

  if (panelState === "waiting") {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Program context
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Waiting for workspace
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    );
  }

  if (panelState === "error") {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-red-700">
          Program context
        </p>
        <h2 className="mt-2 text-2xl font-black text-red-950">
          Program load failed
        </h2>
        <p className="mt-3 text-sm leading-6 text-red-900">{message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Program context
          </p>
          <h2 className="mt-2 text-2xl font-black">Selected THRIVE program</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This panel loads active mock/test programs for the selected
            workspace through Supabase RLS. No financial, trust, beneficiary,
            clinical, recovery, or private case data is loaded here.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
          {programs.length} visible programs
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-slate-800">
          Active program
          <select
            value={selectedProgramId}
            onChange={(event) => handleProgramChange(event.target.value)}
            disabled={programs.length === 0}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:bg-slate-50 disabled:text-slate-400"
          >
            {programs.length === 0 ? (
              <option value="">No visible programs</option>
            ) : (
              programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.program_name} - {program.program_type}
                </option>
              ))
            )}
          </select>
        </label>

        {selectedProgram ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Current program
            </p>
            <h3 className="mt-2 text-xl font-black text-emerald-950">
              {selectedProgram.program_name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-emerald-900">
              Type: {selectedProgram.program_type}
            </p>
            <p className="text-sm font-semibold text-emerald-900">
              Status: {selectedProgram.status}
            </p>
            <p className="mt-2 break-all text-xs text-emerald-800">
              ID: {selectedProgram.id}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            No active program selected yet.
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
        {message}
      </div>

      <p className="mt-4 break-all text-xs font-semibold text-slate-500">
        Selected workspace ID: {selectedWorkspaceId || "none"}
      </p>
    </div>
  );
}