"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type WorkspaceRow = {
  id: string;
  name: string;
  workspace_type: string;
  status: string;
  created_by: string;
  created_at: string;
};

export default function WorkspaceTestPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("THRIVE Demo Workspace");
  const [workspaceType, setWorkspaceType] = useState("personal");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSession() {
    setError("");
    setMessage("");

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.user) {
      setEmail(null);
      setUserId(null);
      setError("No authenticated user found. Sign in at /login first.");
      return;
    }

    setEmail(data.user.email ?? null);
    setUserId(data.user.id);
  }

  async function loadWorkspaces() {
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, workspace_type, status, created_by, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setWorkspaces(data ?? []);
    setMessage("Workspace records loaded through authenticated RLS path.");
    setLoading(false);
  }

  async function createWorkspace() {
    setLoading(true);
    setError("");
    setMessage("");
    setWorkspaceId(null);

    const { data, error } = await supabase.rpc("create_workspace_with_admin", {
      p_name: workspaceName,
      p_workspace_type: workspaceType,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setWorkspaceId(data);
    setMessage("Workspace created successfully through authenticated app session.");
    setLoading(false);

    await loadWorkspaces();
  }

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-3xl font-black">THRIVE Workspace Test</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page tests authenticated workspace creation through the approved Supabase
            bootstrap function. Use mock/test records only.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <p className="text-sm font-black text-emerald-900">Authenticated session</p>
          <div className="mt-3 space-y-1 text-sm font-semibold text-emerald-800">
            <p>Email: {email ?? "Not authenticated"}</p>
            <p>User ID: {userId ?? "Not authenticated"}</p>
          </div>
          <button
            type="button"
            onClick={loadSession}
            disabled={loading}
            className="mt-4 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh session
          </button>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Create test workspace</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700">
                Workspace name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">
                Workspace type
              </label>
              <select
                value={workspaceType}
                onChange={(event) => setWorkspaceType(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
              >
                <option value="personal">personal</option>
                <option value="trust_support">trust_support</option>
                <option value="recovery_support">recovery_support</option>
                <option value="demo">demo</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={createWorkspace}
              disabled={loading || !userId}
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Working..." : "Create workspace"}
            </button>

            <button
              type="button"
              onClick={loadWorkspaces}
              disabled={loading || !userId}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Load my workspaces
            </button>
          </div>

          {workspaceId ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Created workspace ID: {workspaceId}
            </div>
          ) : null}

          {message ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Visible workspace records</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These records should only appear if the authenticated user is assigned through
            workspace_members and allowed by RLS.
          </p>

          <div className="mt-5 space-y-3">
            {workspaces.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                No workspace records loaded yet.
              </p>
            ) : (
              workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="rounded-2xl border border-slate-100 p-4 text-sm"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <p className="font-black text-slate-950">{workspace.name}</p>
                      <p className="mt-1 text-slate-500">{workspace.id}</p>
                    </div>
                    <div className="font-semibold text-slate-600">
                      {workspace.workspace_type} / {workspace.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950 p-5 text-sm leading-6 text-slate-200">
          <p className="font-bold text-emerald-300">Security rule</p>
          <p className="mt-1">
            This page is only for mock/test workspace creation. Do not enter real
            beneficiary, trust, clinical, financial, or private case data.
          </p>
        </div>
      </section>
    </main>
  );
}