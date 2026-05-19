import Link from "next/link";
import { Logo } from "@/components/logo";

const NAV: [string, string][] = [
  ["Properties", "/properties"],
  ["Areas", "/areas"],
  ["Developers", "/developers"],
  ["New Launches", "/new-launches"],
];

// Material-style top app bar.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-surface shadow-[0_1px_2px_rgba(60,64,67,0.15)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-[16px] w-auto text-primary" />
          <span className="text-[19px] font-bold tracking-tight text-ink">
            Deal<span className="text-primary">Finder</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[14px] font-medium text-muted md:flex">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/properties"
          className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-primary-dark"
        >
          Browse
        </Link>
      </div>
    </header>
  );
}
