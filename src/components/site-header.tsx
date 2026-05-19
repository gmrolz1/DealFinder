import Link from "next/link";
import { Logo } from "@/components/logo";

const NAV: [string, string][] = [
  ["Properties", "/properties"],
  ["Areas", "/areas"],
  ["Developers", "/developers"],
  ["New Launches", "/new-launches"],
];

// Material-style top app bar, monolith black.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate bg-ink">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-[14px] w-auto text-paper" />
          <span className="text-[14px] font-extrabold uppercase tracking-[0.05em] text-paper">
            The Deal Maker
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.09em] text-data md:flex">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-paper">
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/properties"
          className="bg-paper px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.07em] text-ink transition hover:bg-data"
        >
          Browse
        </Link>
      </div>
    </header>
  );
}
