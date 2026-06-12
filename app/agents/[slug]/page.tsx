import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AgentProfileClient from "./client";

const STYLE_LABELS: Record<string, string> = {
  connector: "The Connector", analyst: "The Analyst", driver: "The Driver", supporter: "The Supporter",
  gut: "Trust Your Gut", researcher: "The Researcher", collaborator: "The Collaborator", independent: "Hands Off",
  calm: "The Calm One", communicator: "Over-Communicator", "problem-solver": "The Problem Solver", empath: "The Empath",
  sprint: "The Sprinter", marathon: "The Marathon Runner", "first-timer": "The Educator", adaptive: "The Chameleon",
};

const STYLE_DESCS: Record<string, string> = {
  connector: "Builds relationships first. Warm, personable, and keeps everyone on the same page.",
  analyst: "Data-driven and methodical. Will show you the numbers behind every decision.",
  driver: "Direct and decisive. Gets things done fast without wasting your time.",
  supporter: "Patient and client-first. Will never rush you or make you feel pressured.",
  gut: "Goes with instinct honed by experience. Trusts the market feel over spreadsheets.",
  researcher: "Digs deep before advising. Expects to know the neighborhood better than anyone.",
  collaborator: "Thinks out loud with you. Wants your input and gives honest opinions back.",
  independent: "Respects your autonomy. Gives you the info and lets you drive the decision.",
  calm: "Stays steady under pressure. The person you want when a deal gets complicated.",
  communicator: "Keeps you in the loop constantly. No radio silence — ever.",
  "problem-solver": "Thrives when things go sideways. Creative and resourceful when deals get hard.",
  empath: "Tunes into what you're actually feeling, not just what you're saying.",
  sprint: "Moves fast and loves momentum. Best for buyers and sellers ready to act now.",
  marathon: "Plays the long game. Patient with timing and focused on the right outcome.",
  "first-timer": "Loves walking clients through every step. Nothing is assumed or skipped.",
  adaptive: "Reads each client differently. Adjusts their style to fit you, not the other way around.",
};

export default async function AgentProfilePage(props: any) {
  const { slug } = await props.params;
  const supabase = await createClient();
  const { data: agent } = await supabase.from("agents").select("*").eq("slug", slug).single();
  if (!agent) notFound();

  const { data: agentConnections } = await supabase
    .from("connections")
    .select("response_hours")
    .eq("agent_id", agent.id)
    .not("response_hours", "is", null);

  let responseBadge = null;
  if (agentConnections && agentConnections.length > 0) {
    const avg = agentConnections.reduce((sum: number, c: any) => sum + c.response_hours, 0) / agentConnections.length;
    if (avg < 1) responseBadge = "⚡ Responds in under 1 hour";
    else if (avg < 4) responseBadge = "⚡ Responds within " + Math.round(avg) + " hours";
    else if (avg < 24) responseBadge = "✓ Responds same day";
    else responseBadge = "Responds within a few days";
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("agent_id", agent.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  return (
    <AgentProfileClient
      agent={agent}
      reviews={reviews || []}
      responseBadge={responseBadge}
      styleLabels={STYLE_LABELS}
      styleDescs={STYLE_DESCS}
    />
  );
}
