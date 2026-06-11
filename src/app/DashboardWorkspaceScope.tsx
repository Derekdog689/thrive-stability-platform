"use client";

import { useEffect, useState } from "react";

const SELECTED_WORKSPACE_STORAGE_KEY = "thrive:selectedWorkspaceId";

type WorkspaceEventDetail = {
  workspaceId?: string;
};

export default function DashboardWorkspaceScope() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  useEffect(() => {
    const savedWorkspaceId =
      window.localStorage.getItem(SELECTED_WORKSPACE_STORAGE_KEY) ?? "";

    setSelectedWorkspaceId(savedWorkspaceId);

    function handleSelectedWorkspaceChanged(event: Event) {
      const customEvent = event as CustomEvent<WorkspaceEventDetail>;
      setSelectedWorkspaceId(customEvent.detail.workspaceId ?? "");
    }

    window.addEventListener(
      "thrive:selectedWorkspaceChanged",
      handleSelectedWorkspaceChanged,
    );

    return () => {
      window.removeEventListener(
        "thrive:selectedWorkspaceChanged",
        handleSelectedWorkspaceChanged,
      );
    };
  }, []);

  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        Dashboard scope
      </p>

      <h2 className="mt-2 text-2xl font-black text-emerald-950">
        Workspace-scoped dashboard shell
      </h2>

      <p className="mt-3 text-sm leading-6 text-emerald-900">
        The mock dashboard below is now listening for selected workspace context.
        This does not load protected records yet.
      </p>

      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-800">
        Active workspace ID:{" "}
        <span className="break-all text-emerald-800">
          {selectedWorkspaceId || "No workspace selected yet"}
        </span>
      </div>
    </div>
  );
}