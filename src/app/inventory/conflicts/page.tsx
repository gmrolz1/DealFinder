import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ConflictRow } from "./row";

export const dynamic = "force-dynamic";
const fmt = new Intl.NumberFormat("en-US");

export default async function ConflictsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const sp = await searchParams;
  const showResolved = sp.show === "resolved";

  const sb = getSupabaseAdmin();
  let q = sb
    .schema("sync")
    .from("conflicts")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(200);
  q = showResolved ? q.not("resolved_at", "is", null) : q.is("resolved_at", null);
  const { data } = await q;
  const rows = data ?? [];

  // Fetch enrichment: nawy unit + ph unit info in batch
  const nawyIds = rows.map((r) => r.nawy_unit_id).filter((x): x is number => !!x);
  const phIds = rows.map((r) => r.ph_unit_id).filter((x): x is string => !!x);
  const [{ data: nawyRows }, { data: phRows }] = await Promise.all([
    nawyIds.length
      ? sb
          .schema("nawy")
          .from("units")
          .select(
            "id, compound_name, unit_id, developer_name, area_name, bedrooms, unit_area, price, image",
          )
          .in("id", nawyIds)
      : { data: [] },
    phIds.length
      ? sb
          .schema("propertyhub")
          .from("units")
          .select(
            "id, apartment_code, project_id, developer_id, location_id, bedrooms, area_general_min, price_total_min",
          )
          .in("id", phIds)
      : { data: [] },
  ]);
  const nawyMap = new Map(
    (nawyRows ?? []).map((r) => [r.id as number, r]),
  );
  const phMap = new Map(
    (phRows ?? []).map((r) => [r.id as string, r]),
  );

  // Load project/dev/loc names for PH enrichment
  const projIds = new Set(
    (phRows ?? [])
      .map((r) => r.project_id as string | null)
      .filter((x): x is string => !!x),
  );
  const devIds = new Set(
    (phRows ?? [])
      .map((r) => r.developer_id as string | null)
      .filter((x): x is string => !!x),
  );
  const [projs, devs] = await Promise.all([
    projIds.size
      ? sb
          .schema("propertyhub")
          .from("projects")
          .select("id, name")
          .in("id", [...projIds])
      : { data: [] },
    devIds.size
      ? sb
          .schema("propertyhub")
          .from("developers")
          .select("id, name")
          .in("id", [...devIds])
      : { data: [] },
  ]);
  const projMap = new Map(
    ((projs.data ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name]),
  );
  const devMap = new Map(
    ((devs.data ?? []) as { id: string; name: string }[]).map((d) => [d.id, d.name]),
  );

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-medium">Price conflicts</h2>
          <p className="text-xs text-neutral-500">
            Same unit found in both sources but the price disagrees by more
            than 2%. Pick which one to trust — this saves your call, it
            doesn&apos;t change the source data.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <a
            href="/inventory/conflicts"
            className={
              "rounded border px-2 py-1 " +
              (!showResolved
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-700")
            }
          >
            Open ({fmt.format(rows.length)})
          </a>
          <a
            href="/inventory/conflicts?show=resolved"
            className={
              "rounded border px-2 py-1 " +
              (showResolved
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-700")
            }
          >
            Resolved
          </a>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const nawyU = r.nawy_unit_id ? nawyMap.get(r.nawy_unit_id) : null;
          const phU = r.ph_unit_id ? phMap.get(r.ph_unit_id) : null;
          const phProjectName =
            phU?.project_id ? projMap.get(phU.project_id as string) ?? "—" : "—";
          const phDevName =
            phU?.developer_id ? devMap.get(phU.developer_id as string) ?? "—" : "—";
          return (
            <ConflictRow
              key={r.id}
              id={r.id}
              matchKey={r.match_key}
              field={r.field}
              detectedAt={r.detected_at}
              resolvedAt={r.resolved_at}
              resolution={r.resolution}
              nawy={
                nawyU
                  ? {
                      compound: nawyU.compound_name as string,
                      unit: nawyU.unit_id as string,
                      developer: nawyU.developer_name as string,
                      area: nawyU.area_name as string,
                      bedrooms: nawyU.bedrooms as number,
                      m2: nawyU.unit_area as number,
                      price: nawyU.price as number,
                      image: nawyU.image as string,
                    }
                  : null
              }
              ph={
                phU
                  ? {
                      project: phProjectName,
                      code: phU.apartment_code as string,
                      developer: phDevName,
                      bedrooms: phU.bedrooms as number,
                      m2: phU.area_general_min as number,
                      price: phU.price_total_min as number,
                    }
                  : null
              }
            />
          );
        })}
        {rows.length === 0 && (
          <div className="rounded-md border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
            {showResolved
              ? "No resolved conflicts yet."
              : "No open conflicts. Nice."}
          </div>
        )}
      </div>
    </section>
  );
}
