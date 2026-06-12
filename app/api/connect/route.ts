import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

const BUYER_TYPE_BRIEFS: Record<string, { how: string; tip: string }> = {
  "The Fast Mover": {
    how: "Moves quickly and decisively. Already knows what they want.",
    tip: "Lead with your availability. Skip the small talk and get to the point fast.",
  },
  "The Thoughtful Planner": {
    how: "Takes their time, asks great questions, wants to understand every step.",
    tip: "Be patient and educational. Never rush them — they'll lose trust immediately.",
  },
  "The Collaborative Partner": {
    how: "Wants a real partnership. Thinks out loud and values honest opinions.",
    tip: "Share your genuine read on things. They want a thought partner, not an order taker.",
  },
  "The Independent Decision Maker": {
    how: "Comes prepared with research. Knows what they want and respects autonomy.",
    tip: "Give them data and let them drive. Don't over-explain things they already know.",
  },
};

async function getAiOpeningLine(consumerName: string, buyerType: string, matchScore: number): Promise<string> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: `Write a single opening text message an agent should send to a new lead named ${consumerName}. They are "${buyerType}" personality type and a ${matchScore}% match. Keep it under 25 words. Warm, direct, no sales language. Just a natural first message.`,
        }],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text || "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agentId, agentName, agentEmail, consumerName, consumerEmail, consumerPhone, matchScore, buyerType, readinessScore, matchExplanation, consumerTags } = await req.json();

    const { error } = await supabase.from("connections").insert({
      agent_id: agentId,
      consumer_name: consumerName,
      consumer_email: consumerEmail,
      consumer_phone: consumerPhone,
      match_score: matchScore,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (agentEmail) {
      const buyerBrief = buyerType ? BUYER_TYPE_BRIEFS[buyerType] : null;
      const openingLine = buyerType ? await getAiOpeningLine(consumerName, buyerType, matchScore) : "";

      await resend.emails.send({
        from: "Meet My Agent <hello@meetmyagentemail.com>",
        to: agentEmail,
        subject: `${consumerName} wants to connect · ${matchScore}% match`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7f5f0;">

            <div style="background:#1a1918;border-radius:16px;padding:32px;margin-bottom:16px;">
              <p style="color:#D85A30;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">new connection</p>
              <h1 style="color:white;font-size:24px;font-weight:500;margin:0 0 4px;">${consumerName} wants to work with you</h1>
              <p style="color:rgba(255,255,255,0.4);font-size:14px;margin:0;">${matchScore}% personality match${readinessScore ? " · " + readinessScore : ""}</p>
            </div>

            <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;">
              <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9f9e99;margin:0 0 12px;">contact info</p>
              ${consumerEmail ? `<p style="font-size:14px;margin:0 0 6px;color:#1a1918;"><strong>Email:</strong> <a href="mailto:${consumerEmail}" style="color:#D85A30;">${consumerEmail}</a></p>` : ""}
              ${consumerPhone ? `<p style="font-size:14px;margin:0;color:#1a1918;"><strong>Phone:</strong> ${consumerPhone}</p>` : ""}
            </div>

            ${buyerType ? `
            <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;">
              <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9f9e99;margin:0 0 12px;">buyer personality</p>
              <p style="font-size:16px;font-weight:500;color:#D85A30;margin:0 0 8px;">${buyerType}</p>
              ${buyerBrief ? `
              <p style="font-size:13px;color:#6b6a65;margin:0 0 12px;line-height:1.6;">${buyerBrief.how}</p>
              <div style="background:#f7f5f0;border-radius:8px;padding:12px 14px;border-left:3px solid #D85A30;">
                <p style="font-size:12px;font-weight:600;color:#D85A30;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">how to approach</p>
                <p style="font-size:13px;color:#6b6a65;margin:0;line-height:1.6;">${buyerBrief.tip}</p>
              </div>
              ` : ""}
            </div>
            ` : ""}

            ${matchExplanation ? `
            <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;">
              <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9f9e99;margin:0 0 8px;">why you matched</p>
              <p style="font-size:13px;color:#6b6a65;margin:0;line-height:1.6;">${matchExplanation}</p>
            </div>
            ` : ""}

            ${openingLine ? `
            <div style="background:#1a1918;border-radius:12px;padding:20px;margin-bottom:12px;">
              <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#D85A30;margin:0 0 8px;">suggested opening text</p>
              <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0;line-height:1.6;font-style:italic;">"${openingLine}"</p>
            </div>
            ` : ""}

            <div style="text-align:center;padding:20px 0 8px;">
              <a href="https://www.meetmyagent.app/agents/dashboard" style="display:inline-block;background:#D85A30;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:500;font-size:14px;">view in dashboard</a>
            </div>

            <p style="font-size:11px;color:#9f9e99;text-align:center;margin:16px 0 0;">meetmyagent.app · reply to this email to reach our team</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (err) {
    console.error("Connect error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
