import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { data } = await supabase
    .from("consumer_profiles")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!data) return NextResponse.json({ error: "No profile found" }, { status: 404 });

  return NextResponse.json({ profile: data });
}
