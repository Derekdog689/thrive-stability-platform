"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthGateProps = {
  children: React.ReactNode;
};

type GateState = "checking" | "signed-in" | "signed-out";

export default function AuthGate({ children }: AuthGateProps) {
  const [gateState, setGateState] = useState<GateState>("checking");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error || !data.session?.user) {
        setGateState("signed-out");
        setEmail(null);
        return;
      }

      setGateState("signed-in");
      setEmail(data.session.user.email ?? null);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setGateState("signed-out");
        setEmail(null);
        return;
      }

      setGateState("signed-in");
      setEmail(session.user.email ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (gateState === "checking") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-6 text-slate-950">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">
              DSS Enterprises
            </p>
            <h1 className="mt-2 text-3xl font-black">Checking THRIVE access</h1>
            <p className="mt-3 text-slate-600">
              Verifying your Supabase session before loading the dashboard.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (gateState === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-6 text-slate-950">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase text-emerald-700">
              DSS Enterprises
            </p>
            <h1 className="mt-2 text-3xl font-black">THRIVE access required</h1>
            <p className="mt-3 leading-7 text-slate-600">
              This dashboard is protected. Please sign in before viewing THRIVE
              workspace tools, mock dashboard content, or test workspace records.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">
              <p className="font-bold uppercase text-emerald-300">
                Security boundary
              </p>
              <p className="mt-2 text-slate-200">
                THRIVE remains mock/test only. Do not enter real financial, trust,
                beneficiary, clinical, recovery, or private case data.
              </p>
            </div>

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

  return (
    <>
      <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-900">
        Signed in as {email ?? "authenticated user"}
      </div>
      {children}
    </>
  );
}