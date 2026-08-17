"use client";

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TRANSACTION_EXPLANATION_TEST_EXECUTION_ENABLED = false as const;

const TEST_SCOPE = {
  participantLabel: "Participant D",
  email: "dstein561+thrive-onboarding-person-d@gmail.com",
  authUserId: "d48b7268-9aa6-4498-a923-2851fd5232c9",
  supportedPersonId: "71000000-0000-4000-8000-000000000009",
  workspaceId: "71000000-0000-4000-8000-000000000001",
  programId: "71000000-0000-4000-8000-000000000002",
  stagedTransactionId: "72000000-0000-4000-8000-000000000003",
} as const;

const INITIAL_EXPLANATION = {
  explanationCategory: "recognized_purchase",
  explanationText:
    "Synthetic test only. I recognize this grocery purchase.",
} as const;

const EDITED_EXPLANATION = {
  explanationCategory: "bill_or_essential",
  explanationText:
    "Synthetic test only. I recognize this as a grocery expense.",
} as const;

type ResultState = {
  action: string;
  ok: boolean;
  data?: unknown;
  error?: string;
};

type TransactionBaseline = {
  id: string;
  financial_source_id: string;
  posted_date: string;
  transaction_date: string | null;
  merchant_name: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  amount: number | string;
  transaction_lifecycle: string;
  parse_status: string;
};

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function TransactionExplanationTestPage() {
  const [explanationId, setExplanationId] = useState("");
  const [transactionBaseline, setTransactionBaseline] =
    useState<TransactionBaseline | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [busy, setBusy] = useState(false);

  const disabled =
    busy || !TRANSACTION_EXPLANATION_TEST_EXECUTION_ENABLED;

  const executionLabel =
    TRANSACTION_EXPLANATION_TEST_EXECUTION_ENABLED
      ? "Execution enabled"
      : "Review-only lock active";

  const verifiedPreconditions = [
    "Browser-authenticated synthetic participant path only.",
    "Execution remains disabled until separately approved.",
    "No service-role client.",
    "No Johnny activation.",
    "No Trust Engine synchronization.",
    "No hard delete behavior.",
    "Only one participant-owned draft explanation may be tested.",
    "The underlying staged financial transaction must remain unchanged.",
  ];

  const participantFacts = [
    {
      label: "Participant",
      value: TEST_SCOPE.participantLabel,
    },
    {
      label: "Email",
      value: TEST_SCOPE.email,
    },
    {
      label: "Auth user ID",
      value: TEST_SCOPE.authUserId,
    },
    {
      label: "Supported-person ID",
      value: TEST_SCOPE.supportedPersonId,
    },
    {
      label: "Workspace ID",
      value: TEST_SCOPE.workspaceId,
    },
    {
      label: "Program ID",
      value: TEST_SCOPE.programId,
    },
    {
      label: "Owned staged transaction ID",
      value: TEST_SCOPE.stagedTransactionId,
    },
  ];

  const ownedTransactionFacts = [
    {
      label: "Posted date",
      value: "2099-02-05",
    },
    {
      label: "Merchant",
      value: "TEST GROCER",
    },
    {
      label: "Category",
      value: "Food",
    },
    {
      label: "Subcategory",
      value: "Groceries",
    },
    {
      label: "Amount",
      value: "-$25.00",
    },
    {
      label: "Lifecycle",
      value: "posted",
    },
    {
      label: "Parse status",
      value: "parsed",
    },
    {
      label: "Ownership",
      value: "primary / active",
    },
  ];

  const approvedDraftValues = [
    {
      label: "Explanation category",
      value: INITIAL_EXPLANATION.explanationCategory,
    },
    {
      label: "Explanation text",
      value: INITIAL_EXPLANATION.explanationText,
    },
    {
      label: "Initial status",
      value: "draft",
    },
    {
      label: "Submitted at",
      value: "must remain null while status is draft",
    },
  ];

  const futureActions = [
    "Verify the authenticated browser identity is Participant D.",
    "Read the participant-owned staged transaction and capture its exact baseline.",
    "Create one synthetic draft explanation for that transaction.",
    "Read back only that participant-owned draft explanation.",
    "Edit only the draft explanation category and text.",
    "Re-read the explanation to confirm the edit persisted.",
    "Submit the participant-owned draft explanation.",
    "Confirm the explanation reaches submitted status with submitted_at populated.",
    "Re-read the staged transaction and prove its baseline did not change.",
  ];

  const stopConditions = [
    "The authenticated browser user is not Participant D.",
    "The staged transaction is not returned through the participant financial read function.",
    "The transaction does not match the approved synthetic baseline.",
    "A draft explanation already exists for this controlled proof and its state is not understood.",
    "Any result requires schema or RLS changes.",
    "Any result requires service-role or privileged bypass.",
    "Any action modifies the staged financial transaction.",
    "Any action broadens scope outside the participant-owned draft path.",
    "Any live behavior differs materially from the approved documentation candidate.",
  ];

  const runAction = useCallback(
    async (action: string, operation: () => Promise<unknown>) => {
      if (!TRANSACTION_EXPLANATION_TEST_EXECUTION_ENABLED) {
        setResult({
          action,
          ok: false,
          error:
            "Review-only lock active. Separate approval is required before synthetic execution.",
        });
        return;
      }

      setBusy(true);
      setResult(null);

      try {
        const data = await operation();
        setResult({
          action,
          ok: true,
          data,
        });
      } catch (error) {
        setResult({
          action,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  async function requireParticipantD() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
      throw new Error("No authenticated browser user.");
    }

    if (user.id !== TEST_SCOPE.authUserId) {
      throw new Error(
        `Execution stopped. Expected Participant D auth user ${TEST_SCOPE.authUserId}, but browser user is ${user.id}.`,
      );
    }

    if (user.email !== TEST_SCOPE.email) {
      throw new Error(
        `Execution stopped. Expected Participant D email ${TEST_SCOPE.email}, but browser email is ${user.email ?? "null"}.`,
      );
    }

    return {
      id: user.id,
      email: user.email ?? null,
      authenticated: true,
    };
  }

  async function loadAuthenticatedIdentity() {
    return requireParticipantD();
  }

  async function readOwnedTransaction(): Promise<TransactionBaseline> {
    await requireParticipantD();

    const { data, error } = await supabase.rpc(
      "get_my_financial_transactions_v1",
    );

    if (error) throw error;

    const rows = (data ?? []) as TransactionBaseline[];

    const transaction = rows.find(
      (row) => row.id === TEST_SCOPE.stagedTransactionId,
    );

    if (!transaction) {
      throw new Error(
        "Execution stopped. The approved staged transaction was not visible through Participant D's authenticated financial read path.",
      );
    }

    if (
      transaction.posted_date !== "2099-02-05" ||
      transaction.merchant_name !== "TEST GROCER" ||
      transaction.category_name !== "Food" ||
      transaction.subcategory_name !== "Groceries" ||
      Number(transaction.amount) !== -25 ||
      transaction.transaction_lifecycle !== "posted" ||
      transaction.parse_status !== "parsed"
    ) {
      throw new Error(
        "Execution stopped. The staged transaction no longer matches the approved synthetic baseline.",
      );
    }

    setTransactionBaseline(transaction);

    return transaction;
  }

  async function createDraftExplanation() {
    const user = await requireParticipantD();

    const baseline =
      transactionBaseline ?? (await readOwnedTransaction());

    const existingResult = await supabase
      .from("participant_transaction_explanations")
      .select(
        "id, workspace_id, program_id, supported_person_id, staged_transaction_id, explanation_category, explanation_text, status, submitted_by, submitted_at, archived_at, created_at, updated_at",
      )
      .eq("workspace_id", TEST_SCOPE.workspaceId)
      .eq("program_id", TEST_SCOPE.programId)
      .eq("supported_person_id", TEST_SCOPE.supportedPersonId)
      .eq("staged_transaction_id", TEST_SCOPE.stagedTransactionId)
      .eq("submitted_by", user.id);

    if (existingResult.error) {
      throw existingResult.error;
    }

    if ((existingResult.data ?? []).length > 0) {
      throw new Error(
        "Execution stopped. A participant-authored explanation already exists for this synthetic transaction. Reconcile that record before creating another.",
      );
    }

    const payload = {
      workspace_id: TEST_SCOPE.workspaceId,
      program_id: TEST_SCOPE.programId,
      supported_person_id: TEST_SCOPE.supportedPersonId,
      staged_transaction_id: TEST_SCOPE.stagedTransactionId,
      explanation_category:
        INITIAL_EXPLANATION.explanationCategory,
      explanation_text: INITIAL_EXPLANATION.explanationText,
      status: "draft",
      submitted_by: user.id,
      submitted_at: null,
    };

    const { data, error } = await supabase
      .from("participant_transaction_explanations")
      .insert(payload)
      .select(
        "id, workspace_id, program_id, supported_person_id, staged_transaction_id, explanation_category, explanation_text, status, submitted_by, submitted_at, archived_at, created_at, updated_at",
      )
      .single();

    if (error) throw error;

    if (data.status !== "draft" || data.submitted_at !== null) {
      throw new Error(
        "Execution stopped. The returned explanation did not preserve the approved draft state.",
      );
    }

    setExplanationId(data.id);

    return {
      transactionBaseline: baseline,
      payload,
      returned: data,
    };
  }

  async function readDraftExplanation() {
    const user = await requireParticipantD();

    const query = supabase
      .from("participant_transaction_explanations")
      .select(
        "id, workspace_id, program_id, supported_person_id, staged_transaction_id, explanation_category, explanation_text, status, submitted_by, submitted_at, archived_at, created_at, updated_at",
      )
      .eq("workspace_id", TEST_SCOPE.workspaceId)
      .eq("program_id", TEST_SCOPE.programId)
      .eq("supported_person_id", TEST_SCOPE.supportedPersonId)
      .eq("staged_transaction_id", TEST_SCOPE.stagedTransactionId)
      .eq("submitted_by", user.id);

    const { data, error } = explanationId
      ? await query.eq("id", explanationId).single()
      : await query.single();

    if (error) throw error;

    if (data.status !== "draft") {
      throw new Error(
        `Execution stopped. Expected draft explanation status, but received ${data.status}.`,
      );
    }

    if (data.submitted_at !== null) {
      throw new Error(
        "Execution stopped. submitted_at must remain null while the explanation is draft.",
      );
    }

    setExplanationId(data.id);

    return data;
  }

  async function editDraftExplanation() {
    const user = await requireParticipantD();

    const current = await readDraftExplanation();

    if (current.submitted_by !== user.id) {
      throw new Error(
        "Execution stopped. The explanation is not owned by the authenticated Participant D user.",
      );
    }

    if (current.status !== "draft") {
      throw new Error(
        "Execution stopped. Only the participant-owned draft state is approved for this edit proof.",
      );
    }

    const payload = {
      explanation_category:
        EDITED_EXPLANATION.explanationCategory,
      explanation_text: EDITED_EXPLANATION.explanationText,
    };

    const { data, error } = await supabase
      .from("participant_transaction_explanations")
      .update(payload)
      .eq("id", current.id)
      .eq("status", "draft")
      .eq("submitted_by", user.id)
      .select(
        "id, workspace_id, program_id, supported_person_id, staged_transaction_id, explanation_category, explanation_text, status, submitted_by, submitted_at, archived_at, created_at, updated_at",
      )
      .single();

    if (error) throw error;

    if (data.status !== "draft" || data.submitted_at !== null) {
      throw new Error(
        "Execution stopped. Draft lifecycle fields changed unexpectedly.",
      );
    }

    return {
      expectedStartingId: current.id,
      payload,
      returned: data,
    };
  }

  async function submitDraftExplanation() {
  const user = await requireParticipantD();

  const current = await readDraftExplanation();

  if (current.submitted_by !== user.id) {
    throw new Error(
      "Execution stopped. The explanation is not owned by the authenticated Participant D user.",
    );
  }

  if (current.status !== "draft") {
    throw new Error(
      "Execution stopped. Only the participant-owned draft may be submitted.",
    );
  }

  const submittedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("participant_transaction_explanations")
    .update({
      status: "submitted",
      submitted_at: submittedAt,
    })
    .eq("id", current.id)
    .eq("status", "draft")
    .eq("submitted_by", user.id)
    .select(
      "id, workspace_id, program_id, supported_person_id, staged_transaction_id, explanation_category, explanation_text, status, submitted_by, submitted_at, archived_at, created_at, updated_at",
    )
    .single();

  if (error) throw error;

  if (data.status !== "submitted" || data.submitted_at === null) {
    throw new Error(
      "Execution stopped. The explanation did not reach the submitted state correctly.",
    );
  }

  setExplanationId(data.id);

  return {
    previousStatus: current.status,
    submittedAt,
    returned: data,
  };
}

  async function verifyTransactionUnchanged() {
    await requireParticipantD();

    if (!transactionBaseline) {
      throw new Error(
        "No captured transaction baseline exists. Run 'Read transaction baseline' before verifying immutability.",
      );
    }

    const previous = transactionBaseline;

    const { data, error } = await supabase.rpc(
      "get_my_financial_transactions_v1",
    );

    if (error) throw error;

    const rows = (data ?? []) as TransactionBaseline[];

    const current = rows.find(
      (row) => row.id === TEST_SCOPE.stagedTransactionId,
    );

    if (!current) {
      throw new Error(
        "The controlled staged transaction is no longer visible.",
      );
    }

    const fields: Array<keyof TransactionBaseline> = [
      "id",
      "financial_source_id",
      "posted_date",
      "transaction_date",
      "merchant_name",
      "category_name",
      "subcategory_name",
      "amount",
      "transaction_lifecycle",
      "parse_status",
    ];

    const differences = fields.filter((field) => {
      if (field === "amount") {
        return Number(previous[field]) !== Number(current[field]);
      }

      return previous[field] !== current[field];
    });

    if (differences.length > 0) {
      throw new Error(
        `Transaction immutability proof failed. Changed fields: ${differences.join(", ")}.`,
      );
    }

    return {
      unchanged: true,
      comparedFields: fields,
      baseline: previous,
      current,
    };
  }

  return (
    <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
            THRIVE transaction explanation test
          </h1>

          <p className="mt-4 max-w-4xl leading-7 text-slate-600">
            Browser-authenticated synthetic proof path for one
            participant-owned transaction explanation. The underlying bank
            observation remains separate and must not be modified.
          </p>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black uppercase tracking-wide text-amber-800">
              Execution status
            </p>

            <p className="mt-2 text-lg font-black text-amber-950">
              {executionLabel}
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Execution requires a separate approved gate. Installing this
              page does not authorize the synthetic write test.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            Verified preconditions
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {verifiedPreconditions.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-semibold text-slate-800">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Synthetic participant
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Verified participant scope
            </h2>

            <div className="mt-5 space-y-3">
              {participantFacts.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-2 break-all font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Owned transaction
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Verified staged transaction baseline
            </h2>

            <div className="mt-5 space-y-3">
              {ownedTransactionFacts.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-2 break-all font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Approved draft target
          </p>

          <h2 className="mt-2 text-2xl font-black">
            First draft explanation values
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            These values remain participant-authored context. They do not
            change the transaction, assign intent, or establish a financial,
            clinical, fiduciary, or behavioral conclusion.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {approvedDraftValues.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
            Guarded browser-authenticated controls
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Draft explanation proof path
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-slate-600">
            Each action runs separately. There is no run-all behavior. The
            page must remain locked until execution receives a separate
            approval.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction(
                  "load authenticated identity",
                  loadAuthenticatedIdentity,
                )
              }
              className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Load Participant D identity
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction(
                  "read transaction baseline",
                  readOwnedTransaction,
                )
              }
              className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Read transaction baseline
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction(
                  "create draft explanation",
                  createDraftExplanation,
                )
              }
              className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create draft explanation
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction(
                  "read draft explanation",
                  readDraftExplanation,
                )
              }
              className="rounded-xl bg-sky-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Read draft explanation
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction(
                  "edit draft explanation",
                  editDraftExplanation,
                )
              }
              className="rounded-xl bg-violet-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Edit draft explanation
            </button>

            <button
  type="button"
  disabled={disabled}
  onClick={() =>
    runAction(
      "submit draft explanation",
      submitDraftExplanation,
    )
  }
  className="rounded-xl bg-emerald-800 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
>
  Submit draft explanation
</button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                runAction(
                  "verify transaction unchanged",
                  verifyTransactionUnchanged,
                )
              }
              className="rounded-xl bg-amber-700 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Verify transaction unchanged
            </button>
          </div>

          {explanationId && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Controlled explanation ID
              </p>
              <p className="mt-2 break-all font-semibold">
                {explanationId}
              </p>
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-sky-700">
              Approved proof sequence
            </p>

            <h2 className="mt-2 text-2xl font-black">
              One action at a time
            </h2>

            <ol className="mt-5 space-y-3">
              {futureActions.map((item, index) => (
                <li
                  key={item}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {index + 1}. {item}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-rose-700">
              Failure boundaries
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Stop conditions
            </h2>

            <ul className="mt-5 space-y-3">
              {stopConditions.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-rose-100 bg-rose-50 p-4"
                >
                  <p className="font-semibold text-rose-950">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Single-action result
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Latest controlled result
          </h2>

          <div className="mt-5">
            <JsonBlock
              value={
                result ?? {
                  status: "No controlled action has run.",
                  executionEnabled:
                    TRANSACTION_EXPLANATION_TEST_EXECUTION_ENABLED,
                }
              }
            />
          </div>
        </section>

        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-300">
            Current build boundary
          </p>

          <p className="mt-3 text-lg font-bold">
            Controls are installed, but execution remains locked.
          </p>

         <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-200">
          This page contains the narrow browser-authenticated candidate path
          for create, read, draft edit, submission, re-read, and transaction
          immutability verification. Resolution, archival, administrative
          action, service-role access, Trust Engine action, Johnny activation,
          and hard delete remain outside this test boundary.
        </p>
        </section>
      </section>
    </main>
  );
}