"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../useAdminAccess";

type TemplateKey = "basic" | "weekly" | "first_paycheck" | "limited_income" | "housing_transition" | "back_to_work";

type StarterLine = {
  category_name: string;
  category_type: "protected" | "flexible" | "support" | "reserve";
  planned_amount: number;
  sort_order: number;
};

type SupportRequestSummary = {
  id: string;
  participant_message: string;
  requested_support: string | null;
  supported_person_id: string;
  status: string;
};

type PersonSummary = {
  display_name: string;
  preferred_name: string | null;
};

const templates: Record<TemplateKey, { label: string; note: string; categories: StarterLine[] }> = {
  basic: { label: "Basic monthly plan", note: "A simple starting structure.", categories: [
    { category_name: "Housing", category_type: "protected", planned_amount: 800, sort_order: 0 },
    { category_name: "Food & household", category_type: "protected", planned_amount: 300, sort_order: 1 },
    { category_name: "Transportation", category_type: "flexible", planned_amount: 150, sort_order: 2 },
    { category_name: "Phone", category_type: "protected", planned_amount: 80, sort_order: 3 },
    { category_name: "Personal", category_type: "flexible", planned_amount: 120, sort_order: 4 },
  ]},
  weekly: { label: "Weekly spending plan", note: "Shorter planning window with basic weekly needs.", categories: [
    { category_name: "Food & household", category_type: "protected", planned_amount: 90, sort_order: 0 },
    { category_name: "Transportation", category_type: "flexible", planned_amount: 45, sort_order: 1 },
    { category_name: "Personal", category_type: "flexible", planned_amount: 40, sort_order: 2 },
  ]},
  first_paycheck: { label: "First paycheck plan", note: "Cover the most important items first.", categories: [
    { category_name: "Housing", category_type: "protected", planned_amount: 500, sort_order: 0 },
    { category_name: "Transportation", category_type: "flexible", planned_amount: 100, sort_order: 1 },
    { category_name: "Food & household", category_type: "protected", planned_amount: 150, sort_order: 2 },
    { category_name: "Savings", category_type: "reserve", planned_amount: 50, sort_order: 3 },
  ]},
  limited_income: { label: "Limited-income starter plan", note: "A starter plan when money is tight or uncertain.", categories: [
    { category_name: "Food & household", category_type: "protected", planned_amount: 120, sort_order: 0 },
    { category_name: "Transportation", category_type: "flexible", planned_amount: 60, sort_order: 1 },
    { category_name: "Phone", category_type: "protected", planned_amount: 50, sort_order: 2 },
    { category_name: "Personal", category_type: "flexible", planned_amount: 30, sort_order: 3 },
  ]},
  housing_transition: { label: "Housing transition plan", note: "A starter structure for move-in and stability costs.", categories: [
    { category_name: "Housing", category_type: "protected", planned_amount: 900, sort_order: 0 },
    { category_name: "Food & household", category_type: "protected", planned_amount: 250, sort_order: 1 },
    { category_name: "Transportation", category_type: "flexible", planned_amount: 100, sort_order: 2 },
    { category_name: "Household setup", category_type: "support", planned_amount: 150, sort_order: 3 },
  ]},
  back_to_work: { label: "Back-to-work plan", note: "A starter plan for early employment costs and first income.", categories: [
    { category_name: "Transportation", category_type: "flexible", planned_amount: 100, sort_order: 0 },
    { category_name: "Food & household", category_type: "protected", planned_amount: 180, sort_order: 1 },
    { category_name: "Work needs", category_type: "support", planned_amount: 80, sort_order: 2 },
    { category_name: "Phone", category_type: "protected", planned_amount: 60, sort_order: 3 },
  ]},
};

function cloneLines(key: TemplateKey) {
  return templates[key].categories.map((line) => ({ ...line }));
}

export default function AssistedBudgetAdminCandidatePage() {
  const { state, canAccessSystemAdmin } = useAdminAccess();
  const [requestId, setRequestId] = useState("");
  const [request, setRequest] = useState<SupportRequestSummary | null>(null);
  const [person, setPerson] = useState<PersonSummary | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [templateKey, setTemplateKey] = useState<TemplateKey>("basic");
  const [lines, setLines] = useState<StarterLine[]>(() => cloneLines("basic"));
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [moneyAvailable, setMoneyAvailable] = useState("");
  const [note, setNote] = useState("Starter plan prepared from your request. Review every amount before using it.");
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [sentBudgetId, setSentBudgetId] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("request")?.trim() ?? "";
    setRequestId(id);
  }, []);

  useEffect(() => {
    if (!canAccessSystemAdmin || !requestId) {
      setLoadingRequest(false);
      return;
    }

    let cancelled = false;

    async function loadRequest() {
      setLoadingRequest(true);
      const requestResult = await supabase
        .from("support_requests")
        .select("id, participant_message, requested_support, supported_person_id, status")
        .eq("id", requestId)
        .eq("participant_category", "budget_money")
        .single();

      if (cancelled) return;

      if (requestResult.error || !requestResult.data) {
        setNotice(requestResult.error?.message || "Money Support request could not be loaded.");
        setLoadingRequest(false);
        return;
      }

      const row = requestResult.data as SupportRequestSummary;
      setRequest(row);

      const personResult = await supabase
        .from("supported_people")
        .select("display_name, preferred_name")
        .eq("id", row.supported_person_id)
        .single();

      if (!cancelled && personResult.data) {
        setPerson(personResult.data as PersonSummary);
      }
      setLoadingRequest(false);
    }

    void loadRequest();
    return () => { cancelled = true; };
  }, [canAccessSystemAdmin, requestId]);

  const total = useMemo(() => lines.reduce((sum, entry) => sum + Number(entry.planned_amount || 0), 0), [lines]);
  const availableNumber = Number(moneyAvailable || 0);
  const participantName = person?.preferred_name?.trim() || person?.display_name || "participant";

  function chooseTemplate(key: TemplateKey) {
    setTemplateKey(key);
    setLines(cloneLines(key));
    setNotice("");
  }

  function changeAmount(index: number, value: string) {
    const amount = Number(value);
    setLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, planned_amount: Number.isFinite(amount) && amount >= 0 ? amount : 0 } : line));
  }

  async function sendForReview() {
    setNotice("");

    if (!requestId || !request) {
      setNotice("Open this tool from a Money Support request.");
      return;
    }
    if (!periodStart || !periodEnd || periodStart > periodEnd) {
      setNotice("Choose a valid start and end date.");
      return;
    }
    if (!moneyAvailable.trim()) {
      setNotice("Enter the total money available for this plan.");
      return;
    }
    if (!Number.isFinite(availableNumber) || availableNumber < 0) {
      setNotice("Total money available must be zero or more.");
      return;
    }
    if (lines.length === 0) {
      setNotice("Add at least one starter category.");
      return;
    }

    setWorking(true);
    const result = await supabase.rpc("prepare_assisted_budget_v1", {
      p_support_request_id: requestId,
      p_period_start: periodStart,
      p_period_end: periodEnd,
      p_expected_income: availableNumber,
      p_notes: note.trim() || null,
      p_lines: lines,
    });
    setWorking(false);

    if (result.error) {
      setNotice(result.error.message);
      return;
    }

    setSentBudgetId(result.data as string);
    setNotice("Starter plan sent for participant review.");
  }

  if (state === "checking" || loadingRequest) return <main className="min-h-screen bg-[#eef4ef] p-6">Loading assisted Budget setup…</main>;
  if (!canAccessSystemAdmin) return <main className="min-h-screen bg-[#eef4ef] p-6"><section className="mx-auto max-w-3xl rounded-3xl bg-white p-8"><h1 className="text-3xl font-black">Admin access required</h1><p className="mt-3 text-slate-600">Only a THRIVE workspace admin can prepare a participant starter plan.</p></section></main>;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#edf7f1_0%,#eef5f7_55%,#edf1f4_100%)] px-4 py-6 text-slate-950 sm:px-6">
      <section className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">THRIVE Admin · Assisted Money</p>
          <h1 className="mt-2 text-4xl font-black">Help build a starter budget</h1>
          <p className="mt-3 max-w-3xl text-lg leading-7 text-slate-600">Prepare a participant-owned draft. The participant can change it, leave it for later, or activate it themselves.</p>
          <Link href="/admin/support" className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">← Back to Support</Link>
        </header>

        {!request ? <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6"><h2 className="text-2xl font-black text-amber-950">Open this from a Money Support request.</h2>{notice ? <p className="mt-3 font-semibold text-amber-900">{notice}</p> : null}</section> : sentBudgetId ? (
          <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50/90 p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Waiting for participant</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-950">Starter plan sent to {participantName}.</h2>
            <p className="mt-3 text-base font-semibold leading-7 text-emerald-900">The plan is still a draft. THRIVE will not activate it for them.</p>
            <Link href="/admin/support" className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-3 font-black text-white">Back to Support</Link>
          </section>
        ) : (
          <>
            <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Participant request</p>
              <h2 className="mt-2 text-2xl font-black">{participantName}</h2>
              <p className="mt-3 text-lg font-semibold leading-7 text-slate-800">{request.participant_message}</p>
              {request.requested_support ? <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">{request.requested_support}</p> : null}
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">1 · Start from</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(Object.keys(templates) as TemplateKey[]).map((key) => (
                  <button key={key} type="button" onClick={() => chooseTemplate(key)} className={"rounded-[1.4rem] border p-4 text-left " + (templateKey === key ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white")}>
                    <p className="font-black">{templates[key].label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{templates[key].note}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">2 · Prepare the starter plan</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-sm font-black">Start<input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 font-normal" /></label>
                <label className="text-sm font-black">End<input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 font-normal" /></label>
              </div>
              <label className="mt-4 block font-black">Total money available for this plan
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">Enter the full amount the participant expects to have available during this planning period. Do not enter a category amount here.</p>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="text-xl font-black text-slate-400">$</span><input type="number" min="0" step="0.01" value={moneyAvailable} onChange={(e) => setMoneyAvailable(e.target.value)} inputMode="decimal" placeholder="Total available" className="w-full bg-transparent px-3 py-4 text-2xl font-black outline-none" /></div>
              </label>

              <div className="mt-5 space-y-3">
                {lines.map((entry, index) => <div key={entry.category_name} className="grid grid-cols-[1fr_8rem] items-center gap-4 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4"><div><p className="font-black">{entry.category_name}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">Amount to set aside</p></div><div className="flex items-center rounded-xl border border-slate-200 bg-white px-3"><span className="font-black text-slate-400">$</span><input type="number" min="0" step="0.01" value={entry.planned_amount} onChange={(e) => changeAmount(index, e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-right font-black outline-none" /></div></div>)}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Available</p><p className="mt-1 font-black">{"$" + availableNumber.toFixed(2)}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Suggested</p><p className="mt-1 font-black">{"$" + total.toFixed(2)}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">{availableNumber-total < 0 ? "Over" : "Left"}</p><p className="mt-1 font-black">{"$" + Math.abs(availableNumber-total).toFixed(2)}</p></div>
              </div>

              <label className="mt-5 block font-black">Note to participant <span className="font-normal text-slate-400">Optional</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 font-normal" /></label>
            </section>

            <section className="rounded-[2rem] border border-violet-100 bg-violet-50/85 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">3 · Send for review</p>
              <h2 className="mt-2 text-2xl font-black text-violet-950">Participant keeps the last action.</h2>
              <p className="mt-2 text-base font-semibold leading-7 text-violet-900">This creates a participant-owned draft and places the Support request into waiting for participant.</p>
              <button type="button" disabled={working} onClick={() => void sendForReview()} className="mt-5 w-full rounded-full bg-violet-700 px-5 py-4 text-lg font-black text-white disabled:opacity-50">{working ? "Preparing..." : "Send starter plan for review"}</button>
              {notice ? <p className="mt-3 text-sm font-bold text-violet-900">{notice}</p> : null}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
