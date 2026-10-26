"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/inventory", label: "Overview" },
  { href: "/inventory/update", label: "Update" },
  { href: "/inventory/projects", label: "Projects" },
  { href: "/inventory/nawy", label: "Nawy" },
  { href: "/inventory/propertyhub", label: "PropertyHub" },
  { href: "/inventory/merged", label: "Merged" },
  { href: "/inventory/conflicts", label: "Conflicts" },
  { href: "/inventory/history", label: "History" },
  { href: "/inventory/settings", label: "Settings" },
];

export function InventoryNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1 text-sm">
      {TABS.map((t) => {
        const active =
          t.href === "/inventory"
            ? pathname === t.href
            : pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={
              "rounded px-3 py-1.5 transition-colors " +
              (active
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
