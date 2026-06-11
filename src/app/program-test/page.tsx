"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type WorkspaceRecord = {
id: string;
name: string;
workspace_type: string;
status: string;
};

type ProgramRecord = {
id: string;
workspace_id: string;
program_name: string;
program_type: string;
status: string;
description: string | null;
created_at: string;
};

type PageState = "checking" | "signed-out" | "ready" | "loading" | "error";

export default function ProgramTestPage() {
const [pageState, setPageState] = useState<PageState>("checking");
const [email, setEmail] = useState<string>("");
const [userId, setUserId] = useState<string>("");

const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

const [programs, setPrograms] = useState<ProgramRecord[]>([]);
const [programName, setProgramName] = useState<string>("THRIVE Demo Program");
const [programType, setProgramType] = useState<string>("demo");
const [description, setDescription] = useState<string>(
"Mock/test program used to verify workspace-scoped program behavior.",
);

const [message, setMessage] = useState<string>("Checking Supabase session.");

useEffect(() => {
let isMounted = true;

async function loadInitialData() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (!isMounted) {
    return;
  }

  if (sessionError || !sessionData.session?.user) {
    setPageState("signed-out");
    setEmail("");
    setUserId("");
    setMessage("Sign in before testing program records.");
    return;
  }

  setPageState("loading");
  setEmail(sessionData.session.user.email ?? "");
  setUserId(sessionData.session.user.id);
  setMessage("Loading visible workspaces through authenticated RLS path.");

  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name, workspace_type, status")
    .order("created_at", { ascending: false });

  if (!isMounted) {
    return;
  }

  if (workspaceError) {
    setPageState("error");
    setMessage(workspaceError.message);
    return;
  }

  const visibleWorkspaces = workspaceData ?? [];
  const firstWorkspaceId = visibleWorkspaces[0]?.id ?? "";

  setWorkspaces(visibleWorkspaces);
  setSelectedWorkspaceId(firstWorkspaceId);
  setPageState("ready");
  setMessage(
    visibleWorkspaces.length > 0
      ? "Workspace records loaded through authenticated RLS path."
      : "No visible workspaces found for this authenticated user.",
  );

  if (firstWorkspaceId) {
    await loadPrograms(firstWorkspaceId);
  }
}

loadInitialData();

return () => {
  isMounted = false;
};

}, []);

async function loadPrograms(workspaceId: string) {
if (!workspaceId) {
setPrograms([]);
setMessage("Select a workspace before loading programs.");
return;
}

setMessage("Loading visible programs through program RLS.");

const { data, error } = await supabase
  .from("programs")
  .select(
    "id, workspace_id, program_name, program_type, status, description, created_at",
  )
  .eq("workspace_id", workspaceId)
  .order("created_at", { ascending: false });

if (error) {
  setPrograms([]);
  setPageState("error");
  setMessage(error.message);
  return;
}

setPrograms(data ?? []);
setPageState("ready");
setMessage(
  data && data.length > 0
    ? "Program records loaded through authenticated RLS path."
    : "No program records are visible for this workspace yet.",
);

}

async function handleWorkspaceChange(nextWorkspaceId: string) {
setSelectedWorkspaceId(nextWorkspaceId);
await loadPrograms(nextWorkspaceId);
}

async function createProgram() {
if (!selectedWorkspaceId) {
setMessage("Select a workspace before creating a mock/test program.");
return;
}

setPageState("loading");
setMessage("Creating mock/test program through controlled SQL function.");

const { data, error } = await supabase.rpc("create_program_for_workspace", {
  p_workspace_id: selectedWorkspaceId,
  p_program_name: programName,
  p_program_type: programType,
  p_description: description,
});

if (error) {
  setPageState("error");
  setMessage(error.message);
  return;
}

setMessage(`Created mock/test program ID: ${data}`);
await loadPrograms(selectedWorkspaceId);

}

if (pageState === "checking") {
return ( <main className="min-h-screen bg-slate-50 p-8 text-slate-950"> <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm"> <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
DSS Enterprises </p> <h1 className="mt-2 text-4xl font-black">THRIVE Program Test</h1> <p className="mt-4 text-sm text-slate-600">{message}</p> </section> </main>
);
}

if (pageState === "signed-out") {
return ( <main className="min-h-screen bg-slate-50 p-8 text-slate-950"> <section className="mx-auto max-w-4xl rounded-3xl border border-amber-100 bg-amber-50 p-8 shadow-sm"> <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
Program RLS test </p> <h1 className="mt-2 text-4xl font-black text-amber-950">
Sign-in required </h1> <p className="mt-4 text-sm text-amber-900">{message}</p> <a
         href="/login"
         className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
       >
Go to login </a> </section> </main>
);
}

const selectedWorkspace = workspaces.find(
(workspace) => workspace.id === selectedWorkspaceId,
);

return ( <main className="min-h-screen bg-slate-50 p-8 text-slate-950"> <section className="mx-auto max-w-5xl space-y-6"> <div className="rounded-3xl bg-white p-8 shadow-sm"> <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
DSS Enterprises </p> <h1 className="mt-2 text-4xl font-black">THRIVE Program Test</h1> <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
This page tests program creation and program visibility through the
authenticated Supabase app path. Use mock/test data only. </p> </div>
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
      <p className="text-sm font-bold text-emerald-950">
        Authenticated session
      </p>
      <p className="mt-3 text-sm font-semibold text-emerald-900">
        Email: {email}
      </p>
      <p className="mt-1 break-all text-sm font-semibold text-emerald-900">
        User ID: {userId}
      </p>
    </div>
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">Workspace selection</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Programs must belong to a visible workspace. This selector only
        shows workspaces available to the signed-in user through RLS.
      </p>

      <label className="mt-5 block text-sm font-bold text-slate-800">
        Active workspace
        <select
          value={selectedWorkspaceId}
          onChange={(event) => handleWorkspaceChange(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name} - {workspace.workspace_type}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
        Selected workspace:{" "}
        <span className="font-black">
          {selectedWorkspace?.name ?? "none"}
        </span>
        <br />
        Workspace ID:{" "}
        <span className="break-all">{selectedWorkspaceId || "none"}</span>
      </div>
    </div>

    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">Create mock/test program</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        This uses the controlled Supabase function
        create_program_for_workspace. It should only work for workspace
        admins.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-slate-800">
          Program name
          <input
            value={programName}
            onChange={(event) => setProgramName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"
          />
        </label>

        <label className="block text-sm font-bold text-slate-800">
          Program type
          <select
            value={programType}
            onChange={(event) => setProgramType(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"
          >
            <option value="demo">demo</option>
            <option value="stability_support">stability_support</option>
            <option value="trust_stewardship">trust_stewardship</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm font-bold text-slate-800">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={createProgram}
          disabled={pageState === "loading"}
          className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Create mock program
        </button>

        <button
          type="button"
          onClick={() => loadPrograms(selectedWorkspaceId)}
          disabled={!selectedWorkspaceId}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 disabled:opacity-50"
        >
          Reload programs
        </button>
      </div>

      <div
        className={`mt-5 rounded-2xl border p-4 text-sm font-semibold ${
          pageState === "error"
            ? "border-red-100 bg-red-50 text-red-900"
            : "border-emerald-100 bg-emerald-50 text-emerald-900"
        }`}
      >
        {message}
      </div>
    </div>

    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">Visible program records</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        These records should only appear if the signed-in user has access to
        the selected workspace through RLS.
      </p>

      <div className="mt-5 space-y-3">
        {programs.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            No program records loaded.
          </div>
        ) : (
          programs.map((program) => (
            <div
              key={program.id}
              className="rounded-2xl border border-slate-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black">
                    {program.program_name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {program.description ?? "No description"}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  {program.program_type} / {program.status}
                </div>
              </div>
              <p className="mt-3 break-all text-xs font-semibold text-slate-500">
                Program ID: {program.id}
              </p>
              <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                Workspace ID: {program.workspace_id}
              </p>
            </div>
          ))
        )}
      </div>
    </div>

    <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
      <p className="text-sm font-bold text-emerald-300">Security rule</p>
      <p className="mt-3 text-sm leading-6">
        This page is only for mock/test program creation and RLS testing. Do
        not enter real financial, trust, beneficiary, clinical, recovery, or
        private case data.
      </p>
    </div>
  </section>
</main>
);
}
