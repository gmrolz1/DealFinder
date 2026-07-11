import fs from "node:fs";
import path from "node:path";

/**
 * Local, developer-supplied media for the profile-only developers (no live
 * inventory). Images live in `public/developers/<devSlug>/`:
 *   - `hero.webp`                      → page banner
 *   - `<projectSlug>/NN.webp`          → per-project gallery
 * This module only maps project slugs → bilingual display names; the images
 * themselves are discovered from the filesystem (same pattern as
 * `getLocalCompoundImages`), so adding/removing files needs no code change.
 */

type ProjectMeta = {
  slug: string;
  name: string;
  name_ar: string;
  area: string;
  area_ar: string;
};

const AR = {
  cap: "العاصمة الإدارية الجديدة",
  cairo: "القاهرة الجديدة",
  mansoura: "المنصورة الجديدة",
  damietta: "دمياط الجديدة",
  coast: "الساحل الشمالي",
  alamein: "العلمين الجديدة",
  east: "شرق القاهرة",
  sudr: "رأس سدر",
  october: "مدينة السادس من أكتوبر",
};

const P = (
  slug: string,
  name: string,
  name_ar: string,
  area: string,
  area_ar: string
): ProjectMeta => ({ slug, name, name_ar, area, area_ar });

export const DEVELOPER_PROJECTS: Record<string, ProjectMeta[]> = {
  "erg-developments": [
    P("ri8", "Ri8", "رايت 8", "New Capital", AR.cap),
    P("eelaf-residence", "Eelaf Residence", "إيلاف ريزيدنس", "New Cairo", AR.cairo),
    P("linwood", "Linwood", "لينوود", "New Cairo", AR.cairo),
    P("moonreal-tower", "Moonreal Tower", "برج مون ريل", "New Capital", AR.cap),
    P("diamond-towers", "Diamond Towers", "أبراج دايموند", "New Capital", AR.cap),
  ],
  "qurtuba-developments": [
    P("nuzul-tower", "Nuzul Tower", "برج نُزُل", "New Capital", AR.cap),
    P("hava", "HAVA Residential", "هافا", "New Capital", AR.cap),
    P("one-business-center", "One Business Center (1BC)", "ون بيزنس سنتر", "New Mansoura", AR.mansoura),
  ],
  "dig-developments": [
    P("defaf", "Defaf", "ضفاف", "New Capital", AR.cap),
    P("track-malls", "Track Downtown Malls", "مولات تراك", "New Capital", AR.cap),
  ],
  "arabian-mark-developments": [
    P("rewaq-residence", "Rewaq Residence", "رواق ريزيدنس", "New Cairo", AR.cairo),
  ],
  "eden-development": [
    P("e-one", "E One Business Complex", "عدن وان", "New Capital", AR.cap),
    P("eden-walk-7", "Eden Walk 7", "عدن ووك 7", "New Capital", AR.cap),
    P("sequoia", "Sequoia North Coast", "سيكويا الساحل الشمالي", "North Coast", AR.coast),
    P("city-view", "City View", "سيتي فيو", "New Alamein", AR.alamein),
  ],
  "al-basiony-developments": [
    P("cavali-residence", "Cavali Residence", "كفالي ريزيدنس", "New Cairo", AR.cairo),
    P("cavali-hub", "Cavali Hub", "كفالي هاب", "New Cairo", AR.cairo),
    P("rose-garden", "Rose Garden", "روز جاردن", "New Cairo", AR.cairo),
    P("naseem", "Naseem", "نسيم", "New Damietta", AR.damietta),
  ],
  "founders-for-real-estate-marketing": [
    P("granville", "Granville", "جرانفيل", "New Capital", AR.cap),
    P("wesal", "Wesal", "وصال", "East Cairo", AR.east),
  ],
  "mag-methaq-arab-group": [
    P("la-reva", "La Reva Signature Residence", "لاريفا سيجنتشر ريزيدنس", "New Capital", AR.cap),
  ],
  "smart-view-developments": [
    P("town-gate", "Town Gate", "تاون جيت", "New Capital", AR.cap),
  ],
  "tameer-developments": [
    P("azad", "Azad", "أزاد", "New Cairo", AR.cairo),
    P("azad-views", "Azad Views", "أزاد فيوز", "New Cairo", AR.cairo),
    P("diar", "Diar", "ديار", "6th of October", AR.october),
    P("urban-business-lane", "Urban Business Lane", "أوربان بيزنس لين", "New Cairo", AR.cairo),
  ],
  "eg-master-group": [
    P("aventura-mall", "Aventura Mall", "أفينتورا مول", "New Capital", AR.cap),
    P("asgard-mall", "Asgard Mall", "أسجارد مول", "New Capital", AR.cap),
    P("the-city-valley", "The City Valley", "ذا سيتي فالي", "New Capital", AR.cap),
    P("valley-red-sea", "Valley Red Sea", "فالي ريد سي", "Ras Sudr", AR.sudr),
  ],
};

export type DeveloperProjectGallery = ProjectMeta & { images: string[] };
export type DeveloperMedia = { hero: string | null; projects: DeveloperProjectGallery[] };

function listImages(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f))
      .sort();
  } catch {
    return [];
  }
}

/** Filesystem-driven: hero + per-project galleries for a profile developer. */
export function getDeveloperMedia(devSlug: string): DeveloperMedia {
  const base = path.join(process.cwd(), "public", "developers", devSlug);
  const heroExists = fs.existsSync(path.join(base, "hero.webp"));
  const hero = heroExists ? `/developers/${devSlug}/hero.webp` : null;

  const metas = DEVELOPER_PROJECTS[devSlug] ?? [];
  const projects: DeveloperProjectGallery[] = [];
  for (const m of metas) {
    const files = listImages(path.join(base, m.slug));
    if (files.length)
      projects.push({ ...m, images: files.map((f) => `/developers/${devSlug}/${m.slug}/${f}`) });
  }
  return { hero, projects };
}
