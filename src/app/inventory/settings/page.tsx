import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SourceSettingsCard } from "./card";

export const dynamic = "force-dynamic";

const fmtDT = (s: string | null) =>
  s
    ? new Date(s).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

type Cred = {
  source: string;
  kind: string;
  value: string;
  updated_at: string;
  issued_at: string | null;
  expires_at: string | null;
  last_ok_at: string | null;
  last_fail_at: string | null;
  last_fail_reason: string | null;
};

type Autom = {
  source: string;
  enabled: boolean;
  schedule_time: string;
  last_scheduled_at: string | null;
  next_scheduled_at: string | null;
  last_result: string | null;
};

export default async function SettingsPage() {
  const sb = getSupabaseAdmin();
  const [{ data: creds }, { data: autos }] = await Promise.all([
    sb.schema("sync").from("credentials").select("*"),
    sb.schema("sync").from("automation").select("*"),
  ]);
  const credBy: Record<string, Cred | undefined> = {};
  for (const c of (creds ?? []) as Cred[]) credBy[c.source] = c;
  const autBy: Record<string, Autom | undefined> = {};
  for (const a of (autos ?? []) as Autom[]) autBy[a.source] = a;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Settings</h2>
        <p className="text-xs text-neutral-500">
          Token editors, live health, and daily-refresh automation for each
          source. All times UTC.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SourceSettingsCard
          source="nawy"
          kind="bearer"
          label="Nawy — erealty.nawy.com"
          hint="Bearer JWT from DevTools → Network → any request → Authorization header. Lifetime ~1 hour."
          placeholder="eyJraWQi..."
          cred={credBy["nawy"] ?? null}
          autom={autBy["nawy"] ?? null}
        />
        <SourceSettingsCard
          source="propertyhub"
          kind="cookie"
          label="PropertyHub — propertyhub.site"
          hint="Full cookie header. Session lives ~30 days, cf_clearance rotates faster (~24h)."
          placeholder="session=...; cf_clearance=...; _fbp=..."
          cred={credBy["propertyhub"] ?? null}
          autom={autBy["propertyhub"] ?? null}
        />
      </div>
    </section>
  );
}
