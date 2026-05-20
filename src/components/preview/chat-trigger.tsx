"use client";

// Button that opens the chat sheet. Sized to drop in as a CTA on cards.

import { useState } from "react";
import type { EnrichedUnit } from "@/lib/data";
import { ChatSheet } from "./chat-sheet";
import { CHAT_CONFIG } from "@/lib/chat-config";

export function ChatTrigger({
  unit,
  className = "",
  size = "md",
}: {
  unit: EnrichedUnit;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const padding = size === "sm" ? "py-1.5 px-3" : "py-2 px-3";

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
        Ask {CHAT_CONFIG.aiName} about this unit
      </button>
      {open && <ChatSheet unit={unit} onClose={() => setOpen(false)} />}
    </>
  );
}
