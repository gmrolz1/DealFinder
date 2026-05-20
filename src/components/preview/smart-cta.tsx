"use client";

// Smart CTA — looks like an embedded chat preview, NOT a generic button.
//
// Structure:
//   ┌──────────────────────────────────────────────┐
//   │ [L] LAYLA · online                  • • •    │  ← header (avatar, name, typing dots)
//   ├──────────────────────────────────────────────┤
//   │ ◀┐                                           │
//   │  │ "Ask me about this unit"          TAP →  │  ← speech bubble + reply hint
//   ├──────────────────────────────────────────────┤
//   │ ▬▬ ▪ ▪ ▪ ▪                                   │  ← intent-position dots
//   └──────────────────────────────────────────────┘
//
// The bubble's left edge has a small triangle tail pointing back to the
// avatar — the universal "speech bubble" cue. Square corners (brand
// requires no rounded corners). The whole block is one clickable button.

import { useEffect, useState } from "react";
import type { EnrichedUnit } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { ChatSheet } from "./chat-sheet";
import { CHAT_CONFIG, CHAT_UI } from "@/lib/chat-config";
import {
  DEFAULT_INTENTS,
  type ChatIntent,
  type IntentDirection,
} from "@/lib/chat-intents";

const ROTATE_MS = 3500;

const animClass: Record<IntentDirection, string> = {
  up: "smart-cta-anim-up",
  right: "smart-cta-anim-right",
  left: "smart-cta-anim-left",
};

export function SmartCTA({
  unit,
  locale = "en",
  intents = DEFAULT_INTENTS,
}: {
  unit: EnrichedUnit;
  locale?: Locale;
  intents?: ChatIntent[];
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  const ui = CHAT_UI[locale];
  const isAr = locale === "ar";

  useEffect(() => {
    if (paused || open || intents.length < 2) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % intents.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, open, intents.length]);

  const current = intents[index];
  const label = current.label[locale];
  const seed = current.seed?.[locale];

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="group block w-full border border-ink bg-ink text-paper text-left transition hover:bg-[#0a0a0a]"
        aria-label={`${CHAT_CONFIG.aiName} · ${label} · ${ui.smartCtaTapReply}`}
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* HEADER ROW — avatar + name + online status + typing dots */}
        <div className="flex items-center gap-2 border-b border-paper/15 px-2.5 py-1.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center bg-paper text-[10px] font-black uppercase text-ink">
            {CHAT_CONFIG.aiName.charAt(0)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.06em]">
            {CHAT_CONFIG.aiName}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-paper/70">
            <span className="inline-block h-1.5 w-1.5 bg-green-400" />
            {ui.online}
          </span>
          {/* Typing dots — purely decorative, signals live conversation */}
          <span
            className="ms-auto flex items-end gap-0.5 pb-0.5"
            aria-hidden="true"
          >
            <span className="h-1 w-1 animate-pulse bg-paper/70 [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-pulse bg-paper/70 [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-pulse bg-paper/70" />
          </span>
        </div>

        {/* BUBBLE ROW — speech bubble holds the rotating intent */}
        <div className="flex items-center gap-2 px-2.5 py-2">
          <SpeechBubble rtl={isAr}>
            <span
              key={index}
              className={`block truncate text-[12px] font-bold ${animClass[current.dir]}`}
            >
              {label}
            </span>
          </SpeechBubble>
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.08em] text-paper/70">
            {ui.smartCtaTapReply}
            <span className="ms-1 inline-block">{isAr ? "←" : "→"}</span>
          </span>
        </div>

        {/* PROGRESS DOTS */}
        {intents.length > 1 && (
          <div
            aria-hidden="true"
            className="flex items-center justify-center gap-1 border-t border-paper/15 px-3 py-1"
          >
            {intents.map((it, i) => (
              <span
                key={it.id}
                className={`h-[3px] transition-all duration-300 ${
                  i === index ? "w-5 bg-paper" : "w-1.5 bg-paper/30"
                }`}
              />
            ))}
          </div>
        )}
      </button>

      {open && (
        <ChatSheet
          unit={unit}
          locale={locale}
          seedMessage={seed}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/** Square speech bubble (brand requires square corners). Triangle tail
 * on the leading edge points back toward the avatar in the header above. */
function SpeechBubble({
  children,
  rtl,
}: {
  children: React.ReactNode;
  rtl: boolean;
}) {
  // Tail position swaps for RTL so it points back toward the avatar
  // (which is also on the leading edge of the header).
  return (
    <div
      className={`relative flex-1 overflow-hidden border border-paper bg-paper px-2.5 py-1.5 text-ink ${
        rtl ? "me-1.5" : "ms-1.5"
      }`}
    >
      {/* Triangle tail rendered with a single rotated square — purely cosmetic */}
      <span
        aria-hidden="true"
        className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-s border-paper bg-paper ${
          rtl ? "-end-1" : "-start-1"
        }`}
      />
      <span className="relative block">{children}</span>
    </div>
  );
}
