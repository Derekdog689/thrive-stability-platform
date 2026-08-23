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
    participant,
    participation,
    recentCheckins,
    todayCheckin,
    today,
    loading,
    errorMessage,
    executeInsertCandidate,
    executeSameDayUpdate,
    writeEnabled,
    clientPathTestEnabled,
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

  const participantName =
    participant?.preferred_name ?? participant?.display_name ?? "Participant";

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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
          Today&apos;s check-in
        </p>

        {loading ? (
          <p className="mt-3 leading-7 text-emerald-950">
            Loading your Wellness information.
          </p>
        ) : errorMessage ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-white p-4">
            <p className="font-black text-rose-900">
              Your Wellness information could not be loaded
            </p>
            <p className="mt-2 text-sm leading-6 text-rose-800">
              {errorMessage}
            </p>
          </div>
        ) : !participant ? (
          <p className="mt-3 leading-7 text-emerald-950">
            No active THRIVE participant record is available for this sign-in.
          </p>
        ) : !participation ? (
          <p className="mt-3 leading-7 text-emerald-950">
            No active THRIVE program is available for this check-in.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                For
              </p>
              <p className="mt-2 font-black text-slate-950">
                {participantName}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Date
              </p>
              <p className="mt-2 font-black text-slate-950">{today}</p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Saving
              </p>
              <p className="mt-2 font-black text-slate-950">
                {writeEnabled
                  ? "Available for controlled testing"
                  : "Not available yet"}
              </p>
            </div>
          </div>
        )}
      </section>

      {todayCheckin ? (
        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Today&apos;s saved check-in
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Your reflection for today
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            This is the active check-in currently saved for today.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Overall day
              </p>
              <p className="mt-2 font-black text-slate-950">
                {formatValue(todayCheckin.overall_day)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Energy
              </p>
              <p className="mt-2 font-black text-slate-950">
                {formatValue(todayCheckin.energy)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Next step
              </p>
              <p className="mt-2 font-black text-slate-950">
                {formatValue(todayCheckin.chosen_next_step)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p className="mt-2 font-black text-slate-950">
                {formatValue(todayCheckin.status)}
              </p>
            </div>
          </div>

          {todayCheckin.participant_note ? (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Your note
              </p>
              <p className="mt-2 leading-7 text-slate-700">
                {todayCheckin.participant_note}
              </p>
            </div>
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

            <p className="text-sm leading-6 text-slate-600">
              A new check-in adds another reflection for today. It does not replace this one.
            </p>
          </div>
        </section>
      ) : null}

      {!todayCheckin || isCheckingInAgain ? (
        <WellnessCheckinPreview
          draft={draft}
          onDraftChange={setDraft}
          onSaveCandidate={handleSaveCandidate}
          onUpdateCandidate={handleUpdateCandidate}
          hasSavedCheckin={false}
          actionMessage={actionMessage}
          writeEnabled={writeEnabled}
        />
      ) : null}

      {justSaved ? (
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
            Check-in saved
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            What would be useful next?
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            You can keep going somewhere useful, or finish for now.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/goals"
              className="rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
            >
              Continue a Goal
            </Link>
            <Link
              href="/budget"
              className="rounded-2xl border border-slate-700 px-5 py-3 font-black text-white hover:bg-slate-900"
            >
              Review money
            </Link>
            <Link
              href="/support"
              className="rounded-2xl border border-slate-700 px-5 py-3 font-black text-white hover:bg-slate-900"
            >
              Open Support
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-slate-700 px-5 py-3 font-black text-white hover:bg-slate-900"
            >
              Finish for now
            </Link>
          </div>
        </section>
      ) : null}

      {recentCheckinDates.length > 0 ? (
        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Your reflection history
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            What you&apos;ve been noticing
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            This is a factual look at your saved check-ins from the last 7 days.
            It does not score your week or decide what your answers mean.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                Days you checked in
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-950">
                {reflectionSummary.dayCount} of 7
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                A day can include more than one reflection.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Saved reflections
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {reflectionSummary.reflectionCount}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your own check-ins, kept together for reference.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                What this is for
              </p>
              <p className="mt-2 font-black text-slate-950">
                Remember what you chose to notice.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You decide whether any of it matters now.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="font-black text-slate-950">About earlier check-ins</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Earlier Wellness versions recorded some detail fields as part of the form.
              THRIVE does not treat those older fields as proof that you intentionally
              chose those areas to focus on.
            </p>
          </div>

          {reflectionSummary.nextStepCounts.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-100 p-5">
              <p className="font-black text-slate-950">Next steps you chose</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A reminder of choices you recorded, not a checklist you owe.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {reflectionSummary.nextStepCounts.map(([label, count]) => (
                  <span
                    key={label}
                    className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800"
                  >
                    {label} · {count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer list-none p-5 font-black text-slate-950">
              See your individual reflections
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({reflectionSummary.reflectionCount})
              </span>
            </summary>

            <div className="space-y-6 border-t border-slate-200 p-5">
              {recentCheckinDates.map((dateKey) => (
                <div key={dateKey} className="space-y-3">
                  <p className="text-sm font-black uppercase tracking-wide text-slate-500">
                    {dateKey === today ? "Today" : dateKey}
                  </p>

                  <div className="space-y-3">
                    {recentCheckinsByDate[dateKey].map((checkin) => {
                      const checkinTime = new Intl.DateTimeFormat("en-US", {
                        timeZone: "America/New_York",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(checkin.created_at));

                      return (
                        <div
                          key={checkin.id}
                          className="rounded-2xl border border-slate-100 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <p className="font-black text-slate-950">
                              {checkinTime}
                            </p>

                            <p className="text-sm text-slate-600">
                              {formatValue(checkin.overall_day)}
                              {checkin.energy
                                ? ` · ${formatValue(checkin.energy)} energy`
                                : ""}
                            </p>
                          </div>

                          {checkin.chosen_next_step ? (
                            <p className="mt-2 text-sm font-bold text-slate-800">
                              Next step: {formatValue(checkin.chosen_next_step)}
                            </p>
                          ) : null}

                          {checkin.participant_note ? (
                            <p className="mt-3 text-sm leading-6 text-slate-700">
                              {checkin.participant_note}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </section>
      ) : null}

      {clientPathTestEnabled ? (
        <section className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-violet-700">
            Controlled test mode
          </p>
          <h2 className="mt-2 text-2xl font-black text-violet-950">
            Person D Wellness test
          </h2>
          <p className="mt-3 leading-7 text-violet-900">
            Saving is available only for the approved synthetic Person D test.
            Other identities remain read-only.
          </p>
        </section>
      ) : null}
    </div>
  );
}
