"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThriveAccountPurpose } from "./useThriveAccountPurpose";

type AuthGateProps = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const { purpose, email, errorMessage } = useThriveAccountPurpose();

  useEffect(() => {
    if (purpose === "admin") {
      router.replace("/admin");
      return;
    }

    if (purpose === "support") {
      router.replace("/admin/support");
    }
  }, [purpose, router]);

  if (["checking", "admin", "support"].includes(purpose)) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-6 text-slate-950">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">
              DSS Enterprises
            </p>
            <h1 className="mt-2 text-3xl font-black">Checking THRIVE access</h1>
            <p className="mt-3 text-slate-600">
              Confirming the correct THRIVE experience for this account.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (purpose === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-6 text-slate-950">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">
              DSS Enterprises
            </p>
            <h1 className="mt-2 text-3xl font-black">THRIVE access required</h1>
            <p className="mt-3 leading-7 text-slate-600">
              This dashboard is protected. Please sign in before viewing THRIVE.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
            >
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (purpose === "unconfigured" || purpose === "conflict" || purpose === "error") {
    const title =
      purpose === "conflict"
        ? "THRIVE access needs review"
        : purpose === "unconfigured"
          ? "THRIVE access is not configured"
          : "THRIVE access could not be checked";

    const detail =
      purpose === "conflict"
        ? "This account currently matches more than one THRIVE purpose. Access has been stopped so the account can be reviewed."
        : purpose === "unconfigured"
          ? "This signed-in account does not yet have an active THRIVE participant, support, or admin purpose."
          : errorMessage || "The THRIVE access check could not be completed.";

    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-6 text-slate-950">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">
              DSS Enterprises
            </p>
            <h1 className="mt-2 text-3xl font-black">{title}</h1>
            <p className="mt-3 leading-7 text-slate-600">{detail}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-900">
        Signed in as {email ?? "authenticated user"}
      </div>
      {children}
    </>
  );
}
