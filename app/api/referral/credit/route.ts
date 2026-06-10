import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { newAgentId, newAgentName } = await req.json();
    if (!newAgentId) return NextResponse.json({ error: "newAgentId required" }, { status: 400 });

    const cookieStore = cookies();
    const referralCode = cookieStore.get("referral_code")?.value;
    if (!referralCode) return NextResponse.json({ message: "no referral code" });

    const { data: referrer, error } = await supabase
      .from("agents")
      .select("id, name, email, referral_count")
      .eq("referral_code", referralCode)
      .single();

    if (error || !referrer) return NextResponse.json({ message: "referral code not found" });
    if (referrer.id === newAgentId) return NextResponse.json({ message: "self-referral skipped" });

    await Promise.all([
      supabase.from("agents").update({ referred_by: referrer.id }).eq("id", newAgentId),
      supabase.from("agents").update({ referral_count: (referrer.referral_count || 0) + 1 }).eq("id", referrer.id),
    ]);

    cookieStore.delete("referral_code");

    if (referrer.email) {
      await resend.emails.send({
        from: "meetmyagent.app <hello@meetmyagent.app>",
        to: referrer.email,
        subject: "Someone joined through your link!",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;">
            <p style="font-size:22px;font-weight:600;margin:0 0 16px;">Your referral worked. 🎉</p>
            <p style="font-size:16px;color:#444;line-height:1.6;margin:0 0 16px;">
              Hey ${referrer.name?.split(" ")[0] || "there"} — <strong>${newAgentName || "A new agent"}</strong> just joined meetmyagent.app through your referral link.
            </p>
            <p style="font-size:16px;color:#444;line-height:1.6;margin:0 0 24px;">
              Your total referrals: <strong>${(referrer.referral_count || 0) + 1}</strong>
            </p>
            <a href="https://meetmyagent.app/agents/dashboard"
               style="display:inline-block;background:#1a1918;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;">
              View your dashboard
            </a>
            <p style="font-size:13px;color:#999;margin-top:32px;">
              Keep sharing — meetmyagent.app/join?ref=${referralCode}
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Referral credit error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
