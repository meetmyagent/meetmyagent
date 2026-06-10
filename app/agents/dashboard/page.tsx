"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const STYLE_TAGS = ["mostly text","phone-first","loves video calls","responds same day","responds within the hour","scheduled check-ins","patient, no pressure","direct & fast-moving","data-driven","will tell you to walk away","very educational","low-key, low stress"];
const CLIENT_TAGS = ["first-time buyers","repeat buyers","VA buyers","condo / townhome","suburban / land","investors","relocation clients","luxury","new construction","downsizers"];
const DESIGNATIONS = [
  { code: "ABR", name: "Accredited Buyer's Representative", desc: "Specialist in buyer representation" },
  { code: "SRS", name: "Seller Representative Specialist", desc: "Expert in listing and seller services" },
  { code: "SRES", name: "Seniors Real Estate Specialist", desc: "Specialist in 55+ and downsizing clients" },
  { code: "MRP", name: "Military Relocation Professional", desc: "Expert in VA loans and military moves" },
  { code: "CRS", name: "Certified Residential Specialist", desc: "Advanced training in residential sales" },
  { code: "GRI", name: "Graduate REALTOR Institute", desc: "Advanced real estate education" },
  { code: "PSA", name: "Pricing Strategy Advisor", desc: "Expert in CMAs and pricing" },
  { code: "GREEN", name: "Green Designation", desc: "Specialist in eco-friendly properties" },
  { code: "RSPS", name: "Resort & Second-Home Specialist", desc: "Expert in vacation and investment properties" },
  { code: "e-PRO", name: "Technology Certification", desc: "Digital marketing and tech specialist" },
  { code: "CCIM", name: "Certified Commercial Investment Member", desc: "Advanced commercial real estate" },
  { code: "SIOR", name: "Society of Industrial & Office REALTORS", desc: "Expert in industrial and office space" },
  { code: "CPM", name: "Certified Property Manager", desc: "Expert in property management" },
  { code: "CDPE", name: "Certified Distressed Property Expert", desc: "Short sales and foreclosure specialist" },
];
const AREA_TAGS_BY_STATE: Record<string, string[]> = {
  "Texas": ["Austin","Cedar Park","Round Rock","Leander","Pflugerville","Georgetown","Bee Cave","Dripping Springs","Kyle","Buda","Manor","Mueller","South Austin","North Austin","East Austin","West Austin","Dallas","Fort Worth","Plano","Frisco","McKinney","Houston","Sugar Land","The Woodlands","Katy","San Antonio","New Braunfels","Boerne"],
  "Illinois": ["Chicago","Naperville","Evanston","Oak Park","Schaumburg","Lake County","Wilmette","Glenview"],
  "Tennessee": ["Nashville","Brentwood","Franklin","Memphis","Knoxville","Chattanooga"],
  "Colorado": ["Denver","Boulder","Lakewood","Colorado Springs","Fort Collins"],
  "Arizona": ["Phoenix","Scottsdale","Tempe","Mesa","Chandler","Gilbert","Tucson"],
  "North Carolina": ["Charlotte","Concord","Huntersville","Raleigh","Durham","Chapel Hill","Asheville"],
  "Florida": ["Tampa","St. Petersburg","Clearwater","Miami","Fort Lauderdale","Orlando","Jacksonville","Naples","Sarasota"],
  "Georgia": ["Atlanta","Buckhead","Alpharetta","Roswell","Marietta","Savannah"],
  "Nevada": ["Las Vegas","Henderson","Reno","Summerlin"],
  "Washington": ["Seattle","Bellevue","Tacoma","Spokane","Kirkland"],
  "Oregon": ["Portland","Bend","Eugene","Salem"],
  "California": ["Los Angeles","San Diego","San Francisco","Sacramento","Orange County","Irvine","San Jose"],
  "New York": ["Manhattan","Brooklyn","Queens","Long Island","Westchester"],
  "Ohio": ["Columbus","Cleveland","Cincinnati"],
  "Minnesota": ["Minneapolis","St. Paul","Edina","Eden Prairie"],
  "Virginia": ["Northern Virginia","Arlington","Richmond","Virginia Beach","Alexandria"],
  "Massachusetts": ["Boston","Cambridge","Newton","Brookline"],
  "Michigan": ["Detroit","Ann Arbor","Grand Rapids","Troy"],
  "Pennsylvania": ["Philadelphia","Pittsburgh","Main Line"],
  "Maryland": ["Baltimore","Bethesda","Rockville","Annapolis"],
  "South Carolina": ["Charleston","Columbia","Greenville","Myrtle Beach"],
  "Idaho": ["Boise","Meridian","Nampa"],
  "Utah": ["Salt Lake City","Provo","Park City","St. George"],
};
const AREA_TAGS = Object.values(AREA_TAGS_BY_STATE).flat();

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [clientTags, setClientTags] = useState<string[]>([]);
  const [areaTags, setAreaTags] = useState<string[]>([]);
  const [agentId, setAgentId] = useState("");
  const [slug, setSlug] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [clientNameR, setClientNameR] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [decisionStyle, setDecisionStyle] = useState("");
  const [stressResponse, setStressResponse] = useState("");
  const [paceStyle, setPaceStyle] = useState("");
  const [agentType, setAgentType] = useState("residential");
  const [videoUrl, setVideoUrl] = useState("");
  const [commercialSpecialties, setCommercialSpecialties] = useState<string[]>([]);
  const [dealSizeRange, setDealSizeRange] = useState("");
  const [designations, setDesignations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [personalityStep, setPersonalityStep] = useState(0);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralCopied, setReferralCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setAgentId(user.id);
      const { data } = await supabase.from("agents").select("*").eq("id", user.id).single();
      if (data) {
        setName(data.name || "");
        setBio(data.bio || "");
        setCity(data.city || "");
        setYearsExp(data.years_exp?.toString() || "");
        setStyleTags(data.style_tags || []);
        setClientTags(data.client_tags || []);
        setAreaTags(data.area_tags || []);
        setSlug(data.slug || "");
        setAvatarUrl(data.avatar_url || "");
        setCommunicationStyle(data.communication_style || "");
        setDecisionStyle(data.decision_style || "");
        setStressResponse(data.stress_response || "");
        setPaceStyle(data.pace_style || "");
        setAgentType(data.agent_type || "residential");
        setVideoUrl(data.video_url || "");
        setCommercialSpecialties(data.commercial_specialties || []);
        setDealSizeRange(data.deal_size_range || "");
        setDesignations(data.designations || []);
        setReferralCode(data.referral_code || "");
        setReferralCount(data.referral_count || 0);
      }
      const { data: reviewData } = await supabase.from("reviews").select("*").eq("agent_id", user.id).order("created_at", { ascending: false });
      const { data: connectionData } = await supabase.from("connections").select("*").eq("agent_id", user.id).order("created_at", { ascending: false });
      setConnections(connectionData || []);
      if (!data?.referred_by && !data?.referral_count) {
        fetch("/api/referral/credit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newAgentId: user.id, newAgentName: data?.name || "" }) });
      }
      setReviews(reviewData || []);
      setLoading(false);
    }
    load();
  }, []);

  function toggleTag(tag: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !agentId) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${agentId}.${ext}`;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Not logged in"); setUploading(false); return; }
    const res = await fetch(`https://sfmtwcjwjmpbunvqoazg.supabase.co/storage/v1/object/avatars/${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: file,
    });
    if (res.ok) {
      setAvatarUrl(`https://sfmtwcjwjmpbunvqoazg.supabase.co/storage/v1/object/public/avatars/${path}`);
    } else {
      const err = await res.text();
      alert("Upload error: " + err);
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + user.id.slice(0, 4);
    await supabase.from("agents").upsert({ id: user.id, name, slug: newSlug, bio, city, years_exp: parseInt(yearsExp) || 0, style_tags: styleTags, client_tags: clientTags, area_tags: areaTags, avatar_url: avatarUrl, communication_style: communicationStyle, decision_style: decisionStyle, stress_response: stressResponse, pace_style: paceStyle, agent_type: agentType, commercial_specialties: commercialSpecialties, deal_size_range: dealSizeRange, video_url: videoUrl, designations: designations });
    setSlug(newSlug);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleSendReview() {
    if (!clientNameR || !clientPhone) return;
    setSending(true);
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const { error } = await supabase.from("reviews").insert({ agent_id: agentId, token, client_name: clientNameR, client_phone: clientPhone, address });
    if (!error) {
      setSendSuccess(true);
      setClientNameR("");
      setClientPhone("");
      setAddress("");
      const { data: reviewData } = await supabase.from("reviews").select("*").eq("agent_id", agentId).order("created_at", { ascending: false });
      setReviews(reviewData || []);
      setTimeout(() => setSendSuccess(false), 4000);
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  const completionScore = () => {
    let score = 0;
    if (name) score += 20;
    if (bio) score += 20;
    if (city) score += 10;
    if (yearsExp) score += 10;
    if (styleTags.length > 0) score += 15;
    if (clientTags.length > 0) score += 15;
    if (areaTags.length > 0) score += 10;
    return score;
  };

  const isNewAgent = !name && reviews.length === 0 && connections.length === 0;

  function getResponseBadge() {
    const responded = connections.filter(c => c.response_hours != null);
    if (responded.length === 0) return null;
    const avg = responded.reduce((sum, c) => sum + c.response_hours, 0) / responded.length;
    if (avg < 1) return { label: "⚡ Responds in under 1 hour", color: "text-[#D85A30] bg-[#D85A30]/10 border-[#D85A30]/20" };
    if (avg < 4) return { label: "⚡ Responds within " + Math.round(avg) + " hours", color: "text-[#D85A30] bg-[#D85A30]/10 border-[#D85A30]/20" };
    if (avg < 24) return { label: "✓ Responds same day", color: "text-[#D85A30] bg-[#D85A30]/10 border-[#D85A30]/20" };
    return { label: "Responds within a few days", color: "text-[#6b6a65] bg-[#f7f5f0] border-black/[0.08]" };
  }
  const responseBadge = getResponseBadge();

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <nav className="bg-[#1a1918] px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-lg font-medium text-white">meet<span className="text-[#D85A30]">my</span>agent</a>
        <div className="flex items-center gap-4">
          {slug && <a href={"/agents/" + slug} target="_blank" className="text-xs text-white/40 hover:text-white/60">view my profile</a>}
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-50 text-white text-sm font-medium">
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save profile"}
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {isNewAgent && (
          <div className="bg-[#1a1918] rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D85A30]/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="inline-flex items-center gap-2 bg-[#D85A30]/20 border border-[#D85A30]/30 rounded-full px-3 py-1 mb-4">
              <span className="text-xs font-medium text-[#f4a07a]">founding agent</span>
            </div>
            <h2 className="text-xl font-medium text-white mb-2">Welcome to Meet My Agent! 🎉</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">You are one of the first agents on the platform. Build your profile below and consumers will start matching with you based on your personality and working style.</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div className="bg-[#D85A30] h-2 rounded-full" style={{width: completionScore() + "%"}} />
              </div>
              <span className="text-white/50 text-xs">{completionScore()}% complete</span>
            </div>
          </div>
        )}

        {!isNewAgent && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
              <div className="text-2xl font-medium text-[#1a1918]">{completionScore()}%</div>
              <div className="text-xs text-[#6b6a65] mt-1">profile complete</div>
              <div className="mt-3 bg-[#f7f5f0] rounded-full h-1.5">
                <div className="bg-[#D85A30] h-1.5 rounded-full transition-all" style={{width: completionScore() + "%"}} />
              </div>
            </div>
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
              <div className="text-2xl font-medium text-[#1a1918]">{connections.length}</div>
              <div className="text-xs text-[#6b6a65] mt-1">consumers connected</div>
              {responseBadge && <div className={"text-xs font-medium mt-2 px-2 py-1 rounded-full border " + responseBadge.color}>{responseBadge.label}</div>}
            </div>
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
              <div className="text-2xl font-medium text-[#1a1918]">{reviews.filter(r => r.completed_at).length}</div>
              <div className="text-xs text-[#6b6a65] mt-1">reviews collected</div>
            </div>
          </div>
        )}


        {slug && reviews.filter(r => r.completed_at).length > 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-6">
            <h2 className="text-base font-medium text-[#1a1918] mb-1">embed your reviews</h2>
            <p className="text-sm text-[#6b6a65] mb-4">paste this on any page of your website to show your reviews</p>
            <div className="bg-[#1a1918] rounded-xl p-4 mb-3 overflow-x-auto">
              <code className="text-xs text-green-400 whitespace-nowrap">
                {`<iframe src="https://www.meetmyagent.app/embed/${slug}" width="100%" height="400" frameborder="0" style="border-radius:16px;"></iframe>`}
              </code>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`<iframe src="https://www.meetmyagent.app/embed/${slug}" width="100%" height="400" frameborder="0" style="border-radius:16px;"></iframe>`)}
              className="text-sm font-medium text-[#D85A30] hover:text-[#993C1D]">
              copy snippet
            </button>
          </div>
        )}
        {referralCode {slug && ({slug && ( (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[#1a1918]">your referral link</h3>
              {referralCount > 0 {slug && ({slug && ( (
                <span className="text-xs bg-[#EAF3DE] text-[#3B6D11] border border-[#3B6D11]/20 rounded-full px-3 py-1">
                  {referralCount} {referralCount === 1 ? "agent" : "agents"} joined
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#f7f5f0] border border-black/[0.08] rounded-lg px-3 py-2 text-sm text-[#6b6a65] truncate">
                meetmyagent.app/join?ref={referralCode}
              </div>
              <button onClick={() => { navigator.clipboard.writeText("https://meetmyagent.app/join?ref=" + referralCode); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                className="shrink-0 px-4 py-2 text-sm rounded-lg border border-black/[0.08] bg-white hover:bg-[#f7f5f0] transition-colors">
                {referralCopied ? "copied! ✓" : "copy"}
              </button>
            </div>
            <p className="mt-3 text-xs text-[#9f9e99]">share this with other agents — you will get credit and a notification when they join</p>
          </div>
        )}
        {slug {slug && ({slug && ( (
          <div className="bg-[#1a1918] rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">your public profile is live</p>
              <p className="text-xs text-white/40 mt-0.5">meetmyagent.app/agents/{slug}</p>
            </div>
            <a href={"/agents/" + slug} target="_blank"
              className="px-4 py-2 rounded-lg bg-[#D85A30] text-white text-xs font-medium hover:bg-[#993C1D] transition-colors">
              preview
            </a>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-black/[0.06] pb-6">
          {[
            { id: "profile", label: "profile" },
            { id: "personality", label: "personality" },
            { id: "activity", label: "activity" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (activeTab === tab.id ? "bg-[#1a1918] text-white" : "bg-white border border-black/[0.08] text-[#6b6a65] hover:border-black/20")}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && <div className="flex flex-col gap-4">
        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-medium mb-1 text-[#1a1918]">basic info</h2>
          <p className="text-sm text-[#1a1918] mb-5">how you will appear to consumers</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#FAECE7] flex items-center justify-center flex-shrink-0 border border-black/[0.06]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#993C1D] font-medium text-2xl">
                  {name ? name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "?"}
                </span>
              )}
            </div>
            <div>
              <label className="cursor-pointer text-sm font-medium text-[#D85A30] hover:text-[#993C1D]">
                {uploading ? "Uploading..." : "Upload photo"}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <p className="text-xs text-[#9f9e99] mt-1">JPG or PNG, square works best</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-[#1a1918] block mb-1.5">full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Reynolds" className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1a1918] block mb-1.5">years of experience</label>
              <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="7" className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-[#1a1918] block mb-1.5">primary city</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Cedar Park" className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#1a1918] block mb-1.5">your bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Skip the sales pitch, be real..." className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30] resize-none" />
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-[#1a1918] block mb-1.5">intro video (optional)</label>
            <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
              placeholder="Paste a YouTube or Loom link — 30-60 seconds works best"
              className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]" />
            <p className="text-xs text-[#9f9e99] mt-1.5">Record a quick intro on Loom (free) or your phone. Tell buyers who you are and how you work.</p>
            {videoUrl && (
              <div className="mt-3 bg-[#f7f5f0] rounded-xl p-3 text-xs text-[#6b6a65]">
                video saved — it will appear on your public profile after saving
              </div>
            )}
          </div>
        </div>


        </div>}

        {activeTab === "personality" && <div className="flex flex-col gap-4">
        {(() => {
          const steps = [
            {
              id: "communication",
              label: "How do you communicate?",
              sublabel: "be honest — this is how consumers will find you",
              options: [
                { value: "connector", label: "The Connector", desc: "Warm and relationship-first. You love real conversations." },
                { value: "analyst", label: "The Analyst", desc: "Data-driven. You communicate through facts and written updates." },
                { value: "driver", label: "The Driver", desc: "Direct and efficient. You get to the point fast." },
                { value: "supporter", label: "The Supporter", desc: "Patient and thorough. No question is too small." },
              ],
              value: communicationStyle,
              setValue: setCommunicationStyle,
            },
            {
              id: "decision",
              label: "How do you support decisions?",
              sublabel: "how do you help clients when they need to decide",
              options: [
                { value: "gut", label: "Trust Your Gut", desc: "You help clients tune into what feels right." },
                { value: "researcher", label: "The Researcher", desc: "You arm clients with every data point." },
                { value: "collaborator", label: "The Collaborator", desc: "You weigh in and give your honest take every time." },
                { value: "independent", label: "Hands Off", desc: "You present options and let clients decide." },
              ],
              value: decisionStyle,
              setValue: setDecisionStyle,
            },
            {
              id: "stress",
              label: "How do you handle stress?",
              sublabel: "what happens when a deal gets hard",
              options: [
                { value: "calm", label: "The Calm One", desc: "The steady presence. Nothing rattles you." },
                { value: "communicator", label: "Over-Communicator", desc: "You communicate more, not less, when things get tense." },
                { value: "problem-solver", label: "The Problem Solver", desc: "You go into solution mode immediately." },
                { value: "empath", label: "The Empath", desc: "You acknowledge the emotion first." },
              ],
              value: stressResponse,
              setValue: setStressResponse,
            },
            {
              id: "pace",
              label: "What is your natural pace?",
              sublabel: "what kind of clients do you work best with",
              options: [
                { value: "sprint", label: "The Sprinter", desc: "You thrive with motivated clients ready to move fast." },
                { value: "marathon", label: "The Marathon Runner", desc: "Patient and great with clients who take their time." },
                { value: "first-timer", label: "The Educator", desc: "You love walking first-timers through every step." },
                { value: "adaptive", label: "The Chameleon", desc: "You adapt to whatever the client needs." },
              ],
              value: paceStyle,
              setValue: setPaceStyle,
            },
            {
              id: "style",
              label: "Your working style",
              sublabel: "select all that apply — consumers match based on this",
              multi: true,
              options: STYLE_TAGS.map(t => ({ value: t, label: t })),
              value: styleTags,
              setValue: setStyleTags,
            },
            {
              id: "clients",
              label: "Who do you work best with?",
              sublabel: "select all that apply",
              multi: true,
              options: CLIENT_TAGS.map(t => ({ value: t, label: t })),
              value: clientTags,
              setValue: setClientTags,
            },
            {
              id: "designations",
              label: "Designations & certifications",
              sublabel: "select any you hold — this helps match you with the right clients",
              multi: true,
              options: DESIGNATIONS.map(d => ({ value: d.code, label: d.code, desc: d.name })),
              value: designations,
              setValue: setDesignations,
            },
          ];
          const step = steps[personalityStep];
          const total = steps.length;
          const progress = Math.round((personalityStep / (total - 1)) * 100);
          return (
            <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#D85A30] uppercase tracking-widest">{personalityStep + 1} of {total}</p>
                {step.value && !step.multi && <span className="text-xs text-[#0F6E56] font-medium">✓ saved</span>}
              </div>
              <div className="w-full bg-[#f7f5f0] rounded-full h-1.5 mb-5">
                <div className="bg-[#D85A30] h-1.5 rounded-full transition-all" style={{width: progress + "%"}} />
              </div>
              <h2 className="text-lg font-medium text-[#1a1918] mb-1">{step.label}</h2>
              <p className="text-sm text-[#9f9e99] mb-5">{step.sublabel}</p>
              <div className={step.multi ? "flex flex-wrap gap-2" : "flex flex-col gap-3"}>
                {step.options.map((opt: any) => {
                  const isSelected = step.multi
                    ? (step.value as string[]).includes(opt.value)
                    : step.value === opt.value;
                  return (
                    <button key={opt.value}
                      onClick={() => {
                        if (step.multi) {
                          const arr = step.value as string[];
                          (step.setValue as any)(arr.includes(opt.value) ? arr.filter((x: string) => x !== opt.value) : [...arr, opt.value]);
                        } else {
                          (step.setValue as any)(opt.value);
                        }
                      }}
                      className={"transition-all border " + (step.multi
                        ? "px-3 py-1.5 rounded-lg text-sm font-medium " + (isSelected ? "bg-[#1a1918] border-[#1a1918] text-white" : "bg-[#f7f5f0] border-black/[0.1] text-[#6b6a65]")
                        : "text-left p-4 rounded-xl w-full " + (isSelected ? "bg-[#1a1918] border-[#1a1918]" : "bg-[#f7f5f0] border-black/[0.08] hover:border-black/20"))}>
                      {!step.multi && (
                        <>
                          <p className={"text-sm font-medium mb-1 " + (isSelected ? "text-white" : "text-[#1a1918]")}>{opt.label}</p>
                          {opt.desc && <p className="text-xs text-[#6b6a65] leading-relaxed">{opt.desc}</p>}
                        </>
                      )}
                      {step.multi && (
                        <span>{opt.label}{opt.desc ? " · " + opt.desc : ""}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-6">
                {personalityStep > 0 && (
                  <button onClick={() => setPersonalityStep(personalityStep - 1)}
                    className="flex-1 py-3 rounded-xl border border-black/[0.1] text-sm text-[#6b6a65] font-medium">
                    ← back
                  </button>
                )}
                <button onClick={() => {
                  if (personalityStep < total - 1) setPersonalityStep(personalityStep + 1);
                  else { handleSave(); setActiveTab("profile"); }
                }}
                  className="flex-1 py-3 rounded-xl bg-[#1a1918] text-white text-sm font-medium">
                  {personalityStep < total - 1 ? "next →" : "save profile ✓"}
                </button>
              </div>
            </div>
          );
        })()}

        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-medium mb-1 text-[#1a1918]">areas you know cold</h2>
          <p className="text-sm text-[#6b6a65] mb-4">select all the markets where you actively work</p>
          {areaTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {areaTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#1a1918] text-white">
                  {tag}
                  <button onClick={() => toggleTag(tag, areaTags, setAreaTags)} className="text-white/40 hover:text-white leading-none">×</button>
                </span>
              ))}
            </div>
          )}
          <select onChange={e => { if (e.target.value && !areaTags.includes(e.target.value)) toggleTag(e.target.value, areaTags, setAreaTags); e.target.value = ""; }}
            className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#6b6a65] focus:outline-none focus:border-[#D85A30] cursor-pointer">
            <option value="">+ add a market...</option>
            {Object.entries(AREA_TAGS_BY_STATE).map(([state, cities]) => (
              <optgroup key={state} label={state}>
                {cities.filter(c => !areaTags.includes(c)).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-medium text-[#1a1918] mb-1">agent type</h2>
          <p className="text-sm text-[#6b6a65] mb-5">do you work residential, commercial, or both?</p>
          <div className="flex gap-3 mb-6">
            {["residential", "commercial", "both"].map(type => (
              <button key={type} onClick={() => setAgentType(type)}
                className={"flex-1 py-3 rounded-xl border text-sm font-medium transition-all " + (agentType === type ? "bg-[#1a1918] border-[#1a1918] text-white" : "bg-[#f7f5f0] border-black/[0.1] text-[#6b6a65]")}>
                {type}
              </button>
            ))}
          </div>

          {(agentType === "commercial" || agentType === "both") && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-3">commercial specialties</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["office", "retail", "industrial", "multifamily", "mixed-use", "land", "hospitality", "healthcare", "self-storage"].map(spec => (
                  <button key={spec} onClick={() => setCommercialSpecialties(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])}
                    className={"px-3 py-1.5 rounded-full text-sm border transition-all " + (commercialSpecialties.includes(spec) ? "bg-[#1a1918] border-[#1a1918] text-white font-medium" : "bg-[#f7f5f0] border-black/[0.1] text-[#6b6a65]")}>
                    {spec}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9f9e99] mb-3">typical deal size</p>
              <div className="flex flex-col gap-2">
                {["Under $1M", "$1M — $5M", "$5M — $20M", "$20M+", "All sizes"].map(size => (
                  <button key={size} onClick={() => setDealSizeRange(size)}
                    className={"w-full text-left px-4 py-3 rounded-xl border text-sm transition-all " + (dealSizeRange === size ? "bg-[#1a1918] border-[#1a1918] text-white font-medium" : "bg-[#f7f5f0] border-black/[0.1] text-[#6b6a65]")}>
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        </div>}

        {activeTab === "activity" && <div className="flex flex-col gap-4">
        <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-50 text-white font-medium text-sm mb-8">
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save profile"}
        </button>

        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-medium mb-1 text-[#1a1918]">request a review</h2>
          <p className="text-sm text-[#1a1918] mb-5">enter your client info — we will generate a review link you can send them</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-[#1a1918] block mb-1.5">client first name</label>
              <input type="text" value={clientNameR} onChange={e => setClientNameR(e.target.value)} placeholder="Tony" className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1a1918] block mb-1.5">their phone number</label>
              <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(512) 555-0199" className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-[#1a1918] block mb-1.5">property address (optional)</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Austin" className="w-full px-3 py-2.5 rounded-lg border border-black/[0.1] bg-[#f7f5f0] text-sm text-[#1a1918] focus:outline-none focus:border-[#D85A30]" />
          </div>
          {sendSuccess && (
            <div className="bg-[#EAF3DE] border border-[#3B6D11]/20 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-[#3B6D11]">Review link created! Copy the link below and send it to your client.</p>
            </div>
          )}
          <button onClick={handleSendReview} disabled={sending || !clientNameR || !clientPhone} className="w-full py-3 rounded-xl bg-[#1a1918] hover:bg-black disabled:opacity-40 text-white font-medium text-sm">
            {sending ? "Creating..." : "Create review link"}
          </button>
        </div>

        {connections.length > 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-6">
            <h2 className="text-base font-medium mb-1 text-[#1a1918]">people who want to connect</h2>
            <p className="text-sm text-[#1a1918] mb-5">these buyers and sellers reached out to you directly</p>
            <div className="flex flex-col gap-3">
              {connections.map(c => (
                <div key={c.id} className="flex items-center justify-between py-3 border-b border-black/[0.06] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#1a1918]">{c.consumer_name}</p>
                    <p className="text-xs text-[#6b6a65] mt-0.5">{c.consumer_email} {c.consumer_phone ? "· " + c.consumer_phone : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#D85A30]">{c.match_score}% match</span>
                    {c.consumer_email && (
                      <a href={"mailto:" + c.consumer_email} className="text-xs bg-[#1a1918] text-white px-3 py-1.5 rounded-lg font-medium">reply</a>
                    )}
                    {!c.responded_at && (
                      <button onClick={async () => {
                        const hours = (Date.now() - new Date(c.created_at).getTime()) / 3600000;
                        const { error } = await supabase.from("connections").update({ responded_at: new Date().toISOString(), response_hours: Math.round(hours * 10) / 10 }).eq("id", c.id);
                        if (error) { alert("Error: " + JSON.stringify(error)); return; }
                        const { data } = await supabase.from("connections").select("*").eq("agent_id", c.agent_id).order("created_at", { ascending: false });
                        setConnections(data || []);
                      }} className="text-xs text-[#6b6a65] font-medium hover:text-[#1a1918]">
                        mark responded
                      </button>
                    )}
                    {c.responded_at && <span className="text-xs text-[#3B6D11] font-medium">✓ responded</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
            <h2 className="text-base font-medium mb-5 text-[#1a1918]">review requests</h2>
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-black/[0.06] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#1a1918]">{r.client_name}</p>
                    <p className="text-xs text-[#9f9e99]">{r.address || "no address"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.completed_at ? (
                      <span className="text-xs font-medium bg-[#EAF3DE] text-[#3B6D11] px-2.5 py-1 rounded-full">reviewed</span>
                    ) : (
                      <span className="text-xs font-medium bg-[#FAEEDA] text-[#854F0B] px-2.5 py-1 rounded-full">pending</span>
                    )}
                    <button onClick={() => { navigator.clipboard.writeText("https://www.meetmyagent.app/review/" + r.token); setCopiedToken(r.token); setTimeout(() => setCopiedToken(null), 2000); }} className="text-xs text-[#D85A30] font-medium">
                      {copiedToken === r.token ? "copied! ✓" : "copy link"}
                    </button>
                    {r.completed_at && (
                      <button
                        onClick={async () => {
                          const reply = prompt("Your reply to " + r.client_name + ":");
                          if (!reply) return;
                          const supabase = createClient();
                          await supabase.from("reviews").update({ agent_reply: reply, replied_at: new Date().toISOString() }).eq("id", r.id);
                          const { data: reviewData } = await supabase.from("reviews").select("*").eq("agent_id", agentId).order("created_at", { ascending: false });
                          setReviews(reviewData || []);
                        }}
                        className="text-xs text-[#6b6a65] font-medium hover:text-[#1a1918]">
                        {r.agent_reply ? "edit reply" : "reply"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>}
      </div>
    </div>
  );
}