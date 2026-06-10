import WaitlistForm from "@/components/WaitlistForm";

const agentSteps = [
  { number: "01", title: "Build your real profile", body: "Tag yourself honestly — how you communicate, who you work best with, what areas you know cold. No buzzwords." },
  { number: "02", title: "Get matched to the right clients", body: "Consumers take a short quiz and get ranked matches. Your personality tags drive your score — not how much you paid to be listed." },
  { number: "03", title: "Collect reviews that actually stick", body: "Send a text link after close. Client taps it, leaves a review in 60 seconds, location auto-tagged. No Google account needed." },
];

const painPoints = [
  { icon: "😤", heading: "Zillow shows you who paid most, not who fits best", body: "Premier Agent listings are just ads. The top result isn't the best agent for you — it's whoever has the biggest marketing budget." },
  { icon: "📵", heading: "No way to know how they actually work", body: "Does this agent text or call? Are they pushy or patient? Will they tell you when a house is a bad deal? You can't know until it's too late." },
  { icon: "🔍", heading: "Reviews are nearly impossible to find", body: "If an agent doesn't have an LLC or a Google Business page, their track record is invisible. Most independent agents fall into this gap." },
];

const agentPerks = [
  "A profile that shows your real working style, not a boilerplate bio",
  "Reviews that live on your profile and embed on your website",
  "Geotagged reviews pinned to where deals actually closed",
  "Match notifications when a consumer fits your style",
  "Analytics: why you're being matched, who's connecting",
  "A founding agent badge — permanent, for the first 100",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] font-sans">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="text-2xl font-medium tracking-tight text-[#1a1918]">meet<span className="text-[#D85A30]">my</span>agent</span>
        <div className="flex items-center gap-3">
          <a href="/neighborhoods" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">neighborhoods</a>
          <a href="/consumer" className="text-sm font-medium text-[#1a1918] hover:text-[#D85A30] border border-black/20 hover:border-[#D85A30] px-4 py-2 rounded-lg transition-all hidden sm:block">consumer login</a>
          <a href="/login" className="text-sm font-medium text-[#1a1918] hover:text-[#D85A30] border border-black/20 hover:border-[#D85A30] px-4 py-2 rounded-lg transition-all">agent login</a>
        </div>
      </nav>

      <section className="bg-[#1a1918] text-white">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#D85A30]" />
            <span className="text-xs font-medium text-white/70">now accepting founding agents in Austin</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-medium tracking-tight leading-[1.05] mb-6 max-w-3xl">
            Find a real estate agent<br />who actually <em className="text-[#D85A30] not-italic">fits you.</em>
          </h1>
          <p className="text-white/60 text-xl max-w-xl leading-relaxed mb-12">Most agent search tools show you who paid to be listed. Meet My Agent matches buyers and sellers with agents based on communication style, personality, and working approach — not ad spend.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
              <a href="/find" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] text-white font-medium text-base transition-colors">
                🏠 find a residential agent →
              </a>
              <a href="/find/commercial" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-base transition-colors">
                🏢 find a commercial agent →
              </a>
            </div>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium text-sm transition-colors border border-white/15">see how it works</a>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-white/30 text-sm">free for consumers, always.</p>
            <a href="/consumer" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg transition-all">
              returning? view my matches →
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#9f9e99] mb-4">the problem</p>
        <h2 className="text-4xl font-medium tracking-tight text-[#1a1918] mb-3 max-w-xl">Agent search is broken in three specific ways.</h2>
        <p className="text-[#6b6a65] text-lg max-w-lg mb-12 leading-relaxed">Zillow, Realtor.com, and Google haven&apos;t solved any of these. They&apos;ve made some of them worse.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {painPoints.map((p) => (
            <div key={p.heading} className="bg-white border border-black/[0.08] rounded-2xl p-6">
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-medium text-[#1a1918] text-lg mb-2 leading-snug">{p.heading}</h3>
              <p className="text-[#6b6a65] text-base leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white border-y border-black/[0.08] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#D85A30] mb-4">for buyers &amp; sellers</p>
              <h2 className="text-2xl font-medium tracking-tight mb-8 text-[#1a1918]">Takes 2 minutes. No account needed.</h2>
              <div className="flex flex-col gap-6">
                {[
                  { step: "1", title: "Take the quiz", body: "Tell us how you like to communicate, where the property is, and what matters to you." },
                  { step: "2", title: "See your matches", body: "We score every agent in your area against your answers and show you ranked matches with a compatibility score." },
                  { step: "3", title: "Connect directly", body: "Hit connect and your info goes straight to the agent. No middleman, no sales funnel." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FAECE7] text-[#993C1D] text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
                    <div>
                      <p className="font-medium text-[#1a1918] mb-1">{s.title}</p>
                      <p className="text-[#6b6a65] text-sm leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/find" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] text-white font-medium text-sm transition-colors">find my agent →</a>
            </div>
            <div className="bg-[#1a1918] rounded-2xl p-8 text-white">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#D85A30] mb-4">for agents</p>
              <h2 className="text-2xl font-medium tracking-tight mb-8">Your reputation, finally portable.</h2>
              <div className="flex flex-col gap-6">
                {agentSteps.map((s) => (
                  <div key={s.number} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white/50 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{s.number}</div>
                    <div>
                      <p className="font-medium text-white mb-1">{s.title}</p>
                      <p className="text-white/50 text-sm leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#join" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] text-white font-medium text-sm transition-colors">join free as an agent →</a>
            </div>
          </div>
        </div>
      </section>

      <section id="join" className="bg-[#1a1918] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#D85A30]/20 border border-[#D85A30]/30 rounded-full px-4 py-1.5 mb-6">
                <span className="text-xs font-medium text-[#f4a07a]">founding agent · first 100 only</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight text-white mb-4 leading-snug">Get on the platform free.<br />Keep the badge forever.</h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">We&apos;re onboarding the first 100 agents personally — a 15-minute call, we build your profile together, and you get a permanent founding agent badge. No credit card, no catch.</p>
              <ul className="flex flex-col gap-3">
                {agentPerks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="text-[#D85A30] mt-0.5 flex-shrink-0">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-6">Leave your details and we&apos;ll reach out personally to schedule your onboarding call.</p>
              <WaitlistForm />
              <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                {[{ val: "Free", label: "during launch" }, { val: "10 min", label: "to set up" }, { val: "100%", label: "yours to keep" }].map((s) => (
                  <div key={s.label}>
                    <div className="text-white font-medium text-lg">{s.val}</div>
                    <div className="text-white/30 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <span className="text-sm font-medium text-[#9f9e99]">meet<span className="text-[#D85A30]">my</span>agent</span>
        <p className="text-xs text-[#9f9e99]">built in Austin, TX · questions? <a href="mailto:hello@meetmyagent.app" className="underline hover:text-[#6b6a65] transition-colors">hello@meetmyagent.app</a></p>
      </footer>
    </div>
  );
}
