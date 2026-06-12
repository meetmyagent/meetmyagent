"use client";

import { useState } from "react";

export default function AgentProfileClient({ agent, reviews, responseBadge, styleLabels, styleDescs }: any) {
  const [showConnect, setShowConnect] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  async function handleConnect() {
    if (!name || !email) return;
    setConnecting(true);
    await fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: agent.id,
        agentName: agent.name,
        agentEmail: agent.email,
        consumerName: name,
        consumerEmail: email,
        consumerPhone: phone,
        matchScore: null,
        buyerType: null,
        readinessScore: null,
        matchExplanation: null,
        consumerTags: [],
      }),
    });
    setConnected(true);
    setConnecting(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <nav className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-[#1a1918]">meet<span className="text-[#D85A30]">my</span>agent</a>
        <a href="/find" className="text-sm text-[#D85A30] font-medium">find your match</a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white border border-black/[0.06] rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#FAECE7] text-[#993C1D] flex items-center justify-center text-2xl font-medium flex-shrink-0 border border-black/[0.06]">
              {agent.avatar_url
                ? <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                : agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
              }
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-medium text-[#1a1918] mb-1">{agent.name}</h1>
              <p className="text-[#9f9e99] text-sm mb-3">{agent.years_exp} yrs · {agent.city}</p>
              <div className="flex flex-wrap gap-2">
                {agent.is_founding && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#1a1918] text-white px-3 py-1 rounded-lg">✦ founding agent</span>
                )}
                {agent.agent_type && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20 px-3 py-1 rounded-lg">
                    {agent.agent_type === "both" ? "Residential & Commercial" : agent.agent_type === "commercial" ? "Commercial Real Estate" : "Residential"}
                  </span>
                )}
                {responseBadge && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20 px-3 py-1 rounded-lg">
                    {responseBadge}
                  </span>
                )}
              </div>
            </div>
          </div>
          {agent.bio && <p className="text-[#6b6a65] text-sm leading-relaxed border-t border-black/[0.06] pt-5">{agent.bio}</p>}
          {agent.video_url && (
            <div className="mt-5 border-t border-black/[0.06] pt-5">
              <p className="text-[#9f9e99] text-xs font-medium uppercase tracking-widest mb-3">intro video</p>
              <div className="relative w-full rounded-xl overflow-hidden" style={{paddingTop: "56.25%"}}>
                <iframe
                  src={agent.video_url.includes("youtube.com/watch") ? agent.video_url.replace("watch?v=", "embed/") : agent.video_url.includes("youtu.be") ? agent.video_url.replace("youtu.be/", "youtube.com/embed/") : agent.video_url.replace("loom.com/share", "loom.com/embed")}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}
        </div>

        {(agent.communication_style || agent.decision_style || agent.stress_response || agent.pace_style) && (
          <div className="bg-[#1a1918] rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#D85A30] mb-5">personality profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agent.communication_style && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D85A30] mb-1">communication</p>
                  <p className="text-sm font-medium text-white mb-2">{styleLabels[agent.communication_style]}</p>
                  <p className="text-xs text-white/30 leading-relaxed">{styleDescs[agent.communication_style] || ""}</p>
                </div>
              )}
              {agent.decision_style && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D85A30] mb-1">decision support</p>
                  <p className="text-sm font-medium text-white mb-2">{styleLabels[agent.decision_style]}</p>
                  <p className="text-xs text-white/30 leading-relaxed">{styleDescs[agent.decision_style] || ""}</p>
                </div>
              )}
              {agent.stress_response && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D85A30] mb-1">under stress</p>
                  <p className="text-sm font-medium text-white mb-2">{styleLabels[agent.stress_response]}</p>
                  <p className="text-xs text-white/30 leading-relaxed">{styleDescs[agent.stress_response] || ""}</p>
                </div>
              )}
              {agent.pace_style && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D85A30] mb-1">natural pace</p>
                  <p className="text-sm font-medium text-white mb-2">{styleLabels[agent.pace_style]}</p>
                  <p className="text-xs text-white/30 leading-relaxed">{styleDescs[agent.pace_style] || ""}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {agent.style_tags?.length > 0 && (
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-4">working style</h2>
            <div className="flex flex-wrap gap-2">
              {agent.style_tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {agent.client_tags?.length > 0 && (
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-4">works best with</h2>
            <div className="flex flex-wrap gap-2">
              {agent.client_tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {agent.area_tags?.length > 0 && (
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-4">areas</h2>
            <div className="flex flex-wrap gap-2">
              {agent.area_tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-5">client reviews</h2>
            <div className="flex flex-col gap-5">
              {reviews.map((r: any) => (
                <div key={r.id} className="border-b border-black/[0.06] pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[#1a1918]">{r.client_name}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= r.rating ? "text-[#D85A30]" : "text-black/10"}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.geo_label && <span className="text-xs text-[#D85A30] bg-[#D85A30]/10 px-2.5 py-1 rounded-md font-medium">{r.geo_label}</span>}
                  {r.trait_chips?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {r.trait_chips.map((chip: string) => (
                        <span key={chip} className="text-xs px-2.5 py-1 rounded-md bg-[#D85A30]/10 text-[#D85A30] font-medium">{chip}</span>
                      ))}
                    </div>
                  )}
                  {r.body && <p className="text-sm text-[#6b6a65] leading-relaxed mt-2">{r.body}</p>}
                  {r.agent_reply && (
                    <div className="mt-3 bg-[#f7f5f0] rounded-xl p-3 border-l-2 border-[#D85A30]">
                      <p className="text-xs font-semibold text-[#D85A30] mb-1">{agent.name?.split(" ")[0]} replied</p>
                      <p className="text-xs text-[#6b6a65]">{r.agent_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#D85A30] rounded-2xl p-6 mb-6">
          {connected ? (
            <div className="text-center">
              <p className="text-white font-medium text-lg mb-1">Request sent! 🎉</p>
              <p className="text-white/70 text-sm">{agent.name?.split(" ")[0]} will be in touch soon.</p>
            </div>
          ) : showConnect ? (
            <div>
              <h2 className="text-white font-medium text-lg mb-1">Connect with {agent.name?.split(" ")[0]}</h2>
              <p className="text-white/70 text-sm mb-4">Leave your info and they will reach out directly.</p>
              <div className="flex flex-col gap-3">
                <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/30 text-sm" />
                <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/30 text-sm" />
                <input type="tel" placeholder="Your phone (optional)" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/30 text-sm" />
                <div className="flex gap-3">
                  <button onClick={() => setShowConnect(false)}
                    className="flex-1 py-3 rounded-xl bg-white/20 text-white font-medium text-sm">
                    cancel
                  </button>
                  <button onClick={handleConnect} disabled={!name || !email || connecting}
                    className="flex-1 py-3 rounded-xl bg-white text-[#993C1D] font-medium text-sm disabled:opacity-50">
                    {connecting ? "Sending..." : "send request"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-white font-medium text-lg">Want to work with {agent.name?.split(" ")[0]}?</h2>
                <p className="text-white/70 text-sm mt-1">Send a direct request or take the quiz to see your match score.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a href="javascript:history.back()"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/20 text-white font-medium text-sm text-center">
                  ← back
                </a>
                <button onClick={() => setShowConnect(true)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-[#993C1D] font-medium text-sm">
                  connect with {agent.name?.split(" ")[0]} →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-[#9f9e99] mb-2">Want to see your personality match score?</p>
          <a href="/find" className="text-sm text-[#D85A30] font-medium">take the 2-min quiz →</a>
        </div>
        <div className="text-center pb-6">
          <p className="text-xs text-[#9f9e99]">questions? <a href="mailto:hello@meetmyagent.app" className="underline hover:text-[#6b6a65] transition-colors">hello@meetmyagent.app</a></p>
        </div>
      </div>
    </div>
  );
}
