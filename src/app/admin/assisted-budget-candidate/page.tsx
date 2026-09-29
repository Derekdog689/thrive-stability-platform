"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminAccess } from "../useAdminAccess";

type TemplateKey = "basic" | "weekly" | "first_paycheck" | "limited_income" | "housing_transition" | "back_to_work";

const templates: Record<TemplateKey, { label: string; note: string; categories: Array<{ name: string; amount: number; confidence: "confirmed" | "estimate" | "unsure" }> }> = {
  basic: { label: "Basic monthly plan", note: "A simple starting structure.", categories: [
    { name: "Housing", amount: 800, confidence: "estimate" },
    { name: "Food & household", amount: 300, confidence: "estimate" },
    { name: "Transportation", amount: 150, confidence: "estimate" },
    { name: "Phone", amount: 80, confidence: "estimate" },
    { name: "Personal", amount: 120, confidence: "estimate" },
  ]},
  weekly: { label: "Weekly spending plan", note: "Shorter planning window with basic weekly needs.", categories: [
    { name: "Food & household", amount: 90, confidence: "estimate" },
    { name: "Transportation", amount: 45, confidence: "estimate" },
    { name: "Personal", amount: 40, confidence: "estimate" },
  ]},
  first_paycheck: { label: "First paycheck plan", note: "Use the first check to cover the most important items first.", categories: [
    { name: "Housing", amount: 500, confidence: "estimate" },
    { name: "Transportation", amount: 100, confidence: "estimate" },
    { name: "Food & household", amount: 150, confidence: "estimate" },
    { name: "Savings", amount: 50, confidence: "estimate" },
  ]},
  limited_income: { label: "Limited-income starter plan", note: "A starter plan when money is tight or income is uncertain.", categories: [
    { name: "Food & household", amount: 120, confidence: "estimate" },
    { name: "Transportation", amount: 60, confidence: "estimate" },
    { name: "Phone", amount: 50, confidence: "estimate" },
    { name: "Personal", amount: 30, confidence: "estimate" },
  ]},
  housing_transition: { label: "Housing transition plan", note: "A starter structure for move-in and stability costs.", categories: [
    { name: "Housing", amount: 900, confidence: "estimate" },
    { name: "Food & household", amount: 250, confidence: "estimate" },
    { name: "Transportation", amount: 100, confidence: "estimate" },
    { name: "Household setup", amount: 150, confidence: "estimate" },
  ]},
  back_to_work: { label: "Back-to-work plan", note: "A starter plan for early employment costs and first income.", categories: [
    { name: "Transportation", amount: 100, confidence: "estimate" },
    { name: "Food & household", amount: 180, confidence: "estimate" },
    { name: "Work needs", amount: 80, confidence: "estimate" },
    { name: "Phone", amount: 60, confidence: "estimate" },
  ]},
};

export default function AssistedBudgetAdminCandidatePage() {
  const { state, canAccessSystemAdmin } = useAdminAccess();
  const [templateKey, setTemplateKey] = useState<TemplateKey>("basic");
  const [moneyAvailable, setMoneyAvailable] = useState("1500");
  const [note, setNote] = useState("Starter plan prepared from the participant's request. Review every amount before using it.");
  const [sent, setSent] = useState(false);
  const selected = templates[templateKey];
  const total = useMemo(() => selected.categories.reduce((sum, entry) => sum + entry.amount, 0), [selected]);

  if (state === "checking") return <main className="min-h-screen bg-[#eef4ef] p-6">Checking access…</main>;
  if (!canAccessSystemAdmin) return <main className="min-h-screen bg-[#eef4ef] p-6"><section className="mx-auto max-w-3xl rounded-3xl bg-white p-8"><h1 className="text-3xl font-black">Admin access required</h1><p className="mt-3 text-slate-600">This prototype is for authorized THRIVE admin review.</p></section></main>;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#edf7f1_0%,#eef5f7_55%,#edf1f4_100%)] px-4 py-6 text-slate-950 sm:px-6">
      <section className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">THRIVE Admin · Prototype only</p>
          <h1 className="mt-2 text-4xl font-black">Help build a starter budget</h1>
          <p className="mt-3 max-w-3xl text-lg leading-7 text-slate-600">Prepare structure for the participant. Nothing becomes their active Money plan until they review and accept it.</p>
        </header>

        {sent ? (
          <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50/90 p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Ready for participant review</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-950">Starter plan prepared.</h2>
            <p className="mt-3 text-base font-semibold leading-7 text-emerald-900">In the real workflow, this would now appear in the participant's Money area as a reviewable starter plan. It would still not be active.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/budget/assisted-budget-candidate" className="rounded-full bg-emerald-700 px-5 py-3 font-black text-white">Preview participant side →</Link>
              <button type="button" onClick={() => setSent(false)} className="rounded-full border border-emerald-200 bg-white px-5 py-3 font-black text-emerald-900">Edit draft</button>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Participant request</p>
              <h2 className="mt-2 text-2xl font-black">“Can you help me make a basic budget?”</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">Request gives permission to assist with setup. It does not authorize activation.</p>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">1 · Start from</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(Object.keys(templates) as TemplateKey[]).map((key) => (
                  <button key={key} type="button" onClick={() => setTemplateKey(key)} className={"rounded-[1.4rem] border p-4 text-left " + (templateKey === key ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white")}>
                    <p className="font-black">{templates[key].label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{templates[key].note}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">2 · Prepare the starter plan</p>
              <label className="mt-4 block font-black">Money available
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4"><span className="text-xl font-black text-slate-400">$</span><input value={moneyAvailable} onChange={(e) => setMoneyAvailable(e.target.value)} inputMode="decimal" className="w-full bg-transparent px-3 py-4 text-2xl font-black outline-none" /></div>
              </label>
              <div className="mt-5 space-y-3">
                {selected.categories.map((entry) => <div key={entry.name} className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4"><div><p className="font-black">{entry.name}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{entry.confidence === "confirmed" ? "Confirmed" : entry.confidence === "estimate" ? "Estimate" : "Participant unsure"}</p></div><p className="text-lg font-black">{"$" + entry.amount.toFixed(2)}</p></div>)}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Available</p><p className="mt-1 font-black">{"$" + Number(moneyAvailable || 0).toFixed(2)}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Suggested</p><p className="mt-1 font-black">{"$" + total.toFixed(2)}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Left</p><p className="mt-1 font-black">{"$" + Math.max(Number(moneyAvailable || 0)-total,0).toFixed(2)}</p></div></div>
              <label className="mt-5 block font-black">Note to participant <span className="font-normal text-slate-400">Optional</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 font-normal" /></label>
            </section>

            <section className="rounded-[2rem] border border-violet-100 bg-violet-50/85 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">3 · Send for review</p>
              <h2 className="mt-2 text-2xl font-black text-violet-950">Participant keeps the last action.</h2>
              <p className="mt-2 text-base font-semibold leading-7 text-violet-900">Sending this creates a reviewable starter plan only. The participant can accept it, change it, or leave it for later.</p>
              <button type="button" onClick={() => setSent(true)} className="mt-5 w-full rounded-full bg-violet-700 px-5 py-4 text-lg font-black text-white">Send starter plan for review</button>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
