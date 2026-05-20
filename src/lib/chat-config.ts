// AI chat agent — central config.
// Edit these to customize the agent persona, handoff target, and behaviour.

import type { Locale } from "./i18n";

export const CHAT_CONFIG = {
  /** Display name of the AI agent */
  aiName: "Layla",
  /** Display name of the brokerage / brand */
  brand: "DealFinder",
  /** Human broker who takes over on WhatsApp */
  brokerName: "Ahmed",
  /** Broker WhatsApp number (E.164 format) */
  brokerWhatsApp: "+201023303230",
  /** Broker phone number for tap-to-call (usually same as WhatsApp) */
  brokerPhone: "+201023303230",
  /** Gemini model — fast/cheap tier. Bump to gemini-2.5-pro if you need
   * stronger reasoning at higher latency / cost. */
  geminiModel: "gemini-2.5-flash",
  /** After this many user messages, hard-show the WhatsApp handoff CTA */
  handoffAfterMessages: 3,
  /** Cap reply length so the chat stays snappy. Needs headroom over the
   * actual prose because the JSON wrapper + suggestions eat tokens too. */
  maxOutputTokens: 600,
} as const;

export type ChatMessage = {
  role: "user" | "model";
  text: string;
  /** Optional structured suggestion chips the agent can offer */
  suggestions?: string[];
};

// ────────────────────────────────────────────────────────────────────────────
// LOCALIZATION
// ────────────────────────────────────────────────────────────────────────────

/** UI strings rendered around the chat (not by Gemini — those come from the
 * model itself, which we instruct to reply in the user's locale). */
export const CHAT_UI = {
  en: {
    triggerLabel: "Ask Layla about this unit",
    inputPlaceholder: "Ask Layla anything…",
    send: "Send",
    online: "online",
    aboutPrefix: "about",
    handoffPrefix: "Continue on WhatsApp with",
    callLabel: "Call",
    whatsappLabel: "WhatsApp",
    errorPrefix: "Something went wrong:",
    callbackIn: "Callback in 30 minutes",
  },
  ar: {
    triggerLabel: "اسأل ليلى عن هذه الوحدة",
    inputPlaceholder: "اسأل ليلى أي شيء…",
    send: "إرسال",
    online: "متصل",
    aboutPrefix: "عن",
    handoffPrefix: "تابع على واتساب مع",
    callLabel: "اتصال",
    whatsappLabel: "واتساب",
    errorPrefix: "حدث خطأ:",
    callbackIn: "اتصال خلال 30 دقيقة",
  },
} as const;

/** Initial agent message — short, warm, locale-aware. Suggestion chips set
 * the conversational lane the user is likely to take. */
export function openingMessage(
  compoundName: string,
  locale: Locale = "en"
): ChatMessage {
  if (locale === "ar") {
    return {
      role: "model",
      text: `اختيار ممتاز — ${compoundName}. أنا ليلى من ${CHAT_CONFIG.brand}. ماذا تريد أن تعرف أولاً — خطة الدفع، موعد التسليم، أم لماذا تعتبر هذه صفقة جيدة؟`,
      suggestions: ["خطة الدفع؟", "موعد التسليم؟", "لماذا هذه صفقة جيدة؟"],
    };
  }
  return {
    role: "model",
    text: `Nice — ${compoundName} is a solid pick. I'm ${CHAT_CONFIG.aiName} from ${CHAT_CONFIG.brand}. What do you want to know first — payment plan, ready date, or what makes this one a deal?`,
    suggestions: ["Payment plan?", "Ready date?", "Why is this a deal?"],
  };
}

/** WhatsApp deep link the user clicks to continue with the human broker.
 * Message body is bilingual-friendly: structured fields + raw chat transcript. */
export function buildHandoffWhatsApp(
  unitLabel: string,
  unitPrice: string,
  summary: string,
  visitorName: string | null,
  visitorPhone: string | null
): string {
  const lines = [
    `Hi ${CHAT_CONFIG.brokerName} — new lead from ${CHAT_CONFIG.brand}.`,
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

/** Per-unit WhatsApp deep link for the direct WhatsApp icon on the card —
 * used when the visitor skips the AI and goes straight to the broker. */
export function buildDirectWhatsApp(
  unitLabel: string,
  unitPrice: string,
  locale: Locale = "en"
): string {
  const message =
    locale === "ar"
      ? `مرحباً — أنا مهتم بـ ${unitLabel} (${unitPrice}). ممكن تبعتلي التفاصيل؟`
      : `Hi — I'm interested in ${unitLabel} (${unitPrice}). Can you send details?`;
  const cleanNum = CHAT_CONFIG.brokerWhatsApp.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
}

/** tap-to-call link */
export const brokerTelHref = `tel:${CHAT_CONFIG.brokerPhone.replace(/[^0-9+]/g, "")}`;
