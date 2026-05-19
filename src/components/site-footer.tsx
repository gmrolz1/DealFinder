import Link from "next/link";
import { Logo } from "@/components/logo";

const FACEBOOK = "https://www.facebook.com/profile.php?id=61552295002435";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <span className="flex items-center gap-2">
              <Logo className="h-[16px] w-auto text-primary" />
              <span className="text-[17px] font-bold tracking-tight text-ink">
                Deal<span className="text-primary">Finder</span>
              </span>
            </span>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
              Egypt&apos;s property marketplace — primary homes from trusted
              developers.
            </p>
            <a
              href={FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full border border-hairline px-4 py-2 text-[12px] font-medium text-muted transition hover:border-primary hover:text-primary"
            >
              Facebook ↗
            </a>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-[13px] text-muted">
            <Link href="/properties" className="hover:text-ink">
              Properties
            </Link>
            <Link href="/areas" className="hover:text-ink">
              Areas
            </Link>
            <Link href="/developers" className="hover:text-ink">
              Developers
            </Link>
            <Link href="/new-launches" className="hover:text-ink">
              New Launches
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-hairline pt-6 text-[12px] text-muted">
          © {new Date().getFullYear()} DealFinder · MVP build — listing data
          shown for demonstration
        </p>
      </div>
    </footer>
  );
}
