import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { InventoryNav } from "./nav";

export const metadata: Metadata = {
  title: "Inventory Sync · DealFinder",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-6 pb-16">
      <header className="mb-6 flex items-baseline justify-between border-b border-neutral-200 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Admin · Inventory
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight">
            Nawy &amp; PropertyHub refresher
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-neutral-500 hover:text-neutral-900 hover:underline"
        >
          ← back to dashboard
        </Link>
      </header>
      <InventoryNav />
      <main className="mt-6">{children}</main>
    </div>
  );
}
