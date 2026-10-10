"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;
        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setChecking(false);
        }
        if (event === "SIGNED_OUT") {
          setReady(false);
          setChecking(false);
        }
      },
    );

    // Supabase can exchange the recovery URL before this page subscribes.
    // An authenticated session permits updating only that user's password.
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError("This recovery link could not be verified. Request a new one.");
      setReady(Boolean(data.session));
      setChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 12) {
      setError("Choose a password with at least 12 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError("Could not update your password. The link may have expired. Please request a new one.");
      return;
    }
    setPassword("");
    setConfirm("");
    setComplete(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071b22] px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/15 bg-[#11313a] p-6 shadow-2xl sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b8e3d7]">THRIVE account recovery</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Set a new password.</h1>
        {checking ? (
          <p className="mt-6 text-white/80" role="status">Checking your recovery link...</p>
        ) : complete ? (
          <div className="mt-6 space-y-5">
            <p role="status">Your password has been updated. You can return to THRIVE.</p>
            <Link href="/living-signal/today" className="block rounded-xl bg-[#0d7f6f] p-3 text-center font-bold">Enter THRIVE</Link>
          </div>
        ) : !ready ? (
          <div className="mt-6 space-y-5">
            <p>We could not verify an active recovery session. Your link may have expired or already been used.</p>
            <Link href="/login" className="inline-block font-bold text-[#b8e3d7] underline underline-offset-4">Return to login and request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              New password
              <input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)}
                className="min-h-12 rounded-xl border border-white/30 bg-black/25 px-4 text-white" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Confirm new password
              <input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e => setConfirm(e.target.value)}
                className="min-h-12 rounded-xl border border-white/30 bg-black/25 px-4 text-white" />
            </label>
            {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
            <button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-[#0d7f6f] px-4 font-bold disabled:opacity-50">
              {busy ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
        {error && !ready && <p role="alert" className="mt-4 text-sm text-rose-200">{error}</p>}
        <p className="mt-6 text-xs text-white/55">Your THRIVE access permissions do not change when you reset your password.</p>
      </section>
    </main>
  );
}
