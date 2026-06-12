"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const BUYER_TYPES: Record<string, { color: string; bg: string; desc: string; icon: string }> = {
  "The Fast Mover": { color: "text-[#993C1D]", bg: "bg-[#FAECE7] border-[#D85A30]", desc: "You know what you want and you move when you see it. You need an agent who can keep up, communicate fast, and isn't afraid to make a call.", icon: "⚡" },
  "The Thoughtful Planner": { color: "text-[#185FA5]", bg: "bg-[#E6F1FB] border-[#378ADD]", desc: "You take your time, ask good questions, and want to fully understand every step. You need an agent who educates without pressure.", icon: "📚" },
  "The Collaborative Partner": { color: "text-[#0F6E56]", bg: "bg-[#E1F5EE] border-[#1D9E75]", desc: "You want a real partnership with your agent. You think out loud, want their honest opinion, and make better decisions together than alone.", icon: "🤝" },
  "The Independent Decision Maker": { color: "text-[#534AB7]", bg: "bg-[#EEEDFE] border-[#534AB7]", desc: "You do your research, know what you want, and need an agent who respects that. Give you the data and let you decide.", icon: "🔍" },
};

export default function ConsumerDashboard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [tab, setTab] = useState("overview");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/consumer-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      setError("No profile found for that email. Take the quiz first!");
      setLoading(false);
      return;
    }
    const json = await res.json();
    const data = json.profile;
    const supabase = createClient();
    setProfile(data);

    if (data.session_id) {
      const { data: quiz } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("session_id", data.session_id)
        .single();

      if (quiz?.derived_tags) {
        const { data: allAgents } = await supabase
          .from("agents")
          .select("*")
          .not("name", "is", null);

        if (allAgents) {
          const scored = allAgents.map(agent => {
            const allTags = [...(agent.style_tags || []), ...(agent.area_tags || []), ...(agent.client_tags || [])];
            const matches = quiz.derived_tags.filter((tag: string) => allTags.includes(tag));
            const score = Math.round((matches.length / quiz.derived_tags.length) * 100);
            return { ...agent, matchScore: agent.is_pro ? Math.min(score + 5, 100) : score };
          }).filter(a => a.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
          setAgents(scored);
        }

        const city = quiz.city;
        if (city) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/neighborhoods?city=eq.${encodeURIComponent(city)}&select=*&limit=3`,
            { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` } }
          );
          if (res.ok) setNeighborhoods(await res.json());
        }
      }
    }
    setLoading(false);
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <a href="/" className="block text-center text-xl font-medium text-white mb-12">
            meet<span className="text-[#D85A30]">my</span>agent
          </a>
          <h1 className="text-3xl font-medium text-white mb-2 text-center">Welcome back</h1>
          <p className="text-white/40 text-sm mb-8 text-center">Enter your email to access your saved matches and buyer profile.</p>
          <form onSubmit={handleLookup} className="flex flex-col gap-3">
            <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm" />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading || !email}
              className="w-full py-3.5 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-40 text-white font-medium text-sm">
              {loading ? "Looking up..." : "access my dashboard"}
            </button>
          </form>
          <p className="text-center text-xs text-white/20 mt-4">No password needed — just your email</p>
          <p className="text-center text-xs text-white/20 mt-2">New here? <a href="/find" className="text-[#D85A30]">take the quiz first</a></p>
        </div>
      </div>
    );
  }

  const buyerType = profile.buyer_type ? BUYER_TYPES[profile.buyer_type] : null;
  const firstName = profile.name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <nav className="bg-[#1a1918] px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-white">meet<span className="text-[#D85A30]">my</span>agent</a>
        <div className="flex items-center gap-4">
          <a href="/find" className="text-xs text-white/40 hover:text-white/60">retake quiz</a>
          <button onClick={() => setProfile(null)} className="text-xs text-white/40 hover:text-white/60">sign out</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-[#1a1918] rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D85A30]/10 rounded-full -translate-y-16 translate-x-16" />
          <p className="text-white/40 text-sm mb-1">welcome back</p>
          <h1 className="text-2xl font-medium text-white mb-4">{firstName ? "Hey " + firstName + "! 👋" : "Hey there! 👋"}</h1>
          {buyerType && (
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <span className="text-lg">{buyerType.icon}</span>
              <span className="text-white text-sm font-medium">{profile.buyer_type}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {["overview", "my matches", "neighborhoods"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (tab === t ? "bg-[#1a1918] text-white" : "bg-white text-[#6b6a65] border border-black/[0.08]")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            {buyerType && (
              <div className={"border rounded-2xl p-6 " + buyerType.bg}>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-2">your buyer personality</p>
                <h2 className={"text-2xl font-medium mb-2 " + buyerType.color}>{profile.buyer_type}</h2>
                <p className="text-sm text-[#6b6a65] leading-relaxed">{buyerType.desc}</p>
              </div>
            )}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
              <p className="text-sm font-medium text-[#1a1918] mb-1">Your top match</p>
              {agents[0] ? (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center font-medium flex-shrink-0">
                      {agents[0].avatar_url
                        ? <img src={agents[0].avatar_url} alt={agents[0].name} className="w-full h-full object-cover" />
                        : agents[0].name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1918]">{agents[0].name}</p>
                      <p className="text-xs text-[#9f9e99]">{agents[0].city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-medium text-[#D85A30]">{agents[0].matchScore}%</div>
                    <div className="text-xs text-[#9f9e99]">match</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6b6a65] mt-2">Take the quiz to see your matches.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a href={"/find/results?session=" + profile.session_id}
                className="bg-[#D85A30] rounded-2xl p-5 text-center hover:bg-[#993C1D] transition-colors">
                <p className="text-white font-medium text-sm mb-1">see all matches</p>
                <p className="text-white/60 text-xs">jump back to your results</p>
              </a>
              <a href="/find" className="bg-white border border-black/[0.08] rounded-2xl p-5 text-center hover:border-black/20 transition-colors">
                <p className="text-[#1a1918] font-medium text-sm mb-1">retake quiz</p>
                <p className="text-[#9f9e99] text-xs">update your preferences</p>
              </a>
            </div>
          </div>
        )}

        {tab === "my matches" && (
          <div className="flex flex-col gap-4">
            {agents.length === 0 ? (
              <div className="bg-white border border-black/[0.08] rounded-2xl p-8 text-center">
                <p className="text-[#1a1918] font-medium mb-2">No matches yet</p>
                <p className="text-[#6b6a65] text-sm mb-4">Take the quiz to get matched with agents.</p>
                <a href="/find" className="inline-flex px-6 py-3 rounded-xl bg-[#D85A30] text-white font-medium text-sm">take the quiz</a>
              </div>
            ) : agents.map(agent => (
              <div key={agent.id} className="bg-white border border-black/[0.08] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center font-medium flex-shrink-0">
                      {agent.avatar_url
                        ? <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                        : agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1918]">{agent.name}</p>
                      <p className="text-xs text-[#9f9e99]">{agent.years_exp} yrs · {agent.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-medium text-[#D85A30]">{agent.matchScore}%</div>
                    <div className="text-xs text-[#9f9e99]">match</div>
                  </div>
                </div>
                {agent.bio && <p className="text-xs text-[#6b6a65] leading-relaxed mb-3">{agent.bio.slice(0, 120)}...</p>}
                <div className="flex gap-2">
                  <a href={"/agents/" + agent.slug} className="flex-1 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#6b6a65] text-center hover:border-black/20">view profile</a>
                  <a href={"/find/results?session=" + profile.session_id} className="flex-1 py-2.5 rounded-xl bg-[#1a1918] text-white text-xs font-medium text-center">connect</a>
                </div>
              </div>
            ))}
            <a href={"/find/results?session=" + profile.session_id}
              className="text-center text-sm text-[#D85A30] font-medium py-3">
              see all matches →
            </a>
          </div>
        )}

        {tab === "neighborhoods" && (
          <div className="flex flex-col gap-4">
            {neighborhoods.length === 0 ? (
              <div className="bg-white border border-black/[0.08] rounded-2xl p-8 text-center">
                <p className="text-[#1a1918] font-medium mb-2">No neighborhood guides yet for your area</p>
                <p className="text-[#6b6a65] text-sm mb-4">We are adding guides for more cities every week.</p>
                <a href="/neighborhoods" className="inline-flex px-6 py-3 rounded-xl bg-[#D85A30] text-white font-medium text-sm">browse all neighborhoods</a>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#6b6a65]">Neighborhood guides near your search area</p>
                {neighborhoods.map((n: any) => (
                  <a key={n.id} href={"/neighborhoods/" + n.slug}
                    className="bg-white border border-black/[0.08] rounded-2xl p-5 hover:border-[#D85A30]/40 transition-all">
                    <h3 className="text-base font-medium text-[#1a1918] mb-1">{n.name}</h3>
                    <p className="text-xs text-[#6b6a65] mb-2">{n.vibe}</p>
                    {n.price_range && <p className="text-xs font-medium text-[#D85A30]">{n.price_range}</p>}
                  </a>
                ))}
                <a href="/neighborhoods" className="text-center text-sm text-[#D85A30] font-medium py-3">browse all neighborhoods →</a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
