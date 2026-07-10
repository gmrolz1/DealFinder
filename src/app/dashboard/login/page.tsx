import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Login · DealFinder",
  robots: { index: false, follow: false },
};

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  return (
    <div className="grid min-h-[70vh] place-items-center bg-paper px-4">
      <div className="w-full max-w-sm border border-ink">
        <div className="border-b border-ink bg-ink px-5 py-3">
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-paper">
            DealFinder · Lead Dashboard
          </p>
        </div>
        <form method="post" action="/api/admin/login" className="space-y-3 p-5">
          <input
            required
            autoFocus
            type="password"
            name="password"
            placeholder="Admin password"
            className="w-full border border-data bg-paper px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-slate/60 focus:border-ink"
          />
          {e && (
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink">
              Wrong password — try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full border border-ink bg-ink py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-paper transition hover:bg-paper hover:text-ink"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
