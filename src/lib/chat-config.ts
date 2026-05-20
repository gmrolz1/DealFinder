// AI chat agent — central config.
// Edit these to customize the agent persona, hand-off target, and behaviour.

export const CHAT_CONFIG = {
  /** Display name of the AI agent */
  aiName: "Layla",
  /** Display name of the brokerage / brand */
  brand: "DealFinder",
  /** Human broker who takes over on WhatsApp */
  brokerName: "Ahmed",
  /** Brand WhatsApp number — replace with the real broker number */
  brokerWhatsApp: "+201000000000",
  /** Gemini model. Stable models as of mid-2025: gemini-2.5-flash (fast),
   * gemini-2.5-pro (stronger reasoning, higher cost). Flash is the sweet
   * spot for a 1-2 sentence sales-chat reply. */
  geminiModel: "gemini-2.5-flash",
  /** After this many user messages, surface the WhatsApp handoff CTA hard */
  handoffAfterMessages: 3,
  /** Cap message length so the chat stays snappy */
  maxOutputTokens: 220,
} as const;

export type ChatMessage = {
  role: "user" | "model";
  text: string;
  /** Optional structured suggestion chips the agent can offer */
  suggestions?: string[];
};

/** Initial agent message — written for warmth, not for length. */
export function openingMessage(compoundName: string): ChatMessage {
  return {
    role: "model",
    text: `Nice — ${compoundName} is a solid pick. I'm ${CHAT_CONFIG.aiName} from ${CHAT_CONFIG.brand}. What do you want to know first — payment plan, ready date, or what makes this one a deal?`,
    suggestions: ["Payment plan?", "Ready date?", "Why is this a deal?"],
  };
}

/** WhatsApp deep link the user clicks to continue with the human broker. */
export function buildHandoffWhatsApp(
  unitLabel: string,
  unitPrice: string,
  summary: string,
  visitorName: string | null,
  visitorPhone: string | null
): string {
  const lines = [
    `Hi ${CHAT_CONFIG.brokerName} — sending over a lead from ${CHAT_CONFIG.brand}.`,
    ``,
    `🏠 Unit: ${unitLabel}`,
    `💰 Price: ${unitPrice}`,
    visitorName ? `👤 Name: ${visitorName}` : null,
    visitorPhone ? `📞 Phone: ${visitorPhone}` : null,
    ``,
    `💬 Chat summary:`,
    summary,
    ``,
    `Please follow up.`,
  ].filter(Boolean);
  const message = lines.join("\n");
  const cleanNum = CHAT_CONFIG.brokerWhatsApp.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
}
