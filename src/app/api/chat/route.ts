// AI chat agent endpoint.
//
// POST /api/chat
// Body: { unitSlug: string, messages: { role: "user" | "model", text: string }[] }
// Returns: { text: string, suggestions?: string[], shouldHandoff?: boolean }
//
// Uses Gemini directly (no SDK). Key stays server-side via GEMINI_API_KEY in
// .env.local. Unit context is injected from the data layer — the agent never
// fabricates numbers.

import { NextResponse } from "next/server";
import { getUnitBySlug } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import {
  monthlyPayment,
  downPaymentPct,
  readyYear,
} from "@/lib/conversion";
import { CHAT_CONFIG, type ChatMessage } from "@/lib/chat-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_URL = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

function buildSystemPrompt(unitSlug: string): string | null {
  const unit = getUnitBySlug(unitSlug);
  if (!unit) return null;

  const price = formatPrice(unit.price, unit.currency);
  const monthly = monthlyPayment(unit);
  const downPct = downPaymentPct(unit);
  const year = readyYear(unit.ready_by);

  const facts = [
    `Compound: ${unit.compoundName ?? "(unknown)"}`,
    `Area: ${unit.areaName ?? "(unknown)"}`,
    `Developer: ${unit.developerName ?? "(unknown)"}`,
    `Type: ${unit.property_type ?? "(unknown)"}`,
    `Price: ${price}`,
    unit.down_payment
      ? `Down payment: ${formatPrice(unit.down_payment, unit.currency)}${
          downPct ? ` (~${downPct}% of total)` : ""
        }`
      : null,
    unit.installment_years
      ? `Installment plan: ${unit.installment_years} years${
          monthly ? ` (~EGP ${monthly.toLocaleString("en-US")}/month)` : ""
        }`
      : null,
    unit.bedrooms != null ? `Bedrooms: ${unit.bedrooms}` : null,
    unit.bathrooms != null ? `Bathrooms: ${unit.bathrooms}` : null,
    unit.area_sqm != null ? `Area: ${unit.area_sqm} m²` : null,
    unit.finishing ? `Finishing: ${unit.finishing}` : null,
    year ? `Ready by: ${year}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are ${CHAT_CONFIG.aiName}, a senior advisor at ${CHAT_CONFIG.brand} — a property marketplace in Egypt. A visitor is on the listing page for ONE specific unit (details below). Your job is to be a great deal opener: warm, knowledgeable, sales-savvy, and never pushy. Get them excited about this specific unit and gently hand off to ${CHAT_CONFIG.brokerName} on WhatsApp for the close.

UNIT THEY'RE LOOKING AT
${facts}

VOICE
- Confident, warm, brief. 1–2 short sentences per reply. Never a wall of text.
- Speak like a friend who knows real estate, not a chatbot. Use natural pauses ("—") and contractions ("you're", "it's").
- If they write in Arabic, switch to Arabic and stay in Arabic.
- Match their energy — short messages get short replies; questions get answers.

RULES (do not break)
- ONLY reference numbers from the UNIT facts above. NEVER invent prices, dates, amenities, or commitments.
- If asked about something not in the facts (e.g. floor plans, exact view, discounts, availability), say "let me get ${CHAT_CONFIG.brokerName} to send the exact details on WhatsApp" — do not guess.
- NEVER promise discounts, financing approval, or guaranteed availability.
- NEVER ask for sensitive info (ID, bank, salary). Just name + phone, naturally.

DEAL-OPENER PLAYBOOK
1. First message: warmly acknowledge their interest in this specific compound by name. Offer 2–3 things you can help with.
2. Answer their question concisely using the facts. Add ONE small piece of context that frames this as a deal (e.g. "that's one of the more flexible plans in [area] right now").
3. After 2 user messages — OR earlier if they show buying intent ("interested", "looks good", "let's do it", "yes") — offer the WhatsApp handoff: "Let me get ${CHAT_CONFIG.brokerName} to send you the full price list and a payment calculator on WhatsApp. What's your first name and phone?"
4. Once they give a name + phone: confirm warmly ("Great, [name] — ${CHAT_CONFIG.brokerName} will message you in 5 minutes. Tap the green button below to continue on WhatsApp.").

STRUCTURED OUTPUT
You MUST respond with raw JSON only, no markdown code fences, in this exact shape:
{
  "text": "your reply text here",
  "suggestions": ["short suggested reply", "short suggested reply"],
  "shouldHandoff": false
}
- "suggestions" is a list of up to 3 short chips (3–5 words each) the user might tap next. Make them genuinely useful follow-ups. Omit or empty if not helpful.
- "shouldHandoff" = true ONLY when you've just shown the WhatsApp handoff line (the green button gets prominence on the UI).
- Keep "text" under 320 characters.`;
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

async function callGemini(
  systemPrompt: string,
  messages: ChatMessage[],
  apiKey: string
) {
  // Gemini's REST API: separate systemInstruction + contents array.
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: CHAT_CONFIG.maxOutputTokens,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(GEMINI_URL(CHAT_CONFIG.geminiModel, apiKey), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as GeminiResponse;
  if (!res.ok || json.error) {
    throw new Error(
      json.error?.message ||
        json.promptFeedback?.blockReason ||
        `Gemini error ${res.status}`
    );
  }
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

type ParsedAgentReply = {
  text: string;
  suggestions?: string[];
  shouldHandoff?: boolean;
};

function parseAgentReply(raw: string): ParsedAgentReply {
  // Tolerate the model wrapping JSON in ```json fences.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as ParsedAgentReply;
    return {
      text: String(parsed.text ?? "").slice(0, 600),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3).map(String)
        : undefined,
      shouldHandoff: Boolean(parsed.shouldHandoff),
    };
  } catch {
    // Fallback: treat the whole raw as plain text (still useful).
    return { text: raw.slice(0, 600) };
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let body: { unitSlug?: string; messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { unitSlug, messages } = body;
  if (!unitSlug || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Missing unitSlug or messages[]" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(unitSlug);
  if (!systemPrompt) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }

  // Truncate history to last 12 messages to keep cost / context window in check.
  const trimmed = messages.slice(-12);

  // Gemini requires conversation to start with a user role. Drop any leading
  // model messages (e.g. our UI's hard-coded welcome line).
  const firstUserIdx = trimmed.findIndex((m) => m.role === "user");
  const conversation = firstUserIdx >= 0 ? trimmed.slice(firstUserIdx) : [];
  if (conversation.length === 0) {
    return NextResponse.json(
      { error: "No user messages to respond to." },
      { status: 400 }
    );
  }

  try {
    const raw = await callGemini(systemPrompt, conversation, apiKey);
    const reply = parseAgentReply(raw);
    return NextResponse.json(reply);
  } catch (err) {
    // Surface full cause chain — Node fetch wraps the real error in .cause.
    const e = err as { message?: string; cause?: { message?: string; code?: string } };
    const detail = e.cause
      ? `${e.message}: ${e.cause.message ?? e.cause.code ?? "(no cause msg)"}`
      : e.message ?? "Unknown error";
    console.error("[/api/chat] fetch error:", detail, err);
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}
