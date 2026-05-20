"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, localizedPath } from "@/lib/i18n";

const TABS: {
  enLabel: string;
  arLabel: string;
  href: string;
  icon: React.ReactNode;
}[] = [
  {
    enLabel: "Home",
    arLabel: "الرئيسية",
    href: "/",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    ),
  },
  {
    enLabel: "Search",
    arLabel: "بحث",
    href: "/properties",
    icon: <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />,
  },
  {
    enLabel: "Areas",
    arLabel: "المناطق",
    href: "/areas",
    icon: (
      <path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    ),
  },
  {
    enLabel: "Developers",
    arLabel: "المطورون",
    href: "/developers",
    icon: (
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 11h.01M15 11h.01" />
    ),
  },
];

export function MobileTabBar({ locale = "en" }: { locale?: Locale }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-data bg-paper md:hidden">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const href = localizedPath(tab.href, locale);
          const active =
            href === "/" || href === "/ar"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[9px] font-semibold uppercase tracking-[0.07em] ${
                active ? "text-ink" : "text-slate/55"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[22px] w-[22px]"
              >
                {tab.icon}
              </svg>
              {locale === "ar" ? tab.arLabel : tab.enLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
