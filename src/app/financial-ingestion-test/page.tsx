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

type FinancialSource = {
  id: string;
  workspace_id: string;
  program_id: string;
  source_name: string;
  institution_name: string | null;
  source_type: string;
  account_mask: string | null;
  source_mode: string;
  status: string;
  created_at: string;
};

type ImportBatch = {
  id: string;
  workspace_id: string;
  program_id: string;
  financial_source_id: string;
  statement_period_start: string;
  statement_period_end: string;
  source_filename: string;
  source_file_sha256: string;
  source_row_count: number;
  import_status: string;
  data_boundary: string;
  source_lifecycle: string;
  created_at: string;
};

type StagedTransaction = {
  id: string;
  import_batch_id: string;
  source_row_number: number;
  source_row_identity: string;
  source_content_fingerprint: string;
  raw_posted_date: string;
  raw_transaction_date: string;
  raw_transaction_type: string;
  raw_full_description: string;
  raw_amount: string;
  posted_date: string | null;
  transaction_date: string | null;
  transaction_type: string | null;
  amount: number | string | null;
  parse_status: string;
  created_at: string;
};

type TransactionReview = {
  id: string;
  staged_transaction_id: string;
  review_status: string;
  duplicate_classification: string;
  trust_match_status: string;
  review_notes: string | null;
  created_at: string;
};

const syntheticHash =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function formatMoney(value: number | string | null) {
  if (value === null) {
    return "Not parsed";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function FinancialIngestionTestPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");

  const [sources, setSources] = useState<FinancialSource[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [transactions, setTransactions] = useState<StagedTransaction[]>([]);
  const [reviews, setReviews] = useState<TransactionReview[]>([]);

  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState("");

  const [statusMessage, setStatusMessage] = useState("Loading session...");
  const [isBusy, setIsBusy] = useState(false);

  const selectedWorkspace = useMemo(
    () =>
      workspaces.find(
        (workspace) => workspace.id === selectedWorkspaceId,
      ),
    [workspaces, selectedWorkspaceId],
  );

  const selectedProgram = useMemo(
    () =>
      programs.find((program) => program.id === selectedProgramId),
    [programs, selectedProgramId],
  );

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
          : "No active session. Sign in before testing financial ingestion.",
      );
    };

    void loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setWorkspaces([]);
      setPrograms([]);
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
        setSelectedWorkspaceId((currentId) => {
          const stillExists = nextWorkspaces.some(
            (workspace) => workspace.id === currentId,
          );

          return stillExists ? currentId : nextWorkspaces[0].id;
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
      setSelectedProgramId("");
      return;
    }

    const loadPrograms = async () => {
      setIsBusy(true);
      setStatusMessage("Loading active programs through RLS...");

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
        setSelectedProgramId((currentId) => {
          const stillExists = nextPrograms.some(
            (program) => program.id === currentId,
          );

          return stillExists ? currentId : nextPrograms[0].id;
        });
      } else {
        setSelectedProgramId("");
      }

      setStatusMessage("Active programs loaded through RLS.");
      setIsBusy(false);
    };

    void loadPrograms();
  }, [session, selectedWorkspaceId]);

  async function loadFinancialData() {
    if (!selectedWorkspaceId || !selectedProgramId) {
      setStatusMessage("Select a workspace and program first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Loading synthetic financial-ingestion records...");

    const [
      sourceResult,
      batchResult,
      transactionResult,
      reviewResult,
    ] = await Promise.all([
      supabase
        .from("financial_sources")
        .select(
          "id, workspace_id, program_id, source_name, institution_name, source_type, account_mask, source_mode, status, created_at",
        )
        .eq("workspace_id", selectedWorkspaceId)
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: true }),

      supabase
        .from("financial_import_batches")
        .select(
          "id, workspace_id, program_id, financial_source_id, statement_period_start, statement_period_end, source_filename, source_file_sha256, source_row_count, import_status, data_boundary, source_lifecycle, created_at",
        )
        .eq("workspace_id", selectedWorkspaceId)
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: true }),

      supabase
        .from("staged_financial_transactions")
        .select(
          "id, import_batch_id, source_row_number, source_row_identity, source_content_fingerprint, raw_posted_date, raw_transaction_date, raw_transaction_type, raw_full_description, raw_amount, posted_date, transaction_date, transaction_type, amount, parse_status, created_at",
        )
        .eq("workspace_id", selectedWorkspaceId)
        .eq("program_id", selectedProgramId)
        .order("source_row_number", { ascending: true }),

      supabase
        .from("financial_transaction_reviews")
        .select(
          "id, staged_transaction_id, review_status, duplicate_classification, trust_match_status, review_notes, created_at",
        )
        .eq("workspace_id", selectedWorkspaceId)
        .eq("program_id", selectedProgramId)
        .order("created_at", { ascending: true }),
    ]);

    const firstError =
      sourceResult.error ??
      batchResult.error ??
      transactionResult.error ??
      reviewResult.error;

    if (firstError) {
      setStatusMessage(`Financial data load error: ${firstError.message}`);
      setIsBusy(false);
      return;
    }

    const nextSources = sourceResult.data ?? [];
    const nextBatches = batchResult.data ?? [];
    const nextTransactions = transactionResult.data ?? [];
    const nextReviews = reviewResult.data ?? [];

    setSources(nextSources);
    setBatches(nextBatches);
    setTransactions(nextTransactions);
    setReviews(nextReviews);

    setSelectedSourceId((currentId) => {
      const stillExists = nextSources.some(
        (source) => source.id === currentId,
      );

      return stillExists ? currentId : nextSources[0]?.id ?? "";
    });

    setSelectedBatchId((currentId) => {
      const stillExists = nextBatches.some(
        (batch) => batch.id === currentId,
      );

      return stillExists ? currentId : nextBatches[0]?.id ?? "";
    });

    setSelectedTransactionId((currentId) => {
      const stillExists = nextTransactions.some(
        (transaction) => transaction.id === currentId,
      );

      return stillExists
        ? currentId
        : nextTransactions[0]?.id ?? "";
    });

    setStatusMessage(
      "Synthetic financial-ingestion records loaded through authenticated RLS.",
    );
    setIsBusy(false);
  }

  useEffect(() => {
    if (!session || !selectedWorkspaceId || !selectedProgramId) {
      setSources([]);
      setBatches([]);
      setTransactions([]);
      setReviews([]);
      setSelectedSourceId("");
      setSelectedBatchId("");
      setSelectedTransactionId("");
      return;
    }

    void loadFinancialData();
  }, [session, selectedWorkspaceId, selectedProgramId]);

  async function createSyntheticSource() {
    if (!session?.user || !selectedWorkspaceId || !selectedProgramId) {
      setStatusMessage("Select a workspace and program first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Creating synthetic financial source...");

    const { data, error } = await supabase
      .from("financial_sources")
      .insert({
        workspace_id: selectedWorkspaceId,
        program_id: selectedProgramId,
        source_name: "Synthetic Monthly Test Source",
        institution_name: "Synthetic Test Institution",
        source_type: "bank_account",
        account_mask: "TEST",
        source_mode: "historical",
        status: "active",
        created_by: session.user.id,
      })
      .select("id")
      .single();

    if (error) {
      setStatusMessage(`Create source error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setSelectedSourceId(data.id);
    setStatusMessage(`Synthetic source created: ${data.id}`);
    setIsBusy(false);
    await loadFinancialData();
  }

  async function createSyntheticBatch() {
    if (
      !session?.user ||
      !selectedWorkspaceId ||
      !selectedProgramId ||
      !selectedSourceId
    ) {
      setStatusMessage("Create or select a synthetic source first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Creating synthetic import batch...");

    const { data, error } = await supabase
      .from("financial_import_batches")
      .insert({
        workspace_id: selectedWorkspaceId,
        program_id: selectedProgramId,
        financial_source_id: selectedSourceId,
        statement_period_start: "2099-01-01",
        statement_period_end: "2099-01-31",
        source_filename: "synthetic_test_2099_01.csv",
        source_file_sha256: syntheticHash,
        source_row_count: 2,
        import_status: "uploaded",
        data_boundary: "historical",
        source_lifecycle: "posted",
        uploaded_by: session.user.id,
      })
      .select("id")
      .single();

    if (error) {
      setStatusMessage(`Create batch error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setSelectedBatchId(data.id);
    setStatusMessage(`Synthetic batch created: ${data.id}`);
    setIsBusy(false);
    await loadFinancialData();
  }

  async function createSyntheticTransactions() {
    if (
      !session?.user ||
      !selectedWorkspaceId ||
      !selectedProgramId ||
      !selectedSourceId ||
      !selectedBatchId
    ) {
      setStatusMessage("Create or select a synthetic batch first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Creating two content-identical synthetic rows...");

    const syntheticRows = [2, 3].map((rowNumber) => ({
      workspace_id: selectedWorkspaceId,
      program_id: selectedProgramId,
      financial_source_id: selectedSourceId,
      import_batch_id: selectedBatchId,
      source_row_number: rowNumber,
      source_row_identity: `${syntheticHash}:${rowNumber}`,
      source_content_fingerprint:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      raw_posted_date: "01/02/2099",
      raw_transaction_date: "01/01/2099",
      raw_transaction_type: "POS",
      raw_check_serial: null,
      raw_full_description: "SYNTHETIC TEST PURCHASE",
      raw_merchant_name: "Synthetic Merchant",
      raw_category_name: "Synthetic Category",
      raw_subcategory_name: "Synthetic Subcategory",
      raw_amount: "($12.34)",
      raw_daily_posted_balance: "$987.66",
      transaction_lifecycle: "posted",
      parse_status: "unparsed",
      created_by: session.user.id,
    }));

    const { error } = await supabase
      .from("staged_financial_transactions")
      .insert(syntheticRows);

    if (error) {
      setStatusMessage(`Create staged rows error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      "Two content-identical synthetic rows were retained separately.",
    );
    setIsBusy(false);
    await loadFinancialData();
  }

  async function parseSelectedTransaction() {
    if (!selectedTransactionId) {
      setStatusMessage("Select a staged transaction first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Applying normalized synthetic values...");

    const { error } = await supabase
      .from("staged_financial_transactions")
      .update({
        posted_date: "2099-01-02",
        transaction_date: "2099-01-01",
        transaction_type: "POS",
        check_serial: null,
        merchant_name: "Synthetic Merchant",
        category_name: "Synthetic Category",
        subcategory_name: "Synthetic Subcategory",
        amount: -12.34,
        daily_posted_balance: 987.66,
        parse_status: "parsed",
        parse_error: null,
      })
      .eq("id", selectedTransactionId);

    if (error) {
      setStatusMessage(`Parse update error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setStatusMessage("Selected staged row parsed successfully.");
    setIsBusy(false);
    await loadFinancialData();
  }

  async function createSyntheticReview() {
    if (!session?.user || !selectedTransactionId) {
      setStatusMessage("Select a staged transaction first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Creating synthetic review...");

    const { error } = await supabase
      .from("financial_transaction_reviews")
      .insert({
        workspace_id: selectedWorkspaceId,
        program_id: selectedProgramId,
        staged_transaction_id: selectedTransactionId,
        review_status: "routine_repeated_activity",
        duplicate_classification: "content_identical",
        trust_match_status: "not_applicable",
        review_notes:
          "Synthetic review confirming that content similarity alone does not establish duplication.",
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
        created_by: session.user.id,
      });

    if (error) {
      setStatusMessage(`Create review error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setStatusMessage("Synthetic review created successfully.");
    setIsBusy(false);
    await loadFinancialData();
  }

  async function testRawMutationDenial() {
    if (!selectedTransactionId) {
      setStatusMessage("Select a staged transaction first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Testing raw source immutability...");

    const { error } = await supabase
      .from("staged_financial_transactions")
      .update({
        raw_amount: "($99.99)",
      })
      .eq("id", selectedTransactionId);

    if (!error) {
      setStatusMessage(
        "TEST FAILED: raw source mutation unexpectedly succeeded.",
      );
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      `PASS: raw source mutation blocked. ${error.message}`,
    );
    setIsBusy(false);
  }

  async function moveBatchUnderReview() {
    if (!session?.user || !selectedBatchId) {
      setStatusMessage("Select a synthetic batch first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Moving synthetic batch into review...");

    const reviewedAt = new Date().toISOString();

    const { error } = await supabase
      .from("financial_import_batches")
      .update({
        import_status: "under_review",
        reviewed_by: session.user.id,
        reviewed_at: reviewedAt,
        approved_by: null,
        approved_at: null,
        rejection_reason: null,
      })
      .eq("id", selectedBatchId);

    if (error) {
      setStatusMessage(`Move to review error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setStatusMessage("PASS: synthetic batch moved to under_review.");
    setIsBusy(false);
    await loadFinancialData();
  }

  async function approveSelectedBatch() {
    if (!session?.user || !selectedBatchId) {
      setStatusMessage("Select a synthetic batch first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Approving synthetic batch...");

    const timestamp = new Date().toISOString();

    const { error } = await supabase
      .from("financial_import_batches")
      .update({
        import_status: "approved",
        reviewed_by: session.user.id,
        reviewed_at: timestamp,
        approved_by: session.user.id,
        approved_at: timestamp,
        rejection_reason: null,
      })
      .eq("id", selectedBatchId);

    if (error) {
      setStatusMessage(`Approve batch error: ${error.message}`);
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      "PASS: synthetic batch approved and closed successfully.",
    );
    setIsBusy(false);
    await loadFinancialData();
  }

  async function testApprovedBatchReopenDenial() {
    if (!selectedBatchId) {
      setStatusMessage("Select an approved synthetic batch first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Testing approved-batch reopening denial...");

    const { error } = await supabase
      .from("financial_import_batches")
      .update({
        import_status: "under_review",
      })
      .eq("id", selectedBatchId);

    if (!error) {
      setStatusMessage(
        "TEST FAILED: approved batch was unexpectedly reopened.",
      );
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      `PASS: approved batch reopening blocked. ${error.message}`,
    );
    setIsBusy(false);
  }

  async function testApprovedTransactionUpdateDenial() {
    if (!selectedTransactionId) {
      setStatusMessage("Select a staged transaction first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Testing staged update after approval...");

    const { error } = await supabase
      .from("staged_financial_transactions")
      .update({
        merchant_name: "Changed Synthetic Merchant",
      })
      .eq("id", selectedTransactionId);

    if (!error) {
      setStatusMessage(
        "TEST FAILED: staged transaction changed after approval.",
      );
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      `PASS: staged update after approval blocked. ${error.message}`,
    );
    setIsBusy(false);
  }

  async function testApprovedReviewUpdateDenial() {
    const selectedReview = reviews.find(
      (review) =>
        review.staged_transaction_id === selectedTransactionId,
    );

    if (!selectedReview) {
      setStatusMessage(
        "Select the transaction that already has the synthetic review.",
      );
      return;
    }

    setIsBusy(true);
    setStatusMessage("Testing review update after approval...");

    const { error } = await supabase
      .from("financial_transaction_reviews")
      .update({
        review_notes: "Attempted post-approval change.",
      })
      .eq("id", selectedReview.id);

    if (!error) {
      setStatusMessage(
        "TEST FAILED: review changed after batch approval.",
      );
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      `PASS: review update after approval blocked. ${error.message}`,
    );
    setIsBusy(false);
  }

  async function testApprovedTransactionInsertDenial() {
    if (
      !session?.user ||
      !selectedWorkspaceId ||
      !selectedProgramId ||
      !selectedSourceId ||
      !selectedBatchId
    ) {
      setStatusMessage("Select the approved synthetic batch first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Testing staged insert after approval...");

    const { error } = await supabase
      .from("staged_financial_transactions")
      .insert({
        workspace_id: selectedWorkspaceId,
        program_id: selectedProgramId,
        financial_source_id: selectedSourceId,
        import_batch_id: selectedBatchId,
        source_row_number: 4,
        source_row_identity: `${syntheticHash}:4`,
        source_content_fingerprint:
          "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        raw_posted_date: "01/03/2099",
        raw_transaction_date: "01/03/2099",
        raw_transaction_type: "POS",
        raw_check_serial: null,
        raw_full_description: "SYNTHETIC POST-APPROVAL INSERT",
        raw_merchant_name: "Synthetic Merchant",
        raw_category_name: "Synthetic Category",
        raw_subcategory_name: "Synthetic Subcategory",
        raw_amount: "($1.00)",
        raw_daily_posted_balance: "$986.66",
        transaction_lifecycle: "posted",
        parse_status: "unparsed",
        created_by: session.user.id,
      });

    if (!error) {
      setStatusMessage(
        "TEST FAILED: staged row inserted after approval.",
      );
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      `PASS: staged insert after approval blocked. ${error.message}`,
    );
    setIsBusy(false);
  }

  async function testApprovedReviewInsertDenial() {
    if (!session?.user || !selectedTransactionId) {
      setStatusMessage("Select a staged transaction first.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Testing review insert after approval...");

    const { error } = await supabase
      .from("financial_transaction_reviews")
      .insert({
        workspace_id: selectedWorkspaceId,
        program_id: selectedProgramId,
        staged_transaction_id: selectedTransactionId,
        review_status: "routine_repeated_activity",
        duplicate_classification: "content_identical",
        trust_match_status: "not_applicable",
        review_notes:
          "Attempted synthetic review insertion after approval.",
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
        created_by: session.user.id,
      });

    if (!error) {
      setStatusMessage(
        "TEST FAILED: review inserted after approval.",
      );
      setIsBusy(false);
      return;
    }

    setStatusMessage(
      `PASS: review insert after approval blocked. ${error.message}`,
    );
    setIsBusy(false);
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-4xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <p className="text-sm font-black uppercase tracking-wide text-amber-700">
            Synthetic financial-ingestion test
          </p>
          <h1 className="mt-2 text-4xl font-black">Sign-in required</h1>
          <p className="mt-4 text-sm text-amber-900">{statusMessage}</p>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white"
          >
            Go to login
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-4xl font-black">
            THRIVE Financial Ingestion Test
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
            Synthetic-only validation of financial source, batch, staged-row,
            review, RLS, parsing, and immutability controls.
          </p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="font-black text-red-900">Synthetic data only</p>
          <p className="mt-2 text-sm leading-6 text-red-800">
            Do not upload or enter the real January 2025 CSV, real merchants,
            account information, beneficiary information, trust conclusions,
            or private financial records on this page.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="font-black text-emerald-950">
            Authenticated application path
          </p>
          <p className="mt-2 break-all text-sm text-emerald-900">
            {session.user.email ?? "Authenticated user"} / {session.user.id}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Scope selection</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold">
              Workspace
              <select
                value={selectedWorkspaceId}
                onChange={(event) =>
                  setSelectedWorkspaceId(event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name ?? workspace.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold">
              Active program
              <select
                value={selectedProgramId}
                onChange={(event) =>
                  setSelectedProgramId(event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.program_name ?? program.id}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Selected: {selectedWorkspace?.name ?? "none"} /{" "}
            {selectedProgram?.program_name ?? "none"}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Synthetic test sequence</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createSyntheticSource}
              disabled={isBusy || !selectedProgramId}
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              1. Create source
            </button>

            <button
              type="button"
              onClick={createSyntheticBatch}
              disabled={isBusy || !selectedSourceId}
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              2. Create batch
            </button>

            <button
              type="button"
              onClick={createSyntheticTransactions}
              disabled={isBusy || !selectedBatchId}
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              3. Create two rows
            </button>

            <button
              type="button"
              onClick={parseSelectedTransaction}
              disabled={isBusy || !selectedTransactionId}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              4. Parse selected row
            </button>

            <button
              type="button"
              onClick={createSyntheticReview}
              disabled={isBusy || !selectedTransactionId}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              5. Create review
            </button>

            <button
              type="button"
              onClick={testRawMutationDenial}
              disabled={isBusy || !selectedTransactionId}
              className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-50"
            >
              6. Test raw mutation denial
            </button>

            <button
              type="button"
              onClick={loadFinancialData}
              disabled={isBusy || !selectedProgramId}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black"
            >
              Reload
            </button>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="text-sm font-black uppercase tracking-wide text-slate-700">
              Batch closure gate
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={moveBatchUnderReview}
                disabled={isBusy || !selectedBatchId}
                className="rounded-2xl bg-amber-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
              >
                7. Move under review
              </button>

              <button
                type="button"
                onClick={approveSelectedBatch}
                disabled={isBusy || !selectedBatchId}
                className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
              >
                8. Approve batch
              </button>

              <button
                type="button"
                onClick={testApprovedBatchReopenDenial}
                disabled={isBusy || !selectedBatchId}
                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-50"
              >
                9. Test reopening denial
              </button>

              <button
                type="button"
                onClick={testApprovedTransactionUpdateDenial}
                disabled={isBusy || !selectedTransactionId}
                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-50"
              >
                10. Test staged update denial
              </button>

              <button
                type="button"
                onClick={testApprovedReviewUpdateDenial}
                disabled={isBusy || reviews.length === 0}
                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-50"
              >
                11. Test review update denial
              </button>

              <button
                type="button"
                onClick={testApprovedTransactionInsertDenial}
                disabled={isBusy || !selectedBatchId}
                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-50"
              >
                12. Test staged insert denial
              </button>

              <button
                type="button"
                onClick={testApprovedReviewInsertDenial}
                disabled={isBusy || !selectedTransactionId}
                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-50"
              >
                13. Test review insert denial
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold">
            {isBusy ? "Working... " : ""}
            {statusMessage}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">
              Sources ({sources.length})
            </h2>

            <select
              value={selectedSourceId}
              onChange={(event) => setSelectedSourceId(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">No source selected</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.source_name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">
              Batches ({batches.length})
            </h2>

            <select
              value={selectedBatchId}
              onChange={(event) => setSelectedBatchId(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">No batch selected</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.source_filename} / {batch.import_status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            Staged transactions ({transactions.length})
          </h2>

          <div className="mt-5 space-y-3">
            {transactions.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No synthetic staged rows created.
              </p>
            ) : (
              transactions.map((transaction) => (
                <button
                  key={transaction.id}
                  type="button"
                  onClick={() =>
                    setSelectedTransactionId(transaction.id)
                  }
                  className={`block w-full rounded-2xl border p-4 text-left ${
                    selectedTransactionId === transaction.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200"
                  }`}
                >
                  <p className="font-black">
                    Source row {transaction.source_row_number}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {transaction.source_row_identity}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {transaction.raw_full_description} /{" "}
                    {transaction.raw_amount}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    Parse status: {transaction.parse_status} / Normalized:{" "}
                    {formatMoney(transaction.amount)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            Reviews ({reviews.length})
          </h2>

          <div className="mt-5 space-y-3">
            {reviews.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No synthetic reviews created.
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="font-black">{review.review_status}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {review.duplicate_classification} /{" "}
                    {review.trust_match_status}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {review.review_notes ?? "No review note"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
