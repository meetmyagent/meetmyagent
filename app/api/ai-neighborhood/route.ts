import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { consumerTags, city, buyerType } = await req.json();

    const prompt = `You are a knowledgeable real estate advisor. Based on this homebuyer's preferences, recommend the best neighborhood for them in 2-3 conversational sentences. Be specific to their city. Sound like a knowledgeable local friend.

City: ${city}
Buyer type: ${buyerType || "unknown"}
Preferences: ${consumerTags.join(", ")}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    console.log("Anthropic status:", response.status);
    console.log("Anthropic data:", JSON.stringify(data).slice(0, 200));
    
    const text = data.content?.[0]?.text || "";
    return NextResponse.json({ recommendation: text });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
