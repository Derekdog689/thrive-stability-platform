"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";

const BATCH_ID = "fe367f99-c52e-430a-84fe-1760682ab332";

type ImportBatch = {
  id: string;
  financial_source_id: string;
  statement_period_start: string;
  statement_period_end: string;
  source_filename: string;
  source_file_sha256: string;
  source_row_count: number;
  import_status: string;
  data_boundary: string;
  source_lifecycle: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
};

type FinancialSource = {
  id: string;
  source_name: string;
  institution_name: string | null;
  source_type: string;
  account_mask: string | null;
  source_mode: string;
  status: string;
};

type StagedTransaction = {
  id: string;
  source_row_number: number;
  source_row_identity: string;
  source_content_fingerprint: string;

  raw_posted_date: string;
  raw_transaction_date: string;
  raw_transaction_type: string;
  raw_full_description: string;
  raw_merchant_name: string | null;
  raw_category_name: string;
  raw_subcategory_name: string;
  raw_amount: string;
  raw_daily_posted_balance: string;

  posted_date: string | null;
  transaction_date: string | null;
  transaction_type: string | null;
  merchant_name: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  amount: number | string | null;
  daily_posted_balance: number | string | null;

  parse_status: string;
  transaction_lifecycle: string;
};

type ReviewRecord = {
  id: string;
  staged_transaction_id: string;
  review_status: string;
  duplicate_classification: string;
  // Legacy schema field. The reconciliation UI must not treat this
  // as trust authority over the individual's personal financial record.
  // A future schema reconciliation may replace it with a neutral
  // explanation or support-context status.
  trust_match_status: string;
};

function formatCurrency(value: number | string | null) {
  if (value === null) {
    return "Not parsed";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numericValue);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not parsed";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

export default function January2025ReconciliationPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [source, setSource] = useState<FinancialSource | null>(null);
  const [transactions, setTransactions] = useState<
    StagedTransaction[]
  >([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  const [statusMessage, setStatusMessage] = useState(
    "Loading authenticated session...",
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatusMessage(`Session error: ${error.message}`);
        setIsLoading(false);
        return;
      }

      setSession(data.session);

      if (!data.session) {
        setStatusMessage(
          "An authenticated THRIVE session is required.",
        );
        setIsLoading(false);
      }
    };

    void loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const loadReconciliationData = async () => {
      setIsLoading(true);
      setStatusMessage(
        "Loading January observational records through RLS...",
      );

      const { data: batchData, error: batchError } =
        await supabase
          .from("financial_import_batches")
          .select(
            [
              "id",
              "financial_source_id",
              "statement_period_start",
              "statement_period_end",
              "source_filename",
              "source_file_sha256",
              "source_row_count",
              "import_status",
              "data_boundary",
              "source_lifecycle",
              "reviewed_by",
              "reviewed_at",
              "approved_by",
              "approved_at",
              "rejection_reason",
            ].join(","),
          )
          .eq("id", BATCH_ID)
          .single();

      if (batchError || !batchData) {
        setStatusMessage(
          `Batch load error: ${
            batchError?.message ?? "Batch was not returned."
          }`,
        );
        setIsLoading(false);
        return;
      }

      const typedBatch = batchData as unknown as ImportBatch;
      setBatch(typedBatch);

      const [
        sourceResponse,
        transactionResponse,
      ] = await Promise.all([
        supabase
          .from("financial_sources")
          .select(
            [
              "id",
              "source_name",
              "institution_name",
              "source_type",
              "account_mask",
              "source_mode",
              "status",
            ].join(","),
          )
          .eq("id", typedBatch.financial_source_id)
          .single(),

        supabase
          .from("staged_financial_transactions")
          .select(
            [
              "id",
              "source_row_number",
              "source_row_identity",
              "source_content_fingerprint",
              "raw_posted_date",
              "raw_transaction_date",
              "raw_transaction_type",
              "raw_full_description",
              "raw_merchant_name",
              "raw_category_name",
              "raw_subcategory_name",
              "raw_amount",
              "raw_daily_posted_balance",
              "posted_date",
              "transaction_date",
              "transaction_type",
              "merchant_name",
              "category_name",
              "subcategory_name",
              "amount",
              "daily_posted_balance",
              "parse_status",
              "transaction_lifecycle",
            ].join(","),
          )
          .eq("import_batch_id", BATCH_ID)
          .order("source_row_number", { ascending: true }),
      ]);

      if (sourceResponse.error || !sourceResponse.data) {
        setStatusMessage(
          `Source load error: ${
            sourceResponse.error?.message ??
            "Financial source was not returned."
          }`,
        );
        setIsLoading(false);
        return;
      }

      if (transactionResponse.error) {
        setStatusMessage(
          `Transaction load error: ${transactionResponse.error.message}`,
        );
        setIsLoading(false);
        return;
      }

      const nextTransactions =
        (transactionResponse.data ?? []) as unknown as StagedTransaction[];

      setSource(sourceResponse.data as unknown as FinancialSource);
      setTransactions(nextTransactions);

      const transactionIds = nextTransactions.map(
        (transaction) => transaction.id,
      );

      if (transactionIds.length > 0) {
        const { data: reviewData, error: reviewError } =
          await supabase
            .from("financial_transaction_reviews")
            .select(
              [
                "id",
                "staged_transaction_id",
                "review_status",
                "duplicate_classification",
                "trust_match_status",
              ].join(","),
            )
            .in("staged_transaction_id", transactionIds);

        if (reviewError) {
          setStatusMessage(
            `Review-state load error: ${reviewError.message}`,
          );
          setIsLoading(false);
          return;
        }

        setReviews(
          (reviewData ?? []) as unknown as ReviewRecord[],
        );
      }

      setStatusMessage(
        "January observational records loaded. Read-only reconciliation view.",
      );
      setIsLoading(false);
    };

    void loadReconciliationData();
  }, [session]);

  const fingerprintCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const transaction of transactions) {
      counts.set(
        transaction.source_content_fingerprint,
        (counts.get(transaction.source_content_fingerprint) ?? 0) + 1,
      );
    }

    return counts;
  }, [transactions]);

  const duplicateGroups = useMemo(
    () =>
      Array.from(fingerprintCounts.values()).filter(
        (count) => count > 1,
      ).length,
    [fingerprintCounts],
  );

  const duplicateRows = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          (fingerprintCounts.get(
            transaction.source_content_fingerprint,
          ) ?? 0) > 1,
      ).length,
    [fingerprintCounts, transactions],
  );

  const normalizedTotal = useMemo(
    () =>
      transactions.reduce(
        (total, transaction) =>
          total + Number(transaction.amount ?? 0),
        0,
      ),
    [transactions],
  );

  const reviewByTransaction = useMemo(
    () =>
      new Map(
        reviews.map((review) => [
          review.staged_transaction_id,
          review,
        ]),
      ),
    [reviews],
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            January 2025 Reconciliation
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
            Read-only presentation of Johnny’s imported personal
            bank observations. Displaying a transaction does not assign
            intent, classify behavior, establish purpose, or create a
            financial, recovery, or legal conclusion.
          </p>
        </header>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-black uppercase tracking-wide text-amber-900">
            Read-only boundary
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-950">
            This interface performs no inserts, updates, deletes,
            personal explanations, behavioral conclusions, duplicate
            determinations, support decisions, or payment actions.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            {statusMessage}
          </p>
        </section>

        {batch && source ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Batch status"
                value={batch.import_status}
              />
              <SummaryCard
                label="Staged rows"
                value={transactions.length}
              />
              <SummaryCard
                label="Normalized total"
                value={formatCurrency(normalizedTotal)}
              />
              <SummaryCard
                label="Review records"
                value={reviews.length}
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Content-identical groups"
                value={duplicateGroups}
              />
              <SummaryCard
                label="Rows in those groups"
                value={duplicateRows}
              />
              <SummaryCard
                label="Source"
                value={
                  source.account_mask
                    ? `${source.institution_name ?? source.source_name} • ${source.account_mask}`
                    : source.source_name
                }
              />
              <SummaryCard
                label="Statement period"
                value={`${formatDate(
                  batch.statement_period_start,
                )} to ${formatDate(batch.statement_period_end)}`}
              />
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-2xl font-black">
                  Imported observational rows
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Content-identical rows remain separate. Indicators
                  below describe matching source fingerprints only and
                  do not establish duplicate transactions.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1500px] border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Posted</th>
                      <th className="px-4 py-3">Transaction</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Merchant / description</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Raw amount</th>
                      <th className="px-4 py-3">Normalized</th>
                      <th className="px-4 py-3">Daily balance</th>
                      <th className="px-4 py-3">Source match</th>
                      <th className="px-4 py-3">Review state</th>
                      <th className="px-4 py-3">Explanation status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => {
                      const fingerprintCount =
                        fingerprintCounts.get(
                          transaction.source_content_fingerprint,
                        ) ?? 1;

                      const review = reviewByTransaction.get(
                        transaction.id,
                      );

                      return (
                        <tr
                          key={transaction.id}
                          className="border-t border-slate-100 align-top"
                        >
                          <td className="px-4 py-4 font-black">
                            {transaction.source_row_number}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {formatDate(transaction.posted_date)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {formatDate(transaction.transaction_date)}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {transaction.transaction_type ??
                              transaction.raw_transaction_type}
                          </td>

                          <td className="max-w-md px-4 py-4">
                            <p className="font-black">
                              {transaction.merchant_name ??
                                transaction.raw_merchant_name ??
                                "Merchant not provided"}
                            </p>

                            <p className="mt-1 leading-5 text-slate-600">
                              {transaction.raw_full_description}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold">
                              {transaction.category_name ??
                                transaction.raw_category_name}
                            </p>

                            <p className="mt-1 text-slate-500">
                              {transaction.subcategory_name ??
                                transaction.raw_subcategory_name}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-mono">
                            {transaction.raw_amount}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-black">
                            {formatCurrency(transaction.amount)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {formatCurrency(
                              transaction.daily_posted_balance,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {fingerprintCount > 1 ? (
                              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                                Content-identical group of{" "}
                                {fingerprintCount}
                              </span>
                            ) : (
                              <span className="text-slate-500">
                                No matching fingerprint
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {review?.review_status ?? "unreviewed"}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {review?.trust_match_status === "matched"
                              ? "Supporting context recorded"
                              : "No personal explanation recorded"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!isLoading && transactions.length === 0 ? (
                <div className="p-6 text-sm font-semibold text-red-800">
                  No staged transactions were returned for the locked
                  January batch.
                </div>
              ) : null}
            </section>
          </>
        ) : null}

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
          <h2 className="text-xl font-black">
            Legal, ethical, and personal-support boundary
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            The bank observation layer helps Johnny and authorized
            support persons understand what occurred. It does not
            independently establish purpose, intent, responsibility,
            recovery status, legal conclusions, or authority to make or
            automate a payment.
          </p>

          <p className="mt-3 text-sm font-black text-emerald-300">
            Johnny’s personal financial record remains independent.
            External systems may exchange only limited, authorized facts.
          </p>
        </section>
      </section>
    </main>
  );
}
