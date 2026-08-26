"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import WellnessCheckinPreview from "./WellnessCheckinPreview";
import {
  type WellnessDraft,
  useWellnessCheckinCandidate,
} from "./useWellnessCheckinCandidate";

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";

  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
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

  const {
    recentCheckins,
    todayCheckin,
    today,
    executeInsertCandidate,
    executeSameDayUpdate,
    writeEnabled,
  } = useWellnessCheckinCandidate();

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

  const recentCheckinsByDate = useMemo(() => {
    return recentCheckins.reduce<Record<string, typeof recentCheckins>>(
      (groups, checkin) => {
        if (!groups[checkin.checkin_date]) {
          groups[checkin.checkin_date] = [];
        }

        groups[checkin.checkin_date].push(checkin);
        return groups;
      },
      {},
    );
  }, [recentCheckins]);

  const recentCheckinDates = Object.keys(recentCheckinsByDate);

  const reflectionSummary = useMemo(() => {
    const nextStepCounts = recentCheckins.reduce<Record<string, number>>(
      (counts, checkin) => {
        if (!checkin.chosen_next_step) return counts;

        const label = formatValue(checkin.chosen_next_step);
        counts[label] = (counts[label] ?? 0) + 1;
        return counts;
      },
      {},
    );

    return {
      reflectionCount: recentCheckins.length,
      dayCount: new Set(recentCheckins.map((checkin) => checkin.checkin_date)).size,
      nextStepCounts: Object.entries(nextStepCounts).sort(
        ([, leftCount], [, rightCount]) => rightCount - leftCount,
      ),
    };
  }, [recentCheckins]);

  const focusMode = !todayCheckin || isCheckingInAgain;

  return (
    <div className="space-y-6">
      {todayCheckin && !focusMode && !justSaved ? (
        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Today&apos;s saved check-in</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Your reflection for today</h2>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Overall day</p>
              <p className="mt-2 font-black text-slate-950">{formatValue(todayCheckin.overall_day)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Energy</p>
              <p className="mt-2 font-black text-slate-950">{formatValue(todayCheckin.energy)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Next step</p>
              <p className="mt-2 font-black text-slate-950">{formatValue(todayCheckin.chosen_next_step)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-2 font-black text-slate-950">{formatValue(todayCheckin.status)}</p>
            </div>
          </div>

          {todayCheckin.participant_note ? (
            <details className="mt-4 rounded-2xl border border-slate-100 bg-slate-50">
              <summary className="cursor-pointer list-none p-4 text-xs font-black uppercase tracking-wide text-slate-600">Read your note</summary>
              <p className="border-t border-slate-100 px-4 pb-4 pt-3 leading-7 text-slate-700">{todayCheckin.participant_note}</p>
            </details>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setDraft(emptyDraft);
                setActionMessage("");
                setJustSaved(false);
                setIsCheckingInAgain(true);
              }}
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
            >
              Check in again
            </button>
            <p className="text-sm leading-6 text-slate-600">A new check-in adds another reflection for today.</p>
          </div>
        </section>
      ) : null}

      {focusMode ? (
        <WellnessCheckinPreview
          draft={draft}
          onDraftChange={setDraft}
          onSaveCandidate={handleSaveCandidate}
          onUpdateCandidate={handleUpdateCandidate}
          hasSavedCheckin={false}
          actionMessage={actionMessage}
          writeEnabled={writeEnabled}
          focusOnMount={isCheckingInAgain}
        />
      ) : null}

      {justSaved ? (
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">Check-in saved</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">What would be useful next?</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">You can keep going somewhere useful, or finish for now.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/goals" className="rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300">Continue a Goal</Link>
            <Link href="/budget" className="rounded-2xl border border-slate-700 px-5 py-3 font-black text-white hover:bg-slate-900">Review money</Link>
            <Link href="/support" className="rounded-2xl border border-slate-700 px-5 py-3 font-black text-white hover:bg-slate-900">Open Support</Link>
            <Link href="/" className="rounded-2xl border border-slate-700 px-5 py-3 font-black text-white hover:bg-slate-900">Finish for now</Link>
          </div>
        </section>
      ) : null}

      {recentCheckinDates.length > 0 && !focusMode && !justSaved ? (
        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Your reflection history</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">What you&apos;ve been noticing</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">A factual look at your saved check-ins from the last 7 days. You decide what, if anything, matters now.</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-800">Days checked in</p>
              <p className="mt-2 text-2xl font-black text-emerald-950 sm:text-3xl">{reflectionSummary.dayCount} of 7</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Reflections</p>
              <p className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{reflectionSummary.reflectionCount}</p>
            </div>
          </div>

          {reflectionSummary.nextStepCounts.length > 0 ? (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-slate-950">Next steps you chose</p>
                <p className="text-xs text-slate-500">Saved choices, not obligations</p>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {reflectionSummary.nextStepCounts.map(([label, count]) => (
                  <span key={label} className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">{label} · {count}</span>
                ))}
              </div>
            </div>
          ) : null}

          <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer list-none p-4 font-black text-slate-950">
              Browse individual reflections
              <span className="ml-2 text-sm font-normal text-slate-500">({reflectionSummary.reflectionCount})</span>
            </summary>

            <div className="border-t border-slate-200 p-4">
              <p className="mb-3 text-xs font-semibold text-slate-500 sm:hidden">Swipe sideways to look back.</p>
              <div className="grid auto-cols-[86%] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:auto-cols-[48%] lg:auto-cols-[42%]">
                {recentCheckinDates.map((dateKey) => (
                  <article key={dateKey} className="snap-start rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{dateKey === today ? "Today" : dateKey}</p>
                    <div className="mt-3 space-y-3">
                      {recentCheckinsByDate[dateKey].map((checkin) => {
                        const checkinTime = new Intl.DateTimeFormat("en-US", {
                          timeZone: "America/New_York",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(checkin.created_at));

                        return (
                          <div key={checkin.id} className="rounded-xl bg-slate-50 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-black text-slate-950">{checkinTime}</p>
                              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600">{formatValue(checkin.overall_day)}</span>
                            </div>
                            {checkin.energy ? <p className="mt-2 text-xs text-slate-500">Energy: {formatValue(checkin.energy)}</p> : null}
                            {checkin.chosen_next_step ? <p className="mt-2 text-sm font-bold text-slate-800">Next: {formatValue(checkin.chosen_next_step)}</p> : null}
                            {checkin.participant_note ? (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-xs font-black text-emerald-800">Read note</summary>
                                <p className="mt-2 text-sm leading-6 text-slate-700">{checkin.participant_note}</p>
                              </details>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}