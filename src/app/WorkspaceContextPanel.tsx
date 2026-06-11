"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type WorkspaceRecord = {
  id: string;
  name: string;
  workspace_type: string;
  status: string;
};

type PanelState = "checking" | "signed-out" | "loading" | "ready" | "error";

const SELECTED_WORKSPACE_STORAGE_KEY = "thrive:selectedWorkspaceId";

export default function WorkspaceContextPanel() {
  const [panelState, setPanelState] = useState<PanelState>("checking");
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaces() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError || !sessionData.session?.user) {
        setPanelState("signed-out");
        setWorkspaces([]);
        setSelectedWorkspaceId("");
        setMessage("Sign in before loading workspace context.");
        return;
      }

      setPanelState("loading");
      setMessage("Loading visible workspaces through RLS.");

      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, workspace_type, status")
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setPanelState("error");
        setWorkspaces([]);
        setSelectedWorkspaceId("");
        setMessage(error.message);
        return;
      }

      const visibleWorkspaces = data ?? [];
      const savedWorkspaceId = window.localStorage.getItem(
        SELECTED_WORKSPACE_STORAGE_KEY,
      );

      const savedWorkspaceStillVisible = visibleWorkspaces.some(
        (workspace) => workspace.id === savedWorkspaceId,
      );

      const nextSelectedWorkspaceId =
        savedWorkspaceStillVisible && savedWorkspaceId
          ? savedWorkspaceId
          : visibleWorkspaces[0]?.id ?? "";

      setWorkspaces(visibleWorkspaces);
      setSelectedWorkspaceId(nextSelectedWorkspaceId);

      if (nextSelectedWorkspaceId) {
        window.localStorage.setItem(
          SELECTED_WORKSPACE_STORAGE_KEY,
          nextSelectedWorkspaceId,
        );
        broadcastSelectedWorkspace(nextSelectedWorkspaceId);
      }

      setPanelState("ready");
      setMessage(
        visibleWorkspaces.length > 0
          ? "Workspace context loaded through authenticated RLS path."
          : "No visible workspaces found for this authenticated user.",
      );
    }

    loadWorkspaces();

    return () => {
      isMounted = false;
    };
  }, []);

  function broadcastSelectedWorkspace(nextWorkspaceId: string) {
    window.dispatchEvent(
      new CustomEvent("thrive:selectedWorkspaceChanged", {
        detail: { workspaceId: nextWorkspaceId },
      }),
    );
  }

  function handleWorkspaceChange(nextWorkspaceId: string) {
    setSelectedWorkspaceId(nextWorkspaceId);
    window.localStorage.setItem(
      SELECTED_WORKSPACE_STORAGE_KEY,
      nextWorkspaceId,
    );
    broadcastSelectedWorkspace(nextWorkspaceId);
  }

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === selectedWorkspaceId,
  );

  if (panelState === "checking" || panelState === "loading") {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Workspace context
        </p>
        <h2 className="mt-2 text-2xl font-black">Loading workspace access</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    );
  }

  if (panelState === "signed-out") {
    return (
      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
          Workspace context
        </p>
        <h2 className="mt-2 text-2xl font-black text-amber-950">
          Sign-in required
        </h2>
        <p className="mt-3 text-sm leading-6 text-amber-900">{message}</p>
      </div>
    );
  }

  if (panelState === "error") {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-red-700">
          Workspace context
        </p>
        <h2 className="mt-2 text-2xl font-black text-red-950">
          Workspace load failed
        </h2>
        <p className="mt-3 text-sm leading-6 text-red-900">{message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Workspace context
          </p>
          <h2 className="mt-2 text-2xl font-black">Selected THRIVE workspace</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel only loads workspace records visible to the signed-in user
            through Supabase RLS. No financial, trust, beneficiary, clinical,
            recovery, or private case data is loaded here.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
          {workspaces.length} visible workspace
          {workspaces.length === 1 ? "" : "s"}
        </div>
      </div>

      {workspaces.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <label className="block">
            <span className="text-sm font-bold text-slate-800">
              Active workspace
            </span>
            <select
              value={selectedWorkspaceId}
              onChange={(event) => handleWorkspaceChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name} - {workspace.workspace_type}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Current selection
            </p>
            <h3 className="mt-2 text-xl font-black text-emerald-950">
              {selectedWorkspace?.name ?? "No workspace selected"}
            </h3>
            <p className="mt-2 text-sm font-semibold text-emerald-900">
              Type: {selectedWorkspace?.workspace_type ?? "none"}
            </p>
            <p className="text-sm font-semibold text-emerald-900">
              Status: {selectedWorkspace?.status ?? "none"}
            </p>
            <p className="mt-2 break-all text-xs text-emerald-800">
              ID: {selectedWorkspace?.id ?? "none"}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          No workspace records are visible yet. Use the workspace test page to
          create a mock/test workspace through the approved authenticated
          bootstrap function.
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
        {message}
      </div>
    </div>
  );
}