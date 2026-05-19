import Link from "next/link";
import { Logo } from "@/components/logo";

const FACEBOOK = "https://www.facebook.com/profile.php?id=61552295002435";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <span className="flex items-center gap-2.5">
              <Logo className="h-[14px] w-auto text-paper" />
              <span className="text-[14px] font-extrabold uppercase tracking-[0.05em] text-paper">
                The Deal Maker
              </span>
            </span>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-data">
              Where deals happen. Primary real estate from trusted developers
              across Egypt.
            </p>
            <a
              href={FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border border-slate px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-data transition hover:border-data hover:text-paper"
            >
              Facebook ↗
            </a>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-data">
            <Link href="/properties" className="hover:text-paper">
              Properties
            </Link>
            <Link href="/areas" className="hover:text-paper">
              Areas
            </Link>
            <Link href="/developers" className="hover:text-paper">
              Developers
            </Link>
            <Link href="/new-launches" className="hover:text-paper">
              New Launches
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-slate pt-6 text-[10px] uppercase tracking-[0.08em] text-taupe">
          © {new Date().getFullYear()} The Deal Maker · MVP build — listing
          data shown for demonstration
        </p>
      </div>
    </footer>
  );
}
