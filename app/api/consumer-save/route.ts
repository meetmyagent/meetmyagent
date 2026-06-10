import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name, buyerType, sessionId } = await req.json();
    const firstName = name?.split(" ")[0] || "";

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await supabase.from("consumer_profiles").upsert({
      email: email.toLowerCase().trim(),
      name: name || null,
      buyer_type: buyerType || null,
      session_id: sessionId,
    }, { onConflict: "email" });

    await resend.emails.send({
      from: "Meet My Agent <hello@meetmyagent.app>",
      to: email,
      subject: firstName ? "your matches are ready, " + firstName + "!" : "your matches are ready!",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f7f5f0;">
          <div style="background:#1a1918;border-radius:16px;padding:32px;margin-bottom:16px;">
            <p style="color:#D85A30;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">your buyer profile</p>
            <h1 style="color:white;font-size:24px;font-weight:500;margin:0 0 8px;">Your matches are ready${firstName ? ', ' + firstName : ''}! 🎉</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0;">meetmyagent.app</p>
          </div>
          <div style="background:white;border-radius:16px;padding:24px;margin-bottom:12px;">
            <p style="font-size:15px;color:#1a1918;font-weight:500;margin:0 0 12px;">Hey${name ? " " + name : ""}!</p>
            <p style="font-size:14px;color:#6b6a65;line-height:1.7;margin:0 0 16px;">We matched you with agents based on your personality and working style. Click below to see your matches — bookmark it to come back anytime without retaking the quiz.</p>
            <a href="https://www.meetmyagent.app/consumer" style="display:inline-block;background:#D85A30;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:500;font-size:14px;margin-bottom:20px;">see my matches</a>
            <hr style="border:none;border-top:1px solid #f0ede8;margin:20px 0;">
            <p style="font-size:13px;color:#9f9e99;">Just enter your email at meetmyagent.app/consumer to pick up where you left off.</p>
          </div>
          <p style="font-size:11px;color:#9f9e99;text-align:center;margin:0;">meetmyagent.app · built in Austin, TX</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (err) {
    console.error("Consumer save error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
