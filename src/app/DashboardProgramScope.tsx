"use client";

import { useEffect, useState } from "react";

const SELECTED_PROGRAM_STORAGE_KEY = "thrive:selectedProgramId";

export default function DashboardProgramScope() {
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  useEffect(() => {
    const storedProgramId = window.localStorage.getItem(
      SELECTED_PROGRAM_STORAGE_KEY,
    );

    if (storedProgramId) {
      setSelectedProgramId(storedProgramId);
    }

    function handleSelectedProgramChanged(event: Event) {
      const customEvent = event as CustomEvent<{ programId?: string }>;
      const nextProgramId = customEvent.detail?.programId ?? "";
      setSelectedProgramId(nextProgramId);
    }

    window.addEventListener(
      "thrive:selectedProgramChanged",
      handleSelectedProgramChanged,
    );

    return () => {
      window.removeEventListener(
        "thrive:selectedProgramChanged",
        handleSelectedProgramChanged,
      );
    };
  }, []);

  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        Program dashboard scope
      </p>

      <h2 className="mt-2 text-2xl font-black text-emerald-950">
        Program-scoped dashboard shell
      </h2>

      <p className="mt-3 text-sm leading-6 text-emerald-900">
        The mock dashboard below is now listening for selected program context.
        This does not load protected records yet.
      </p>

      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-emerald-900">
        Active program ID: {selectedProgramId || "No program selected yet"}
      </div>
    </div>
  );
}