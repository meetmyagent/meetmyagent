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
    const { email, name, city } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ message: "already_signed_up" }, { status: 200 });
    }

    const { error } = await supabase.from("waitlist").insert({
      email: email.toLowerCase().trim(),
      name: name || null,
      city: city || null,
      source: "landing_page",
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "already_signed_up" }, { status: 200 });
      }
      throw error;
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: linkData } = await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.toLowerCase().trim(),
      options: { redirectTo: "https://www.meetmyagent.app/agents/dashboard" }
    });

    const magicLink = linkData?.properties?.action_link || "https://www.meetmyagent.app/login";

    await resend.emails.send({
      from: "Lindsey at Meet My Agent <hello@meetmyagentemail.com>",
      to: email,
      subject: "you signed up — here is what happens next",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f7f5f0;">
          <div style="background:#1a1918;border-radius:16px;padding:32px;margin-bottom:16px;">
            <p style="color:#D85A30;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">founding agent · you are one of the first</p>
            <h1 style="color:white;font-size:24px;font-weight:500;margin:0 0 8px;">Welcome${name ? ", " + name : ""}! 👋</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0;">meetmyagent.app — personality-matched real estate</p>
          </div>
          <div style="background:white;border-radius:16px;padding:24px;margin-bottom:12px;">
            <p style="font-size:15px;color:#1a1918;font-weight:500;margin:0 0 12px;">Hey${name ? " " + name : ""}!</p>
            <p style="font-size:14px;color:#6b6a65;line-height:1.7;margin:0 0 16px;">I built Meet My Agent because great agents kept getting buried by Zillow ads. You deserve to be found by clients who actually match your style — not just whoever has the biggest marketing budget.</p>
            <p style="font-size:14px;color:#6b6a65;line-height:1.7;margin:0 0 8px;">Your profile is ready to build. Click below — it will log you in automatically and take you straight to your dashboard. No password needed.</p>
            <p style="font-size:14px;color:#6b6a65;line-height:1.7;margin:0 0 20px;">Takes about 10 minutes. Pick your personality tags, write a real bio, and you will be live and matchable with consumers today.</p>
            <a href="${magicLink}" style="display:inline-block;background:#D85A30;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:500;font-size:14px;margin-bottom:20px;">build my profile now — one click login</a>
            <hr style="border:none;border-top:1px solid #f0ede8;margin:20px 0;">
            <p style="font-size:13px;color:#9f9e99;line-height:1.6;margin:0;">This link expires in 24 hours. Questions? Just reply to this email — it comes straight to me.</p>
            <p style="font-size:13px;color:#1a1918;font-weight:500;margin:12px 0 0;">— Lindsey, founder of Meet My Agent</p>
          </div>
          <p style="font-size:11px;color:#9f9e99;text-align:center;margin:0;">meetmyagent.app · built in Austin, TX</p>
        </div>
      `,
    });

    // Add to HubSpot as a contact
    try {
      await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          properties: {
            email: email.toLowerCase().trim(),
            firstname: name?.split(" ")[0] || "",
            lastname: name?.split(" ").slice(1).join(" ") || "",
            city: city || "",
            hs_lead_status: "NEW",
            lifecyclestage: "lead",
          },
        }),
      });
    } catch (hubspotErr) {
      console.error("HubSpot sync failed:", hubspotErr);
      // Don't block signup if HubSpot fails
    }

    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
