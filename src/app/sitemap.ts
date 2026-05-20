import type { MetadataRoute } from "next";
import { getAreas, getDevelopersWithCounts } from "@/lib/data";
import fs from "node:fs";
import path from "node:path";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// One sitemap entry, with bilingual alternates so Google can pair EN ↔ AR.
function entry(
  pathEn: string,
  opts: { priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"] } = {}
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE}${pathEn}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.5,
    alternates: {
      languages: {
        en: `${SITE}${pathEn}`,
        ar: `${SITE}/ar${pathEn === "/" ? "" : pathEn}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];

  // Static pages
  out.push(entry("/", { priority: 1.0, changeFrequency: "daily" }));
  out.push(entry("/properties", { priority: 0.9, changeFrequency: "daily" }));
  out.push(entry("/developers", { priority: 0.9, changeFrequency: "weekly" }));
  out.push(entry("/areas", { priority: 0.8, changeFrequency: "weekly" }));
  out.push(
    entry("/new-launches", { priority: 0.8, changeFrequency: "daily" })
  );

  // Areas
  for (const a of getAreas()) {
    out.push(
      entry(`/areas/${a.slug}`, { priority: 0.7, changeFrequency: "weekly" })
    );
  }

  // Developers (all 518)
  for (const d of getDevelopersWithCounts()) {
    out.push(
      entry(`/developers/${d.slug}`, {
        priority: d.available > 0 ? 0.8 : 0.5,
        changeFrequency: "weekly",
      })
    );
  }

  // Compounds — read directly so we cover all 1,189
  const compounds = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "scraper", "data", "compounds.json"),
      "utf8"
    )
  ) as { slug: string }[];
  for (const c of compounds) {
    out.push(
      entry(`/compounds/${c.slug}`, {
        priority: 0.7,
        changeFrequency: "weekly",
      })
    );
  }

  // Units — read directly to cover all 26,968
  const units = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "scraper", "data", "units.json"),
      "utf8"
    )
  ) as { slug: string }[];
  for (const u of units) {
    out.push(
      entry(`/properties/${u.slug}`, {
        priority: 0.6,
        changeFrequency: "monthly",
      })
    );
  }

  return out;
}

// Sitemap can exceed 50k entries with this many units. Split into chunks
// via generateSitemaps if needed. For now units count is ~27k, well within
// the 50k sitemap.xml limit; total ≈ 28.7k entries.
export const dynamic = "force-static";
export const revalidate = 3600;
