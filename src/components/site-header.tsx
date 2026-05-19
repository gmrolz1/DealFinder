import Link from "next/link";

const NAV: [string, string][] = [
  ["Properties", "/properties"],
  ["Areas", "/areas"],
  ["Developers", "/developers"],
  ["New Launches", "/new-launches"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-data bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <span className="text-[20px] font-extrabold uppercase tracking-[0.02em] text-ink">
            DealFinder
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate md:flex">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/properties"
          className="border border-ink bg-ink px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.07em] text-paper transition hover:bg-paper hover:text-ink"
        >
          Browse
        </Link>
      </div>
    </header>
  );
}
