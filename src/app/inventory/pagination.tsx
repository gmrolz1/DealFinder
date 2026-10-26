import Link from "next/link";

const fmt = new Intl.NumberFormat("en-US");

export function Pagination({
  base,
  page,
  totalPages,
  q,
}: {
  base: string;
  page: number;
  totalPages: number;
  q: string;
}) {
  if (totalPages <= 1) return null;
  const link = (p: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-neutral-600">
      <span>
        Page {page} of {fmt.format(totalPages)}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={link(page - 1)} className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50">
            ← Prev
          </Link>
        )}
        {page < totalPages && (
          <Link href={link(page + 1)} className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
