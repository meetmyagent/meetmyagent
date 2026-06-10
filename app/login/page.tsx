"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/agents/dashboard`,
      },
    });

    if (error) {
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-6">📬</div>
          <h1 className="text-2xl font-medium text-white mb-3">
            Check your email
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            We sent a magic link to <span className="text-white">{email}</span>.
            Click it and you'll land straight on your dashboard — no password needed.
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
        <h1 className="text-3xl font-medium text-white mb-2">
          Agent sign in
        </h1>
        <p className="text-white/50 text-sm mb-8">
          Enter your email and we'll send you a magic link. No password needed.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="w-full px-4 py-3 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-50 text-white font-medium text-sm transition-colors"
          >
            {status === "loading" ? "Sending..." : "Send magic link →"}
          </button>
          {status === "error" && (
            <p className="text-red-400 text-xs text-center">
              Something went wrong — try again.
            </p>
          )}
        </form>
        <p className="text-white/20 text-xs text-center mt-6">
          Not an agent yet?{" "}
          <a href="/#join" className="underline hover:text-white/40 transition-colors">
            Join the waitlist
          </a>
        </p>
      </div>
    </div>
  );
}