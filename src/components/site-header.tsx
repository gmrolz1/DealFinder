import Link from "next/link";

const NAV = [
  ["Properties", "/properties"],
  ["Areas", "/areas"],
  ["Developers", "/developers"],
  ["New Launches", "/new-launches"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-[17px] font-semibold tracking-tight text-ink">
            Deal<span className="text-blue">Finder</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[12px] font-normal text-ink md:flex">
          {NAV.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-ink/80 transition hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/properties"
          className="rounded-full bg-blue px-3.5 py-1.5 text-[12px] font-medium text-white transition hover:bg-blue-hover"
        >
          Browse
        </Link>
      </div>
    </header>
  );
}
