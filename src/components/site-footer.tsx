import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <span className="flex items-center gap-2">
              <Logo className="h-5 w-5 text-ink" />
              <span className="text-[15px] font-semibold tracking-tight text-ink">
                DealFinder
              </span>
            </span>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
              Egypt&apos;s property marketplace — primary homes from trusted
              developers.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px] text-ink-soft">
            <Link href="/properties" className="hover:text-ink">
              All properties
            </Link>
            <Link href="/areas" className="hover:text-ink">
              Areas
            </Link>
            <Link href="/developers" className="hover:text-ink">
              Developers
            </Link>
            <Link href="/new-launches" className="hover:text-ink">
              New launches
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-hairline pt-6 text-[12px] text-ink-faint">
          © {new Date().getFullYear()} DealFinder. MVP build — listing data
          shown for demonstration.
        </p>
      </div>
    </footer>
  );
}
