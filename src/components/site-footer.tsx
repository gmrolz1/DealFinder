import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Deal<span className="text-emerald-600">Finder</span>
            </span>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Egypt&apos;s property marketplace — apartments, villas and
              chalets across the country&apos;s top compounds.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <Link href="/properties" className="hover:text-emerald-600">
              All properties
            </Link>
            <Link href="/properties?type=Apartment" className="hover:text-emerald-600">
              Apartments
            </Link>
            <Link href="/properties?type=Villa" className="hover:text-emerald-600">
              Villas
            </Link>
            <Link href="/properties?type=Chalet" className="hover:text-emerald-600">
              Chalets
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} DealFinder. MVP build — listing data is
          for demonstration.
        </p>
      </div>
    </footer>
  );
}
