"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "confirm" ? "That confirmation link didn't work. Try logging in." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        router.push(dest);
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(dest)}`,
        },
      });
      if (error) setError(error.message);
      else if (data.session) {
        router.push(dest);
        router.refresh();
      } else {
        setNotice("Check your email for a link to confirm your account, then log in.");
      }
    }
    setBusy(false);
  }

  const field =
    "w-full rounded-xl border-2 border-violet-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500";

  return (
    <form onSubmit={submit} className="mx-auto mt-10 w-full max-w-sm space-y-4 rounded-3xl border-2 border-violet-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-extrabold text-violet-700">
        {mode === "in" ? "Welcome back" : "Create your account"}
      </h1>
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}
      <button
        disabled={busy}
        className="w-full rounded-xl bg-violet-600 py-2.5 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {busy ? "Please wait…" : mode === "in" ? "Log in" : "Sign up"}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setError(null);
          setNotice(null);
        }}
        className="w-full text-center text-sm text-violet-700 underline"
      >
        {mode === "in" ? "New here? Create an account" : "Already have an account? Log in"}
      </button>
    </form>
  );
}
