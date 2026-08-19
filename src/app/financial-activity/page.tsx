"use client";

import { FormEvent, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  formatDate,
  formatMoney,
  useParticipantFinancial,
} from "../useParticipantFinancial";
import { supabase } from "@/lib/supabaseClient";

export default function FinancialActivityPage() {
  const {
    activeProgramId,
    financialActivity,
    loading,
    errorMessage,
    refresh,
  } = useParticipantFinancial();

  const [showManualForm, setShowManualForm] = useState(false);
  const [activityDate, setActivityDate] = useState("");
  const [activityDirection, setActivityDirection] =
    useState<"outflow" | "inflow">("outflow");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleManualSave(
    event: FormEvent<HTMLFormElement>,
  ) {
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
                    </div>

                    {!showManualForm ? (
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
                    ) : null}
                  </div>

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
                                event.target.value as
                                  | "outflow"
                                  | "inflow",
                              );
                              setNotice("");
                            }}
                            disabled={saving}
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
                          {saving
                            ? "Saving..."
                            : "Save activity"}
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

                  <div className="mt-6 space-y-3">
                    {financialActivity.map((activity) => (
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
                            {formatMoney(
                              activity.signed_amount,
                            )}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                            {activity.activity_direction ===
                            "outflow"
                              ? "Money spent"
                              : activity.activity_direction ===
                                  "inflow"
                                ? "Money received"
                                : "Financial activity"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              activity.provenance_type ===
                              "participant_manual"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {activity.provenance_type ===
                            "participant_manual"
                              ? "Added by you"
                              : "Bank import"}
                          </span>

                          {activity.lifecycle ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">
                              {activity.lifecycle.replaceAll(
                                "_",
                                " ",
                              )}
                            </span>
                          ) : null}
                        </div>
                      </article>
                    ))}

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