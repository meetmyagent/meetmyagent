"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, city }),
      });
      if (res.status === 201) {
        setStatus("success");
      } else if (res.status === 200) {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-3">🎉</div>
        <p className="text-white font-medium text-lg mb-1">You are in as a founding agent.</p>
        <p className="text-white/60 text-sm">Check your email — we sent you a magic link to build your profile right now. Takes about 10 minutes.</p>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
        <p className="text-white font-medium text-lg mb-1">You are already on the list</p>
        <p className="text-white/60 text-sm">We will be in touch soon!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Your first name (required)" value={name} onChange={e => setName(e.target.value)} required
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm" />
        <input type="text" placeholder="City (e.g. Austin)" value={city} onChange={e => setCity(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm" />
        <button type="submit" disabled={status === "loading" || !email || !name}
          className="sm:w-auto w-full px-6 py-3 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-50 text-white font-medium text-sm transition-colors whitespace-nowrap">
          {status === "loading" ? "Joining..." : "Join as founding agent"}
        </button>
      </div>
      {status === "error" && <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>}
      <p className="text-white/30 text-xs">Free during launch. No credit card. We will reach out personally.</p>
    </form>
  );
}