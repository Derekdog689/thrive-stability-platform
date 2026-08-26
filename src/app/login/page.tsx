"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

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
    refreshSessionStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await refreshSessionStatus();
    setMessage("Welcome back. Opening THRIVE...");
    setLoading(false);
    router.push("/");
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account request submitted. Check your email if confirmation is required.",
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
    <main className="min-h-screen bg-[#e8f0eb] px-3 py-3 text-slate-950 sm:px-6 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-5xl overflow-hidden rounded-[2.4rem] bg-white shadow-[0_28px_90px_rgba(6,55,42,0.16)] sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative min-h-[390px] overflow-hidden bg-[#073f32] text-white sm:min-h-[470px] lg:min-h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(251,191,120,0.7),transparent_18%),radial-gradient(circle_at_62%_38%,rgba(246,198,134,0.24),transparent_24%),linear-gradient(155deg,#7f9c91_0%,#4f786b_25%,#1b5648_52%,#073f32_78%,#052d27_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(145deg,transparent_0%,transparent_22%,rgba(9,56,46,0.88)_23%,rgba(5,43,36,0.98)_48%,rgba(4,37,32,1)_100%)]" />
          <div className="absolute -left-[16%] top-[32%] h-56 w-[74%] rotate-[-10deg] rounded-[50%] bg-slate-950/18 blur-sm" />
          <div className="absolute -right-[15%] top-[40%] h-48 w-[62%] rotate-[8deg] rounded-[50%] bg-emerald-950/30 blur-sm" />

          <div className="relative flex min-h-[390px] flex-col p-7 sm:min-h-[470px] sm:p-10 lg:min-h-full lg:p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 text-lg font-black ring-1 ring-white/20 backdrop-blur">
                T
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100/80">
                  DSS Enterprises
                </p>
                <p className="text-base font-black tracking-wide text-white">THRIVE</p>
              </div>
            </div>

            <div className="mt-auto max-w-xl pt-16">
              <p className="font-serif text-2xl text-amber-50/90 sm:text-3xl">Welcome back.</p>
              <h1 className="mt-2 font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl">
                Your space is here.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-emerald-50/85 sm:text-lg">
                Check in, keep something moving, look at your money, or ask for support. Start wherever feels useful.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-gradient-to-b from-white to-[#f4f7f4] p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-7">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                Sign in to THRIVE
              </p>
              <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-slate-950">
                Pick up where you left off.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Use the email and password connected to your THRIVE account.
              </p>
            </div>

            {currentUser ? (
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-black">You&apos;re already signed in.</p>
                <p className="mt-1 break-words text-xs leading-5 text-emerald-800/80">{currentUser.email}</p>
              </div>
            ) : null}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-700 px-5 py-3.5 text-base font-black text-white shadow-lg shadow-emerald-950/10 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Working..." : "Sign in"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading || !email || !password}
                className="text-sm font-black text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create an account
              </button>

              {currentUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="text-sm font-black text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sign out
                </button>
              ) : null}
            </div>

            {message ? (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-7 rounded-2xl bg-[#f3f0e8] p-4 text-xs leading-5 text-slate-600">
              <p className="font-black uppercase tracking-wide text-[#8d6244]">Your privacy matters</p>
              <p className="mt-1">
                Sign-in is only for accessing your THRIVE account. Sensitive personal information should be entered only in the appropriate THRIVE areas after you sign in.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
