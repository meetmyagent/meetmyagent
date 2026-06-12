import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: agents } = await supabase
      .from("agents")
      .select("*")
      .not("name", "is", null)
      .not("email", "is", null);

    if (!agents || agents.length === 0) {
      return NextResponse.json({ message: "no agents" });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    for (const agent of agents) {
      const { data: newConnections } = await supabase
        .from("connections")
        .select("*")
        .eq("agent_id", agent.id)
        .gte("created_at", oneWeekAgo);

      const { data: newReviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("agent_id", agent.id)
        .not("completed_at", "is", null)
        .gte("completed_at", oneWeekAgo);

      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("agent_id", agent.id)
        .not("completed_at", "is", null);

      const avgRating = allReviews && allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : null;

      const connectionsThisWeek = newConnections?.length || 0;
      const reviewsThisWeek = newReviews?.length || 0;
      const firstName = agent.name?.split(" ")[0] || "there";

      await resend.emails.send({
        from: "Meet My Agent <hello@meetmyagentemail.com>",
        to: agent.email,
        subject: "your week on Meet My Agent",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f7f5f0;">
            <div style="background:#1a1918;border-radius:16px;padding:32px;margin-bottom:16px;">
              <p style="color:#D85A30;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">weekly digest</p>
              <h1 style="color:white;font-size:22px;font-weight:500;margin:0 0 4px;">Hey ${firstName}!</h1>
              <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">here is your week on Meet My Agent</p>
            </div>
            <div style="display:flex;gap:12px;margin-bottom:16px;">
              <div style="flex:1;background:white;border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:28px;font-weight:600;color:#1a1918;">${connectionsThisWeek}</div>
                <div style="font-size:12px;color:#6b6a65;margin-top:4px;">new connections</div>
              </div>
              <div style="flex:1;background:white;border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:28px;font-weight:600;color:#1a1918;">${reviewsThisWeek}</div>
                <div style="font-size:12px;color:#6b6a65;margin-top:4px;">new reviews</div>
              </div>
              ${avgRating ? `<div style="flex:1;background:white;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:28px;font-weight:600;color:#D85A30;">★ ${avgRating}</div><div style="font-size:12px;color:#6b6a65;margin-top:4px;">avg rating</div></div>` : ""}
            </div>
            <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;">
              <p style="font-size:14px;color:#6b6a65;margin:0 0 16px;line-height:1.6;">
                ${connectionsThisWeek === 0 && reviewsThisWeek === 0
                  ? "Quiet week — but your profile is live and matching with consumers. Make sure your tags and bio are up to date to improve your matches."
                  : "You had " + connectionsThisWeek + " new connection" + (connectionsThisWeek !== 1 ? "s" : "") + " this week. Log in to see their details and reply."}
              </p>
              <a href="https://www.meetmyagent.app/agents/dashboard" style="display:inline-block;background:#D85A30;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:500;font-size:13px;">view my dashboard</a>
            </div>
            <p style="font-size:11px;color:#9f9e99;text-align:center;margin:0;">meetmyagent.app · sent every monday</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ message: "sent " + agents.length + " digests" });
  } catch (err) {
    console.error("Digest error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
