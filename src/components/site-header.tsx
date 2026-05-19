import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 font-bold text-white">
            D
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Deal<span className="text-emerald-600">Finder</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/properties" className="hover:text-emerald-600">
            All properties
          </Link>
          <Link href="/properties?sort=price-desc" className="hover:text-emerald-600">
            Luxury
          </Link>
          <Link href="/properties?sort=price-asc" className="hover:text-emerald-600">
            Best value
          </Link>
        </nav>

        <Link
          href="/properties"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Browse listings
        </Link>
      </div>
    </header>
  );
}
