import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

import { loadStayByToken } from "@/lib/stay/loader";

const client = new Anthropic();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI chat is not configured yet." },
      { status: 503 }
    );
  }

  let body: { message?: string; token?: string; history?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message, token, history = [] } = body;
  if (!message || !token) {
    return NextResponse.json({ error: "Missing message or token" }, { status: 400 });
  }

  const stay = await loadStayByToken(token);
  if (!stay) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  const { reservation, amenities } = stay;
  const property = reservation.property;
  const location = property.location;
  const host = property.host;

  const systemPrompt = `You are a personal AI concierge for ${property.name}, a vacation property in ${location?.city ?? property.city ?? "Greece"}.

You are helping ${reservation.guestName || "a guest"} staying from ${new Date(reservation.checkIn).toDateString()} to ${new Date(reservation.checkOut).toDateString()}.

PROPERTY INFORMATION:
- Name: ${property.name}
- WiFi: ${property.wifiName ?? "not set"} / Password: ${property.wifiPassword ?? "not set"}
- Check-in: ${location?.checkInTime ?? property.checkInTime ?? "15:00"}
- Check-out: ${location?.checkOutTime ?? property.checkOutTime ?? "11:00"}
- Address: ${property.address ?? "not set"}
- House rules: ${property.houseRules ?? "Standard house rules apply"}
- Description: ${property.description ?? ""}

${location ? `SHARED FACILITIES & LOCATION:
- Amenities: ${amenities.length > 0 ? amenities.map((a: { name: string; hours?: string; notes?: string }) => `${a.name}${a.hours ? ` (${a.hours})` : ""}${a.notes ? ` — ${a.notes}` : ""}`).join(", ") : "none"}
- Quiet hours: ${location.quietHoursStart ?? "23:00"} — ${location.quietHoursEnd ?? "08:00"}
- Gate code: ${location.gateCode ?? "not applicable"}
- Parking: ${location.parkingInfo ?? "ask host"}
- Building access: ${location.buildingAccess ?? ""}` : ""}

LOCAL KNOWLEDGE FROM YOUR HOST ${host.displayName || host.name || ""}:
${location?.localTips ?? property.localTips ?? "The host has not added local tips yet."}

IMPORTANT CONTACTS:
${(location?.contacts ?? []).map((c) => `- ${c.name}: ${c.phone}${c.notes ? ` (${c.notes})` : ""}`).join("\n") || "No contacts added"}

GUIDELINES:
- Be warm, helpful and conversational — like a knowledgeable local friend
- Answer in the SAME LANGUAGE the guest is writing in
- Keep answers concise — this is a mobile chat, not an essay (2-4 sentences ideal)
- For emergencies always provide 112 (general) or 166 (ambulance)
- If you don't know something specific, suggest contacting the host directly
- Never make up phone numbers, addresses, or facts
- Always be positive about the local area`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 500,
      system: systemPrompt,
      messages: [...history, { role: "user", content: message }],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Failed to get a response. Please try again." },
      { status: 500 }
    );
  }
}
