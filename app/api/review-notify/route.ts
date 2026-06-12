import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { agentName, agentEmail, reviewerName, rating, body } = await req.json();
    if (!agentEmail) return NextResponse.json({ error: "Missing agent email" }, { status: 400 });

    await resend.emails.send({
      from: "Meet My Agent <hello@meetmyagentemail.com>",
      to: agentEmail,
      subject: "You received a new review on meetmyagent.app",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f7f5f0;padding:32px;border-radius:12px;">
          <p style="font-size:13px;color:#9f9e99;margin:0 0 16px;">meetmyagent.app</p>
          <h2 style="font-size:20px;color:#1a1918;margin:0 0 8px;">You got a new review!</h2>
          <p style="font-size:14px;color:#6b6a65;margin:0 0 24px;">Here is what your client had to say:</p>
          <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="font-size:22px;margin:0 0 8px;">${"⭐".repeat(rating || 5)}</p>
            ${body ? `<p style="font-size:14px;color:#1a1918;line-height:1.6;margin:0;">"${body}"</p>` : ""}
          </div>
          <a href="https://meetmyagent.app/agents/dashboard" style="display:inline-block;background:#D85A30;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">view your profile</a>
          <p style="font-size:12px;color:#9f9e99;margin:24px 0 0;">questions? hello@meetmyagentemail.com</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
