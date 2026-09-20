"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildContextualWellnessReturn } from "./contextualWellnessReturn";
import WellnessCheckinPreview from "./WellnessCheckinPreview";
import { type WellnessDraft, useWellnessCheckinCandidate } from "./useWellnessCheckinCandidate";

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function nextStepLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    review_today_plan: "Keep it going",
    choose_one_task: "Do one useful thing",
    take_a_break: "Take a break",
    food_water_rest: "Handle a basic need",
    contact_supportive_person: "Talk to someone",
    ask_for_help: "Ask THRIVE for help",
    other: "Something else",
    nothing_right_now: "Nothing right now",
  };
  return value ? labels[value] ?? formatValue(value) : null;
}

function nextStepRoute(value: string | null | undefined) {
  if (value === "contact_supportive_person" || value === "ask_for_help") return "/support";
  return null;
}

function nextStepIcon(value: string | null | undefined) {
  const icons: Record<string, string> = {
    review_today_plan: "✓",
    choose_one_task: "◎",
    take_a_break: "Ⅱ",
    food_water_rest: "◇",
    contact_supportive_person: "♡",
    ask_for_help: "♡",
    other: "+",
    nothing_right_now: "·",
  };
  return value ? icons[value] ?? "•" : "•";
}

function overallVisual(value: string | null | undefined) {
  const key = value?.toLowerCase().replaceAll(" ", "_") ?? "";
  const visuals: Record<string, { dot: string; ring: string; badge: string; text: string }> = {
    good: {
      dot: "bg-emerald-500",
      ring: "shadow-[0_0_0_8px_rgba(16,185,129,0.10)]",
      badge: "bg-emerald-50 text-emerald-800",
      text: "text-emerald-800",
    },
    okay: {
      dot: "bg-sky-500",
      ring: "shadow-[0_0_0_8px_rgba(14,165,233,0.10)]",
      badge: "bg-sky-50 text-sky-800",
      text: "text-sky-800",
    },
    not_sure: {
      dot: "bg-slate-400",
      ring: "shadow-[0_0_0_8px_rgba(148,163,184,0.14)]",
      badge: "bg-slate-100 text-slate-700",
      text: "text-slate-700",
    },
    hard: {
      dot: "bg-amber-500",
      ring: "shadow-[0_0_0_8px_rgba(245,158,11,0.12)]",
      badge: "bg-amber-50 text-amber-900",
      text: "text-amber-900",
    },
  };
  return visuals[key] ?? visuals.not_sure;
}

function detailSentence(label: string, value: string) {
  const plainValue = formatValue(value).toLowerCase();
  if (label === "Stress") return `Stress feels ${plainValue}.`;
  if (label === "Sleep") return `Sleep feels ${plainValue}.`;
  if (label === "Energy") return `Energy feels ${plainValue}.`;
  if (label === "Confidence") return `Confidence feels ${plainValue}.`;
  if (label === "Routine") return `Routine feels ${plainValue}.`;
  if (label === "Recovery") return `Recovery support feels ${plainValue}.`;
  if (label === "Support") return `Support feels ${plainValue}.`;
  return `${label}: ${formatValue(value)}`;
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
  ].filter(([, value]) => Boolean(value)) as [string, string][] : [];

  const primaryTodayDetail = todayDetails[0] ?? null;
  const secondaryTodayDetails = todayDetails.slice(1);
  const todayOverallVisual = overallVisual(todayCheckin?.overall_day);
  const todayNextRoute = nextStepRoute(todayCheckin?.chosen_next_step);
  const contextualReturn = useMemo(
    () => buildContextualWellnessReturn(todayCheckin, recentCheckins),
    [todayCheckin, recentCheckins],
  );

  return (
    <div className="space-y-6">
      {todayCheckin && !focusMode && !justSaved ? (
        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/64 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl">
          <div className="relative p-5 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-100/70 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-amber-100/50 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Today</p>
                <span className="rounded-full border border-emerald-100 bg-white/76 px-3 py-1.5 text-xs font-black text-emerald-800 shadow-sm backdrop-blur-xl">Your check-in</span>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/78 shadow-sm">
                  <span className={`h-5 w-5 rounded-full ${todayOverallVisual.dot} ${todayOverallVisual.ring}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-wide text-slate-500">How today feels</p>
                  <h2 className={`mt-1 text-4xl font-black tracking-tight sm:text-5xl ${todayOverallVisual.text}`}>{formatValue(todayCheckin.overall_day)}</h2>
                </div>
              </div>

              {primaryTodayDetail ? (
                <p className="mt-5 text-xl font-bold leading-7 text-slate-700">{detailSentence(primaryTodayDetail[0], primaryTodayDetail[1])}</p>
              ) : null}

              {secondaryTodayDetails.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {secondaryTodayDetails.map(([label, value]) => (
                    <span key={label} className="rounded-full border border-white/80 bg-white/68 px-3 py-2 text-xs font-bold text-slate-600 backdrop-blur-xl">{detailSentence(label, value)}</span>
                  ))}
                </div>
              ) : null}

              {contextualReturn?.signals.length ? (
                <div className="mt-5 rounded-[1.5rem] border border-white/80 bg-white/66 p-4 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">What THRIVE noticed</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {contextualReturn.signals.map((signal) => (
                      <div key={signal.dimension} className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{signal.label}</p>
                        <p className="mt-1 text-lg font-black text-slate-950">{formatValue(signal.value)}</p>
                        {signal.comparisonDetail ? (
                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{signal.comparisonDetail}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {todayCheckin.chosen_next_step ? (
                todayNextRoute ? (
                  <Link href={todayNextRoute} className="mt-6 flex items-center gap-4 rounded-[1.6rem] border border-emerald-200/80 bg-emerald-700 px-5 py-5 text-white shadow-[0_14px_32px_rgba(4,120,87,0.20)] transition hover:bg-emerald-800">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/14 text-xl">{nextStepIcon(todayCheckin.chosen_next_step)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">Next</p>
                      <p className="mt-1 text-xl font-black leading-6">{nextStepLabel(todayCheckin.chosen_next_step)}</p>
                    </div>
                    <span className="text-2xl font-black text-emerald-100">›</span>
                  </Link>
                ) : (
                  <div className="mt-6 rounded-[1.6rem] border border-emerald-100 bg-emerald-50/82 px-5 py-5 text-emerald-950 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-800">{nextStepIcon(todayCheckin.chosen_next_step)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Next</p>
                        <p className="mt-1 text-xl font-black leading-6">{nextStepLabel(todayCheckin.chosen_next_step)}</p>
                      </div>
                    </div>
                  </div>
                )
              ) : null}

              {todayCheckin.participant_note ? (
                <details className="mt-4 rounded-2xl border border-white/80 bg-white/62 backdrop-blur-xl">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-700">Your note <span className="ml-1 text-emerald-700">⌄</span></summary>
                  <p className="border-t border-white/80 px-4 pb-4 pt-3 leading-7 text-slate-700">{todayCheckin.participant_note}</p>
                </details>
              ) : null}

              <button type="button" onClick={() => { setDraft(emptyDraft); setActionMessage(""); setJustSaved(false); setIsCheckingInAgain(true); }} className="mt-5 rounded-full border border-emerald-200 bg-white/72 px-4 py-2.5 text-sm font-black text-emerald-900 shadow-sm transition hover:bg-white">Check in again</button>
            </div>
          </div>
        </section>
      ) : null}

      {focusMode ? (
        <WellnessCheckinPreview recentCheckins={recentCheckins} draft={draft} onDraftChange={setDraft} onSaveCandidate={handleSaveCandidate} onUpdateCandidate={handleUpdateCandidate} hasSavedCheckin={false} actionMessage={actionMessage} writeEnabled={writeEnabled} focusOnMount={isCheckingInAgain} />
      ) : null}

      {justSaved ? (
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">Saved</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">{contextualReturn?.headline ?? "Your check-in is saved."}</h2>
          {contextualReturn?.detail ? (
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-300">{contextualReturn.detail}</p>
          ) : null}

          {contextualReturn?.signals.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {contextualReturn.signals.map((signal) => (
                <div key={signal.dimension} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">{signal.label}</p>
                  <p className="mt-1 text-xl font-black text-white">{formatValue(signal.value)}</p>
                  {signal.comparisonDetail ? (
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">{signal.comparisonDetail}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-7 border-t border-slate-800 pt-6">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Ways to continue</p>
            {contextualReturn?.suggestedActions.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {contextualReturn.suggestedActions.map((action) =>
                  action.href ? (
                    <Link key={action.key} href={action.href} className="rounded-2xl bg-emerald-400 px-5 py-4 text-slate-950 transition hover:bg-emerald-300">
                      <span className="block font-black">{action.label}</span>
                      <span className="mt-1 block text-xs font-bold leading-5 text-slate-700">{action.reason}</span>
                    </Link>
                  ) : (
                    <div key={action.key} className="rounded-2xl border border-slate-700 px-5 py-4">
                      <span className="block font-black text-white">{action.label}</span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-slate-400">{action.reason}</span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-slate-400">Nothing else is required from this check-in.</p>
            )}
            <Link href="/" className="mt-4 inline-flex rounded-full border border-slate-700 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-900">Done for now</Link>
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
                  const historyOverallVisual = overallVisual(checkin.overall_day);
                  return (
                    <article key={checkin.id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black text-slate-950">{checkinTime}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${historyOverallVisual.badge}`}>{formatValue(checkin.overall_day)}</span>
                      </div>
                      {checkin.chosen_next_step ? <p className="mt-3 text-sm font-bold text-slate-700">Next: {nextStepLabel(checkin.chosen_next_step)}</p> : null}
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
