"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const cityOptions: Record<string, { label: string; tags: string[] }[]> = {
  "Texas": [
    { label: "Austin / Cedar Park / Round Rock", tags: ["Austin", "Cedar Park", "Round Rock", "Leander", "Pflugerville"] },
    { label: "Dallas / Fort Worth / Plano / Frisco", tags: ["Dallas", "Fort Worth", "Plano", "Frisco", "McKinney"] },
    { label: "Houston / Sugar Land / The Woodlands", tags: ["Houston", "Sugar Land", "The Woodlands", "Katy"] },
    { label: "San Antonio / New Braunfels / Boerne", tags: ["San Antonio", "New Braunfels", "Boerne"] },
  ],
  "Illinois": [
    { label: "Chicago (city)", tags: ["Chicago"] },
    { label: "Chicago suburbs (Naperville, Evanston, Oak Park)", tags: ["Naperville", "Evanston", "Oak Park", "Schaumburg"] },
    { label: "Chicagoland north (Lake County, Wilmette)", tags: ["Lake County", "Wilmette", "Glenview"] },
    { label: "Chicagoland west (Aurora, Wheaton, Downers Grove)", tags: ["Aurora", "Wheaton", "Downers Grove"] },
  ],
  "Florida": [
    { label: "Tampa / St. Pete / Clearwater", tags: ["Tampa", "St. Petersburg", "Clearwater"] },
    { label: "Miami / Fort Lauderdale / Boca Raton", tags: ["Miami", "Fort Lauderdale", "Boca Raton"] },
    { label: "Orlando / Kissimmee / Lake Nona", tags: ["Orlando", "Kissimmee", "Lake Nona"] },
    { label: "Jacksonville / St. Augustine", tags: ["Jacksonville", "St. Augustine"] },
    { label: "Naples / Sarasota / Fort Myers", tags: ["Naples", "Sarasota", "Fort Myers"] },
  ],
  "Georgia": [
    { label: "Atlanta / Buckhead / Midtown", tags: ["Atlanta", "Buckhead", "Midtown"] },
    { label: "Alpharetta / Roswell / Johns Creek", tags: ["Alpharetta", "Roswell", "Johns Creek"] },
    { label: "Marietta / Kennesaw / Smyrna", tags: ["Marietta", "Kennesaw", "Smyrna"] },
    { label: "Savannah", tags: ["Savannah"] },
  ],
  "North Carolina": [
    { label: "Charlotte / Concord / Huntersville", tags: ["Charlotte", "Concord", "Huntersville"] },
    { label: "Raleigh / Durham / Chapel Hill", tags: ["Raleigh", "Durham", "Chapel Hill"] },
    { label: "Asheville", tags: ["Asheville"] },
    { label: "Greensboro / Winston-Salem", tags: ["Greensboro", "Winston-Salem"] },
  ],
  "Tennessee": [
    { label: "Nashville / Brentwood / Franklin", tags: ["Nashville", "Brentwood", "Franklin"] },
    { label: "Memphis", tags: ["Memphis"] },
    { label: "Knoxville", tags: ["Knoxville"] },
    { label: "Chattanooga", tags: ["Chattanooga"] },
  ],
  "Colorado": [
    { label: "Denver / Aurora / Lakewood", tags: ["Denver", "Aurora", "Lakewood"] },
    { label: "Boulder / Longmont", tags: ["Boulder", "Longmont"] },
    { label: "Colorado Springs", tags: ["Colorado Springs"] },
    { label: "Fort Collins", tags: ["Fort Collins"] },
  ],
  "Arizona": [
    { label: "Phoenix / Tempe / Mesa", tags: ["Phoenix", "Tempe", "Mesa"] },
    { label: "Scottsdale / Paradise Valley", tags: ["Scottsdale", "Paradise Valley"] },
    { label: "Tucson", tags: ["Tucson"] },
    { label: "Chandler / Gilbert", tags: ["Chandler", "Gilbert"] },
  ],
  "California": [
    { label: "Los Angeles / Santa Monica / Pasadena", tags: ["Los Angeles", "Santa Monica", "Pasadena"] },
    { label: "San Diego / Chula Vista / Carlsbad", tags: ["San Diego", "Chula Vista", "Carlsbad"] },
    { label: "San Francisco / Oakland / Berkeley", tags: ["San Francisco", "Oakland", "Berkeley"] },
    { label: "Sacramento / Elk Grove / Roseville", tags: ["Sacramento", "Elk Grove", "Roseville"] },
    { label: "Orange County / Irvine / Anaheim", tags: ["Orange County", "Irvine", "Anaheim"] },
    { label: "San Jose / Silicon Valley", tags: ["San Jose", "Sunnyvale", "Santa Clara"] },
  ],
  "Nevada": [
    { label: "Las Vegas / Henderson / Summerlin", tags: ["Las Vegas", "Henderson", "Summerlin"] },
    { label: "North Las Vegas", tags: ["North Las Vegas"] },
    { label: "Reno / Sparks", tags: ["Reno", "Sparks"] },
  ],
  "Washington": [
    { label: "Seattle / Bellevue / Redmond", tags: ["Seattle", "Bellevue", "Redmond"] },
    { label: "Tacoma / Federal Way", tags: ["Tacoma", "Federal Way"] },
    { label: "Spokane", tags: ["Spokane"] },
    { label: "Kirkland / Bothell / Everett", tags: ["Kirkland", "Bothell", "Everett"] },
  ],
  "Oregon": [
    { label: "Portland / Beaverton / Hillsboro", tags: ["Portland", "Beaverton", "Hillsboro"] },
    { label: "Bend / Redmond", tags: ["Bend", "Redmond"] },
    { label: "Eugene / Springfield", tags: ["Eugene", "Springfield"] },
    { label: "Salem", tags: ["Salem"] },
  ],
  "New York": [
    { label: "New York City (Manhattan / Brooklyn / Queens)", tags: ["Manhattan", "Brooklyn", "Queens"] },
    { label: "Long Island / Nassau / Suffolk", tags: ["Long Island", "Nassau", "Suffolk"] },
    { label: "Westchester / White Plains", tags: ["Westchester", "White Plains"] },
    { label: "Buffalo / Amherst", tags: ["Buffalo", "Amherst"] },
    { label: "Albany / Saratoga Springs", tags: ["Albany", "Saratoga Springs"] },
  ],
  "Ohio": [
    { label: "Columbus / Dublin / Westerville", tags: ["Columbus", "Dublin", "Westerville"] },
    { label: "Cleveland / Akron / Parma", tags: ["Cleveland", "Akron", "Parma"] },
    { label: "Cincinnati / Mason / Loveland", tags: ["Cincinnati", "Mason", "Loveland"] },
  ],
  "Minnesota": [
    { label: "Minneapolis / St. Paul", tags: ["Minneapolis", "St. Paul"] },
    { label: "Edina / Eden Prairie / Minnetonka", tags: ["Edina", "Eden Prairie", "Minnetonka"] },
    { label: "Rochester", tags: ["Rochester"] },
  ],
  "Virginia": [
    { label: "Northern Virginia / Arlington / Alexandria", tags: ["Northern Virginia", "Arlington", "Alexandria"] },
    { label: "Richmond / Henrico / Chesterfield", tags: ["Richmond", "Henrico", "Chesterfield"] },
    { label: "Virginia Beach / Norfolk / Chesapeake", tags: ["Virginia Beach", "Norfolk", "Chesapeake"] },
  ],
  "Massachusetts": [
    { label: "Boston / Cambridge / Somerville", tags: ["Boston", "Cambridge", "Somerville"] },
    { label: "Newton / Brookline / Wellesley", tags: ["Newton", "Brookline", "Wellesley"] },
    { label: "Worcester", tags: ["Worcester"] },
    { label: "Cape Cod / Plymouth", tags: ["Cape Cod", "Plymouth"] },
  ],
  "Michigan": [
    { label: "Detroit / Dearborn / Sterling Heights", tags: ["Detroit", "Dearborn", "Sterling Heights"] },
    { label: "Ann Arbor / Ypsilanti", tags: ["Ann Arbor", "Ypsilanti"] },
    { label: "Grand Rapids / Kentwood", tags: ["Grand Rapids", "Kentwood"] },
    { label: "Troy / Birmingham / Royal Oak", tags: ["Troy", "Birmingham", "Royal Oak"] },
  ],
  "Pennsylvania": [
    { label: "Philadelphia / Main Line / Cherry Hill", tags: ["Philadelphia", "Main Line", "Cherry Hill"] },
    { label: "Pittsburgh / Mt. Lebanon", tags: ["Pittsburgh", "Mt. Lebanon"] },
    { label: "Allentown / Bethlehem", tags: ["Allentown", "Bethlehem"] },
  ],
  "Maryland": [
    { label: "Baltimore / Towson / Columbia", tags: ["Baltimore", "Towson", "Columbia"] },
    { label: "Bethesda / Rockville / Silver Spring", tags: ["Bethesda", "Rockville", "Silver Spring"] },
    { label: "Annapolis", tags: ["Annapolis"] },
  ],
  "New Jersey": [
    { label: "Jersey City / Hoboken / Newark", tags: ["Jersey City", "Hoboken", "Newark"] },
    { label: "Princeton / Edison / Woodbridge", tags: ["Princeton", "Edison", "Woodbridge"] },
    { label: "Cherry Hill / Moorestown", tags: ["Cherry Hill", "Moorestown"] },
  ],
  "South Carolina": [
    { label: "Charleston / Mount Pleasant / Summerville", tags: ["Charleston", "Mount Pleasant", "Summerville"] },
    { label: "Columbia / Lexington", tags: ["Columbia", "Lexington"] },
    { label: "Greenville / Spartanburg", tags: ["Greenville", "Spartanburg"] },
    { label: "Myrtle Beach / Hilton Head", tags: ["Myrtle Beach", "Hilton Head"] },
  ],
  "Idaho": [
    { label: "Boise / Meridian / Nampa", tags: ["Boise", "Meridian", "Nampa"] },
    { label: "Coeur d Alene / Spokane Valley", tags: ["Coeur d Alene", "Spokane Valley"] },
    { label: "Twin Falls / Sun Valley", tags: ["Twin Falls", "Sun Valley"] },
  ],
  "Utah": [
    { label: "Salt Lake City / Sandy / Murray", tags: ["Salt Lake City", "Sandy", "Murray"] },
    { label: "Provo / Orem / Lehi", tags: ["Provo", "Orem", "Lehi"] },
    { label: "Park City / Heber", tags: ["Park City", "Heber"] },
    { label: "St. George / Washington", tags: ["St. George", "Washington"] },
  ],
  "Hawaii": [
    { label: "Honolulu / Kailua / Pearl City", tags: ["Honolulu", "Kailua", "Pearl City"] },
    { label: "Maui / Lahaina / Kihei", tags: ["Maui", "Lahaina", "Kihei"] },
    { label: "Big Island / Kona / Hilo", tags: ["Big Island", "Kona", "Hilo"] },
  ],
  "Other": [
    { label: "I am not sure yet", tags: ["Austin"] },
  ],
};

const baseQuestions = [
  {
    id: "role",
    question: "Are you buying, selling, or both?",
    note: "helps us find the right type of agent for you",
    multiSelect: false,
    options: [
      { label: "Buying a home", tags: ["buyer"] },
      { label: "Selling a home", tags: ["seller rep", "listing agent"] },
      { label: "Buying and selling at the same time", tags: ["buyer", "seller rep"] },
      { label: "Relocating — selling here, buying somewhere new", tags: ["buyer", "seller rep", "relocation clients", "very educational"] },
      { label: "Just exploring my options", tags: ["patient, no pressure", "very educational"] },
    ],
  },
  {
    id: "communication",
    question: "How do you want your agent to communicate with you?",
    note: "be honest — there is no wrong answer",
    multiSelect: false,
    options: [
      { label: "Mostly text — short and sweet, do not call me", tags: ["mostly text", "low-key, low stress"] },
      { label: "Text for quick stuff, calls when it really matters", tags: ["mostly text", "responds same day"] },
      { label: "I want to talk through everything — calls preferred", tags: ["phone-first", "very educational"] },
      { label: "Whatever is fastest, I just need answers", tags: ["responds within the hour", "direct & fast-moving"] },
    ],
  },
  {
    id: "pace",
    question: "How would you describe your pace?",
    note: "this helps us match your energy",
    multiSelect: false,
    options: [
      { label: "Ready to move fast when the right house shows up", tags: ["direct & fast-moving", "responds within the hour"] },
      { label: "I want to be thorough — I will know it when I see it", tags: ["patient, no pressure", "low-key, low stress"] },
      { label: "Still early, just exploring my options", tags: ["patient, no pressure", "very educational"] },
      { label: "I have a deadline and need to close soon", tags: ["direct & fast-moving", "responds same day"] },
    ],
  },
  {
    id: "experience",
    question: "Have you bought a home before?",
    note: "no judgment either way",
    multiSelect: false,
    options: [
      { label: "First time buying or selling — I need someone patient who explains everything", tags: ["first-time buyers", "very educational", "patient, no pressure"] },
      { label: "Done this before — I know what I want", tags: ["repeat buyers", "direct & fast-moving"] },
      { label: "Investor looking for deals", tags: ["investors", "data-driven"] },
      { label: "Relocating and do not know the area yet", tags: ["relocation clients", "very educational"] },
    ],
  },
  {
    id: "style",
    question: "What matters most in an agent working style?",
    note: "pick the one that resonates most",
    multiSelect: false,
    options: [
      { label: "I want data — comps, market trends, numbers", tags: ["data-driven"] },
      { label: "I want honesty — tell me if a house is a bad deal", tags: ["will tell you to walk away"] },
      { label: "I want patience — do not rush me", tags: ["patient, no pressure", "low-key, low stress"] },
      { label: "I want hustle — respond fast and move faster", tags: ["responds within the hour", "direct & fast-moving"] },
    ],
  },
  {
    id: "type",
    question: "What type of property is this about?",
    note: "select all that apply",
    multiSelect: true,
    options: [
      { label: "Single family home", tags: ["suburban / land"] },
      { label: "Condo or townhome", tags: ["condo / townhome"] },
      { label: "Luxury or high-end", tags: ["luxury"] },
      { label: "Investment / rental property", tags: ["investors", "data-driven"] },
      { label: "New construction", tags: ["new construction"] },
      { label: "Land", tags: ["suburban / land"] },
    ],
  },
  {
    id: "specific_needs",
    question: "Do any of these apply to your situation?",
    note: "select all that apply — we will match you with the right specialist",
    multiSelect: true,
    options: [
      { label: "I am using a VA loan", tags: ["VA buyers"] },
      { label: "I am 55+ or downsizing", tags: ["downsizers"] },
      { label: "I am relocating to a new city", tags: ["relocation clients"] },
      { label: "None of these apply", tags: [] },
    ],
  },
  {
    id: "state",
    question: "Which state is the property in?",
    note: "we will show you the right cities next",
    multiSelect: false,
    options: [
      { label: "Texas", tags: [] },
      { label: "Illinois", tags: [] },
      { label: "Tennessee", tags: [] },
      { label: "Colorado", tags: [] },
      { label: "Arizona", tags: [] },
      { label: "North Carolina", tags: [] },
      { label: "Florida", tags: [] },
      { label: "Georgia", tags: [] },
      { label: "Nevada", tags: [] },
      { label: "Washington", tags: [] },
      { label: "Oregon", tags: [] },
      { label: "California", tags: [] },
      { label: "New York", tags: [] },
      { label: "Ohio", tags: [] },
      { label: "Minnesota", tags: [] },
      { label: "Virginia", tags: [] },
      { label: "Other / not sure yet", tags: [] },
    ],
  },
];

export default function FindPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
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
      const state = selectedOption.label.replace(" / not sure yet", "").trim();
      const stateCities = cityOptions[state] || cityOptions["Other"];
      setSelectedState(state);
      const cityQuestion = {
        id: "city",
        question: "Which area specifically?",
        note: state === "Other" ? "no worries, we will find someone nearby" : "pick the one closest to you",
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
      // Quiz done — save to DB then show signup
      setSubmitting(true);
      const allTags = Object.values(newAnswers).flatMap((a: any) => a.tags);
      const uniqueTags = [...new Set(allTags)];
      const city = newAnswers.city?.tags?.[0] || newAnswers.state?.label || "Austin";
      const sid = Math.random().toString(36).slice(2);
      setSessionId(sid);
      const supabase = createClient();
      const { error } = await supabase.from("quiz_responses").insert({
        session_id: sid,
        answers: newAnswers,
        derived_tags: uniqueTags,
        city,
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
    if (!signupEmail) {
      router.push("/find/results?session=" + sessionId);
      return;
    }
    setSigningUp(true);
    await fetch("/api/consumer-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: signupEmail,
        name: signupName,
        sessionId,
      }),
    });
    setSigningUp(false);
    router.push("/find/results?session=" + sessionId + "&email=" + encodeURIComponent(signupEmail));
  }

  if (showSignup) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-medium text-white mb-2">Your matches are ready!</h2>
            <p className="text-white/50 text-sm">Enter your email to see your matches and save your results. Free forever — no spam.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
            <form onSubmit={handleSignup} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your first name"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm"
              />
              <input
                type="email"
                placeholder="Your email address"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D85A30] text-sm"
              />
              <button
                type="submit"
                disabled={signingUp || !signupEmail}
                className="w-full py-3.5 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-50 text-white font-medium text-sm"
              >
                {signingUp ? "Finding your matches..." : "see my matches →"}
              </button>
            </form>
          </div>
          <p className="text-center text-white/30 text-xs mt-2">free forever · no spam · unsubscribe anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1918] flex flex-col">
      <nav className="max-w-2xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-white">
          meet<span className="text-[#D85A30]">my</span>agent
        </a>
        <span className="text-white/30 text-sm">{current + 1} of {questions.length}</span>
      </nav>
      <div className="w-full bg-white/10 h-1">
        <div className="bg-[#D85A30] h-1 transition-all duration-500" style={{ width: progress + "%" }} />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">{q.note}</p>
          <h2 className="text-xl sm:text-3xl font-medium text-white mb-6 leading-snug">{q.question}</h2>
          {(q.id === "state" || q.id === "city") ? (
            <div className="mb-8">
              <select
                value={selected !== null ? q.options[selected]?.label : ""}
                onChange={e => {
                  const idx = q.options.findIndex(o => o.label === e.target.value);
                  setSelected(idx >= 0 ? idx : null);
                }}
                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#D85A30] cursor-pointer"
              >
                <option value="" disabled style={{background: "#1a1918"}}>
                  {q.id === "state" ? "Select a state..." : "Select an area..."}
                </option>
                {q.options.map((opt, idx) => (
                  <option key={idx} value={opt.label} style={{background: "#1a1918", color: "white"}}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {q.options.map((opt, idx) => {
                const isSelected = q.multiSelect ? multiSelected.includes(idx) : selected === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => q.multiSelect ? toggleMulti(idx) : setSelected(idx)}
                    className={"w-full text-left px-5 py-4 rounded-xl border text-sm leading-relaxed transition-all " + (isSelected ? "bg-[#D85A30] border-[#D85A30] text-white font-medium" : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white")}
                  >
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
          <button
            onClick={handleNext}
            disabled={!canProceed || submitting}
            className="w-full py-3.5 rounded-xl bg-white text-[#1a1918] font-medium text-sm disabled:opacity-30 hover:bg-white/90 transition-colors"
          >
            {submitting ? "Finding your matches..." : current === questions.length - 1 ? "see my matches" : "next question"}
          </button>
          {current > 0 && (
            <button
              onClick={() => { setCurrent(current - 1); setSelected(null); setMultiSelected([]); }}
              className="w-full mt-3 py-2 text-white/30 text-sm hover:text-white/50 transition-colors"
            >
              back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
