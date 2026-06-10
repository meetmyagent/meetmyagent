"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const commercialCityOptions: Record<string, { label: string; tags: string[] }[]> = {
  "Texas": [
    { label: "Austin / Round Rock / Cedar Park", tags: ["Austin", "Cedar Park", "Round Rock"] },
    { label: "Dallas / Fort Worth / Plano", tags: ["Dallas", "Fort Worth", "Plano"] },
    { label: "Houston / The Woodlands / Sugar Land", tags: ["Houston", "The Woodlands", "Sugar Land"] },
    { label: "San Antonio", tags: ["San Antonio"] },
  ],
  "California": [
    { label: "Los Angeles / Orange County", tags: ["Los Angeles", "Orange County"] },
    { label: "San Francisco Bay Area", tags: ["San Francisco", "Oakland", "San Jose"] },
    { label: "San Diego", tags: ["San Diego"] },
    { label: "Sacramento", tags: ["Sacramento"] },
  ],
  "New York": [
    { label: "New York City", tags: ["Manhattan", "Brooklyn", "Queens"] },
    { label: "Long Island / Westchester", tags: ["Long Island", "Westchester"] },
  ],
  "Florida": [
    { label: "Miami / Fort Lauderdale", tags: ["Miami", "Fort Lauderdale"] },
    { label: "Tampa / St. Pete", tags: ["Tampa", "St. Petersburg"] },
    { label: "Orlando", tags: ["Orlando"] },
    { label: "Jacksonville", tags: ["Jacksonville"] },
  ],
  "Illinois": [
    { label: "Chicago / suburbs", tags: ["Chicago", "Naperville", "Schaumburg"] },
  ],
  "Georgia": [
    { label: "Atlanta metro", tags: ["Atlanta", "Alpharetta", "Marietta"] },
  ],
  "Washington": [
    { label: "Seattle / Bellevue", tags: ["Seattle", "Bellevue"] },
  ],
  "Colorado": [
    { label: "Denver / Boulder", tags: ["Denver", "Boulder"] },
  ],
  "Arizona": [
    { label: "Phoenix / Scottsdale", tags: ["Phoenix", "Scottsdale"] },
  ],
  "North Carolina": [
    { label: "Charlotte / Raleigh", tags: ["Charlotte", "Raleigh"] },
  ],
  "Tennessee": [
    { label: "Nashville", tags: ["Nashville"] },
  ],
  "Nevada": [
    { label: "Las Vegas", tags: ["Las Vegas"] },
  ],
  "Other": [
    { label: "I am not sure yet / national", tags: ["national"] },
  ],
};

const baseQuestions = [
  {
    id: "role",
    question: "What best describes you?",
    note: "this helps us match you to the right specialist",
    multiSelect: false,
    options: [
      { label: "Business owner looking to buy or lease space", tags: ["business owner", "tenant rep"] },
      { label: "Investor buying commercial property", tags: ["investors", "data-driven"] },
      { label: "Developer or builder", tags: ["investors", "new construction", "data-driven"] },
      { label: "Looking to sell a commercial property", tags: ["seller rep"] },
    ],
  },
  {
    id: "property_type",
    question: "What type of commercial property?",
    note: "select all that apply",
    multiSelect: true,
    options: [
      { label: "Office space", tags: ["office"] },
      { label: "Retail / storefront", tags: ["retail"] },
      { label: "Industrial / warehouse", tags: ["industrial"] },
      { label: "Multifamily (5+ units)", tags: ["multifamily"] },
      { label: "Mixed-use", tags: ["mixed-use"] },
      { label: "Land / development", tags: ["land", "new construction"] },
      { label: "Hospitality / hotel", tags: ["hospitality"] },
    ],
  },
  {
    id: "deal_size",
    question: "What is your approximate deal size?",
    note: "helps us match you with agents experienced at your level",
    multiSelect: false,
    options: [
      { label: "Under $1 million", tags: ["deals under 1M"] },
      { label: "$1M — $5M", tags: ["deals 1M-5M"] },
      { label: "$5M — $20M", tags: ["deals 5M-20M"] },
      { label: "$20M+", tags: ["deals 20M+", "luxury"] },
    ],
  },
  {
    id: "communication",
    question: "How do you want your agent to communicate?",
    note: "commercial deals move fast — how do you want to work?",
    multiSelect: false,
    options: [
      { label: "Email and text — I will review when I have time", tags: ["mostly text", "responds same day"] },
      { label: "Call me for anything important", tags: ["phone-first"] },
      { label: "I need fast responses — whatever channel is fastest", tags: ["responds within the hour", "direct & fast-moving"] },
      { label: "Scheduled check-ins — I run a tight calendar", tags: ["scheduled check-ins"] },
    ],
  },
  {
    id: "market",
    question: "What is your market focus?",
    note: "are you buying locally or open to broader markets?",
    multiSelect: false,
    options: [
      { label: "Local only — I know my market well", tags: ["local market expert"] },
      { label: "Regional — open to nearby metros", tags: ["regional market"] },
      { label: "National — I go where the deal is", tags: ["national deals"] },
      { label: "Not sure yet — I need guidance", tags: ["very educational", "patient, no pressure"] },
    ],
  },
  {
    id: "state",
    question: "Which state are you focused on?",
    note: "we will narrow down to the right market",
    multiSelect: false,
    options: Object.keys(commercialCityOptions).map(state => ({ label: state, tags: [] })),
  },
];

export default function CommercialFindPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [questions, setQuestions] = useState(baseQuestions);
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [signingUp, setSigningUp] = useState(false);

  const q = questions[current];
  const progress = (current / questions.length) * 100;

  function toggleMulti(idx: number) {
    setMultiSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }

  const canProceed = q.multiSelect ? multiSelected.length > 0 : selected !== null;

  async function handleNext() {
    if (!canProceed) return;

    let selectedOption;
    if (q.multiSelect) {
      const selectedOptions = multiSelected.map(idx => q.options[idx]);
      selectedOption = {
        label: selectedOptions.map(o => o.label).join(", "),
        tags: [...new Set(selectedOptions.flatMap(o => o.tags))],
      };
    } else {
      selectedOption = q.options[selected!];
    }

    const newAnswers = { ...answers, [q.id]: selectedOption };
    setAnswers(newAnswers);

    if (q.id === "state") {
      const state = selectedOption.label;
      const stateCities = commercialCityOptions[state] || commercialCityOptions["Other"];
      const cityQuestion = {
        id: "city",
        question: "Which market specifically?",
        note: "we will match you with agents who know this market",
        multiSelect: false,
        options: stateCities,
      };
      setQuestions([...baseQuestions, cityQuestion]);
      setCurrent(current + 1);
      setSelected(null);
      setMultiSelected([]);
      return;
    }

    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setMultiSelected([]);
    } else {
      setSubmitting(true);
      const allTags = Object.values(newAnswers).flatMap((a: any) => a.tags);
      const uniqueTags = [...new Set(allTags)];
      const city = newAnswers.city?.tags?.[0] || "national";
      const sid = Math.random().toString(36).slice(2);
      setSessionId(sid);
      const supabase = createClient();
      const { error } = await supabase.from("quiz_responses").insert({
        session_id: sid,
        answers: newAnswers,
        derived_tags: uniqueTags,
        city,
        consumer_type: "commercial",
      });
      if (error) {
        setErrorMsg(JSON.stringify(error));
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      setShowSignup(true);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!signupEmail) return;
    setSigningUp(true);
    await fetch("/api/consumer-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: signupEmail, name: signupName, sessionId }),
    });
    setSigningUp(false);
    router.push("/find/results?session=" + sessionId);
  }

  if (showSignup) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🏢</div>
            <h2 className="text-2xl font-medium text-white mb-2">Your matches are ready!</h2>
            <p className="text-white/50 text-sm">Enter your email to see your commercial agent matches.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
            <form onSubmit={handleSignup} className="flex flex-col gap-3">
              <input type="text" placeholder="Your first name" value={signupName} onChange={e => setSignupName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm" />
              <input type="email" placeholder="Your email address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm" />
              <button type="submit" disabled={signingUp || !signupEmail}
                className="w-full py-3.5 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-50 text-white font-medium text-sm">
                {signingUp ? "Finding matches..." : "see my commercial agent matches →"}
              </button>
            </form>
          </div>
          <p className="text-center text-white/30 text-xs">free forever · no spam</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1918] flex flex-col">
      <nav className="max-w-2xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-white">meet<span className="text-[#D85A30]">my</span>agent</a>
        <span className="text-white/30 text-sm">{current + 1} of {questions.length} · commercial</span>
      </nav>
      <div className="w-full bg-white/10 h-1">
        <div className="bg-[#D85A30] h-1 transition-all duration-500" style={{ width: progress + "%" }} />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">{q.note}</p>
          <h2 className="text-2xl sm:text-3xl font-medium text-white mb-8 leading-snug">{q.question}</h2>
          {q.id === "state" ? (
            <div className="mb-8">
              <select
                value={selected !== null ? q.options[selected]?.label : ""}
                onChange={e => {
                  const idx = q.options.findIndex(o => o.label === e.target.value);
                  setSelected(idx >= 0 ? idx : null);
                }}
                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#D85A30] cursor-pointer"
              >
                <option value="" disabled style={{background: "#1a1918"}}>Select a state...</option>
                {q.options.map((opt, idx) => (
                  <option key={idx} value={opt.label} style={{background: "#1a1918", color: "white"}}>{opt.label}</option>
                ))}
              </select>
            </div>
          ) : q.id === "city" ? (
            <div className="mb-8">
              <select
                value={selected !== null ? q.options[selected]?.label : ""}
                onChange={e => {
                  const idx = q.options.findIndex(o => o.label === e.target.value);
                  setSelected(idx >= 0 ? idx : null);
                }}
                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#D85A30] cursor-pointer"
              >
                <option value="" disabled style={{background: "#1a1918"}}>Select a market...</option>
                {q.options.map((opt, idx) => (
                  <option key={idx} value={opt.label} style={{background: "#1a1918", color: "white"}}>{opt.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {q.options.map((opt, idx) => {
                const isSelected = q.multiSelect ? multiSelected.includes(idx) : selected === idx;
                return (
                  <button key={idx} onClick={() => q.multiSelect ? toggleMulti(idx) : setSelected(idx)}
                    className={"w-full text-left px-5 py-4 rounded-xl border text-sm leading-relaxed transition-all " + (isSelected ? "bg-[#D85A30] border-[#D85A30] text-white font-medium" : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white")}>
                    {q.multiSelect && (
                      <span className={"inline-flex items-center justify-center w-4 h-4 rounded border mr-3 " + (isSelected ? "bg-white border-white" : "border-white/30")}>
                        {isSelected && <span className="text-[#D85A30] text-xs font-bold">✓</span>}
                      </span>
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
          {errorMsg && <p className="text-red-400 text-xs mb-4">{errorMsg}</p>}
          <button onClick={handleNext} disabled={!canProceed || submitting}
            className="w-full py-3.5 rounded-xl bg-white text-[#1a1918] font-medium text-sm disabled:opacity-30 hover:bg-white/90 transition-colors">
            {submitting ? "Finding your matches..." : current === questions.length - 1 ? "see my matches" : "next question"}
          </button>
          {current > 0 && (
            <button onClick={() => { setCurrent(current - 1); setSelected(null); setMultiSelected([]); }}
              className="w-full mt-3 py-2 text-white/30 text-sm hover:text-white/50 transition-colors">
              back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
