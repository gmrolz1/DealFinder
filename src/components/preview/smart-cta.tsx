"use client";

// Smart CTA — a single chat-opening button whose label cycles through
// intent prompts ("Ask about this unit", "See better alternatives",
// "Match my payment plan", …). Each rotation slides in from a different
// direction (up / right / left) so the motion feels alive, not mechanical.
//
// Behaviour:
//   - Auto-rotates every ROTATE_MS while the visitor is NOT hovering /
//     focused / has the chat open.
//   - Clicking opens the chat sheet seeded with that intent's first message
//     (or just an open chat for "Ask anything").
//   - prefers-reduced-motion is respected via globals.css.

import { useEffect, useRef, useState } from "react";
import type { EnrichedUnit } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { ChatSheet } from "./chat-sheet";
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
  className = "",
}: {
  unit: EnrichedUnit;
  locale?: Locale;
  intents?: ChatIntent[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  // Rotate only when mounted on the client — avoid the first-paint flash.
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

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
        className={`group relative flex w-full items-center justify-center gap-1.5 overflow-hidden border border-ink bg-ink px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-paper transition hover:bg-paper hover:text-ink ${className}`}
        aria-label={label}
      >
        <span
          className="inline-block h-1.5 w-1.5 shrink-0 bg-green-400 group-hover:bg-ink"
          aria-hidden="true"
        />
        {/* keying on index re-mounts the span and re-fires the CSS animation */}
        <span
          key={index}
          className={`inline-block truncate ${animClass[current.dir]}`}
        >
          {label}
        </span>
      </button>

      {/* tiny progress dots — visual indicator of how many intents are in rotation */}
      {intents.length > 1 && (
        <div
          aria-hidden="true"
          className="flex items-center justify-center gap-1 border-x border-b border-data bg-paper px-3 py-1"
        >
          {intents.map((it, i) => (
            <span
              key={it.id}
              className={`h-[3px] transition-all duration-300 ${
                i === index ? "w-5 bg-ink" : "w-1.5 bg-data"
              }`}
            />
          ))}
        </div>
      )}

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
