"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

const TRAIT_CHIPS = [
  "low-key","honest","patient","fast responder",
  "data nerd","knew the area","no pressure","great communicator",
  "will tell you to walk away","first-timer friendly",
];

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  const [review, setReview] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [chips, setChips] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: r } = await supabase.from("reviews").select("*").eq("token", token).single();
      if (!r) { setLoading(false); return; }
      if (r.completed_at) { setDone(true); setLoading(false); return; }
      setReview(r);
      const { data: a } = await supabase.from("agents").select("*").eq("id", r.agent_id).single();
      setAgent(a);
      setLoading(false);
    }
    load();
  }, [token]);

  function toggleChip(chip: string) {
    setChips(chips.includes(chip) ? chips.filter(c => c !== chip) : [...chips, chip]);
  }

  async function handleSubmit() {
    if (rating === 0) { setError("Please select a star rating"); return; }
    setSubmitting(true);

    let lat = null;
    let lng = null;
    let geoLabel = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      geoLabel = "location captured";
    } catch {
      // geolocation declined — that is fine
    }

    const { error: err } = await supabase
      .from("reviews")
      .update({
        rating,
        trait_chips: chips,
        body,
        lat,
        lng,
        geo_label: geoLabel,
        completed_at: new Date().toISOString(),
      })
      .eq("token", token);

    if (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    } else {
      // Auto-verify agent for neighborhood if review has geo data
      if (geoLabel && geoLabel !== "location captured" && review?.agent_id) {
        const { data: matchingHood } = await supabase
          .from("neighborhoods")
          .select("id, name")
          .ilike("name", "%" + (geoLabel.split(",")[0]?.trim() || "") + "%")
          .single();
        
        if (matchingHood) {
          const { data: existing } = await supabase
            .from("neighborhood_agents")
            .select("*")
            .eq("neighborhood_id", matchingHood.id)
            .eq("agent_id", review.agent_id)
            .single();

          if (existing) {
            const newCount = (existing.review_count || 0) + 1;
            await supabase
              .from("neighborhood_agents")
              .update({ 
                review_count: newCount,
                verified: newCount >= 3,
                verified_at: newCount >= 3 ? new Date().toISOString() : null
              })
              .eq("id", existing.id);
          } else {
            await supabase
              .from("neighborhood_agents")
              .insert({
                neighborhood_id: matchingHood.id,
                agent_id: review.agent_id,
                review_count: 1,
                verified: false,
              });
          }
        }
      }
      // Notify agent of new review
      if (review?.agent_id) {
        const { data: agent } = await supabase
          .from("agents")
          .select("name, email")
          .eq("id", review.agent_id)
          .single();
        if (agent?.email) {
          await fetch("/api/review-notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agentName: agent.name,
              agentEmail: agent.email,
              reviewerName: review.consumer_name,
              rating,
              body,
            }),
          });
        }
      }
      setDone(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-6">🎉</div>
          <h1 className="text-2xl font-medium text-white mb-3">Thank you!</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Your review has been submitted. It means a lot to agents who work hard but do not have a big marketing budget.
          </p>
        </div>
      </div>
    );
  }

  if (!review || !agent) {
    return (
      <div className="min-h-screen bg-[#1a1918] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/40 text-sm">Review link not found or already completed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1918] flex flex-col">
      <nav className="max-w-lg mx-auto w-full px-6 py-5">
        <a href="/" className="text-lg font-medium text-white">
          meet<span className="text-[#D85A30]">my</span>agent
        </a>
      </nav>

      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="max-w-lg w-full">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-[#FAECE7] text-[#993C1D] flex items-center justify-center font-medium flex-shrink-0">
              {agent.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-white font-medium">{agent.name}</p>
              <p className="text-white/40 text-sm">{review.address || agent.city}</p>
            </div>
          </div>

          <h2 className="text-xl font-medium text-white mb-6">
            How was working with {agent.name?.split(" ")[0]}?
          </h2>

          <div className="flex gap-3 mb-8">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-4xl transition-transform hover:scale-110"
              >
                {star <= (hovered || rating) ? "★" : "☆"}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-white/50 text-sm mb-3">What stood out? (pick any)</p>
            <div className="flex flex-wrap gap-2">
              {TRAIT_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={"px-3 py-1.5 rounded-full text-sm border transition-all " + (chips.includes(chip) ? "bg-[#D85A30] border-[#D85A30] text-white font-medium" : "bg-white/5 border-white/15 text-white/60 hover:border-white/30")}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white/50 text-sm mb-2">Anything else? (optional)</p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={3}
              placeholder="What would you tell a friend about working with them?"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full py-3.5 rounded-xl bg-[#D85A30] hover:bg-[#993C1D] disabled:opacity-40 text-white font-medium text-sm transition-colors"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>

          <p className="text-white/20 text-xs text-center mt-4">
            Your location may be captured to verify this review. We never share your exact coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}