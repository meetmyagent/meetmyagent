"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STYLE_LABELS: Record<string, string> = {
  connector: "The Connector", analyst: "The Analyst", driver: "The Driver", supporter: "The Supporter",
  gut: "Trust Your Gut", researcher: "The Researcher", collaborator: "The Collaborator", independent: "Hands Off",
  calm: "The Calm One", communicator: "Over-Communicator", "problem-solver": "The Problem Solver", empath: "The Empath",
  sprint: "The Sprinter", marathon: "The Marathon Runner", "first-timer": "The Educator", adaptive: "The Chameleon",
};

function CompareContent() {
  const searchParams = useSearchParams();
  const slugs = searchParams.get("agents")?.split(",") || [];
  const session = searchParams.get("session") || "";
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("agents").select("*").in("slug", slugs);
      if (data) {
        const ordered = slugs.map(s => data.find(a => a.slug === s)).filter(Boolean);
        setAgents(ordered);
      }
      setLoading(false);
    }
    if (slugs.length > 0) load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#1a1918] flex items-center justify-center">
      <p className="text-white/40 text-sm">Loading comparison...</p>
    </div>
  );

  const rows = [
    { label: "Experience", key: (a: any) => a.years_exp ? a.years_exp + " yrs" : "—" },
    { label: "City", key: (a: any) => a.city || "—" },
    { label: "Communication", key: (a: any) => STYLE_LABELS[a.communication_style] || "—" },
    { label: "Decisions", key: (a: any) => STYLE_LABELS[a.decision_style] || "—" },
    { label: "Under stress", key: (a: any) => STYLE_LABELS[a.stress_response] || "—" },
    { label: "Pace", key: (a: any) => STYLE_LABELS[a.pace_style] || "—" },
    { label: "Specialties", key: (a: any) => a.client_tags?.slice(0, 2).join(", ") || "—" },
    { label: "Areas", key: (a: any) => a.area_tags?.slice(0, 2).join(", ") || "—" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-[#1a1918]">meet<span className="text-[#D85A30]">my</span>agent</a>
        <button onClick={() => window.history.back()} className="text-sm text-[#6b6a65] hover:text-[#1a1918]">← back</button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[#1a1918] mb-1">Agent comparison</h1>
          <p className="text-sm text-[#6b6a65]">tap an agent to compare</p>
        </div>

        {/* Mobile: tab selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 sm:hidden">
          {agents.map((agent, i) => (
            <button key={agent.id} onClick={() => setActiveAgent(i)}
              className={"flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all " + (activeAgent === i ? "bg-[#1a1918] border-[#1a1918] text-white" : "bg-white border-black/[0.08] text-[#6b6a65]")}>
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center text-xs font-medium flex-shrink-0">
                {agent.avatar_url ? <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" /> : agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              {agent.name?.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Mobile: single agent card view */}
        <div className="sm:hidden">
          {agents[activeAgent] && (
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center font-medium flex-shrink-0">
                    {agents[activeAgent].avatar_url ? <img src={agents[activeAgent].avatar_url} alt={agents[activeAgent].name} className="w-full h-full object-cover" /> : agents[activeAgent].name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-base font-medium text-[#1a1918]">{agents[activeAgent].name}</p>
                    <p className="text-xs text-[#9f9e99]">{agents[activeAgent].city}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-black/[0.04] last:border-0">
                      <span className="text-xs font-semibold text-[#9f9e99] uppercase tracking-wide">{row.label}</span>
                      <span className="text-sm text-[#1a1918] text-right max-w-[180px]">{row.key(agents[activeAgent])}</span>
                    </div>
                  ))}
                </div>
              </div>
              {agents[activeAgent].bio && (
                <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-2">bio</p>
                  <p className="text-sm text-[#6b6a65] leading-relaxed">{agents[activeAgent].bio}</p>
                </div>
              )}
              <a href={"/agents/" + agents[activeAgent].slug}
                className="block w-full py-3 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] text-white font-medium text-sm text-center">
                connect with {agents[activeAgent].name?.split(" ")[0]}
              </a>
            </div>
          )}
        </div>

        {/* Desktop: side by side */}
        <div className="hidden sm:block">
          <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden mb-6">
            <div className="grid border-b border-black/[0.06]" style={{gridTemplateColumns: `180px repeat(${agents.length}, 1fr)`}}>
              <div className="p-5 bg-[#f7f5f0]" />
              {agents.map(agent => (
                <div key={agent.id} className="p-5 border-l border-black/[0.06]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center font-medium flex-shrink-0">
                      {agent.avatar_url ? <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" /> : agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1918]">{agent.name}</p>
                      <p className="text-xs text-[#9f9e99]">{agent.city}</p>
                    </div>
                  </div>
                  <a href={"/agents/" + agent.slug} target="_blank" className="text-xs text-[#D85A30] font-medium">view profile →</a>
                </div>
              ))}
            </div>
            {rows.map((row, i) => (
              <div key={i} className={"grid border-b border-black/[0.04] last:border-0 " + (i % 2 === 0 ? "bg-white" : "bg-[#fafaf8]")}
                style={{gridTemplateColumns: `180px repeat(${agents.length}, 1fr)`}}>
                <div className="px-5 py-3.5 flex items-center">
                  <span className="text-xs font-semibold text-[#9f9e99] uppercase tracking-wide">{row.label}</span>
                </div>
                {agents.map(agent => (
                  <div key={agent.id} className="px-5 py-3.5 border-l border-black/[0.04] flex items-center">
                    <span className="text-sm text-[#1a1918]">{row.key(agent)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="grid gap-4" style={{gridTemplateColumns: `repeat(${agents.length}, 1fr)`}}>
            {agents.map(agent => (
              <div key={agent.id} className="bg-white border border-black/[0.08] rounded-2xl p-5">
                {agent.bio && <p className="text-sm text-[#6b6a65] leading-relaxed mb-4">{agent.bio}</p>}
                <a href={"/agents/" + agent.slug}
                  className="block w-full py-2.5 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] text-white font-medium text-sm text-center">
                  connect with {agent.name?.split(" ")[0]}
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-[#9f9e99]">built in Austin, TX · questions? <a href="mailto:hello@meetmyagent.app" className="underline hover:text-[#6b6a65] transition-colors">hello@meetmyagent.app</a></p>
      </footer>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
