"use client";

import { useState, useTransition } from "react";

import { supabase } from "@/lib/supabaseClient";

import { importJanuary2025Candidate } from "./actions";

const REQUIRED_CONFIRMATION =
  "IMPORT JANUARY 2025 TO THRIVE TRUST STEWARDSHIP";

export default function ImportConfirmationClient({
  validationPassed,
}: {
  validationPassed: boolean;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    batchId?: string;
    insertedRows?: number;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const phraseMatches =
    confirmation.trim() === REQUIRED_CONFIRMATION;

  async function runControlledImport() {
    setResult(null);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      setResult({
        ok: false,
        message:
          "An authenticated session is required. No database writes occurred.",
      });
      return;
    }

    startTransition(async () => {
      const response = await importJanuary2025Candidate({
        accessToken: session.access_token,
        confirmation,
      });

      setResult({
        ok: response.ok,
        message: response.message,
        batchId: response.batchId,
        insertedRows: response.insertedRows,
      });
    });
  }

  return (
    <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
      <p className="text-sm font-black uppercase tracking-wide text-red-800">
        Controlled import gate
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        January 2025 server import candidate
      </h2>

      <p className="mt-3 text-sm leading-6 text-red-950">
        This control remains disabled unless the server environment variable
        <code className="mx-1 rounded bg-white px-1.5 py-0.5 font-bold">
          THRIVE_ENABLE_JANUARY_2025_IMPORT
        </code>
        is explicitly set to
        <code className="mx-1 rounded bg-white px-1.5 py-0.5 font-bold">
          true
        </code>
        .
      </p>

      <div className="mt-5 rounded-2xl border border-red-200 bg-white p-5">
        <label
          htmlFor="january-import-confirmation"
          className="text-sm font-black text-slate-950"
        >
          Type the exact authorization phrase
        </label>

        <p className="mt-2 break-words rounded-xl bg-slate-100 p-3 font-mono text-xs font-bold text-slate-800">
          {REQUIRED_CONFIRMATION}
        </p>

        <input
          id="january-import-confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-red-500"
          placeholder="Type the authorization phrase exactly"
        />

        <button
          type="button"
          onClick={runControlledImport}
          disabled={
            isPending ||
            !validationPassed ||
            !phraseMatches
          }
          className="mt-4 rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending
            ? "Running controlled validation..."
            : "Create January batch and 85 staged rows"}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-red-200 bg-red-100 p-4 text-sm font-semibold text-red-950">
        This action does not approve the batch. A successful import stops at
        <code className="mx-1 font-black">ready_for_review</code>
        and requires human reconciliation.
      </div>

      {result ? (
        <div
          className={`mt-5 rounded-2xl border p-4 text-sm font-semibold ${
            result.ok
              ? "border-emerald-300 bg-emerald-100 text-emerald-950"
              : "border-red-300 bg-white text-red-950"
          }`}
        >
          <p>{result.message}</p>

          {result.batchId ? (
            <p className="mt-2 break-all">
              Batch ID: {result.batchId}
            </p>
          ) : null}

          {typeof result.insertedRows === "number" ? (
            <p className="mt-1">
              Verified staged rows: {result.insertedRows}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
