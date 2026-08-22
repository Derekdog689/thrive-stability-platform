"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  formatDate,
  formatMoney,
  useParticipantFinancial,
} from "../useParticipantFinancial";
import { supabase } from "@/lib/supabaseClient";

type TransactionExplanation = {
  id: string;
  staged_transaction_id: string;
  explanation_category: string;
  explanation_text: string | null;
  status: string;
  submitted_at: string | null;
};

export default function FinancialActivityPage() {
  const {
  activeProgramId,
  financialActivity,
  financialActivityAllocations,
  budgetPeriods,
  budgetLines,
  loading,
  errorMessage,
  refresh,
} = useParticipantFinancial();

  const [showManualForm, setShowManualForm] = useState(false);
  const [activityDate, setActivityDate] = useState("");
  const [activityDirection, setActivityDirection] = useState<
    "outflow" | "inflow"
  >("outflow");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [connectingActivityId, setConnectingActivityId] = useState<string | null>(
  null,
);

const [selectedBudgetLineId, setSelectedBudgetLineId] = useState("");

const [connectionAmount, setConnectionAmount] = useState("");

const [connectionSaving, setConnectionSaving] = useState(false);

const [connectionNotice, setConnectionNotice] = useState("");
const [
  editingAllocationId,
  setEditingAllocationId,
] = useState<string | null>(null);

const [editAllocationAmount, setEditAllocationAmount] =
  useState("");

const [allocationSaving, setAllocationSaving] =
  useState(false);

const [allocationNotice, setAllocationNotice] =
  useState("");

  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null,
  );
  const [editActivityDate, setEditActivityDate] = useState("");
  const [editActivityDirection, setEditActivityDirection] = useState<
    "outflow" | "inflow"
  >("outflow");
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editNotice, setEditNotice] = useState("");
  const [removingActivityId, setRemovingActivityId] = useState<string | null>(
    null,
  );

  const [transactionExplanations, setTransactionExplanations] = useState<
    TransactionExplanation[]
  >([]);
  const [explanationsLoading, setExplanationsLoading] = useState(true);
  const [explanationsError, setExplanationsError] = useState("");
  const [editingExplanationId, setEditingExplanationId] = useState<
    string | null
  >(null);
  const [editExplanationCategory, setEditExplanationCategory] =
    useState("other");
  const [editExplanationText, setEditExplanationText] = useState("");
  const [explanationSaving, setExplanationSaving] = useState(false);
const [explanationNotice, setExplanationNotice] = useState("");
const [
  creatingExplanationForTransactionId,
  setCreatingExplanationForTransactionId,
] = useState<string | null>(null);

type UploadPreviewRow = {
  row_number: number;
  raw_date: string;
  raw_description: string;
  raw_amount: string;
  activity_date: string;
  description: string;
  amount: string;
};

const [showUploadForm, setShowUploadForm] = useState(false);
const [uploadFileName, setUploadFileName] = useState("");
const [uploadFileHash, setUploadFileHash] = useState("");
const [uploadRows, setUploadRows] = useState<UploadPreviewRow[]>([]);
const [uploadNotice, setUploadNotice] = useState("");
const [uploadSaving, setUploadSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactionExplanations() {
      setExplanationsLoading(true);
      setExplanationsError("");

      const { data, error } = await supabase
        .from("participant_transaction_explanations")
        .select(
          "id, staged_transaction_id, explanation_category, explanation_text, status, submitted_at",
        )
        .is("archived_at", null);

      if (cancelled) {
        return;
      }

      if (error) {
        setExplanationsError(error.message);
        setTransactionExplanations([]);
        setExplanationsLoading(false);
        return;
      }

      setTransactionExplanations((data ?? []) as TransactionExplanation[]);
      setExplanationsLoading(false);
    }

    void loadTransactionExplanations();

    return () => {
      cancelled = true;
    };
  }, []);

  function parseSimpleCsv(text: string): UploadPreviewRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("The CSV does not contain any activity rows.");
  }

  const headers = lines[0]
  .split(",")
  .map((header) =>
    header
      .trim()
      .replace(/^"|"$/g, "")
      .toLowerCase(),
  );

  const dateIndex = headers.indexOf("date");
  const descriptionIndex = headers.indexOf("description");
  const amountIndex = headers.indexOf("amount");

  if (
    dateIndex === -1 ||
    descriptionIndex === -1 ||
    amountIndex === -1
  ) {
    throw new Error(
      "The CSV must contain Date, Description, and Amount columns.",
    );
  }

  return lines.slice(1).map((line, index) => {
    const values = line
  .split(",")
  .map((value) =>
    value
      .trim()
      .replace(/^"|"$/g, ""),
  );

    const rawDate = values[dateIndex] ?? "";
    const rawDescription = values[descriptionIndex] ?? "";
    const rawAmount = values[amountIndex] ?? "";

    const numericAmount = Number(rawAmount);

    if (!rawDate || !rawDescription || !Number.isFinite(numericAmount)) {
      throw new Error(`Row ${index + 2} could not be read.`);
    }

    const parsedDate = new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Row ${index + 2} has an invalid date.`);
    }

    return {
      row_number: index + 1,
      raw_date: rawDate,
      raw_description: rawDescription,
      raw_amount: rawAmount,
      activity_date: parsedDate.toISOString().slice(0, 10),
      description: rawDescription,
      amount: String(numericAmount),
    };
  });
}

async function sha256Hex(file: File) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function handleUploadFile(file: File | null) {
  setUploadNotice("");
  setUploadRows([]);
  setUploadFileName("");
  setUploadFileHash("");

  if (!file) {
    return;
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    setUploadNotice("Choose a CSV file.");
    return;
  }

  try {
    const text = await file.text();
    const rows = parseSimpleCsv(text);
    const hash = await sha256Hex(file);

    setUploadFileName(file.name);
    setUploadFileHash(hash);
    setUploadRows(rows);
  } catch (error) {
    setUploadNotice(
      error instanceof Error
        ? error.message
        : "The CSV could not be read.",
    );
  }
}

async function handleUploadConfirm() {
  setUploadNotice("");

  if (!activeProgramId) {
    setUploadNotice(
      "A single active THRIVE program is required before activity can be uploaded.",
    );
    return;
  }

  if (
    !uploadFileName ||
    !uploadFileHash ||
    uploadRows.length === 0
  ) {
    setUploadNotice("Choose a CSV file first.");
    return;
  }

  setUploadSaving(true);

  const { error } = await supabase.rpc(
    "import_my_financial_activity_csv_v1",
    {
      p_program_id: activeProgramId,
      p_source_filename: uploadFileName,
      p_source_file_sha256: uploadFileHash,
      p_rows: uploadRows,
    },
  );

  if (error) {
    setUploadNotice(error.message);
    setUploadSaving(false);
    return;
  }

  setUploadFileName("");
  setUploadFileHash("");
  setUploadRows([]);
  setShowUploadForm(false);

  await refresh();

  setUploadNotice("Financial activity uploaded.");
  setUploadSaving(false);
}

const uploadMoneyIn = uploadRows.reduce((sum, row) => {
  const value = Number(row.amount);
  return value > 0 ? sum + value : sum;
}, 0);

const uploadMoneyOut = uploadRows.reduce((sum, row) => {
  const value = Number(row.amount);
  return value < 0 ? sum + Math.abs(value) : sum;
}, 0);

const uploadDates = uploadRows
  .map((row) => row.activity_date)
  .sort();

const uploadDateStart = uploadDates[0] ?? "";
const uploadDateEnd = uploadDates[uploadDates.length - 1] ?? "";

  async function handleManualSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!activeProgramId) {
      setNotice(
        "A single active THRIVE program is required before activity can be added.",
      );
      return;
    }

    if (!activityDate) {
      setNotice("Choose the activity date.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setNotice("Enter an amount greater than zero.");
      return;
    }

    if (!description.trim()) {
      setNotice("Add a short description.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.rpc(
      "create_my_manual_financial_activity_v1",
      {
        p_program_id: activeProgramId,
        p_activity_date: activityDate,
        p_activity_direction: activityDirection,
        p_amount: numericAmount,
        p_description: description.trim(),
      },
    );

    if (error) {
      setNotice(error.message);
      setSaving(false);
      return;
    }

    setActivityDate("");
    setActivityDirection("outflow");
    setAmount("");
    setDescription("");
    setShowManualForm(false);

    await refresh();

    setNotice("Financial activity saved.");
    setSaving(false);
  }

  function startEditingActivity(activity: {
    activity_id: string;
    activity_date: string;
    activity_direction: "inflow" | "outflow" | null;
    signed_amount: number | string;
    description: string;
  }) {
    setEditingActivityId(activity.activity_id);
    setEditActivityDate(activity.activity_date);
    setEditActivityDirection(
      activity.activity_direction === "inflow" ? "inflow" : "outflow",
    );
    setEditAmount(String(Math.abs(Number(activity.signed_amount ?? 0))));
    setEditDescription(activity.description);
    setEditNotice("");
  }

  function cancelEditingActivity() {
    setEditingActivityId(null);
    setEditActivityDate("");
    setEditActivityDirection("outflow");
    setEditAmount("");
    setEditDescription("");
    setEditNotice("");
  }

  async function handleEditSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditNotice("");

    if (!editingActivityId) {
      return;
    }

    if (!editActivityDate) {
      setEditNotice("Choose the activity date.");
      return;
    }

    const numericAmount = Number(editAmount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setEditNotice("Enter an amount greater than zero.");
      return;
    }

    if (!editDescription.trim()) {
      setEditNotice("Add a short description.");
      return;
    }

    setEditSaving(true);

    const { error } = await supabase.rpc(
      "update_my_manual_financial_activity_v1",
      {
        p_activity_id: editingActivityId,
        p_activity_date: editActivityDate,
        p_activity_direction: editActivityDirection,
        p_amount: numericAmount,
        p_description: editDescription.trim(),
      },
    );

    if (error) {
      setEditNotice(error.message);
      setEditSaving(false);
      return;
    }

    await refresh();

    cancelEditingActivity();
    setNotice("Financial activity updated.");
    setEditSaving(false);
  }

  async function handleRemoveActivity(activityId: string) {
    const confirmed = window.confirm(
      "Remove this activity from your current Financial Activity? The record will remain in history.",
    );

    if (!confirmed) {
      return;
    }

    setNotice("");
    setRemovingActivityId(activityId);

    const { error } = await supabase.rpc(
      "archive_my_manual_financial_activity_v1",
      {
        p_activity_id: activityId,
      },
    );

    if (error) {
      setNotice(error.message);
      setRemovingActivityId(null);
      return;
    }

    await refresh();

    setNotice(
      "Financial activity removed from your current activity. The record remains preserved in history.",
    );
    setRemovingActivityId(null);
  }
  function startCreatingExplanation(stagedTransactionId: string) {
  setCreatingExplanationForTransactionId(stagedTransactionId);
  setEditingExplanationId(null);
  setEditExplanationCategory("other");
  setEditExplanationText("");
  setExplanationNotice("");
}

function cancelCreatingExplanation() {
  setCreatingExplanationForTransactionId(null);
  setEditExplanationCategory("other");
  setEditExplanationText("");
  setExplanationNotice("");
}

async function handleCreateExplanationDraft(
  event: FormEvent<HTMLFormElement>,
  activity: {
    activity_id: string;
    workspace_id: string;
    program_id: string;
    supported_person_id: string;
  },
) {
  event.preventDefault();

  if (!editExplanationText.trim()) {
    setExplanationNotice("Add a short explanation before saving.");
    return;
  }

  setExplanationSaving(true);
  setExplanationNotice("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    setExplanationNotice(userError.message);
    setExplanationSaving(false);
    return;
  }

  if (!user) {
    setExplanationNotice("You must be signed in to add context.");
    setExplanationSaving(false);
    return;
  }

  const existingResult = await supabase
    .from("participant_transaction_explanations")
    .select("id")
    .eq("workspace_id", activity.workspace_id)
    .eq("program_id", activity.program_id)
    .eq("supported_person_id", activity.supported_person_id)
    .eq("staged_transaction_id", activity.activity_id)
    .eq("submitted_by", user.id);

  if (existingResult.error) {
    setExplanationNotice(existingResult.error.message);
    setExplanationSaving(false);
    return;
  }

  if ((existingResult.data ?? []).length > 0) {
    setExplanationNotice(
      "Context already exists for this activity. Refresh the page before adding another.",
    );
    setExplanationSaving(false);
    return;
  }

  const { data, error } = await supabase
    .from("participant_transaction_explanations")
    .insert({
      workspace_id: activity.workspace_id,
      program_id: activity.program_id,
      supported_person_id: activity.supported_person_id,
      staged_transaction_id: activity.activity_id,
      explanation_category: editExplanationCategory,
      explanation_text: editExplanationText.trim(),
      status: "draft",
      submitted_by: user.id,
      submitted_at: null,
    })
    .select(
      "id, staged_transaction_id, explanation_category, explanation_text, status, submitted_at",
    )
    .single();

  if (error) {
    setExplanationNotice(error.message);
    setExplanationSaving(false);
    return;
  }

  setTransactionExplanations((current) => [
    ...current,
    data as TransactionExplanation,
  ]);

  setCreatingExplanationForTransactionId(null);
  setEditExplanationCategory("other");
  setEditExplanationText("");
  setExplanationSaving(false);
}

  function startEditingExplanation(explanation: TransactionExplanation) {
    if (explanation.status !== "draft") {
      return;
    }

    setEditingExplanationId(explanation.id);
    setEditExplanationCategory(explanation.explanation_category);
    setEditExplanationText(explanation.explanation_text ?? "");
    setExplanationNotice("");
  }

  function cancelEditingExplanation() {
    setEditingExplanationId(null);
    setEditExplanationCategory("other");
    setEditExplanationText("");
    setExplanationNotice("");
  }

  async function handleExplanationDraftSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingExplanationId) {
      return;
    }

    if (!editExplanationText.trim()) {
      setExplanationNotice("Add a short explanation before saving.");
      return;
    }

    setExplanationSaving(true);
    setExplanationNotice("");

    const { data, error } = await supabase
      .from("participant_transaction_explanations")
      .update({
        explanation_category: editExplanationCategory,
        explanation_text: editExplanationText.trim(),
      })
      .eq("id", editingExplanationId)
      .eq("status", "draft")
      .select(
        "id, staged_transaction_id, explanation_category, explanation_text, status, submitted_at",
      )
      .single();

    if (error) {
      setExplanationNotice(error.message);
      setExplanationSaving(false);
      return;
    }

    setTransactionExplanations((current) =>
      current.map((explanation) =>
        explanation.id === data.id
          ? (data as TransactionExplanation)
          : explanation,
      ),
    );

    cancelEditingExplanation();
    setExplanationSaving(false);
  }

  async function handleSubmitExplanation(explanationId: string) {
    const confirmed = window.confirm(
      "Submit this context? After submission, you will no longer be able to edit it from this participant screen.",
    );

    if (!confirmed) {
      return;
    }

    setExplanationSaving(true);
    setExplanationNotice("");

    const submittedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("participant_transaction_explanations")
      .update({
        status: "submitted",
        submitted_at: submittedAt,
      })
      .eq("id", explanationId)
      .eq("status", "draft")
      .select(
        "id, staged_transaction_id, explanation_category, explanation_text, status, submitted_at",
      )
      .single();

    if (error) {
      setExplanationNotice(error.message);
      setExplanationSaving(false);
      return;
    }

    setTransactionExplanations((current) =>
      current.map((explanation) =>
        explanation.id === data.id
          ? (data as TransactionExplanation)
          : explanation,
      ),
    );

    if (editingExplanationId === explanationId) {
      cancelEditingExplanation();
    }

    setExplanationSaving(false);
  }

  function startConnectingActivity(activity: {
  activity_id: string;
  signed_amount: number | string;
}) {
  setConnectingActivityId(activity.activity_id);
  setSelectedBudgetLineId("");
  setConnectionAmount(
    String(Math.abs(Number(activity.signed_amount ?? 0))),
  );
  setConnectionNotice("");
}

function cancelConnectingActivity() {
  setConnectingActivityId(null);
  setSelectedBudgetLineId("");
  setConnectionAmount("");
  setConnectionNotice("");
}

async function handleConnectActivity(
  event: FormEvent<HTMLFormElement>,
  activity: {
    activity_id: string;
    activity_record_type: "imported" | "manual";
  },
) {
  event.preventDefault();
  setConnectionNotice("");

  if (!selectedBudgetLineId) {
    setConnectionNotice("Choose a Budget category.");
    return;
  }

  const numericAmount = Number(connectionAmount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    setConnectionNotice("Enter an amount greater than zero.");
    return;
  }

  setConnectionSaving(true);

  const { error } = await supabase.rpc(
    "allocate_my_financial_activity_v1",
    {
      p_activity_record_type: activity.activity_record_type,
      p_activity_id: activity.activity_id,
      p_budget_line_id: selectedBudgetLineId,
      p_allocated_amount: numericAmount,
    },
  );

  if (error) {
    setConnectionNotice(error.message);
    setConnectionSaving(false);
    return;
  }

  await refresh();

  setConnectingActivityId(null);
  setSelectedBudgetLineId("");
  setConnectionAmount("");
  setConnectionNotice("Connected to your Budget.");
  setConnectionSaving(false);
}

const activeBudgetPeriod =
  budgetPeriods.find(
    (period) => period.status === "active",
  ) ?? null;

const activeBudgetLines = activeBudgetPeriod
  ? budgetLines.filter(
      (line) =>
        line.budget_period_id === activeBudgetPeriod.id &&
        line.is_active,
    )
  : [];

function startEditingAllocation(allocation: {
  allocation_id: string;
  allocated_amount: number | string;
}) {
  setEditingAllocationId(allocation.allocation_id);
  setEditAllocationAmount(String(allocation.allocated_amount));
  setAllocationNotice("");
}

function cancelEditingAllocation() {
  setEditingAllocationId(null);
  setEditAllocationAmount("");
  setAllocationNotice("");
}

async function handleAllocationSave(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();
  setAllocationNotice("");

  if (!editingAllocationId) {
    return;
  }

  const numericAmount = Number(editAllocationAmount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    setAllocationNotice("Enter an amount greater than zero.");
    return;
  }

  setAllocationSaving(true);

  const { error } = await supabase.rpc(
    "update_my_financial_activity_allocation_v1",
    {
      p_allocation_id: editingAllocationId,
      p_allocated_amount: numericAmount,
    },
  );

  if (error) {
    setAllocationNotice(error.message);
    setAllocationSaving(false);
    return;
  }

  await refresh();

  cancelEditingAllocation();
  setAllocationSaving(false);
}

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Financial Activity
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                See what has happened with your money.
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Financial Activity brings your available money records into one
                place while keeping their source visible. Activity you add
                yourself remains separate from imported account evidence.
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Financial Activity.
              </section>
            ) : null}

            {errorMessage ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">
                  Financial Activity could not be loaded.
                </p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage ? (
              <>
                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Add activity
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        Add something that happened outside an imported record.
                      </h2>

                      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                        Use this when you want to record cash activity or
                        another financial event that is not already available
                        from an imported account record.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
  {!showManualForm && !showUploadForm ? (
    <>
      <button
        type="button"
        onClick={() => {
          setNotice("");
          setShowManualForm(true);
        }}
        className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
      >
        Add activity manually
      </button>

      <button
        type="button"
        onClick={() => {
          setUploadNotice("");
          setShowUploadForm(true);
        }}
        className="rounded-2xl border border-emerald-300 bg-white px-5 py-3 font-black text-emerald-900 hover:bg-emerald-50"
      >
        Upload activity
      </button>
    </>
  ) : null}
</div>
</div>
</div>
  {showUploadForm ? (
  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
    <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
      Upload activity
    </p>

    <h3 className="mt-2 text-xl font-black">
      Add activity from a CSV
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-600">
      Choose a CSV with Date, Description, and Amount columns.
      You can review everything before it is added.
    </p>

    <div className="mt-4">
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          void handleUploadFile(
            event.target.files?.[0] ?? null,
          );
        }}
        className="block w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm"
      />
    </div>

    {uploadRows.length > 0 ? (
      <div className="mt-5">
        <div>
  <div className="flex flex-wrap items-center justify-between gap-3">
    <p className="font-black">Preview</p>

    <p className="text-sm font-semibold text-slate-600">
      {uploadRows.length}{" "}
      {uploadRows.length === 1 ? "record" : "records"} found
    </p>
  </div>

  <div className="mt-4 grid gap-3 sm:grid-cols-3">
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Dates
      </p>
      <p className="mt-1 font-black">
        {formatDate(uploadDateStart)} – {formatDate(uploadDateEnd)}
      </p>
    </div>

    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Money in
      </p>
      <p className="mt-1 font-black">
        {formatMoney(uploadMoneyIn)}
      </p>
    </div>

    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Money out
      </p>
      <p className="mt-1 font-black">
        {formatMoney(uploadMoneyOut)}
      </p>
    </div>
  </div>
</div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {uploadRows.map((row) => (
            <div
              key={row.row_number}
              className="grid gap-2 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[140px_1fr_auto]"
            >
              <p className="text-sm text-slate-600">
                {formatDate(row.activity_date)}
              </p>

              <p className="font-bold">
                {row.description}
              </p>

              <p className="font-black">
                {formatMoney(row.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    ) : null}

    {uploadNotice ? (
      <p className="mt-4 text-sm font-semibold text-slate-700">
        {uploadNotice}
      </p>
    ) : null}

    <div className="mt-5 flex flex-wrap gap-3">
  {uploadRows.length > 0 ? (
    <button
      type="button"
      onClick={() => {
        void handleUploadConfirm();
      }}
      disabled={uploadSaving}
      className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-60"
    >
      {uploadSaving
        ? "Importing..."
        : `Import ${uploadRows.length} ${
            uploadRows.length === 1 ? "record" : "records"
          }`}
    </button>
  ) : null}

  <button
    type="button"
    onClick={() => {
      setShowUploadForm(false);
      setUploadFileName("");
      setUploadFileHash("");
      setUploadRows([]);
      setUploadNotice("");
    }}
    disabled={uploadSaving}
    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 disabled:opacity-60"
  >
    Cancel
  </button>
</div>
  </div>
) : null}
                  {showManualForm ? (
                    <form
                      onSubmit={handleManualSave}
                      className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-black">
                          Date
                          <input
                            type="date"
                            value={activityDate}
                            onChange={(event) => {
                              setActivityDate(event.target.value);
                              setNotice("");
                            }}
                            disabled={saving}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                          />
                        </label>

                        <label className="block text-sm font-black">
                          What happened?
                          <select
                            value={activityDirection}
                            onChange={(event) => {
                              setActivityDirection(
                                event.target.value as "outflow" | "inflow",
                              );
                              setNotice("");
                            }}
                            disabled={saving}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                          >
                            <option value="outflow">Money spent</option>
                            <option value="inflow">Money received</option>
                          </select>
                        </label>

                        <label className="block text-sm font-black">
                          Amount
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(event) => {
                              setAmount(event.target.value);
                              setNotice("");
                            }}
                            disabled={saving}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                          />
                        </label>

                        <label className="block text-sm font-black">
                          Description
                          <input
                            type="text"
                            value={description}
                            onChange={(event) => {
                              setDescription(event.target.value);
                              setNotice("");
                            }}
                            disabled={saving}
                            placeholder="Groceries, gas, cash income..."
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                          />
                        </label>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save activity"}
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            setShowManualForm(false);
                            setNotice("");
                          }}
                          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {notice ? (
                    <p
                      role="status"
                      aria-live="polite"
                      className="mt-4 text-sm font-semibold text-slate-700"
                    >
                      {notice}
                    </p>
                  ) : null}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Recent activity
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Your Financial Activity
                  </h2>

                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    Imported evidence and activity you add yourself appear
                    together here, while their source remains visible.
                  </p>
                  {explanationsLoading ? (
                    <p className="mt-4 text-sm text-slate-500">
                      Loading your saved activity context.
                    </p>
                  ) : null}

                  {explanationsError ? (
                    <p className="mt-4 text-sm font-semibold text-rose-700">
                      Saved activity context could not be loaded.
                    </p>
                  ) : null}
                  <div className="mt-6 space-y-3">
                    {financialActivity.map((activity) => {
                      const matchingExplanation =
                        activity.activity_record_type === "imported"
                          ? transactionExplanations.find(
                              (explanation) =>
                                explanation.staged_transaction_id ===
                                activity.activity_id,
                            )
                          : undefined;
                        const matchingAllocations =
  financialActivityAllocations.filter(
    (allocation) =>
      allocation.activity_record_type === activity.activity_record_type &&
      allocation.activity_id === activity.activity_id &&
      allocation.status === "active",
  );

const connectedAmount = matchingAllocations.reduce(
  (sum, allocation) =>
    sum + Number(allocation.allocated_amount ?? 0),
  0,
);

async function handleArchiveAllocation(allocationId: string) {
  const confirmed = window.confirm(
    "Remove this Budget connection? The Financial Activity itself will remain unchanged.",
  );

  if (!confirmed) {
    return;
  }

  setAllocationSaving(true);
  setAllocationNotice("");

  const { error } = await supabase.rpc(
    "archive_my_financial_activity_allocation_v1",
    {
      p_allocation_id: allocationId,
    },
  );

  if (error) {
    setAllocationNotice(error.message);
    setAllocationSaving(false);
    return;
  }

  await refresh();

  setAllocationSaving(false);
}

                      return (
                        <article
                          key={`${activity.activity_record_type}:${activity.activity_id}`}
                          className="rounded-2xl border border-slate-100 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="font-black">
                                {activity.description}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {formatDate(activity.activity_date)}
                                {" · "}
                                {activity.source_name}
                              </p>
                            </div>

                            <p className="text-xl font-black">
                              {formatMoney(activity.signed_amount)}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                              {activity.activity_direction === "outflow"
                                ? "Money spent"
                                : activity.activity_direction === "inflow"
                                  ? "Money received"
                                  : "Financial activity"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                              activity.provenance_type === "participant_manual" ||
                              activity.provenance_type === "participant_csv_upload"
                                ? "bg-emerald-100 text-emerald-900"
                              : "bg-blue-100 text-blue-900"
                              }`}
                                  >
                              {activity.provenance_type === "participant_manual"
                              ? "Added by you"
                              : activity.provenance_type === "participant_csv_upload"
                              ? "Uploaded by you"
                              : "Bank import"}
                            </span>

                            {activity.lifecycle ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">
                                {activity.lifecycle.replaceAll("_", " ")}
                              </span>
                            ) : null}
                            {activity.activity_direction === "outflow" ? (
  <div className="mt-4 w-full rounded-2xl border border-amber-100 bg-amber-50 p-4">
    <p className="text-xs font-black uppercase tracking-wide text-amber-800">
      Budget connection
    </p>

    {matchingAllocations.length > 0 ? (
      <div className="mt-3 space-y-2">
        {matchingAllocations.map((allocation) => (
          <div
  key={allocation.allocation_id}
  className="rounded-xl bg-white px-4 py-3"
>
  {editingAllocationId === allocation.allocation_id ? (
    <form
      onSubmit={handleAllocationSave}
      className="space-y-3"
    >
      <p className="font-black text-slate-900">
        {allocation.budget_category_name}
      </p>

      <label className="block text-sm font-black text-slate-900">
        Connected amount
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={editAllocationAmount}
          onChange={(event) => {
            setEditAllocationAmount(event.target.value);
            setAllocationNotice("");
          }}
          disabled={allocationSaving}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={allocationSaving}
          className="rounded-2xl bg-amber-700 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
        >
          {allocationSaving ? "Saving..." : "Save amount"}
        </button>

        <button
          type="button"
          onClick={cancelEditingAllocation}
          disabled={allocationSaving}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      {allocationNotice ? (
        <p className="text-sm font-semibold text-slate-700">
          {allocationNotice}
        </p>
      ) : null}
    </form>
  ) : (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-black text-slate-900">
          {allocation.budget_category_name}
        </p>

        <button
          type="button"
          onClick={() => startEditingAllocation(allocation)}
          className="mt-2 text-sm font-black text-amber-800 hover:text-amber-950"
        >
          Edit amount
        </button>
        <button
  type="button"
  onClick={() =>
    void handleArchiveAllocation(allocation.allocation_id)
  }
  disabled={allocationSaving}
  className="ml-3 mt-2 text-sm font-black text-slate-600 hover:text-slate-900 disabled:opacity-60"
>
  Remove connection
</button>
      </div>

      <span className="font-black text-slate-900">
        {formatMoney(allocation.allocated_amount)}
      </span>
    </div>
  )}
</div>
        ))}

        <p className="text-sm font-semibold text-slate-700">
          Connected total: {formatMoney(connectedAmount)}
        </p>
      </div>
    ) : connectingActivityId === activity.activity_id ? (
  <form
    onSubmit={(event) =>
      void handleConnectActivity(event, activity)
    }
    className="mt-3 space-y-4"
  >
    <p className="text-sm leading-6 text-slate-700">
      Choose where this spending fits in your current Budget.
    </p>

    <label className="block text-sm font-black text-slate-900">
      Budget category
      <select
        value={selectedBudgetLineId}
        onChange={(event) => {
          setSelectedBudgetLineId(event.target.value);
          setConnectionNotice("");
        }}
        disabled={connectionSaving}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
      >
        <option value="">Choose a category</option>

        {activeBudgetLines.map((line) => (
          <option key={line.id} value={line.id}>
            {line.category_name}
          </option>
        ))}
      </select>
    </label>

    <label className="block text-sm font-black text-slate-900">
      Amount to connect
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={connectionAmount}
        onChange={(event) => {
          setConnectionAmount(event.target.value);
          setConnectionNotice("");
        }}
        disabled={connectionSaving}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
      />
    </label>

    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        disabled={
          connectionSaving ||
          !activeBudgetPeriod ||
          activeBudgetLines.length === 0
        }
        className="rounded-2xl bg-amber-700 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
      >
        {connectionSaving
          ? "Connecting..."
          : "Connect to Budget"}
      </button>

      <button
        type="button"
        onClick={cancelConnectingActivity}
        disabled={connectionSaving}
        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-60"
      >
        Cancel
      </button>
    </div>

    {connectionNotice ? (
      <p className="text-sm font-semibold text-slate-700">
        {connectionNotice}
      </p>
    ) : null}
  </form>
) : (
  <div className="mt-2">
    <p className="text-sm leading-6 text-slate-700">
      This activity is not connected to your Budget yet.
    </p>

    {activeBudgetPeriod && activeBudgetLines.length > 0 ? (
      <button
        type="button"
        onClick={() => startConnectingActivity(activity)}
        className="mt-3 rounded-2xl border border-amber-300 bg-white px-4 py-2 text-sm font-black text-amber-900 hover:bg-amber-100"
      >
        Connect to Budget
      </button>
    ) : (
      <p className="mt-3 text-sm font-semibold text-slate-600">
        An active Budget with an active category is needed before this activity can be connected.
      </p>
    )}
  </div>
)}
  </div>
) : null}
                            {activity.activity_record_type === "imported" ? (
  matchingExplanation ? (
                              <div className="mt-4 w-full rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                <p className="text-xs font-black uppercase tracking-wide text-blue-800">
                                  {matchingExplanation.status === "draft"
                                    ? "Your draft context"
                                    : "Your context"}
                                </p>

                                {matchingExplanation.status === "draft" &&
                                editingExplanationId ===
                                  matchingExplanation.id ? (
                                  <form
                                    onSubmit={handleExplanationDraftSave}
                                    className="mt-4 space-y-4"
                                  >
                                    <label className="block text-sm font-black">
                                      What best describes this?
                                      <select
                                        value={editExplanationCategory}
                                        onChange={(event) => {
                                          setEditExplanationCategory(
                                            event.target.value,
                                          );
                                          setExplanationNotice("");
                                        }}
                                        disabled={explanationSaving}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      >
                                        <option value="recognized_purchase">
                                          Recognized purchase
                                        </option>
                                        <option value="bill_or_essential">
                                          Bill or essential
                                        </option>
                                        <option value="transfer">
                                          Transfer
                                        </option>
                                        <option value="refund_or_reversal">
                                          Refund or reversal
                                        </option>
                                        <option value="shared_expense">
                                          Shared expense
                                        </option>
                                        <option value="medical_expense">
                                          Medical expense
                                        </option>
                                        <option value="cash_withdrawal_context">
                                          Cash withdrawal context
                                        </option>
                                        <option value="incorrect_or_unrecognized">
                                          Incorrect or unrecognized
                                        </option>
                                        <option value="other">Other</option>
                                      </select>
                                    </label>

                                    <label className="block text-sm font-black">
                                      Your note
                                      <textarea
                                        value={editExplanationText}
                                        onChange={(event) => {
                                          setEditExplanationText(
                                            event.target.value,
                                          );
                                          setExplanationNotice("");
                                        }}
                                        disabled={explanationSaving}
                                        rows={4}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      />
                                    </label>

                                    <div className="flex flex-wrap gap-3">
                                      <button
                                        type="submit"
                                        disabled={explanationSaving}
                                        className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                                      >
                                        {explanationSaving
                                          ? "Saving..."
                                          : "Save draft"}
                                      </button>

                                      <button
                                        type="button"
                                        disabled={explanationSaving}
                                        onClick={cancelEditingExplanation}
                                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-60"
                                      >
                                        Cancel
                                      </button>
                                    </div>

                                    {explanationNotice ? (
                                      <p className="text-sm font-semibold text-slate-700">
                                        {explanationNotice}
                                      </p>
                                    ) : null}
                                  </form>
                                ) : (
                                  <>
                                    <p className="mt-2 font-black capitalize text-slate-900">
                                      {matchingExplanation.explanation_category.replaceAll(
                                        "_",
                                        " ",
                                      )}
                                    </p>

                                    {matchingExplanation.explanation_text ? (
                                      <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {matchingExplanation.explanation_text}
                                      </p>
                                    ) : null}

                                    <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black capitalize text-slate-700">
                                      {matchingExplanation.status.replaceAll(
                                        "_",
                                        " ",
                                      )}
                                    </span>

                                    {matchingExplanation.status === "draft" ? (
                                      <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            startEditingExplanation(
                                              matchingExplanation,
                                            )
                                          }
                                          disabled={explanationSaving}
                                          className="rounded-2xl border border-blue-300 bg-white px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-50 disabled:opacity-60"
                                        >
                                          Edit context
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            void handleSubmitExplanation(
                                              matchingExplanation.id,
                                            )
                                          }
                                          disabled={explanationSaving}
                                          className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                                        >
                                          {explanationSaving
                                            ? "Submitting..."
                                            : "Submit context"}
                                        </button>
                                      </div>
                                    ) : null}
                                  </>
                                )}
                                                           </div>
                            ) : (
                              <div className="mt-4 w-full rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                {creatingExplanationForTransactionId ===
                                activity.activity_id ? (
                                  <form
                                    onSubmit={(event) =>
                                      void handleCreateExplanationDraft(
                                        event,
                                        activity,
                                      )
                                    }
                                    className="space-y-4"
                                  >
                                    <p className="text-xs font-black uppercase tracking-wide text-blue-800">
                                      Add your context
                                    </p>

                                    <p className="text-sm leading-6 text-slate-700">
                                      Add your own note about this activity.
                                      This does not change the imported account
                                      record.
                                    </p>

                                    <label className="block text-sm font-black">
                                      What best describes this?
                                      <select
                                        value={editExplanationCategory}
                                        onChange={(event) => {
                                          setEditExplanationCategory(
                                            event.target.value,
                                          );
                                          setExplanationNotice("");
                                        }}
                                        disabled={explanationSaving}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      >
                                        <option value="recognized_purchase">
                                          Recognized purchase
                                        </option>
                                        <option value="bill_or_essential">
                                          Bill or essential
                                        </option>
                                        <option value="transfer">
                                          Transfer
                                        </option>
                                        <option value="refund_or_reversal">
                                          Refund or reversal
                                        </option>
                                        <option value="shared_expense">
                                          Shared expense
                                        </option>
                                        <option value="medical_expense">
                                          Medical expense
                                        </option>
                                        <option value="cash_withdrawal_context">
                                          Cash withdrawal context
                                        </option>
                                        <option value="incorrect_or_unrecognized">
                                          Incorrect or unrecognized
                                        </option>
                                        <option value="other">Other</option>
                                      </select>
                                    </label>

                                    <label className="block text-sm font-black">
                                      Your note
                                      <textarea
                                        value={editExplanationText}
                                        onChange={(event) => {
                                          setEditExplanationText(
                                            event.target.value,
                                          );
                                          setExplanationNotice("");
                                        }}
                                        disabled={explanationSaving}
                                        rows={4}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      />
                                    </label>

                                    <div className="flex flex-wrap gap-3">
                                      <button
                                        type="submit"
                                        disabled={explanationSaving}
                                        className="rounded-2xl bg-blue-700 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                                      >
                                        {explanationSaving
                                          ? "Saving..."
                                          : "Save draft"}
                                      </button>

                                      <button
                                        type="button"
                                        disabled={explanationSaving}
                                        onClick={cancelCreatingExplanation}
                                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-60"
                                      >
                                        Cancel
                                      </button>
                                    </div>

                                    {explanationNotice ? (
                                      <p className="text-sm font-semibold text-slate-700">
                                        {explanationNotice}
                                      </p>
                                    ) : null}
                                  </form>
                                ) : (
                                  <>
                                    <p className="text-xs font-black uppercase tracking-wide text-blue-800">
                                      Your context
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                      You have not added context to this
                                      imported activity yet.
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        startCreatingExplanation(
                                          activity.activity_id,
                                        )
                                      }
                                      disabled={explanationSaving}
                                      className="mt-4 rounded-2xl border border-blue-300 bg-white px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-50 disabled:opacity-60"
                                    >
                                      Add context
                                    </button>
                                  </>
                                )}
                              </div>
                            )
                          ) : null}

                            {activity.provenance_type ===
                            "participant_manual" ? (
                              editingActivityId === activity.activity_id ? (
                                <form
                                  onSubmit={handleEditSave}
                                  className="mt-4 w-full rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
                                >
                                  <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                                    Correct this activity
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Update something you entered incorrectly.
                                    This does not change imported account
                                    evidence.
                                  </p>

                                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <label className="block text-sm font-black">
                                      Date
                                      <input
                                        type="date"
                                        value={editActivityDate}
                                        onChange={(event) => {
                                          setEditActivityDate(
                                            event.target.value,
                                          );
                                          setEditNotice("");
                                        }}
                                        disabled={editSaving}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      />
                                    </label>

                                    <label className="block text-sm font-black">
                                      What happened?
                                      <select
                                        value={editActivityDirection}
                                        onChange={(event) => {
                                          setEditActivityDirection(
                                            event.target.value as
                                              | "outflow"
                                              | "inflow",
                                          );
                                          setEditNotice("");
                                        }}
                                        disabled={editSaving}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      >
                                        <option value="outflow">
                                          Money spent
                                        </option>
                                        <option value="inflow">
                                          Money received
                                        </option>
                                      </select>
                                    </label>

                                    <label className="block text-sm font-black">
                                      Amount
                                      <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={editAmount}
                                        onChange={(event) => {
                                          setEditAmount(event.target.value);
                                          setEditNotice("");
                                        }}
                                        disabled={editSaving}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      />
                                    </label>

                                    <label className="block text-sm font-black">
                                      Description
                                      <input
                                        type="text"
                                        value={editDescription}
                                        onChange={(event) => {
                                          setEditDescription(
                                            event.target.value,
                                          );
                                          setEditNotice("");
                                        }}
                                        disabled={editSaving}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal disabled:opacity-60"
                                      />
                                    </label>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                      type="submit"
                                      disabled={editSaving}
                                      className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                                    >
                                      {editSaving
                                        ? "Saving..."
                                        : "Save correction"}
                                    </button>

                                    <button
                                      type="button"
                                      disabled={editSaving}
                                      onClick={cancelEditingActivity}
                                      className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-60"
                                    >
                                      Cancel
                                    </button>
                                  </div>

                                  {editNotice ? (
                                    <p
                                      role="alert"
                                      className="mt-3 text-sm font-semibold text-slate-700"
                                    >
                                      {editNotice}
                                    </p>
                                  ) : null}
                                </form>
                              ) : (
                                <div className="mt-4 flex w-full flex-wrap gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditingActivity(activity)
                                    }
                                    disabled={
                                      removingActivityId ===
                                      activity.activity_id
                                    }
                                    className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleRemoveActivity(
                                        activity.activity_id,
                                      )
                                    }
                                    disabled={
                                      removingActivityId ===
                                      activity.activity_id
                                    }
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                  >
                                    {removingActivityId === activity.activity_id
                                      ? "Removing..."
                                      : "Remove activity"}
                                  </button>
                                </div>
                              )
                            ) : null}
                          </div>
                        </article>
                      );
                    })}

                    {financialActivity.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                        No Financial Activity is available yet. You can add
                        something manually when you are ready.
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-3xl bg-slate-950 p-6 text-white">
                  <p className="font-black text-emerald-300">
                    About Financial Activity
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Imported account evidence and participant-entered activity
                    remain separate sources. Financial Activity does not assign
                    intent, responsibility, relapse, incapacity, misuse, or any
                    legal, clinical, or fiduciary conclusion.
                  </p>
                </section>
              </>
            ) : null}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
