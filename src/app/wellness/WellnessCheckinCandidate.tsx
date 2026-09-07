"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import WellnessCheckinPreview from "./WellnessCheckinPreview";
import { type WellnessDraft, useWellnessCheckinCandidate } from "./useWellnessCheckinCandidate";

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function dateLabel(dateKey: string, today: string) {
  if (dateKey === today) return "Today";
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date);
}

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

const emptyDraft: WellnessDraft = {
  overallDay: null,
  stress: null,
  sleep: null,
  energy: null,
  confidence: null,
  routine: null,
  recoverySupport: null,
  supportNeeded: null,
  chosenNextStep: null,
  participantNote: "",
};

export default function WellnessCheckinCandidate() {
  const [draft, setDraft] = useState<WellnessDraft>(emptyDraft);
  const [actionMessage, setActionMessage] = useState("");
  const [isCheckingInAgain, setIsCheckingInAgain] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [historyDay, setHistoryDay] = useState<string | null>(null);

  const { recentCheckins, todayCheckin, today, executeInsertCandidate, executeSameDayUpdate, writeEnabled } = useWellnessCheckinCandidate();

  const savedDraft = useMemo<WellnessDraft>(() => {
    if (!todayCheckin) return draft;
    return {
      overallDay: todayCheckin.overall_day,
      stress: todayCheckin.stress,
      sleep: todayCheckin.sleep,
      energy: todayCheckin.energy,
      confidence: todayCheckin.confidence,
      routine: todayCheckin.routine,
      recoverySupport: todayCheckin.recovery_support,
      supportNeeded: todayCheckin.support_needed,
      chosenNextStep: todayCheckin.chosen_next_step,
      participantNote: todayCheckin.participant_note ?? "",
    };
  }, [draft, todayCheckin]);

  async function handleSaveCandidate() {
    const result = await executeInsertCandidate(draft);
    if (!result.ok) {
      setActionMessage(result.message);
      setJustSaved(false);
      return result;
    }
    setDraft(emptyDraft);
    setActionMessage("");
    setIsCheckingInAgain(false);
    setJustSaved(true);
    return result;
  }

  async function handleUpdateCandidate() {
    const result = await executeSameDayUpdate(savedDraft);
    if (!result.ok) {
      setActionMessage(result.message);
      setJustSaved(false);
      return result;
    }
    setActionMessage("");
    setJustSaved(true);
    return result;
  }

  const recentCheckinsByDate = useMemo(() => recentCheckins.reduce<Record<string, typeof recentCheckins>>((groups, checkin) => {
    if (!groups[checkin.checkin_date]) groups[checkin.checkin_date] = [];
    groups[checkin.checkin_date].push(checkin);
    return groups;
  }, {}), [recentCheckins]);

  const recentCheckinDates = Object.keys(recentCheckinsByDate);
  const weekKeys = useMemo(() => Array.from({ length: 7 }, (_, index) => shiftDateKey(today, index - 6)), [today]);
  const dayCount = new Set(recentCheckins.map((checkin) => checkin.checkin_date)).size;
  const reflectionCount = recentCheckins.length;
  const selectedDayKey = historyDay ?? (recentCheckinDates.includes(today) ? today : recentCheckinDates[0] ?? null);
  const selectedDayRows = selectedDayKey ? recentCheckinsByDate[selectedDayKey] ?? [] : [];
  const focusMode = !todayCheckin || isCheckingInAgain;

  const todayDetails = todayCheckin ? [
    ["Stress", todayCheckin.stress],
    ["Sleep", todayCheckin.sleep],
    ["Energy", todayCheckin.energy],
    ["Confidence", todayCheckin.confidence],
    ["Routine", todayCheckin.routine],
    ["Recovery", todayCheckin.recovery_support],
    ["Support", todayCheckin.support_needed],
  ].filter(([, value]) => Boolean(value)) : [];

  return (
    <div className="space-y-6">
      {todayCheckin && !focusMode && !justSaved ? (
        <section className="rounded-3xl border border-emerald-100 bg-white/82 p-5 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Today</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Your check-in</h2>
            </div>
            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">{formatValue(todayCheckin.overall_day)}</div>
          </div>

          {todayDetails.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {todayDetails.map(([label, value]) => <span key={label} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{label}: {formatValue(value)}</span>)}
            </div>
          ) : null}

          {todayCheckin.chosen_next_step ? (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Next step</p>
              <p className="mt-1 text-lg font-black text-emerald-950">{formatValue(todayCheckin.chosen_next_step)}</p>
            </div>
          ) : null}

          {todayCheckin.participant_note ? (
            <details className="mt-4 rounded-2xl border border-slate-100 bg-slate-50">
              <summary className="cursor-pointer list-none p-4 font-black text-slate-800">Your note</summary>
              <p className="border-t border-slate-100 px-4 pb-4 pt-3 leading-7 text-slate-700">{todayCheckin.participant_note}</p>
            </details>
          ) : null}

          <button type="button" onClick={() => { setDraft(emptyDraft); setActionMessage(""); setJustSaved(false); setIsCheckingInAgain(true); }} className="mt-5 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800">Check in again</button>
        </section>
      ) : null}

      {focusMode ? (
        <WellnessCheckinPreview draft={draft} onDraftChange={setDraft} onSaveCandidate={handleSaveCandidate} onUpdateCandidate={handleUpdateCandidate} hasSavedCheckin={false} actionMessage={actionMessage} writeEnabled={writeEnabled} focusOnMount={isCheckingInAgain} />
      ) : null}

      {justSaved ? (
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">Saved</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">What next?</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/goals" className="rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 hover:bg-emerald-300">Continue a goal</Link>
            <Link href="/budget" className="rounded-2xl border border-slate-700 px-5 py-4 font-black text-white hover:bg-slate-900">Review money</Link>
            <Link href="/support" className="rounded-2xl border border-slate-700 px-5 py-4 font-black text-white hover:bg-slate-900">Open support</Link>
            <Link href="/" className="rounded-2xl border border-slate-700 px-5 py-4 font-black text-white hover:bg-slate-900">Done for now</Link>
          </div>
        </section>
      ) : null}

      {recentCheckinDates.length > 0 && !focusMode && !justSaved ? (
        <section className="rounded-3xl border border-emerald-100 bg-white/82 p-5 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Your week</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Check-ins</h2>
            </div>
            <p className="text-sm font-black text-slate-500">{dayCount} days · {reflectionCount} total</p>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2">
            {weekKeys.map((dateKey) => {
              const rows = recentCheckinsByDate[dateKey] ?? [];
              const checked = rows.length > 0;
              const selected = selectedDayKey === dateKey;
              return (
                <button key={dateKey} type="button" onClick={() => checked && setHistoryDay(dateKey)} disabled={!checked} className={`min-w-0 rounded-2xl border px-1 py-3 text-center transition ${selected ? "border-emerald-600 bg-emerald-100" : checked ? "border-emerald-200 bg-white" : "border-slate-100 bg-slate-50"}`}>
                  <span className="block text-[9px] font-black uppercase tracking-wide text-slate-500">{dateLabel(dateKey, today)}</span>
                  <span className={`mx-auto mt-3 block h-4 w-4 rounded-full ${checked ? "bg-emerald-500" : "bg-slate-200"}`} />
                  {rows.length > 1 ? <span className="mt-2 block text-[9px] font-black text-emerald-800">{rows.length}</span> : <span className="mt-2 block h-[11px]" />}
                </button>
              );
            })}
          </div>

          {selectedDayRows.length > 0 ? (
            <div className="mt-5 rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-950">{selectedDayKey === today ? "Today" : selectedDayKey}</p>
                <span className="text-xs font-bold text-slate-500">{selectedDayRows.length} check-in{selectedDayRows.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-3 space-y-3">
                {selectedDayRows.map((checkin) => {
                  const checkinTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }).format(new Date(checkin.created_at));
                  return (
                    <article key={checkin.id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black text-slate-950">{checkinTime}</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">{formatValue(checkin.overall_day)}</span>
                      </div>
                      {checkin.chosen_next_step ? <p className="mt-3 text-sm font-bold text-slate-700">Next: {formatValue(checkin.chosen_next_step)}</p> : null}
                      {checkin.participant_note ? <details className="mt-3"><summary className="cursor-pointer text-sm font-black text-emerald-800">Read note</summary><p className="mt-2 text-sm leading-6 text-slate-700">{checkin.participant_note}</p></details> : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
