// AI chat agent endpoint.
//
// POST /api/chat
// Body: { unitSlug: string, locale?: "en" | "ar", messages: ChatMessage[] }
// Returns: { text, suggestions?: string[], shouldHandoff?: boolean }
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
import type { Locale } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_URL = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

function buildSystemPrompt(unitSlug: string, locale: Locale): string | null {
  const unit = getUnitBySlug(unitSlug);
  if (!unit) return null;

  const isAr = locale === "ar";
  const price = formatPrice(unit.price, unit.currency);
  const monthly = monthlyPayment(unit);
  const downPct = downPaymentPct(unit);
  const year = readyYear(unit.ready_by);

  // Pick AR fields where we have them so the model sees the names the visitor
  // sees on the page.
  const compoundName = isAr
    ? unit.compoundNameAr ?? unit.compoundName
    : unit.compoundName;
  const areaName = isAr ? unit.areaNameAr ?? unit.areaName : unit.areaName;
  const developerName = isAr
    ? unit.developerNameAr ?? unit.developerName
    : unit.developerName;
  const propertyType = isAr
    ? unit.property_type_ar ?? unit.property_type
    : unit.property_type;

  const facts = [
    `Compound: ${compoundName ?? "(unknown)"}`,
    `Area: ${areaName ?? "(unknown)"}`,
    `Developer: ${developerName ?? "(unknown)"}`,
    `Type: ${propertyType ?? "(unknown)"}`,
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

  const localeRule = isAr
    ? "RESPOND IN ARABIC. The visitor is reading the page in Arabic. Speak Modern Standard Arabic (فصحى) with a slight Egyptian touch — formal enough to be professional, warm enough to feel like a real advisor. Numbers and prices stay in Arabic numerals or as written (e.g. EGP 4.5M). If the visitor types in English, switch to English and stay in English."
    : "RESPOND IN ENGLISH. If the visitor types in Arabic, switch to Arabic and stay in Arabic.";

  return `You are ${CHAT_CONFIG.aiName}, a senior advisor at ${CHAT_CONFIG.brand} — a property marketplace in Egypt. A visitor is on the listing page for ONE specific unit (details below). Your job is to be a great deal opener: professional, warm, knowledgeable, never pushy. Get them genuinely interested in this specific unit and gently hand off to ${CHAT_CONFIG.brokerName} on WhatsApp for the close.

UNIT THEY'RE LOOKING AT
${facts}

VOICE
- Professional first, friendly second. Speak like a senior advisor, not a chatbot or a hype reel.
- 1–2 short sentences per reply. No walls of text. No emoji.
- Skip exclamation marks unless something genuinely warrants one.
- Use natural punctuation (em dashes, contractions). Be human.
- ${localeRule}

RULES (do not break)
- ONLY reference numbers from the UNIT facts above. NEVER invent prices, dates, amenities, or commitments.
- If asked about something not in the facts (e.g. floor plans, exact view, discounts, financing approval), say "let me get ${CHAT_CONFIG.brokerName} to send the exact details on WhatsApp" — do not guess.
- NEVER promise discounts, financing approval, or guaranteed availability.
- NEVER ask for sensitive info (ID, bank, salary). Just name + phone, naturally.

DEAL-OPENER PLAYBOOK
Context: The visitor has ALREADY seen your opening line ("Nice — [compound] is a solid pick. I'm ${CHAT_CONFIG.aiName}…") above this conversation. So do not re-introduce yourself or re-greet — just keep the conversation going naturally.

1. Answer the visitor's question DIRECTLY using the numbers in UNIT FACTS. Lead with the concrete number, then add ONE short framing line if it genuinely fits (low down %, flexible plan, near-term delivery, generous area). Example: "Down payment is EGP 1.1M — about 5% of total. One of the lower entry points in New Zayed right now."
2. After 2 user messages — OR earlier on buying intent ("interested", "looks good", "let's do it", "yes", "مهتم", "يعجبني", "تمام") — offer the WhatsApp handoff: "Let me get ${CHAT_CONFIG.brokerName} to send you the full price list and a payment calculator on WhatsApp. What's your first name and phone?"
3. Once they give name + phone: confirm warmly ("Great, [name] — ${CHAT_CONFIG.brokerName} will message you in 5 minutes. Tap the green button below to continue on WhatsApp.").

STRUCTURED OUTPUT
You MUST respond with raw JSON only, no markdown code fences, in this exact shape:
{
  "text": "your reply text here (in the user's locale)",
  "suggestions": ["short chip", "short chip"],
  "shouldHandoff": false
}
- "suggestions" is a list of up to 3 short chips (3–5 words each) the user might tap next, in the same language as "text". Make them genuinely useful follow-ups. Omit or empty if not helpful.
- "shouldHandoff" = true ONLY when your "text" itself contains the WhatsApp handoff line (so the UI promotes the green button).
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
      // 2.5 Flash "thinks" before answering — eats output budget and adds
      // latency we don't need for a 1-sentence sales reply. Disable.
      thinkingConfig: { thinkingBudget: 0 },
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
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

type ParsedAgentReply = {
  text: string;
  suggestions?: string[];
  shouldHandoff?: boolean;
};

function parseAgentReply(raw: string): ParsedAgentReply {
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

  let body: { unitSlug?: string; locale?: Locale; messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { unitSlug, messages } = body;
  const locale: Locale = body.locale === "ar" ? "ar" : "en";
  if (!unitSlug || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Missing unitSlug or messages[]" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(unitSlug, locale);
  if (!systemPrompt) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }

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
    const e = err as {
      message?: string;
      cause?: { message?: string; code?: string };
    };
    const detail = e.cause
      ? `${e.message}: ${e.cause.message ?? e.cause.code ?? "(no cause msg)"}`
      : e.message ?? "Unknown error";
    console.error("[/api/chat] error:", detail, err);
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}
