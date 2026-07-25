"use server";

import "server-only";

import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const WORKSPACE_ID = "d1cb9168-b0cd-42d0-8745-024c3e421c11";
const PROGRAM_ID = "f67f14a2-6666-44d6-99d4-dbb2678a2863";

const EXPECTED_SOURCE_SHA256 =
  "9c993baf1e7558de40215ac7802c23c1fbee04f7ca80e5405366c1043a6b951a";

const EXPECTED_ROW_COUNT = 85;
const EXPECTED_FIRST_IDENTITY = `${EXPECTED_SOURCE_SHA256}:2`;
const EXPECTED_LAST_IDENTITY = `${EXPECTED_SOURCE_SHA256}:86`;

const REQUIRED_CONFIRMATION =
  "IMPORT JANUARY 2025 TO THRIVE TRUST STEWARDSHIP";

const PRIVATE_PREVIEW_PATH =
  "private_artifacts/financial_ingestion/january_2025/" +
  "january_2025_staging_preview.json";

type ImportResult = {
  ok: boolean;
  status:
    | "disabled"
    | "validation_failed"
    | "already_imported"
    | "authorization_failed"
    | "import_failed"
    | "ready_for_review";
  message: string;
  sourceId?: string;
  batchId?: string;
  insertedRows?: number;
};

type PreviewRecord = {
  source_row_number: number;
  source_row_identity: string;
  source_content_fingerprint: string;

  raw_posted_date: string;
  raw_transaction_date: string;
  raw_transaction_type: string;
  raw_check_serial: string | null;
  raw_full_description: string;
  raw_merchant_name: string | null;
  raw_category_name: string;
  raw_subcategory_name: string;
  raw_amount: string;
  raw_daily_posted_balance: string;

  posted_date: string | null;
  transaction_date: string | null;
  transaction_type: string | null;
  check_serial: string | null;
  merchant_name: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  amount: string | null;
  daily_posted_balance: string | null;

  transaction_lifecycle: string;
  parse_status: string;
  parse_error: string | null;
};

type PreviewPayload = {
  classification: string;
  database_writes: number;
  metadata: {
    source_filename: string;
    source_file_sha256: string;
    statement_period_start: string;
    statement_period_end: string;
    source_row_count: number;
    accepted_count: number;
    rejected_count: number;
    readiness_status: string;
  };
  records: PreviewRecord[];
};

function loadAndValidatePreview(): PreviewPayload {
  const absolutePath = path.join(process.cwd(), PRIVATE_PREVIEW_PATH);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      "The private January staging preview was not found on the server.",
    );
  }

  const payload = JSON.parse(
    fs.readFileSync(absolutePath, "utf8"),
  ) as PreviewPayload;

  if (payload.classification !== "PRIVATE FINANCIAL SOURCE PREVIEW") {
    throw new Error("Unexpected preview classification.");
  }

  if (payload.database_writes !== 0) {
    throw new Error("Dry-run preview reports unexpected database writes.");
  }

  if (payload.metadata.readiness_status !== "PASS") {
    throw new Error("January dry-run readiness status is not PASS.");
  }

  if (
    payload.metadata.source_file_sha256 !== EXPECTED_SOURCE_SHA256
  ) {
    throw new Error("January source SHA-256 does not match reconciliation.");
  }

  if (
    payload.metadata.source_row_count !== EXPECTED_ROW_COUNT ||
    payload.metadata.accepted_count !== EXPECTED_ROW_COUNT ||
    payload.metadata.rejected_count !== 0 ||
    payload.records.length !== EXPECTED_ROW_COUNT
  ) {
    throw new Error("January source-row counts do not match expectations.");
  }

  const firstIdentity = payload.records[0]?.source_row_identity;
  const lastIdentity =
    payload.records[payload.records.length - 1]?.source_row_identity;

  if (
    firstIdentity !== EXPECTED_FIRST_IDENTITY ||
    lastIdentity !== EXPECTED_LAST_IDENTITY
  ) {
    throw new Error("January source-row identity boundaries are invalid.");
  }

  const identities = new Set(
    payload.records.map((record) => record.source_row_identity),
  );

  if (identities.size !== EXPECTED_ROW_COUNT) {
    throw new Error("January source-row identities are not unique.");
  }

  for (const record of payload.records) {
    const expectedIdentity =
      `${EXPECTED_SOURCE_SHA256}:${record.source_row_number}`;

    if (record.source_row_identity !== expectedIdentity) {
      throw new Error(
        `Source identity mismatch at row ${record.source_row_number}.`,
      );
    }

    if (record.parse_status !== "parsed") {
      throw new Error(
        `Source row ${record.source_row_number} is not fully parsed.`,
      );
    }
  }

  return payload;
}

function createAuthenticatedServerClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Required Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function importJanuary2025Candidate(input: {
  accessToken: string;
  confirmation: string;
}): Promise<ImportResult> {
  if (process.env.THRIVE_ENABLE_JANUARY_2025_IMPORT !== "true") {
    return {
      ok: false,
      status: "disabled",
      message:
        "The January 2025 import gate is disabled. No database writes occurred.",
    };
  }

  if (input.confirmation.trim() !== REQUIRED_CONFIRMATION) {
    return {
      ok: false,
      status: "validation_failed",
      message:
        "The typed confirmation phrase does not match. No database writes occurred.",
    };
  }

  let preview: PreviewPayload;

  try {
    preview = loadAndValidatePreview();
  } catch (error) {
    return {
      ok: false,
      status: "validation_failed",
      message:
        error instanceof Error
          ? error.message
          : "The private preview failed validation.",
    };
  }

  const supabase = createAuthenticatedServerClient(input.accessToken);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(input.accessToken);

  if (userError || !user) {
    return {
      ok: false,
      status: "authorization_failed",
      message: "The authenticated user could not be verified.",
    };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name, workspace_type, status")
    .eq("id", WORKSPACE_ID)
    .eq("name", "THRIVE Trust Stewardship")
    .eq("workspace_type", "trust_support")
    .eq("status", "active")
    .single();

  if (workspaceError || !workspace) {
    return {
      ok: false,
      status: "authorization_failed",
      message:
        "The locked THRIVE Trust Stewardship workspace could not be verified.",
    };
  }

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("id, workspace_id, program_name, program_type, status")
    .eq("id", PROGRAM_ID)
    .eq("workspace_id", WORKSPACE_ID)
    .eq("program_name", "Johnny Stability and Trust Support")
    .eq("program_type", "trust_stewardship")
    .eq("status", "active")
    .single();

  if (programError || !program) {
    return {
      ok: false,
      status: "authorization_failed",
      message:
        "The locked Johnny Stability and Trust Support program could not be verified.",
    };
  }

  const { data: existingBatch, error: existingBatchError } =
    await supabase
      .from("financial_import_batches")
      .select("id, import_status, source_file_sha256")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("program_id", PROGRAM_ID)
      .eq("source_file_sha256", EXPECTED_SOURCE_SHA256)
      .maybeSingle();

  if (existingBatchError) {
    return {
      ok: false,
      status: "import_failed",
      message:
        `Existing-batch verification failed: ${existingBatchError.message}`,
    };
  }

  if (existingBatch) {
    return {
      ok: false,
      status: "already_imported",
      message:
        `The reconciled January file already has a batch with status ` +
        `${existingBatch.import_status}. No additional records were created.`,
      batchId: existingBatch.id,
    };
  }

  const { data: existingSource, error: sourceLookupError } =
    await supabase
      .from("financial_sources")
      .select("id")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("program_id", PROGRAM_ID)
      .eq("source_type", "bank_account")
      .eq("account_mask", "2847")
      .maybeSingle();

  if (sourceLookupError) {
    return {
      ok: false,
      status: "import_failed",
      message:
        `Financial-source verification failed: ${sourceLookupError.message}`,
    };
  }

  let sourceId = existingSource?.id;

  if (!sourceId) {
    const { data: createdSource, error: sourceCreateError } =
      await supabase
        .from("financial_sources")
        .insert({
          workspace_id: WORKSPACE_ID,
          program_id: PROGRAM_ID,
          source_name: "Truist Account Ending 2847",
          institution_name: "Truist",
          source_type: "bank_account",
          account_mask: "2847",
          source_mode: "historical",
          status: "active",
          created_by: user.id,
        })
        .select("id")
        .single();

    if (sourceCreateError || !createdSource) {
      return {
        ok: false,
        status: "import_failed",
        message:
          `Financial-source creation failed: ` +
          `${sourceCreateError?.message ?? "No source returned."}`,
      };
    }

    sourceId = createdSource.id;
  }

  const { data: createdBatch, error: batchCreateError } =
    await supabase
      .from("financial_import_batches")
      .insert({
        workspace_id: WORKSPACE_ID,
        program_id: PROGRAM_ID,
        financial_source_id: sourceId,
        statement_period_start:
          preview.metadata.statement_period_start,
        statement_period_end: preview.metadata.statement_period_end,
        source_filename: preview.metadata.source_filename,
        source_file_sha256: EXPECTED_SOURCE_SHA256,
        source_row_count: EXPECTED_ROW_COUNT,
        import_status: "uploaded",
        data_boundary: "historical",
        source_lifecycle: "posted",
        uploaded_by: user.id,
      })
      .select("id")
      .single();

  if (batchCreateError || !createdBatch) {
    return {
      ok: false,
      status: "import_failed",
      message:
        `January batch creation failed: ` +
        `${batchCreateError?.message ?? "No batch returned."}`,
      sourceId,
    };
  }

  const batchId = createdBatch.id;

  const stagedRows = preview.records.map((record) => ({
    workspace_id: WORKSPACE_ID,
    program_id: PROGRAM_ID,
    financial_source_id: sourceId,
    import_batch_id: batchId,

    source_row_number: record.source_row_number,
    source_row_identity: record.source_row_identity,
    source_content_fingerprint:
      record.source_content_fingerprint,

    raw_posted_date: record.raw_posted_date,
    raw_transaction_date: record.raw_transaction_date,
    raw_transaction_type: record.raw_transaction_type,
    raw_check_serial: record.raw_check_serial,
    raw_full_description: record.raw_full_description,
    raw_merchant_name: record.raw_merchant_name,
    raw_category_name: record.raw_category_name,
    raw_subcategory_name: record.raw_subcategory_name,
    raw_amount: record.raw_amount,
    raw_daily_posted_balance:
      record.raw_daily_posted_balance,

    posted_date: record.posted_date,
    transaction_date: record.transaction_date,
    transaction_type: record.transaction_type,
    check_serial: record.check_serial,
    merchant_name: record.merchant_name,
    category_name: record.category_name,
    subcategory_name: record.subcategory_name,
    amount: record.amount,
    daily_posted_balance: record.daily_posted_balance,

    transaction_lifecycle: "posted",
    parse_status: "parsed",
    parse_error: null,
    created_by: user.id,
  }));

  const { error: stagedInsertError } = await supabase
    .from("staged_financial_transactions")
    .insert(stagedRows);

  if (stagedInsertError) {
    return {
      ok: false,
      status: "import_failed",
      message:
        `The January batch was created, but staged-row insertion failed: ` +
        `${stagedInsertError.message}. The batch remains open for controlled review.`,
      sourceId,
      batchId,
    };
  }

  const { count: insertedCount, error: countError } = await supabase
    .from("staged_financial_transactions")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("import_batch_id", batchId);

  if (
    countError ||
    insertedCount !== EXPECTED_ROW_COUNT
  ) {
    return {
      ok: false,
      status: "import_failed",
      message:
        `Post-import count verification failed. Expected 85 rows and observed ` +
        `${insertedCount ?? "an unknown count"}. The batch was not advanced.`,
      sourceId,
      batchId,
      insertedRows: insertedCount ?? undefined,
    };
  }

  const { error: readyError } = await supabase
    .from("financial_import_batches")
    .update({
      import_status: "ready_for_review",
    })
    .eq("id", batchId)
    .eq("import_status", "uploaded");

  if (readyError) {
    return {
      ok: false,
      status: "import_failed",
      message:
        `All 85 staged rows were inserted, but the batch could not be advanced ` +
        `to ready_for_review: ${readyError.message}`,
      sourceId,
      batchId,
      insertedRows: EXPECTED_ROW_COUNT,
    };
  }

  return {
    ok: true,
    status: "ready_for_review",
    message:
      "January 2025 was imported as observational source evidence. " +
      "The batch contains 85 staged rows and is ready for human review. " +
      "The batch was not approved, and no trust conclusions were created.",
    sourceId,
    batchId,
    insertedRows: EXPECTED_ROW_COUNT,
  };
}
