"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type Workspace = {
  id: string;
  name: string | null;
};

type Program = {
  id: string;
  workspace_id: string;
  program_name: string | null;
  program_type: string | null;
  status: string | null;
};

type BudgetCategory = {
  id: string;
  workspace_id: string;
  program_id: string;
  category_name: string;
  category_type: string;
  planned_amount: number | string;
  spent_amount: number | string;
  remaining_amount: number | string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type TestCategoryInput = {
  category_name: string;
  category_type: "protected" | "flexible" | "support" | "reserve";
  planned_amount: number;
  spent_amount: number;
  sort_order: number;
};

const testCategories: TestCategoryInput[] = [
  {
    category_name: "Housing",
    category_type: "protected",
    planned_amount: 1200,
    spent_amount: 1200,
    sort_order: 1,
  },
  {
    category_name: "Food",
    category_type: "protected",
    planned_amount: 400,
    spent_amount: 125,
    sort_order: 2,
  },
  {
    category_name: "Flexible Spending",
    category_type: "flexible",
    planned_amount: 300,
    spent_amount: 210,
    sort_order: 3,
  },
  {
    category_name: "Emergency Reserve",
    category_type: "reserve",
    planned_amount: 500,
    spent_amount: 0,
    sort_order: 4,
  },
];

function formatMoney(value: number | string) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "$0.00";
  }

  return numericValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function BudgetTestPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [statusMessage, setStatusMessage] = useState("Loading session...");
  const [isBusy, setIsBusy] = useState(false);

  const selectedWorkspace = useMemo(() => {
    return workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  }, [workspaces, selectedWorkspaceId]);

  const selectedProgram = useMemo(() => {
    return programs.find((program) => program.id === selectedProgramId);
  }, [programs, selectedProgramId]);

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatusMessage(`Session error: ${error.message}`);
        return;
      }

      setSession(data.session);
      setStatusMessage(
        data.session
          ? "Authenticated session loaded."
          : "No active session. Sign in before testing budget categories."
      );
    };

    void loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setWorkspaces([]);
      setPrograms([]);
      setCategories([]);
      setSelectedWorkspaceId("");
      setSelectedProgramId("");
      return;
    }

    const loadWorkspaces = async () => {
      setIsBusy(true);
      setStatusMessage("Loading visible workspaces through RLS...");

      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name")
        .order("created_at", { ascending: true });

      if (error) {
        setStatusMessage(`Workspace load error: ${error.message}`);
        setIsBusy(false);
        return;
      }

      const nextWorkspaces = data ?? [];
      setWorkspaces(nextWorkspaces);

      if (nextWorkspaces.length > 0) {
        setSelectedWorkspaceId((currentWorkspaceId) => {
          const stillExists = nextWorkspaces.some(
            (workspace) => workspace.id === currentWorkspaceId
          );

          return stillExists ? currentWorkspaceId : nextWorkspaces[0].id;
        });
      }

      setStatusMessage("Visible workspaces loaded through RLS.");
      setIsBusy(false);
    };

    void loadWorkspaces();
  }, [session]);

  useEffect(() => {
    if (!session || !selectedWorkspaceId) {
      setPrograms([]);
      setCategories([]);
      setSelectedProgramId("");
      return;
    }

    const loadPrograms = async () => {
      setIsBusy(true);
      setStatusMessage("Loading visible programs through RLS...");

      const { data, error } = await supabase
        .from("programs")
        .select("id, workspace_id, program_name, program_type, status")
        .eq("workspace_id", selectedWorkspaceId)
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (error) {
        setStatusMessage(`Program load error: ${error.message}`);
        setIsBusy(false);
        return;
      }

      const nextPrograms = data ?? [];
      setPrograms(nextPrograms);

      if (nextPrograms.length > 0) {
        setSelectedProgramId((currentProgramId) => {
          const stillExists = nextPrograms.some(
            (program) => program.id === currentProgramId
          );

          return stillExists ? currentProgramId : nextPrograms[0].id;
        });
      } else {
        setSelectedProgramId("");
      }

      setStatusMessage("Visible programs loaded through RLS.");
      setIsBusy(false);
    };

    void loadPrograms();
  }, [session, selectedWorkspaceId]);

  const loadBudgetCategories = async () => {
    if (!session || !selectedWorkspaceId || !selectedProgramId) {
      setCategories([]);
      return;
    }

    setIsBusy(true);
    setStatusMessage("Loading visible budget categories through RLS...");

    const { data, error } = await supabase
      .from("budget_categories")
      .select(
        "id, workspace_id, program_id, category_name, category_type, planned_amount, spent_amount, remaining_amount, sort_order, is_active, created_at"
      )
      .eq("workspace_id", selectedWorkspaceId)
      .eq("program_id", selectedProgramId)
      .order("sort_order", { ascending: true });

    if (error) {
      setStatusMessage(`Budget category load error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setCategories(data ?? []);
    setStatusMessage("Budget categories loaded through authenticated RLS.");
    setIsBusy(false);
  };

  useEffect(() => {
    void loadBudgetCategories();
  }, [session, selectedWorkspaceId, selectedProgramId]);

  const createSingleCategory = async (category: TestCategoryInput) => {
    if (!selectedWorkspaceId || !selectedProgramId) {
      setStatusMessage("Select a workspace and program before creating categories.");
      return;
    }

    setIsBusy(true);
    setStatusMessage(`Creating mock category: ${category.category_name}...`);

    const { error } = await supabase.rpc("create_budget_category_for_program", {
      p_workspace_id: selectedWorkspaceId,
      p_program_id: selectedProgramId,
      p_category_name: category.category_name,
      p_category_type: category.category_type,
      p_planned_amount: category.planned_amount,
      p_spent_amount: category.spent_amount,
      p_sort_order: category.sort_order,
    });

    if (error) {
      setStatusMessage(`Create category error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setStatusMessage(`Created mock category: ${category.category_name}.`);
    setIsBusy(false);
  };

  const createAllTestCategories = async () => {
    for (const category of testCategories) {
      await createSingleCategory(category);
    }

    await loadBudgetCategories();
    setStatusMessage("Mock budget category test set created and reloaded.");
  };

  return (
    <main
  style={{
    minHeight: "100vh",
    padding: "2rem",
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#f4fbf7",
    color: "#07111f",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  }}
>
      <h1>THRIVE Budget Category RLS Test</h1>

      <section
        style={{
          border: "1px solid #b45309",
          background: "#fff7ed",
          color: "#7c2d12",
          padding: "1rem",
          borderRadius: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <strong>Mock/Test Only:</strong> Do not enter real financial, trust,
        beneficiary, clinical, recovery, or personally identifying data on this
        page. This route exists only to prove authenticated Supabase RLS.
      </section>

      <section
        style={{
          border: "1px solid #d1d5db",
          padding: "1rem",
          borderRadius: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <h2>Session</h2>
        <p>
          <strong>Status:</strong> {session ? "Signed in" : "Signed out"}
        </p>
        <p>
          <strong>Email:</strong> {session?.user.email ?? "None"}
        </p>
        <p>
          <strong>User ID:</strong> {session?.user.id ?? "None"}
        </p>
      </section>

      <section
        style={{
          border: "1px solid #d1d5db",
          padding: "1rem",
          borderRadius: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <h2>Workspace and Program Scope</h2>

        <label>
          Workspace:
          <select
            value={selectedWorkspaceId}
            onChange={(event) => setSelectedWorkspaceId(event.target.value)}
            disabled={!session || isBusy}
            style={{ display: "block", marginTop: "0.5rem", width: "100%" }}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name ?? "Unnamed workspace"} | {workspace.id}
              </option>
            ))}
          </select>
        </label>

        <div style={{ height: "1rem" }} />

        <label>
          Program:
          <select
            value={selectedProgramId}
            onChange={(event) => setSelectedProgramId(event.target.value)}
            disabled={!session || isBusy || programs.length === 0}
            style={{ display: "block", marginTop: "0.5rem", width: "100%" }}
          >
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.program_name ?? "Unnamed program"} |{" "}
                {program.program_type ?? "unknown"} | {program.id}
              </option>
            ))}
          </select>
        </label>

        <p>
          <strong>Selected workspace:</strong>{" "}
          {selectedWorkspace?.name ?? selectedWorkspaceId ?? "None"}
        </p>
        <p>
          <strong>Selected program:</strong>{" "}
          {selectedProgram?.program_name ?? selectedProgramId ?? "None"}
        </p>
      </section>

      <section
        style={{
          border: "1px solid #d1d5db",
          padding: "1rem",
          borderRadius: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <h2>Actions</h2>

       <button
  type="button"
  onClick={() => void loadBudgetCategories()}
  disabled={!session || isBusy || !selectedProgramId}
  style={{
    marginRight: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#07111f",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  Reload Categories
</button>

        <button
  type="button"
  onClick={() => void createAllTestCategories()}
  disabled={!session || isBusy || !selectedProgramId}
  style={{
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #047857",
    background: "#047857",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  }}
>
  Create Mock Test Categories
</button>

        <p>
          <strong>Action status:</strong> {statusMessage}
        </p>
      </section>

      <section
        style={{
          border: "1px solid #d1d5db",
          padding: "1rem",
          borderRadius: "0.75rem",
        }}
      >
        <h2>Visible Budget Categories</h2>

        {categories.length === 0 ? (
          <p>No budget categories visible through current RLS scope.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  Name
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  Type
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
                  Planned
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
                  Spent
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
                  Remaining
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td style={{ padding: "0.5rem 0" }}>{category.category_name}</td>
                  <td>{category.category_type}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatMoney(category.planned_amount)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatMoney(category.spent_amount)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatMoney(category.remaining_amount)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {category.is_active ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}