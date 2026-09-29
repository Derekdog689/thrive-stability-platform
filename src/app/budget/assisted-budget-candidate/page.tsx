"use client";

import { useState } from "react";
import AuthGate from "../../AuthGate";

const categories = [
  { name: "Housing", amount: 800, label: "Estimate" },
  { name: "Food & household", amount: 300, label: "Estimate" },
  { name: "Transportation", amount: 150, label: "Estimate" },
  { name: "Phone", amount: 80, label: "Estimate" },
  { name: "Personal", amount: 120, label: "Estimate" },
];

export default function AssistedBudgetParticipantCandidatePage() {
  const [accepted, setAccepted] = useState(false);
  const [editing, setEditing] = useState(false);

  return <AuthGate><main className="min-h-screen bg-[linear-gradient(180deg,#edf7f1_0%,#eef5f7_55%,#edf1f4_100%)] px-4 py-6 pb-28 text-slate-950 sm:px-6">
    <section className="mx-auto max-w-3xl space-y-5">
      <header className="rounded-[2.2rem] border border-white/80 bg-white/72 p-6 shadow-sm backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Money · Prototype only</p>
        <h1 className="mt-2 text-4xl font-black">A starter plan is ready for you.</h1>
        <p className="mt-3 text-lg font-semibold leading-7 text-slate-600">THRIVE Support prepared this because you asked for help. Nothing is final until you review it.</p>
      </header>

      {accepted ? <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Accepted</p>
        <h2 className="mt-2 text-3xl font-black text-emerald-950">This would now become your Money plan.</h2>
        <p className="mt-3 text-base font-semibold leading-7 text-emerald-900">In the real workflow, THRIVE would populate the accepted categories and amounts into your participant-owned Money plan and carry you directly into the active plan view.</p>
        <p className="mt-4 rounded-2xl bg-white/80 p-4 text-sm font-bold text-slate-600">Prototype only: this screen does not write or activate anything yet.</p>
      </section> : <>
        <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Prepared for you</p><h2 className="mt-2 text-2xl font-black">Basic monthly plan</h2></div><span className="rounded-full bg-violet-50 px-3 py-2 text-xs font-black text-violet-800">Needs your review</span></div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">Starter plan prepared from your request. Review every amount before using it.</p>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Available</p><p className="mt-1 font-black">$1,500</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">Suggested</p><p className="mt-1 font-black">$1,450</p></div><div className="rounded-2xl bg-emerald-50 p-3"><p className="text-xs font-black text-emerald-700">Left to plan</p><p className="mt-1 font-black text-emerald-950">$50</p></div></div>
          <div className="mt-5 space-y-3">{categories.map((entry) => <div key={entry.name} className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-slate-100 bg-white p-4"><div><p className="font-black">{entry.name}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{entry.label}</p></div><p className="text-lg font-black">{"$" + entry.amount.toFixed(2)}</p></div>)}</div>
        </section>

        {editing ? <section className="rounded-[2rem] border border-sky-100 bg-sky-50/85 p-6 shadow-sm"><h2 className="text-2xl font-black text-sky-950">Change anything you want.</h2><p className="mt-2 text-base font-semibold leading-7 text-sky-900">The real version would open the normal Money plan editor with these suggested amounts prefilled, not force you to start over.</p><button type="button" onClick={() => setEditing(false)} className="mt-4 rounded-full border border-sky-200 bg-white px-5 py-3 font-black text-sky-900">Back to review</button></section> : null}

        <section className="rounded-[2rem] border border-emerald-100 bg-white/85 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Your choice</p>
          <h2 className="mt-2 text-2xl font-black">What do you want to do?</h2>
          <div className="mt-5 grid gap-3"><button type="button" onClick={() => setAccepted(true)} className="rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white">Use this as my starting plan</button><button type="button" onClick={() => setEditing(true)} className="rounded-full border border-sky-200 bg-sky-50 px-5 py-4 text-lg font-black text-sky-900">Change something</button><button type="button" className="rounded-full border border-slate-200 bg-white px-5 py-4 text-lg font-black text-slate-700">Leave it for later</button></div>
        </section>
      </>}
    </section>
  </main></AuthGate>;
}
