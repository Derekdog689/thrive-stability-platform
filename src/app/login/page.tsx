"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const THRIVE_ENTRY = "/living-signal/today";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshSessionStatus() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      setError(error.message);
      setCurrentUser(null);
      return;
    }

    setCurrentUser(session?.user ?? null);
  }

  useEffect(() => {
    void refreshSessionStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await refreshSessionStatus();
    setMessage("Welcome back. Opening THRIVE...");
    setLoading(false);
    router.push(THRIVE_ENTRY);
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage("");
    setError("");

    const emailRedirectTo = `${window.location.origin}${THRIVE_ENTRY}`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account request submitted. Check your email to confirm your account and return to THRIVE.",
    );
    setLoading(false);
  }

  async function handleSignOut() {
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setCurrentUser(null);
    setMessage("Signed out successfully.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#e8efec] text-[#0b2630]">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#17313a_0%,#264b50_42%,#dfe9e5_100%)]" />
        <div className="absolute inset-0 opacity-95 [background:radial-gradient(circle_at_78%_14%,rgba(255,217,157,.42),transparent_22rem),radial-gradient(circle_at_20%_18%,rgba(121,203,187,.24),transparent_28rem),linear-gradient(160deg,rgba(9,31,39,.12),rgba(9,31,39,.48)_58%,rgba(238,242,235,.12))]" />
        <div className="absolute left-[-18%] top-[26%] h-[52rem] w-[72rem] rotate-[-8deg] rounded-[50%] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.015))] shadow-[0_0_120px_rgba(255,216,159,.08)]" />
        <div className="absolute right-[-12%] top-[8%] h-[24rem] w-[16rem] rounded-[8rem_2rem_8rem_2rem] border border-white/12 bg-white/[0.045] shadow-[inset_0_0_60px_rgba(255,255,255,.04),0_30px_90px_rgba(3,17,22,.18)] backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(180deg,transparent,rgba(239,244,239,.86)_46%,#eef3ef_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-8 sm:pt-7">
          <header className="flex items-center justify-between gap-4 rounded-[1.6rem] border border-white/15 bg-white/[0.055] px-4 py-3 text-white shadow-[0_14px_42px_rgba(3,19,26,.12)] backdrop-blur-xl sm:px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 font-serif text-lg font-black text-white shadow-inner">T</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#bfe7dc]">DSS Enterprises</p>
                <p className="text-sm font-black tracking-[0.08em] text-white">THRIVE</p>
              </div>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">Your space</span>
          </header>

          <div className="grid flex-1 items-center gap-6 py-6 sm:py-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
            <section className="flex min-h-[300px] flex-col justify-end rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,.03),rgba(6,31,39,.18))] p-5 text-white shadow-[0_34px_90px_rgba(3,20,27,.16)] backdrop-blur-[2px] sm:min-h-[420px] sm:p-8">
              <div className="max-w-xl">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6dfd5]">Welcome to THRIVE</p>
                <h1 className="mt-3 max-w-lg font-serif text-[3.25rem] font-semibold leading-[.95] tracking-[-.045em] text-white sm:text-[4.5rem]">Come back to what matters.</h1>
                <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-white/78 sm:text-lg">Your check-ins, goals, money, support, resources, and Story stay connected so you can pick up where you left off.</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e7b270] shadow-[0_0_20px_rgba(231,178,112,.75)]" />
                  <p className="text-sm font-bold text-white/82">Calm enough to trust. Alive enough to return to.</p>
                </div>
              </div>
            </section>

            <section className="lg:py-6">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-[#f9faf7]/90 p-5 shadow-[0_30px_90px_rgba(10,34,42,.18)] backdrop-blur-2xl sm:p-7">
                <div className="absolute right-[-4rem] top-[-5rem] h-40 w-40 rounded-full bg-[#dceee7]/65 blur-2xl" />
                <div className="absolute bottom-[-4rem] left-[-3rem] h-32 w-32 rounded-full bg-[#f3ddbd]/60 blur-2xl" />
                <div className="relative">
                  {currentUser ? (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#167b73]">Welcome back</p>
                      <h2 className="mt-2 font-serif text-4xl font-semibold leading-[1.02] tracking-[-.03em] text-[#0b2630]">Your THRIVE is ready.</h2>
                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">Everything you have already started is waiting inside.</p>
                      <div className="mt-5 rounded-[1.3rem] border border-emerald-100 bg-emerald-50/82 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">Signed in</p>
                        <p className="mt-1 break-words text-sm font-semibold text-emerald-900/80">{currentUser.email}</p>
                      </div>
                      <button type="button" onClick={() => router.push(THRIVE_ENTRY)} className="mt-5 w-full rounded-[1.3rem] bg-[#0d7f6f] px-5 py-4 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,127,111,.24)] transition active:scale-[0.985]">Open THRIVE</button>
                      <button type="button" onClick={handleSignOut} disabled={loading} className="mt-3 w-full rounded-[1.3rem] border border-slate-200 bg-white/80 px-5 py-3 text-sm font-black text-slate-600 transition active:scale-[0.985] disabled:opacity-50">{loading ? "Signing out..." : "Sign out"}</button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#167b73]">Return to your THRIVE</p>
                      <h2 className="mt-2 font-serif text-4xl font-semibold leading-[1.02] tracking-[-.03em] text-[#0b2630]">Pick up where you left off.</h2>
                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">Sign in to continue your current thread, not start over.</p>
                      <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                        <label className="block text-sm font-black text-slate-700">Email
                          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-[1.2rem] border border-slate-200 bg-white/92 px-4 py-4 text-base outline-none transition focus:border-[#0d7f6f] focus:ring-4 focus:ring-emerald-100" placeholder="you@example.com" autoComplete="email" required />
                        </label>
                        <label className="block text-sm font-black text-slate-700">Password
                          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-[1.2rem] border border-slate-200 bg-white/92 px-4 py-4 text-base outline-none transition focus:border-[#0d7f6f] focus:ring-4 focus:ring-emerald-100" placeholder="Enter your password" autoComplete="current-password" required />
                        </label>
                        <button type="submit" disabled={loading} className="w-full rounded-[1.3rem] bg-[#0d7f6f] px-5 py-4 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,127,111,.24)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Opening THRIVE..." : "Open THRIVE"}</button>
                      </form>
                      <button type="button" onClick={handleSignUp} disabled={loading || !email || !password} className="mt-5 text-sm font-black text-[#167b73] transition hover:text-[#0b4f49] disabled:cursor-not-allowed disabled:opacity-40">Create an account</button>
                    </div>
                  )}

                  {message ? <div className="mt-5 rounded-[1.2rem] border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">{message}</div> : null}
                  {error ? <div className="mt-5 rounded-[1.2rem] border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</div> : null}

                  <details className="mt-6 rounded-[1.2rem] border border-slate-100 bg-white/70 px-4 py-3 text-sm text-slate-600">
                    <summary className="cursor-pointer font-black text-slate-700">Privacy</summary>
                    <p className="mt-2 text-xs leading-5">Sign-in is only for accessing your THRIVE account. Enter sensitive personal information only in the appropriate THRIVE areas after signing in.</p>
                  </details>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
