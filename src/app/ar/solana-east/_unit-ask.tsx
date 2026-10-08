"use client";

// "What's still available in this unit type?" — a soft ask on each launch-price
// card; it hands the unit to the guide form instead of opening a sales pitch.

export function UnitAsk({ unit }: { unit: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("se:want", { detail: { unit } }))}
      className="mt-4 h-10 w-full rounded-xl border border-white/25 text-sm font-bold text-paper"
    >
      اعرف المتاح · {unit}
    </button>
  );
}
