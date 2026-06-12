import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [a, w, c, r] = await Promise.all([
    supabase.from("agents").select("*").order("created_at", { ascending: false }),
    supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
    supabase.from("connections").select("*").order("created_at", { ascending: false }),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    agents: a.data || [],
    waitlist: w.data || [],
    connections: c.data || [],
    reviews: r.data || [],
  });
}
