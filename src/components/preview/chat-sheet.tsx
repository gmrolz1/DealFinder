"use client";

// AI chat sheet — mobile-first sales agent, locale-aware (EN / AR with RTL).

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { EnrichedUnit } from "@/lib/data";
import { type Locale, isRtl } from "@/lib/i18n";
import {
  CHAT_CONFIG,
  CHAT_UI,
  openingMessage,
  buildHandoffWhatsApp,
  type ChatMessage,
} from "@/lib/chat-config";

export function ChatSheet({
  unit,
  onClose,
  locale = "en",
  seedMessage,
}: {
  unit: EnrichedUnit;
  onClose: () => void;
  locale?: Locale;
  /** Optional first message that's auto-sent as soon as the chat opens
   * — used by the SmartCTA when the visitor picks an intent. */
  seedMessage?: string;
}) {
  const ui = CHAT_UI[locale];
  const rtl = isRtl(locale);

  const compoundLabel =
    (locale === "ar"
      ? unit.compoundNameAr ?? unit.compoundName
      : unit.compoundName) ??
    unit.title;
  const priceLabel = formatPrice(unit.price, unit.currency);

  const [messages, setMessages] = useState<ChatMessage[]>([
    openingMessage(compoundLabel, locale),
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoffArmed, setHandoffArmed] = useState(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const seedSentRef = useRef(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Auto-send the seed intent (from SmartCTA) once, on first mount.
  useEffect(() => {
    if (!seedMessage || seedSentRef.current) return;
    seedSentRef.current = true;
    // Small delay so the open transition finishes and the user sees their
    // message land deliberately, not before the sheet has settled.
    const t = window.setTimeout(() => send(seedMessage), 260);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    setDraft("");

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          unitSlug: unit.slug,
          locale,
          messages: nextMessages,
        }),
      });
      const data = (await res.json()) as {
        text?: string;
        suggestions?: string[];
        shouldHandoff?: boolean;
        error?: string;
      };
      if (!res.ok || data.error) {
        throw new Error(data.error || `Chat error ${res.status}`);
      }
      setMessages((m) => [
        ...m,
        {
          role: "model",
          text: data.text ?? "",
          suggestions: data.suggestions,
        },
      ]);
      const userTurns = nextMessages.filter((x) => x.role === "user").length;
      if (data.shouldHandoff || userTurns >= CHAT_CONFIG.handoffAfterMessages) {
        setHandoffArmed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handoffHref() {
    const summary = messages
      .slice(1)
      .map((m) =>
        m.role === "user"
          ? `Client: ${m.text}`
          : `${CHAT_CONFIG.aiName}: ${m.text}`
      )
      .join("\n");
    const userText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.text)
      .join(" ");
    const phoneMatch = userText.match(/\b(\+?2?01[0-9]{9})\b/);
    // Look for Latin OR Arabic name introductions
    const nameMatch = userText.match(
      /(?:i'?m|i am|my name is|name's|اسمي|انا)\s+([\p{L}][\p{L}\s'-]{1,30})/iu
    );
    return buildHandoffWhatsApp(
      compoundLabel,
      priceLabel,
      summary,
      nameMatch?.[1]?.trim() ?? null,
      phoneMatch?.[1] ?? null
    );
  }

  const lastIdx = messages.length - 1;
  const lastSuggestions =
    messages[lastIdx]?.role === "model"
      ? messages[lastIdx].suggestions ?? []
      : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Chat with ${CHAT_CONFIG.aiName}`}
      dir={rtl ? "rtl" : "ltr"}
    >
      <div
        className="flex h-[92vh] w-full max-w-md flex-col border border-ink bg-paper shadow-2xl sm:h-[640px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-ink bg-ink px-4 py-3 text-paper">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center border border-paper bg-paper text-[14px] font-black uppercase text-ink">
              {CHAT_CONFIG.aiName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-tight">
                {CHAT_CONFIG.aiName}
                <span
                  className="inline-block h-1.5 w-1.5 bg-green-400"
                  aria-label={ui.online}
                />
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-data">
                {CHAT_CONFIG.brand} · {ui.aboutPrefix} {compoundLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[28px] leading-none text-paper hover:opacity-70"
          >
            ×
          </button>
        </div>

        {/* UNIT CONTEXT STRIP */}
        <div className="flex items-center gap-3 border-b border-data bg-data/30 px-4 py-2.5">
          {unit.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={unit.image_url}
              alt={compoundLabel}
              className="h-10 w-14 shrink-0 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold text-ink">
              {compoundLabel}
            </p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-slate">
              {priceLabel}
              {unit.bedrooms != null &&
                ` · ${unit.bedrooms} ${locale === "ar" ? "غ.نوم" : "bed"}`}
              {unit.area_sqm != null && ` · ${unit.area_sqm} m²`}
            </p>
          </div>
        </div>

        {/* MESSAGES */}
        <div
          ref={scrollerRef}
          className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4"
        >
          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} rtl={rtl} />
          ))}
          {loading && <TypingIndicator />}
          {error && (
            <div className="border border-ink bg-paper p-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink">
              {ui.errorPrefix} {error}
            </div>
          )}
        </div>

        {/* HANDOFF CTA */}
        {handoffArmed && (
          <a
            href={handoffHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-3 mb-2 grid place-items-center border border-ink bg-ink py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink"
          >
            <span className="flex items-center gap-2">
              <WhatsAppIcon />
              {ui.handoffPrefix} {CHAT_CONFIG.brokerName}
            </span>
          </a>
        )}

        {/* SUGGESTION CHIPS */}
        {lastSuggestions.length > 0 && !loading && (
          <div className="flex flex-wrap gap-1.5 border-t border-data bg-paper px-3 pt-2">
            {lastSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="border border-data px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-slate transition hover:border-ink hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2 border-t border-data bg-paper p-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={ui.inputPlaceholder}
            className="flex-1 border border-data bg-paper px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-slate/60 focus:border-ink"
            disabled={loading}
            autoFocus
            dir={rtl ? "rtl" : "ltr"}
          />
          <button
            type="submit"
            disabled={loading || draft.trim().length === 0}
            className="border border-ink bg-ink px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-paper"
          >
            {ui.send}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ msg, rtl }: { msg: ChatMessage; rtl: boolean }) {
  const isUser = msg.role === "user";
  // In RTL: user bubbles still align "logical end" (left visually), so we
  // use flex-row-reverse implicitly via dir="rtl" on the parent.
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="grid h-7 w-7 shrink-0 place-items-center border border-ink bg-ink text-[11px] font-black uppercase text-paper">
          {CHAT_CONFIG.aiName.charAt(0)}
        </div>
      )}
      <div
        className={`max-w-[78%] whitespace-pre-wrap px-3 py-2 text-[13px] leading-relaxed ${
          isUser
            ? "bg-ink text-paper"
            : "border border-data bg-paper text-ink"
        }`}
        dir={rtl ? "rtl" : "ltr"}
      >
        {msg.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center border border-ink bg-ink text-[11px] font-black uppercase text-paper">
        {CHAT_CONFIG.aiName.charAt(0)}
      </div>
      <div className="border border-data bg-paper px-3 py-2.5">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse bg-ink [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-pulse bg-ink [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-pulse bg-ink" />
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}
