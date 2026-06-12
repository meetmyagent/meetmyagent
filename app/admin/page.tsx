"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("agents");
  const [agents, setAgents] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setAuthed(true);
      loadData();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Could not sign in");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setPassword("");
  }

  async function loadData() {
    setLoading(true);
    const supabase = createClient();
    const [a, w, c, r] = await Promise.all([
      supabase.from("agents").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
      supabase.from("connections").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);
    setAgents(a.data || []);
    setWaitlist(w.data || []);
    setConnections(c.data || []);
    setReviews(r.data || []);
    setLoading(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-medium text-white mb-8">admin</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm" />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" className="w-full py-3 rounded-xl bg-[#D85A30] text-white font-medium text-sm">sign in</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "agents", label: "agents", count: agents.length },
    { id: "waitlist", label: "waitlist", count: waitlist.length },
    { id: "connections", label: "connections", count: connections.length },
    { id: "reviews", label: "reviews", count: reviews.length },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <nav className="bg-[#1a1918] px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-white">meet<span className="text-[#D85A30]">my</span>agent <span className="text-white/30 text-sm ml-2">admin</span></a>
        <div className="flex items-center gap-4">
          <button onClick={loadData} className="text-xs text-white/40 hover:text-white/60">refresh</button>
          <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white/60">sign out</button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {tabs.map(t => (
            <div key={t.id} className="bg-white border border-black/[0.08] rounded-2xl p-5 text-center cursor-pointer" onClick={() => setTab(t.id)}>
              <div className="text-3xl font-medium text-[#1a1918]">{t.count}</div>
              <div className="text-sm text-[#6b6a65] mt-1">{t.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (tab === t.id ? "bg-[#1a1918] text-white" : "bg-white text-[#6b6a65] border border-black/[0.08]")}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        {loading && <p className="text-[#6b6a65] text-sm">Loading...</p>}
        {tab === "agents" && (
          <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#f7f5f0]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">city</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">tags</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">joined</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">profile</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id} className="border-b border-black/[0.04] hover:bg-[#f7f5f0]">
                    <td className="px-5 py-3 font-medium text-[#1a1918]">{a.name || <span className="text-[#9f9e99]">no name</span>}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{a.city || "-"}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{a.email || "-"}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{(a.style_tags?.length || 0) + (a.area_tags?.length || 0) + (a.client_tags?.length || 0)} tags</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">{a.slug ? <a href={"/agents/" + a.slug} target="_blank" className="text-[#D85A30] text-xs font-medium">view</a> : <span className="text-[#9f9e99] text-xs">incomplete</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "waitlist" && (
          <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#f7f5f0]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">city</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">signed up</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map(w => (
                  <tr key={w.id} className="border-b border-black/[0.04] hover:bg-[#f7f5f0]">
                    <td className="px-5 py-3 font-medium text-[#1a1918]">{w.name || <span className="text-[#9f9e99]">no name</span>}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{w.email}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{w.city || "-"}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{new Date(w.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "connections" && (
          <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#f7f5f0]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">consumer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">match</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">date</th>
                </tr>
              </thead>
              <tbody>
                {connections.map(c => (
                  <tr key={c.id} className="border-b border-black/[0.04] hover:bg-[#f7f5f0]">
                    <td className="px-5 py-3 font-medium text-[#1a1918]">{c.consumer_name || "-"}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{c.consumer_email || "-"}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{c.consumer_phone || "-"}</td>
                    <td className="px-5 py-3"><span className="text-[#D85A30] font-medium">{c.match_score}%</span></td>
                    <td className="px-5 py-3 text-[#6b6a65]">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "reviews" && (
          <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#f7f5f0]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">client</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">rating</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">address</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#9f9e99] uppercase">date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} className="border-b border-black/[0.04] hover:bg-[#f7f5f0]">
                    <td className="px-5 py-3 font-medium text-[#1a1918]">{r.client_name || "-"}</td>
                    <td className="px-5 py-3">{r.rating ? "★".repeat(r.rating) : <span className="text-[#9f9e99]">pending</span>}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{r.address || "-"}</td>
                    <td className="px-5 py-3">{r.completed_at ? <span className="text-xs bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full font-medium">reviewed</span> : <span className="text-xs bg-[#FAEEDA] text-[#854F0B] px-2 py-0.5 rounded-full font-medium">pending</span>}</td>
                    <td className="px-5 py-3 text-[#6b6a65]">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
