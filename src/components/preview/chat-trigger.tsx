"use client";

// "Ask Layla about this unit" button. Locale-aware label.

import { useState } from "react";
import type { EnrichedUnit } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { ChatSheet } from "./chat-sheet";
import { CHAT_UI } from "@/lib/chat-config";

export function ChatTrigger({
  unit,
  locale = "en",
  className = "",
  size = "md",
}: {
  unit: EnrichedUnit;
  locale?: Locale;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const ui = CHAT_UI[locale];
  const padding = size === "sm" ? "py-1.5 px-3" : "py-2.5 px-3";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`group inline-flex items-center justify-center gap-1.5 bg-ink text-paper text-[11px] font-bold uppercase tracking-[0.06em] transition hover:bg-paper hover:text-ink border border-ink ${padding} ${className}`}
      >
        <span
          className="inline-block h-1.5 w-1.5 bg-green-400 group-hover:bg-ink"
          aria-hidden="true"
        />
        {ui.triggerLabel}
      </button>
      {open && (
        <ChatSheet unit={unit} locale={locale} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
