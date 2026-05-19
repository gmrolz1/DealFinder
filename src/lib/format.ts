// Display formatting helpers.

export function formatPrice(
  n: number | null | undefined,
  currency = "EGP"
): string {
  if (n == null || n <= 0) return "Price on request";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${currency} ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1000) return `${currency} ${Math.round(n / 1000)}K`;
  return `${currency} ${n}`;
}

export function formatFull(
  n: number | null | undefined,
  currency = "EGP"
): string {
  if (n == null || n <= 0) return "Price on request";
  return `${currency} ${Math.round(n).toLocaleString("en-US")}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

// nawy compounds store ready date as an int like 20291231
export function formatReadyBy(v: string | number | null | undefined): string {
  if (v == null) return "—";
  if (typeof v === "number") {
    const s = String(v);
    if (s.length === 8) return `${s.slice(0, 4)}`;
    return s;
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : String(d.getFullYear());
}
