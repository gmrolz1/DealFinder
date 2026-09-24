// Inventory sync engine — Nawy (Bearer token) and PropertyHub (session cookie)
// into their own Supabase schemas. Server-only.

import { getSupabaseAdmin } from "./supabase-admin";

// ---------- Credentials ----------
export type CredSource = "nawy" | "propertyhub";

export async function getCredential(source: CredSource) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .schema("sync")
    .from("credentials")
    .select("*")
    .eq("source", source)
    .maybeSingle();
  if (error) throw error;
  return data as {
    source: CredSource;
    kind: string;
    value: string;
    issued_at: string | null;
    expires_at: string | null;
    updated_at: string;
    last_ok_at: string | null;
    last_fail_at: string | null;
    last_fail_reason: string | null;
  } | null;
}

// ---------- Automation ----------
export type Automation = {
  source: CredSource;
  enabled: boolean;
  schedule_time: string;         // 'HH:MM:SS' UTC
  last_scheduled_at: string | null;
  next_scheduled_at: string | null;
  last_result: string | null;
  updated_at: string;
};

export async function getAutomation(source: CredSource): Promise<Automation | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .schema("sync")
    .from("automation")
    .select("*")
    .eq("source", source)
    .maybeSingle();
  return data as Automation | null;
}

export async function getAllAutomation(): Promise<Automation[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.schema("sync").from("automation").select("*");
  return (data ?? []) as Automation[];
}

function computeNextScheduled(scheduleTime: string, from = new Date()): Date {
  // scheduleTime is "HH:MM" or "HH:MM:SS" in UTC
  const [h, m] = scheduleTime.split(":").map(Number);
  const next = new Date(from);
  next.setUTCHours(h, m, 0, 0);
  if (next <= from) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export async function setAutomation(
  source: CredSource,
  enabled: boolean,
  scheduleTime: string,
) {
  const sb = getSupabaseAdmin();
  const next = enabled ? computeNextScheduled(scheduleTime).toISOString() : null;
  const { error } = await sb
    .schema("sync")
    .from("automation")
    .upsert(
      {
        source,
        enabled,
        schedule_time: scheduleTime,
        next_scheduled_at: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "source" },
    );
  if (error) throw error;
}

export async function setCredential(
  source: CredSource,
  kind: "bearer" | "cookie",
  value: string,
) {
  const sb = getSupabaseAdmin();
  let issued: string | null = null;
  let expires: string | null = null;

  // Decode JWT exp/iat if it's a Nawy bearer JWT
  if (source === "nawy" && kind === "bearer") {
    try {
      const payload = JSON.parse(
        Buffer.from(value.split(".")[1], "base64").toString("utf8"),
      );
      if (payload.iat) issued = new Date(payload.iat * 1000).toISOString();
      if (payload.exp) expires = new Date(payload.exp * 1000).toISOString();
    } catch {
      /* ignore */
    }
  }

  const { error } = await sb
    .schema("sync")
    .from("credentials")
    .upsert(
      {
        source,
        kind,
        value,
        issued_at: issued,
        expires_at: expires,
        updated_at: new Date().toISOString(),
        last_fail_at: null,
        last_fail_reason: null,
      },
      { onConflict: "source" },
    );
  if (error) throw error;
}

async function markCredential(
  source: CredSource,
  ok: boolean,
  reason?: string,
) {
  const sb = getSupabaseAdmin();
  const patch: Record<string, string | null> = ok
    ? { last_ok_at: new Date().toISOString() }
    : { last_fail_at: new Date().toISOString(), last_fail_reason: reason ?? "" };
  await sb.schema("sync").from("credentials").update(patch).eq("source", source);
}

// ---------- Run bookkeeping ----------
async function startRun(source: CredSource) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .schema("sync")
    .from("runs")
    .insert({ source, status: "running" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as number;
}

async function finishRun(
  runId: number,
  patch: Partial<{
    status: string;
    pages_fetched: number;
    rows_seen: number;
    rows_added: number;
    rows_removed: number;
    rows_changed: number;
    duration_ms: number;
    notes: string;
  }>,
) {
  const sb = getSupabaseAdmin();
  await sb
    .schema("sync")
    .from("runs")
    .update({ ...patch, finished_at: new Date().toISOString() })
    .eq("id", runId);
}

async function logChange(rows: {
  run_id: number;
  source: CredSource;
  entity_type: string;
  entity_id: string;
  action: "added" | "removed" | "changed";
  field?: string;
  before?: unknown;
  after?: unknown;
}[]) {
  if (!rows.length) return;
  const sb = getSupabaseAdmin();
  // insert in chunks of 500
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    await sb.schema("sync").from("changes").insert(batch);
  }
}

// ---------- Fetch helpers ----------
const NAWY_BASE = "https://erealty-backend-api.cooingestate.com/v1";
const NAWY_ORIGIN = "https://erealty.nawy.com";
const PH_BASE =
  "https://www.propertyhub.site/properties/availabilities/__data.json";

async function fetchWithRetry(url: string, headers: HeadersInit, tries = 3) {
  let last: Error | { status: number; body: string } | null = null;
  for (let t = 0; t < tries; t++) {
    try {
      const r = await fetch(url, { headers });
      if (r.status === 401 || r.status === 403) {
        return { auth: false as const, status: r.status };
      }
      if (r.ok) {
        return { auth: true as const, body: await r.json() };
      }
      last = { status: r.status, body: await r.text() };
    } catch (e) {
      last = e as Error;
    }
    if (t < tries - 1) await new Promise((res) => setTimeout(res, 500 * (t + 1)));
  }
  throw new Error(`fetch failed after ${tries} tries: ${JSON.stringify(last)}`);
}

async function fetchInBatches<T>(
  totalPages: number,
  concurrency: number,
  makeUrl: (page: number) => string,
  headers: HeadersInit,
  onPage: (body: unknown, page: number) => T[],
): Promise<{ pages: number; items: T[]; authFailed: boolean }> {
  const items: T[] = [];
  let authFailed = false;
  let done = 0;
  const queue = Array.from({ length: totalPages }, (_, i) => i + 1);

  async function worker() {
    while (queue.length && !authFailed) {
      const page = queue.shift();
      if (!page) return;
      const res = await fetchWithRetry(makeUrl(page), headers);
      if (!res.auth) {
        authFailed = true;
        return;
      }
      const rows = onPage(res.body, page);
      items.push(...rows);
      done++;
    }
  }
  await Promise.all(
    Array.from({ length: concurrency }, () => worker()),
  );
  return { pages: done, items, authFailed };
}

// ---------- SvelteKit __data.json decoder (for PropertyHub) ----------
function decodeSveltekit(pool: unknown[]): Record<string, unknown> | null {
  const seen = new Map<number, unknown>();
  function walk(v: unknown): unknown {
    if (v == null) return v;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v >= pool.length)
      return v;
    if (seen.has(v)) return seen.get(v);
    const raw = pool[v];
    if (raw === undefined) return null;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const out: Record<string, unknown> = {};
      seen.set(v, out);
      for (const [k, i] of Object.entries(raw)) out[k] = walk(i);
      return out;
    }
    if (Array.isArray(raw)) {
      const out: unknown[] = [];
      seen.set(v, out);
      for (const i of raw) out.push(walk(i));
      return out;
    }
    seen.set(v, raw);
    return raw;
  }
  const root = walk(0);
  return (root ?? null) as Record<string, unknown> | null;
}

// ---------- Nawy sync ----------
type NawyPropertyRaw = {
  id: number;
  nawy_id: number;
  unit_id: string | null;
  nawy_property_id: number | null;
  sale_type: string | null;
  entry_type: string | null;
  unit_area: number | null;
  number_of_bedrooms: number | null;
  number_of_bathrooms: number | null;
  floor_number: number | null;
  building_number: string | null;
  finishing: string | null;
  ready_by: string | null;
  on_sale: boolean;
  max_price: number | null;
  last_inventory_update: string | null;
  image: string | null;
  compound: { id?: number; name?: string } | null;
  area: { name?: string } | null;
  developer: { id?: number; name?: string } | null;
  phase: { name?: string } | null;
  property_type: { name?: string } | null;
  property_sub_type: { name?: string } | null;
  commission: { NORMAL?: number; EXPRESS?: number } | null;
  payment_plans: {
    price?: number;
    price_per_meter?: number;
    down_payment?: number;
    years?: number;
  }[] | null;
};

function flattenNawyProperty(r: NawyPropertyRaw) {
  const pp = r.payment_plans?.[0];
  return {
    id: r.id,
    nawy_id: r.nawy_id,
    unit_id: r.unit_id,
    nawy_property_id: r.nawy_property_id,
    sale_type: r.sale_type,
    entry_type: r.entry_type,
    unit_area: r.unit_area,
    bedrooms: r.number_of_bedrooms,
    bathrooms: r.number_of_bathrooms,
    floor_number: r.floor_number,
    building_number: r.building_number,
    finishing: r.finishing,
    ready_by: r.ready_by,
    on_sale: r.on_sale,
    max_price: r.max_price,
    price: pp?.price ?? null,
    price_per_meter: pp?.price_per_meter ?? null,
    down_payment: pp?.down_payment ?? null,
    years: pp?.years ?? null,
    compound_id: r.compound?.id ?? null,
    compound_name: r.compound?.name ?? null,
    area_name: r.area?.name ?? null,
    developer_id: r.developer?.id ?? null,
    developer_name: r.developer?.name ?? null,
    phase_name: r.phase?.name ?? null,
    property_type: r.property_type?.name ?? null,
    property_subtype: r.property_sub_type?.name ?? null,
    commission_normal: r.commission?.NORMAL ?? null,
    commission_express: r.commission?.EXPRESS ?? null,
    last_inventory_update: r.last_inventory_update,
    image: r.image,
  };
}

export async function syncNawy(): Promise<{
  ok: boolean;
  runId: number;
  needsToken?: boolean;
  message?: string;
  added?: number;
  removed?: number;
  changed?: number;
  seen?: number;
}> {
  const runId = await startRun("nawy");
  const t0 = Date.now();
  try {
    const cred = await getCredential("nawy");
    if (!cred) {
      await finishRun(runId, {
        status: "needs_token",
        notes: "No credential stored for nawy",
      });
      return { ok: false, runId, needsToken: true, message: "No Nawy token stored" };
    }
    const headers = {
      Authorization: `Bearer ${cred.value}`,
      Origin: NAWY_ORIGIN,
      Accept: "application/json",
    };

    // 1. Probe page 1 to learn total
    const probe = await fetchWithRetry(
      `${NAWY_BASE}/properties/search?page=1&page_size=200`,
      headers,
    );
    if (!probe.auth) {
      await markCredential("nawy", false, `HTTP ${probe.status}`);
      await finishRun(runId, {
        status: "needs_token",
        notes: `Auth failed with HTTP ${probe.status}`,
      });
      return {
        ok: false,
        runId,
        needsToken: true,
        message: `Nawy token expired (HTTP ${probe.status})`,
      };
    }
    const firstBody = probe.body as {
      total_count: number;
      results: NawyPropertyRaw[];
    };
    const totalProps = firstBody.total_count;
    const propPages = Math.ceil(totalProps / 200);

    // 2. Probe compounds
    const cprobe = await fetchWithRetry(
      `${NAWY_BASE}/compounds?page=1&page_size=200`,
      headers,
    );
    if (!cprobe.auth) {
      await markCredential("nawy", false, `HTTP ${cprobe.status}`);
      await finishRun(runId, {
        status: "needs_token",
        notes: `Auth failed on compounds (HTTP ${cprobe.status})`,
      });
      return {
        ok: false,
        runId,
        needsToken: true,
        message: `Nawy token expired (HTTP ${cprobe.status})`,
      };
    }
    const cFirstBody = cprobe.body as {
      total_count: number;
      compounds: NawyCompoundRaw[];
    };
    const totalComps = cFirstBody.total_count;
    const compPages = Math.ceil(totalComps / 200);

    // 3. Pull all pages in parallel (both endpoints concurrently)
    const [propResult, compResult] = await Promise.all([
      (async () => {
        const seenIds = new Set<number>();
        const rows: ReturnType<typeof flattenNawyProperty>[] = [];
        // seed with first page
        for (const r of firstBody.results) {
          if (!seenIds.has(r.id)) {
            seenIds.add(r.id);
            rows.push(flattenNawyProperty(r));
          }
        }
        const rest = await fetchInBatches(
          propPages - 1,
          20,
          (p) =>
            `${NAWY_BASE}/properties/search?page=${p + 1}&page_size=200`,
          headers,
          (body) => {
            const b = body as { results: NawyPropertyRaw[] };
            return b.results.map(flattenNawyProperty);
          },
        );
        for (const r of rest.items) {
          if (!seenIds.has(r.id)) {
            seenIds.add(r.id);
            rows.push(r);
          }
        }
        return { rows, pages: 1 + rest.pages, authFailed: rest.authFailed };
      })(),
      (async () => {
        const seenIds = new Set<number>();
        const rows: ReturnType<typeof flattenNawyCompound>[] = [];
        for (const c of cFirstBody.compounds) {
          if (!seenIds.has(c.id)) {
            seenIds.add(c.id);
            rows.push(flattenNawyCompound(c));
          }
        }
        const rest = await fetchInBatches(
          compPages - 1,
          7,
          (p) => `${NAWY_BASE}/compounds?page=${p + 1}&page_size=200`,
          headers,
          (body) => {
            const b = body as { compounds: NawyCompoundRaw[] };
            return b.compounds.map(flattenNawyCompound);
          },
        );
        for (const r of rest.items) {
          if (!seenIds.has(r.id)) {
            seenIds.add(r.id);
            rows.push(r);
          }
        }
        return { rows, pages: 1 + rest.pages, authFailed: rest.authFailed };
      })(),
    ]);

    if (propResult.authFailed || compResult.authFailed) {
      await markCredential("nawy", false, "auth failed mid-run");
      await finishRun(runId, {
        status: "needs_token",
        notes: "auth failed during pagination",
      });
      return { ok: false, runId, needsToken: true };
    }

    await markCredential("nawy", true);

    // 4. Diff against DB and upsert
    const sb = getSupabaseAdmin();
    const { data: existingProps } = await sb
      .schema("nawy")
      .from("units")
      .select("id, price");
    const existingMap = new Map<number, number | null>();
    for (const r of existingProps ?? [])
      existingMap.set(r.id as number, (r.price as number | null) ?? null);

    let added = 0,
      changed = 0;
    const changeRows: Parameters<typeof logChange>[0] = [];
    const now = new Date().toISOString();
    const upsertRows = propResult.rows.map((row) => {
      const prevPrice = existingMap.get(row.id);
      if (!existingMap.has(row.id)) {
        added++;
        changeRows.push({
          run_id: runId,
          source: "nawy",
          entity_type: "unit",
          entity_id: String(row.id),
          action: "added",
          after: { price: row.price, compound: row.compound_name },
        });
      } else if (prevPrice != null && row.price != null && prevPrice !== row.price) {
        changed++;
        changeRows.push({
          run_id: runId,
          source: "nawy",
          entity_type: "unit",
          entity_id: String(row.id),
          action: "changed",
          field: "price",
          before: { price: prevPrice },
          after: { price: row.price },
        });
      }
      return { ...row, last_seen_at: now, synced_at: now };
    });

    // Removals
    const newIds = new Set(propResult.rows.map((r) => r.id));
    let removed = 0;
    for (const id of existingMap.keys()) {
      if (!newIds.has(id)) {
        removed++;
        changeRows.push({
          run_id: runId,
          source: "nawy",
          entity_type: "unit",
          entity_id: String(id),
          action: "removed",
        });
      }
    }

    // Chunk upserts (units)
    for (let i = 0; i < upsertRows.length; i += 1000) {
      const batch = upsertRows.slice(i, i + 1000);
      const { error } = await sb
        .schema("nawy")
        .from("units")
        .upsert(batch, { onConflict: "id" });
      if (error) throw new Error(`nawy.units upsert: ${error.message}`);
    }
    // Delete removed
    if (removed > 0) {
      const removedIds = [...existingMap.keys()].filter((id) => !newIds.has(id));
      for (let i = 0; i < removedIds.length; i += 500) {
        const batch = removedIds.slice(i, i + 500);
        await sb.schema("nawy").from("units").delete().in("id", batch);
      }
    }

    // Compounds — simpler, just upsert and delete missing
    const compRows = compResult.rows.map((r) => ({
      ...r,
      last_seen_at: now,
      synced_at: now,
    }));
    for (let i = 0; i < compRows.length; i += 500) {
      const batch = compRows.slice(i, i + 500);
      const { error } = await sb
        .schema("nawy")
        .from("compounds")
        .upsert(batch, { onConflict: "id" });
      if (error) throw new Error(`nawy.compounds upsert: ${error.message}`);
    }
    const { data: existingCompIds } = await sb
      .schema("nawy")
      .from("compounds")
      .select("id");
    const newCompIds = new Set(compRows.map((r) => r.id));
    const staleCompIds = (existingCompIds ?? [])
      .map((r) => r.id as number)
      .filter((id) => !newCompIds.has(id));
    if (staleCompIds.length) {
      for (let i = 0; i < staleCompIds.length; i += 500) {
        const batch = staleCompIds.slice(i, i + 500);
        await sb.schema("nawy").from("compounds").delete().in("id", batch);
      }
    }

    await logChange(changeRows);

    // Detect conflicts vs propertyhub (price disagreements)
    await detectPriceConflicts();

    await finishRun(runId, {
      status: "ok",
      pages_fetched: propResult.pages + compResult.pages,
      rows_seen: propResult.rows.length,
      rows_added: added,
      rows_removed: removed,
      rows_changed: changed,
      duration_ms: Date.now() - t0,
      notes: `properties ${propResult.rows.length} · compounds ${compRows.length}`,
    });

    return {
      ok: true,
      runId,
      added,
      removed,
      changed,
      seen: propResult.rows.length,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await finishRun(runId, {
      status: "failed",
      duration_ms: Date.now() - t0,
      notes: msg.slice(0, 400),
    });
    return { ok: false, runId, message: msg };
  }
}

type NawyCompoundRaw = {
  id: number;
  nawy_id: number;
  name: string;
  parent_compound_id: number | null;
  parent_compound_name: string | null;
  is_launch: boolean;
  entry_type: string;
  developer: { name?: string; nawy_id?: number; logoPath?: string } | null;
  area: { name?: string } | null;
  parent_area: { name?: string } | null;
  property_count_primary: number | null;
  property_count_resale: number | null;
  min_price_primary: number | null;
  max_price_primary: number | null;
  last_inventory_update: string | null;
  image: string | null;
};

function flattenNawyCompound(c: NawyCompoundRaw) {
  return {
    id: c.id,
    nawy_id: c.nawy_id,
    name: c.name,
    parent_compound_id: c.parent_compound_id,
    parent_compound_name: c.parent_compound_name,
    developer_id: c.developer?.nawy_id ?? null,
    developer_name: c.developer?.name ?? null,
    developer_logo: c.developer?.logoPath ?? null,
    area_name: c.area?.name ?? null,
    parent_area_name: c.parent_area?.name ?? null,
    property_count_primary: c.property_count_primary,
    property_count_resale: c.property_count_resale,
    min_price_primary: c.min_price_primary,
    max_price_primary: c.max_price_primary,
    is_launch: c.is_launch,
    entry_type: c.entry_type,
    last_inventory_update: c.last_inventory_update,
    image: c.image,
  };
}

// ---------- PropertyHub sync ----------
type PHUnit = {
  id: string;
  legacyId: string;
  dataType: string;
  apartmentCode: string | null;
  listId: string | null;
  unitType: string | null;
  finishingSpecs: string | null;
  phase: string | null;
  buildingName: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number[] | null;
  layoutPlacement: number | null;
  deliveryDateMonths: number | null;
  price?: {
    total?: { min?: number; max?: number };
    indoor?: { min?: number; max?: number };
    outdoor?: { min?: number; max?: number };
  };
  area?: {
    general?: { min?: number; max?: number };
    land?: { min?: number; max?: number };
    roof?: { min?: number; max?: number };
    garden?: { min?: number; max?: number };
    outdoor?: { min?: number; max?: number };
  };
  fees?: {
    maintenance?: number;
    parking?: number;
    clubhouse?: number;
    cashDiscount?: number;
  };
  paymentPlanIds: string[] | null;
  templateId: string | null;
  hidden: boolean;
  note: string;
  project?: { id?: string; name?: string; thumbnailUrl?: string; hidden?: boolean };
  developer?: { id?: string; name?: string; logoUrl?: string };
  location?: { id?: string; name?: string };
  createdAt?: string | [string, string];
};

function flattenPHUnit(u: PHUnit) {
  const createdAt = Array.isArray(u.createdAt) ? u.createdAt[1] : u.createdAt;
  return {
    id: u.id,
    legacy_id: u.legacyId,
    data_type: u.dataType,
    apartment_code: u.apartmentCode,
    list_id: u.listId,
    unit_type: u.unitType,
    finishing_specs: u.finishingSpecs,
    phase: u.phase,
    building_name: u.buildingName,
    bedrooms: u.bedrooms,
    bathrooms: u.bathrooms,
    floors: u.floors ?? null,
    layout_placement: u.layoutPlacement,
    delivery_date_months: u.deliveryDateMonths,
    price_total_min: u.price?.total?.min ?? null,
    price_total_max: u.price?.total?.max ?? null,
    price_indoor_min: u.price?.indoor?.min ?? null,
    price_indoor_max: u.price?.indoor?.max ?? null,
    price_outdoor_min: u.price?.outdoor?.min ?? null,
    price_outdoor_max: u.price?.outdoor?.max ?? null,
    area_general_min: u.area?.general?.min ?? null,
    area_general_max: u.area?.general?.max ?? null,
    area_land_min: u.area?.land?.min ?? null,
    area_land_max: u.area?.land?.max ?? null,
    area_roof_min: u.area?.roof?.min ?? null,
    area_roof_max: u.area?.roof?.max ?? null,
    area_garden_min: u.area?.garden?.min ?? null,
    area_garden_max: u.area?.garden?.max ?? null,
    area_outdoor_min: u.area?.outdoor?.min ?? null,
    area_outdoor_max: u.area?.outdoor?.max ?? null,
    fee_maintenance: u.fees?.maintenance ?? null,
    fee_parking: u.fees?.parking ?? null,
    fee_clubhouse: u.fees?.clubhouse ?? null,
    fee_cash_discount: u.fees?.cashDiscount ?? null,
    payment_plan_ids: u.paymentPlanIds ?? null,
    template_id: u.templateId,
    hidden: u.hidden ?? false,
    note: u.note ?? "",
    project_id: u.project?.id ?? null,
    developer_id: u.developer?.id ?? null,
    location_id: u.location?.id ?? null,
    created_at_source: createdAt ?? null,
  };
}

export async function syncPropertyHub(): Promise<{
  ok: boolean;
  runId: number;
  needsToken?: boolean;
  message?: string;
  added?: number;
  removed?: number;
  changed?: number;
  seen?: number;
}> {
  const runId = await startRun("propertyhub");
  const t0 = Date.now();
  try {
    const cred = await getCredential("propertyhub");
    if (!cred) {
      await finishRun(runId, {
        status: "needs_token",
        notes: "No cookies stored for propertyhub",
      });
      return {
        ok: false,
        runId,
        needsToken: true,
        message: "No PropertyHub cookies stored",
      };
    }
    const headers = {
      Cookie: cred.value,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "application/json",
      Referer: "https://www.propertyhub.site/properties/availabilities",
    };

    const probe = await fetchWithRetry(
      `${PH_BASE}?page=1&limit=1000&x-sveltekit-invalidated=001`,
      headers,
    );
    if (!probe.auth) {
      await markCredential("propertyhub", false, `HTTP ${probe.status}`);
      await finishRun(runId, {
        status: "needs_token",
        notes: `Auth failed HTTP ${probe.status}`,
      });
      return {
        ok: false,
        runId,
        needsToken: true,
        message: "PropertyHub cookies expired",
      };
    }

    type PHResponse = { type: string; nodes: { type: string; data?: unknown[] }[] };
    function extractUnits(body: unknown): { total: number; units: PHUnit[] } {
      const b = body as PHResponse;
      // The redirect case comes back as {type: 'redirect', ...}
      if ((body as { type?: string }).type === "redirect") {
        return { total: 0, units: [] };
      }
      const node = b.nodes.find(
        (n) => n && n.type === "data" && Array.isArray(n.data),
      );
      if (!node?.data) return { total: 0, units: [] };
      const decoded = decodeSveltekit(node.data) as {
        total?: number;
        items?: PHUnit[];
      } | null;
      return {
        total: decoded?.total ?? 0,
        units: (decoded?.items ?? []) as PHUnit[],
      };
    }

    const firstPH = extractUnits(probe.body);
    if (firstPH.total === 0 && firstPH.units.length === 0) {
      await markCredential("propertyhub", false, "auth redirect or empty");
      await finishRun(runId, {
        status: "needs_token",
        notes: "response was redirect / empty — likely session expired",
      });
      return {
        ok: false,
        runId,
        needsToken: true,
        message: "PropertyHub session redirected — cookies expired",
      };
    }
    const totalPages = Math.ceil(firstPH.total / 1000);
    const rest = await fetchInBatches(
      totalPages - 1,
      12,
      (p) =>
        `${PH_BASE}?page=${p + 1}&limit=1000&x-sveltekit-invalidated=001`,
      headers,
      (body) => extractUnits(body).units,
    );
    if (rest.authFailed) {
      await markCredential("propertyhub", false, "auth failed mid-run");
      await finishRun(runId, {
        status: "needs_token",
        notes: "auth failed mid-run",
      });
      return { ok: false, runId, needsToken: true };
    }
    await markCredential("propertyhub", true);

    const allUnits = [...firstPH.units, ...rest.items];
    const seenIds = new Set<string>();
    const dedupUnits: PHUnit[] = [];
    for (const u of allUnits) {
      if (!seenIds.has(u.id)) {
        seenIds.add(u.id);
        dedupUnits.push(u);
      }
    }

    // Extract catalog (projects, developers, locations) from units
    const projMap = new Map<
      string,
      { id: string; name: string; hidden: boolean; thumbnail_url: string | null }
    >();
    const devMap = new Map<
      string,
      { id: string; name: string; logo_url: string | null }
    >();
    const locMap = new Map<string, { id: string; name: string }>();
    for (const u of dedupUnits) {
      if (u.project?.id)
        projMap.set(u.project.id, {
          id: u.project.id,
          name: u.project.name ?? "",
          hidden: u.project.hidden ?? false,
          thumbnail_url: u.project.thumbnailUrl ?? null,
        });
      if (u.developer?.id)
        devMap.set(u.developer.id, {
          id: u.developer.id,
          name: u.developer.name ?? "",
          logo_url: u.developer.logoUrl ?? null,
        });
      if (u.location?.id)
        locMap.set(u.location.id, {
          id: u.location.id,
          name: u.location.name ?? "",
        });
    }

    const sb = getSupabaseAdmin();

    // Diff on units
    const { data: existing } = await sb
      .schema("propertyhub")
      .from("units")
      .select("id, price_total_min");
    const existingMap = new Map<string, number | null>();
    for (const r of existing ?? [])
      existingMap.set(
        r.id as string,
        (r.price_total_min as number | null) ?? null,
      );

    let added = 0,
      changed = 0;
    const changeRows: Parameters<typeof logChange>[0] = [];
    const now = new Date().toISOString();
    const upsertUnits = dedupUnits.map((u) => {
      const flat = flattenPHUnit(u);
      const prev = existingMap.get(flat.id);
      if (!existingMap.has(flat.id)) {
        added++;
        changeRows.push({
          run_id: runId,
          source: "propertyhub",
          entity_type: "unit",
          entity_id: flat.id,
          action: "added",
          after: { price: flat.price_total_min, project: u.project?.name },
        });
      } else if (
        prev != null &&
        flat.price_total_min != null &&
        prev !== flat.price_total_min
      ) {
        changed++;
        changeRows.push({
          run_id: runId,
          source: "propertyhub",
          entity_type: "unit",
          entity_id: flat.id,
          action: "changed",
          field: "price",
          before: { price: prev },
          after: { price: flat.price_total_min },
        });
      }
      return { ...flat, last_seen_at: now, synced_at: now };
    });

    const newIds = new Set(dedupUnits.map((u) => u.id));
    const removedIds = [...existingMap.keys()].filter((id) => !newIds.has(id));
    for (const id of removedIds) {
      changeRows.push({
        run_id: runId,
        source: "propertyhub",
        entity_type: "unit",
        entity_id: id,
        action: "removed",
      });
    }

    // Load catalog first (FKs)
    if (devMap.size) {
      await sb
        .schema("propertyhub")
        .from("developers")
        .upsert([...devMap.values()], { onConflict: "id" });
    }
    if (locMap.size) {
      await sb
        .schema("propertyhub")
        .from("locations")
        .upsert([...locMap.values()], { onConflict: "id" });
    }
    if (projMap.size) {
      const projArr = [...projMap.values()];
      for (let i = 0; i < projArr.length; i += 500) {
        await sb
          .schema("propertyhub")
          .from("projects")
          .upsert(projArr.slice(i, i + 500), { onConflict: "id" });
      }
    }

    for (let i = 0; i < upsertUnits.length; i += 1000) {
      const batch = upsertUnits.slice(i, i + 1000);
      const { error } = await sb
        .schema("propertyhub")
        .from("units")
        .upsert(batch, { onConflict: "id" });
      if (error) throw new Error(`propertyhub.units upsert: ${error.message}`);
    }
    if (removedIds.length) {
      for (let i = 0; i < removedIds.length; i += 500) {
        await sb
          .schema("propertyhub")
          .from("units")
          .delete()
          .in("id", removedIds.slice(i, i + 500));
      }
    }

    await logChange(changeRows);
    await detectPriceConflicts();

    await finishRun(runId, {
      status: "ok",
      pages_fetched: 1 + rest.pages,
      rows_seen: dedupUnits.length,
      rows_added: added,
      rows_removed: removedIds.length,
      rows_changed: changed,
      duration_ms: Date.now() - t0,
      notes: `units ${dedupUnits.length} · dev ${devMap.size} · loc ${locMap.size} · proj ${projMap.size}`,
    });

    return {
      ok: true,
      runId,
      added,
      removed: removedIds.length,
      changed,
      seen: dedupUnits.length,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await finishRun(runId, {
      status: "failed",
      duration_ms: Date.now() - t0,
      notes: msg.slice(0, 400),
    });
    return { ok: false, runId, message: msg };
  }
}

// ---------- Conflict detection ----------
// Where nawy.units and propertyhub.units match on compound+unit_id
// but disagree on price, insert into sync.conflicts (idempotent).
async function detectPriceConflicts() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.rpc("detect_price_conflicts");
  if (error) {
    // If RPC doesn't exist yet, log but don't fail the sync
    console.warn("[sync] detect_price_conflicts RPC missing:", error.message);
    return;
  }
  return data;
}
