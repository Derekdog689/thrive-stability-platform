"use client";

import Link from "next/link";
import { useAdminAccess } from "./useAdminAccess";

export default function AdminHomePage() {
  const {
    state,
    membership,
    errorMessage,
    canAccessAdmin,
  } = useAdminAccess();

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">
              DSS Enterprises
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Checking THRIVE Review access
            </h1>
          </div>
        </section>
      </main>
    );
  }

  if (state === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">
              THRIVE Review access required
            </h1>

            <p className="mt-3 text-slate-600">
              Sign in before using reviewer tools.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
            >
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">
              THRIVE Review could not load
            </h1>

            <p className="mt-3 text-slate-600">
              {errorMessage || "The access check could not be completed."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!canAccessAdmin || state === "denied") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-slate-500">
              THRIVE Review
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Reviewer access not available
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              This account does not have an active THRIVE reviewer or admin
              workspace membership.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-emerald-700">
            DSS Enterprises
          </p>

          <h1 className="mt-2 text-4xl font-black">
            THRIVE Review
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Review participant Support requests and complete authorized
            THRIVE support actions.
          </p>

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Role: {membership?.member_role}
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">
              Support
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Support queue
            </h2>

            <p className="mt-3 leading-6 text-slate-600">
              Review participant requests and send participant-visible
              responses.
            </p>

            <Link
              href="/admin/support"
              className="mt-5 inline-flex rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white"
            >
              Open Support queue
            </Link>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-slate-500">
              Supported people
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Coming later
            </h2>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-slate-500">
              Reports
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Coming later
            </h2>
          </section>
        </div>
      </section>
    </main>
  );
}