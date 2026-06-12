"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error" | "wrong_password">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/agents/dashboard` },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const supabase = createClient();

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/agents/dashboard` },
      });
      if (error) { setStatus("error"); } else { setStatus("sent"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login")) {
          setStatus("wrong_password");
          setErrorMsg("Wrong email or password. Try again or use a magic link.");
        } else {
          setStatus("error");
          setErrorMsg("Something went wrong. Try again.");
        }
      } else {
        window.location.href = "/agents/dashboard";
      }
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-6">📬</div>
          <h1 className="text-2xl font-medium text-white mb-3">Check your email</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            We sent a magic link to <span className="text-white">{email}</span>.
            Click it and you'll land straight on your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1918] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="mb-10">
          <a href="/" className="text-xl font-medium text-white">
            meet<span className="text-[#D85A30]">my</span>agent
          </a>
        </div>
        <h1 className="text-3xl font-medium text-white mb-2">Agent sign in</h1>
        <p className="text-white/50 text-sm mb-8">Sign in to your dashboard.</p>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-[#1a1918] font-medium text-sm hover:bg-white/90 transition-colors mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/30 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode("password"); setStatus("idle"); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "password" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}
          >
            Password
          </button>
          <button
            onClick={() => { setMode("magic"); setStatus("idle"); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "magic" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}
          >
            Magic link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm"
          />
          {mode === "password" && (
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm"
            />
          )}
          <button
            type="submit"
            disabled={status === "loading" || !email || (mode === "password" && !password)}
            className="w-full px-4 py-3 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-50 text-white font-medium text-sm transition-colors"
          >
            {status === "loading" ? "Signing in..." : mode === "password" ? "Sign in →" : "Send magic link →"}
          </button>
          {(status === "error" || status === "wrong_password") && (
            <p className="text-red-400 text-xs text-center">{errorMsg}</p>
          )}
          {mode === "password" && (
            <p className="text-white/30 text-xs text-center">
              Forgot your password?{" "}
              <button type="button" onClick={() => setMode("magic")} className="underline hover:text-white/50 transition-colors">
                use a magic link instead
              </button>
            </p>
          )}
        </form>

        <p className="text-white/20 text-xs text-center mt-6">
          Not an agent yet?{" "}
          <a href="/#join" className="underline hover:text-white/40 transition-colors">Join free</a>
        </p>
      </div>
    </div>
  );
}
