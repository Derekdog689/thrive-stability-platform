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
    setMessage("Login successful. Redirecting to dashboard...");
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
      "Sign-up request submitted. Check the email inbox if confirmation is required.",
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
    <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-3xl font-black">THRIVE Login</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Controlled Supabase email/password authentication test. Use mock/test
            accounts only during early development.
          </p>
        </div>

        <div
          className={`mb-5 rounded-2xl border p-4 text-sm font-semibold ${
            currentUser
              ? "border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border-amber-100 bg-amber-50 text-amber-800"
          }`}
        >
          <p>
            Auth status:{" "}
            <span className="font-black">
              {currentUser ? "Authenticated" : "Not signed in"}
            </span>
          </p>

          {currentUser ? (
            <div className="mt-3 space-y-1 break-words text-xs leading-5">
              <p>
                <span className="font-black">Email:</span> {currentUser.email}
              </p>
              <p>
                <span className="font-black">User ID:</span> {currentUser.id}
              </p>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
              placeholder="test@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Working..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading || !email || !password}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign up
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign out
          </button>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-200">
          <p className="font-bold text-emerald-300">Security rule</p>
          <p className="mt-1">
            This page tests authentication only. Do not enter real beneficiary,
            trust, clinical, financial, or private case data.
          </p>
        </div>
      </section>
    </main>
  );
}