"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getBuyerReadinessScore(tags: string[]) {
  if (tags.includes("direct & fast-moving") && tags.includes("responds within the hour")) return { score: 95, label: "Ready to move now", color: "text-[#0F6E56] bg-[#E1F5EE] border-[#1D9E75]" };
  if (tags.includes("direct & fast-moving")) return { score: 80, label: "Highly motivated", color: "text-[#185FA5] bg-[#E6F1FB] border-[#378ADD]" };
  if (tags.includes("repeat buyers")) return { score: 75, label: "Experienced buyer", color: "text-[#185FA5] bg-[#E6F1FB] border-[#378ADD]" };
  if (tags.includes("investors")) return { score: 70, label: "Investment focused", color: "text-[#534AB7] bg-[#EEEDFE] border-[#534AB7]" };
  if (tags.includes("first-time buyers")) return { score: 60, label: "First-time buyer", color: "text-[#854F0B] bg-[#FAEEDA] border-[#E8A020]" };
  if (tags.includes("patient, no pressure")) return { score: 40, label: "Early stage", color: "text-[#6b6a65] bg-[#f7f5f0] border-black/[0.08]" };
  return { score: 50, label: "Actively looking", color: "text-[#854F0B] bg-[#FAEEDA] border-[#E8A020]" };
}

function generateMatchExplanation(agent: any, consumerTags: string[]) {
  const reasons = [];
  if (consumerTags.includes("mostly text") && agent.style_tags?.includes("mostly text")) reasons.push("you both prefer texting over calls");
  else if (consumerTags.includes("phone-first") && agent.style_tags?.includes("phone-first")) reasons.push("you both love talking things through");
  else if (consumerTags.includes("responds within the hour") && agent.style_tags?.includes("responds within the hour")) reasons.push("they respond fast — just like you need");
  if (consumerTags.includes("direct & fast-moving") && agent.style_tags?.includes("direct & fast-moving")) reasons.push("you both move quickly when the right opportunity shows up");
  else if (consumerTags.includes("patient, no pressure") && agent.style_tags?.includes("patient, no pressure")) reasons.push("they are patient and won't rush you");
  if (consumerTags.includes("will tell you to walk away") && agent.style_tags?.includes("will tell you to walk away")) reasons.push("they will tell you when a deal is bad");
  else if (consumerTags.includes("data-driven") && agent.style_tags?.includes("data-driven")) reasons.push("they lead with data and market analysis");
  if (consumerTags.includes("first-time buyers") && agent.client_tags?.includes("first-time buyers")) reasons.push("they specialize in first-time buyers");
  else if (consumerTags.includes("investors") && agent.client_tags?.includes("investors")) reasons.push("they work with investors regularly");
  else if (consumerTags.includes("luxury") && agent.client_tags?.includes("luxury")) reasons.push("they specialize in luxury properties");
  const areaMatches = consumerTags.filter(tag => agent.area_tags?.includes(tag));
  if (areaMatches.length > 0) reasons.push("they know " + areaMatches[0] + " well");
  if (reasons.length === 0) return null;
  return "Matched because " + reasons.slice(0, 2).join(" and ") + ".";
}

function scoreAgent(agent: any, consumerTags: string[]) {
  const allTags = [
    ...(agent.style_tags || []),
    ...(agent.area_tags || []),
    ...(agent.client_tags || []),
    ...(agent.designations || []),
  ];
  const matches = consumerTags.filter(tag => allTags.includes(tag));
  const score = Math.round((matches.length / consumerTags.length) * 100);
  // Boost for designation matches
  const designationMatches = consumerTags.filter(tag => (agent.designations || []).includes(tag)).length;
  const designationBoost = designationMatches * 5;
  return Math.min((agent.is_pro ? score + 5 : score) + designationBoost, 100);
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [consumerTags, setConsumerTags] = useState<string[]>([]);
  const [buyerType, setBuyerType] = useState<{title: string, desc: string, color: string, bg: string} | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [consumerName, setConsumerName] = useState("");
  const [consumerEmail, setConsumerEmail] = useState("");
  const [consumerPhone, setConsumerPhone] = useState("");
  const [compareList, setCompareList] = useState<any[]>([]);
  const [agentIntro, setAgentIntro] = useState<Record<string, string>>({});
  const [introLoading, setIntroLoading] = useState<string | null>(null);
  const [showPersonalityDetail, setShowPersonalityDetail] = useState(false);
  const [areaFilter, setAreaFilter] = useState("all");

  useEffect(() => {
    const connectSlug = searchParams.get("connect");
    if (connectSlug && agents.length > 0) {
      const agent = agents.find(a => a.slug === connectSlug);
      if (agent) setShowForm(agent.id);
    }
  }, [agents, searchParams]);
  function stripMarkdown(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
  }
  const [saveEmail, setSaveEmail] = useState("");
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: quiz } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (!quiz) { setLoading(false); return; }
      const tags = quiz.derived_tags || [];
      setConsumerTags(tags);

      // Derive buyer personality type
      const isFast = tags.includes("direct & fast-moving") || tags.includes("responds within the hour");
      const isPatient = tags.includes("patient, no pressure") || tags.includes("low-key, low stress");
      const isEducational = tags.includes("very educational");
      const isPhone = tags.includes("phone-first");

      let bt;
      if (isFast && isPhone) {
        bt = { title: "The Fast Mover", desc: "You know what you want and you move when you see it. You need an agent who can keep up, communicate fast, and isn't afraid to make a call.", color: "text-[#993C1D]", bg: "bg-[#FAECE7] border-[#D85A30]" };
      } else if (isPatient && isEducational) {
        bt = { title: "The Thoughtful Planner", desc: "You take your time, ask good questions, and want to fully understand every step. You need an agent who educates without pressure — whether you're buying or selling.", color: "text-[#185FA5]", bg: "bg-[#E6F1FB] border-[#378ADD]" };
      } else if (isPhone && !isFast) {
        bt = { title: "The Collaborative Partner", desc: "You want a real partnership with your agent. Whether buying or selling, you think out loud, want honest opinions, and make better decisions together than alone.", color: "text-[#0F6E56]", bg: "bg-[#E1F5EE] border-[#1D9E75]" };
      } else {
        bt = { title: "The Independent Decision Maker", desc: "You've done your homework. Whether pricing your home or making an offer, you need an agent who respects that and gives you data without trying to steer you.", color: "text-white", bg: "bg-[#1a1918] border-white/20" };
      }
      setBuyerType(bt);
      await supabase.from("quiz_responses").update({ buyer_type: bt.title }).eq("session_id", sessionId);

      const isCommercial = quiz.consumer_type === "commercial";

      let agentQuery = supabase.from("agents").select("*").not("name", "is", null);
      if (isCommercial) {
        agentQuery = agentQuery.in("agent_type", ["commercial", "both"]);
      } else {
        agentQuery = agentQuery.in("agent_type", ["residential", "both", null]);
      }
      const { data: allAgents } = await agentQuery;

      if (allAgents) {
        const scored = allAgents
          .map(agent => ({ ...agent, matchScore: scoreAgent(agent, quiz.derived_tags || []) }))
          
          .sort((a, b) => b.matchScore - a.matchScore);
        setAgents(scored);
      }
      setLoading(false);
      if (quiz.derived_tags && quiz.city) {
        setAiLoading(true);
        const aiRes = await fetch("/api/ai-neighborhood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consumerTags: quiz.derived_tags, city: quiz.city, buyerType: quiz.buyer_type }),
        });
        const aiData = await aiRes.json();
        if (aiData.recommendation) setAiRecommendation(aiData.recommendation);
        setAiLoading(false);
      }
    }
    if (sessionId) load();
  }, [sessionId]);

  function toggleCompare(agent: any) {
    setCompareList(prev => {
      if (prev.find(a => a.id === agent.id)) return prev.filter(a => a.id !== agent.id);
      if (prev.length >= 3) return prev;
      return [...prev, agent];
    });
  }

  async function fetchAgentIntro(agent: any) {
    if (agentIntro[agent.id]) return;
    setIntroLoading(agent.id);
    try {
      const res = await fetch("/api/ai-agent-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, consumerTags, buyerType: buyerType?.title }),
      });
      const data = await res.json();
      if (data.intro) setAgentIntro(prev => ({ ...prev, [agent.id]: data.intro }));
    } catch {}
    setIntroLoading(null);
  }

  async function handleConnect(agent: any) {
    if (!consumerName || !consumerEmail) return;
    setConnecting(agent.id);

    const res = await fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: agent.id,
        agentName: agent.name,
        agentEmail: agent.email,
        consumerName,
        consumerEmail,
        consumerPhone,
        matchScore: agent.matchScore,
        buyerType: buyerType?.title || null,
        readinessScore: getBuyerReadinessScore(consumerTags)?.label || null,
        matchExplanation: generateMatchExplanation(agent, consumerTags) || null,
        consumerTags: consumerTags,
      }),
    });
    
    

    setConnected([...connected, agent.id]);
    setConnecting(null);
    setShowForm(null);
    setConsumerName("");
    setConsumerEmail("");
    setConsumerPhone("");
  }

  async function handleSaveResults() {
    if (!saveEmail) return;
    setSaving(true);
    await fetch("/api/consumer-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: saveEmail,
        name: saveName,
        buyerType: buyerType?.title || null,
        readinessScore: getBuyerReadinessScore(consumerTags)?.label || null,
        consumerTags: consumerTags,
        sessionId,
      }),
    });
    setSaved(true);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-white/60 text-sm">Finding your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] overflow-x-hidden">
      <nav className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-[#1a1918]">
          meet<span className="text-[#D85A30]">my</span>agent
        </a>
        <a href="/find" className="text-sm text-[#D85A30] font-medium">retake quiz</a>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-medium text-[#1a1918] mb-2">
            {agents.length > 0 ? agents.length + " agent" + (agents.length > 1 ? "s" : "") + " matched" : "No matches yet"}
          </h1>
          <p className="text-[#6b6a65] text-sm">
            {agents.length > 0 ? "ranked by how well they fit your style" : "We are still onboarding agents — check back soon!"}
          </p>
        </div>

        {buyerType && (
          <div className={"border rounded-2xl p-6 mb-6 " + buyerType.bg}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99]">your buyer personality</p>
              {(() => {
                const readiness = getBuyerReadinessScore(consumerTags);
                return (
                  <span className={"text-xs font-medium px-3 py-1 rounded-full border " + readiness.color}>
                    {readiness.label}
                  </span>
                );
              })()}
            </div>
            <h2 className={"text-2xl font-medium mb-2 " + buyerType.color}>{buyerType.title}</h2>
            <p className="text-sm text-[#6b6a65] leading-relaxed">{buyerType.desc}</p>
          </div>
        )}

        {aiRecommendation && (
          <div className="bg-[#1a1918] rounded-2xl p-5 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D85A30] mb-3">AI neighborhood advisor</p>
            <p className="text-white/80 text-sm leading-relaxed">{stripMarkdown(aiRecommendation)}</p>
            <a href="/neighborhoods" className="inline-flex items-center gap-1 mt-3 text-xs text-[#D85A30] font-medium">explore neighborhood guides →</a>
          </div>
        )}

        {consumerTags.length > 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-3">your vibe</p>
            <div className="flex flex-wrap gap-2">
              {consumerTags.map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {agents.length === 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🏗️</div>
            <h2 className="text-lg font-medium text-[#1a1918] mb-2">Agents are being onboarded now</h2>
            <p className="text-[#6b6a65] text-sm mb-6">We launched recently and are personally onboarding agents. Check back in a few days!</p>
            <a href="/#join" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D85A30] text-white font-medium text-sm">
              get notified when agents are live
            </a>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {(() => {
            const states = [...new Set(agents.flatMap(a => a.area_tags || []).map(tag => {
              if (["Austin","Cedar Park","Round Rock","Leander","Pflugerville","Georgetown","Bee Cave","Dripping Springs","Kyle","Buda","Manor","Mueller","South Austin","North Austin","East Austin","West Austin","Dallas","Fort Worth","Plano","Houston","San Antonio"].includes(tag)) return "Texas";
              if (["Chicago","Naperville","Evanston","Oak Park"].includes(tag)) return "Illinois";
              if (["Nashville","Brentwood","Franklin","Memphis"].includes(tag)) return "Tennessee";
              if (["Denver","Boulder","Colorado Springs"].includes(tag)) return "Colorado";
              if (["Phoenix","Scottsdale","Tempe","Mesa"].includes(tag)) return "Arizona";
              if (["Charlotte","Raleigh","Durham"].includes(tag)) return "North Carolina";
              if (["Tampa","Miami","Orlando","Jacksonville"].includes(tag)) return "Florida";
              if (["Atlanta","Buckhead","Alpharetta"].includes(tag)) return "Georgia";
              if (["Seattle","Bellevue","Tacoma"].includes(tag)) return "Washington";
              if (["Portland","Bend"].includes(tag)) return "Oregon";
              if (["Los Angeles","San Diego","San Francisco","Sacramento"].includes(tag)) return "California";
              if (["Nashville","Brentwood","Franklin"].includes(tag)) return "Tennessee";
              return null;
            }).filter(Boolean))];
            return states.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                <button onClick={() => setAreaFilter("all")} className={"flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all " + (areaFilter === "all" ? "bg-[#1a1918] text-white border-[#1a1918]" : "bg-white text-[#6b6a65] border-black/[0.08]")}>all states</button>
                {states.map(state => (
                  <button key={state} onClick={() => setAreaFilter(state === areaFilter ? "all" : state as string)} className={"flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all " + (areaFilter === state ? "bg-[#1a1918] text-white border-[#1a1918]" : "bg-white text-[#6b6a65] border-black/[0.08]")}>{state}</button>
                ))}
              </div>
            ) : null;
          })()}
          {agents.filter(agent => {
            if (areaFilter === "all") return true;
            const stateMappings: Record<string, string[]> = {
              "Texas": ["Austin","Cedar Park","Round Rock","Leander","Pflugerville","Georgetown","Bee Cave","Dripping Springs","Kyle","Buda","Manor","Mueller","South Austin","North Austin","East Austin","West Austin","Dallas","Fort Worth","Plano","Houston","San Antonio"],
              "Illinois": ["Chicago","Naperville","Evanston","Oak Park"],
              "Tennessee": ["Nashville","Brentwood","Franklin","Memphis"],
              "Colorado": ["Denver","Boulder","Colorado Springs"],
              "Arizona": ["Phoenix","Scottsdale","Tempe","Mesa"],
              "North Carolina": ["Charlotte","Raleigh","Durham"],
              "Florida": ["Tampa","Miami","Orlando","Jacksonville"],
              "Georgia": ["Atlanta","Buckhead","Alpharetta"],
              "Washington": ["Seattle","Bellevue","Tacoma"],
              "Oregon": ["Portland","Bend"],
              "California": ["Los Angeles","San Diego","San Francisco","Sacramento"],
            };
            return (agent.area_tags || []).some((tag: string) => stateMappings[areaFilter]?.includes(tag));
          }).map(agent => (
            <div key={agent.id} className="bg-white border border-black/[0.08] rounded-2xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center font-medium flex-shrink-0">
                    {agent.avatar_url ? (
                      <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-medium text-[#1a1918] break-words">{agent.name}</h2>
                    <p className="text-sm text-[#6b6a65]">{agent.years_exp} yrs &middot; {agent.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-medium text-[#D85A30] whitespace-nowrap">{agent.matchScore}%</div>
                  <div className="text-xs text-[#9f9e99]">match</div>
                </div>
              </div>

              {(() => {
                const explanation = generateMatchExplanation(agent, consumerTags);
                return explanation ? (
                  <div className="bg-[#1a1918] border border-[#D85A30]/30 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-[#D85A30] leading-relaxed">💡 {explanation}</p>
                  </div>
                ) : null;
              })()}
              {agent.bio && (
                <p className="text-sm text-[#6b6a65] leading-relaxed mb-4 border-t border-black/[0.06] pt-4">{agent.bio}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                {[...(agent.style_tags || []), ...(agent.client_tags || [])].slice(0, 4).map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-[#f7f5f0] border border-black/[0.08] text-[#6b6a65]">{tag}</span>
                ))}
              </div>

              {connected.includes(agent.id) ? (
                <div className="bg-[#EAF3DE] border border-[#3B6D11]/20 rounded-xl p-4 text-center">
                  <p className="text-sm font-medium text-[#3B6D11]">Connected! {agent.name?.split(" ")[0]} will be in touch soon.</p>
                </div>
              ) : showForm === agent.id ? (
                <div className="border border-black/[0.08] rounded-xl p-4">
                  <p className="text-sm font-medium text-[#1a1918] mb-3">Leave your info and {agent.name?.split(" ")[0]} will reach out directly.</p>
                  <div className="flex flex-col gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={consumerName}
                      onChange={e => setConsumerName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={consumerEmail}
                      onChange={e => setConsumerEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]"
                    />
                    <input
                      type="text"
                      placeholder="Your phone (optional)"
                      value={consumerPhone}
                      onChange={e => setConsumerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowForm(null)}
                      className="flex-1 py-2.5 rounded-xl border border-black/[0.1] text-sm text-[#6b6a65]"
                    >
                      cancel
                    </button>
                    <button
                      onClick={() => handleConnect(agent)}
                      disabled={connecting === agent.id || !consumerName || !consumerEmail}
                      className="flex-1 py-2.5 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-40 text-white font-medium text-sm"
                    >
                      {connecting === agent.id ? "Connecting..." : "send my info"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <a href={"/agents/" + agent.slug} className="flex-1 py-2.5 rounded-xl border border-black/[0.1] text-sm text-[#6b6a65] text-center hover:border-black/20">
                      view profile
                    </a>
                    <button onClick={() => setShowForm(agent.id)}
                      className="flex-1 py-2.5 rounded-xl bg-[#1a1918] hover:bg-black text-white font-medium text-sm">
                      connect
                    </button>
                  </div>
                  <button onClick={() => toggleCompare(agent)}
                    className={"w-full py-2 rounded-xl text-xs font-medium border transition-all " + (compareList.find(a => a.id === agent.id) ? "bg-[#FAECE7] border-[#D85A30] text-[#993C1D]" : "border-black/[0.1] text-[#9f9e99] hover:border-black/20")}>
                    {compareList.find(a => a.id === agent.id) ? "✓ added to compare" : "+ compare"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1918] border-t border-white/10 px-6 py-4 z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">{compareList.length} agent{compareList.length > 1 ? "s" : ""} selected</span>
              <div className="flex gap-2">
                {compareList.map(a => (
                  <div key={a.id} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                    <span className="text-white text-xs font-medium">{a.name?.split(" ")[0]}</span>
                    <button onClick={() => toggleCompare(a)} className="text-white/40 hover:text-white text-xs">×</button>
                  </div>
                ))}
              </div>
            </div>
            <a href={"/compare?agents=" + compareList.map(a => a.slug).join(",") + "&session=" + sessionId}
              className="px-5 py-2.5 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] text-white font-medium text-sm">
              compare {compareList.length > 1 ? "side by side" : "agents"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}