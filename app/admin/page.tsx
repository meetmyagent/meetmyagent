"use client";
import { useState } from "react";

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
    setLoading(true);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setAgents(data.agents);
    setWaitlist(data.waitlist);
    setConnections(data.connections);
    setReviews(data.reviews);
    setAuthed(true);
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
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#D85A30] text-white font-medium text-sm">
              {loading ? "signing in..." : "sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-medium text-[#1a1918] mb-6">admin</h1>
        <div className="flex gap-2 mb-6">
          {["agents","waitlist","connections","reviews"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-4 py-2 rounded-lg text-sm font-medium border transition-all " + (tab === t ? "bg-[#1a1918] text-white border-[#1a1918]" : "bg-white text-[#6b6a65] border-black/[0.08]")}>
              {t} ({t === "agents" ? agents.length : t === "waitlist" ? waitlist.length : t === "connections" ? connections.length : reviews.length})
            </button>
          ))}
        </div>
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-auto">
          <table className="w-full text-sm">
            <tbody>
              {(tab === "agents" ? agents : tab === "waitlist" ? waitlist : tab === "connections" ? connections : reviews).map((row: any) => (
                <tr key={row.id} className="border-b border-black/[0.06] last:border-0">
                  {Object.entries(row).slice(0, 6).map(([k, v]) => (
                    <td key={k} className="px-4 py-3 text-[#6b6a65]">
                      <span className="text-[#9f9e99] text-xs block">{k}</span>
                      {String(v ?? "").slice(0, 50)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
