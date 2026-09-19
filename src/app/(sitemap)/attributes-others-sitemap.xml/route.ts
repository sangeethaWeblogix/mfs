import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.motorhomesforsale.com.au";

/**
 * The full "By Price / By Weight (GVM) / By Size (Length) / By Sleeping
 * Capacity" band set shown on the home page and every /listings/ page
 * (browseSectionShared.ts's FILTERS_NO_STATE / SLEEP_BANDS), unscoped and
 * per-state — kept together here as one complete, self-contained list even
 * though the unscoped Price/GVM/Length paths are also covered individually
 * by prices-sitemap.xml/weights-sitemap.xml/length-sitemap.xml. Sleeping
 * Capacity has no dedicated sitemap type on the backend at all, so this is
 * its only coverage (unscoped and per-state).
 */
const PRICE_PATHS = [
  "under-100000/", "between-100000-150000/", "between-150000-200000/",
  "between-200000-300000/", "over-300000/",
];
const GVM_PATHS = [
  "under-3500-kg-gvm/", "between-3500-kg-4500-kg-gvm/", "between-4500-kg-6000-kg-gvm/",
  "between-6000-kg-8000-kg-gvm/", "over-8000-kg-gvm/",
];
const LENGTH_PATHS = [
  "under-20-length-in-feet/", "between-20-23-length-in-feet/", "between-23-26-length-in-feet/",
  "between-26-30-length-in-feet/", "over-30-length-in-feet/",
];
const SLEEP_PATHS = [
  "2-people-sleeping-capacity/", "3-people-sleeping-capacity/", "4-people-sleeping-capacity/",
  "5-people-sleeping-capacity/", "over-5-people-sleeping-capacity/",
];

const STATE_SLUGS = [
  "victoria", "new-south-wales", "queensland",
  "south-australia", "western-australia", "tasmania",
];

function buildPaths(): string[] {
  const paths: string[] = [...PRICE_PATHS, ...GVM_PATHS, ...LENGTH_PATHS, ...SLEEP_PATHS];

  for (const state of STATE_SLUGS) {
    const prefix = `${state}-state/`;
    for (const p of PRICE_PATHS)  paths.push(prefix + p);
    for (const p of GVM_PATHS)    paths.push(prefix + p);
    for (const p of LENGTH_PATHS) paths.push(prefix + p);
    for (const p of SLEEP_PATHS)  paths.push(prefix + p);
  }

  return paths;
}

export async function GET() {
  const lastmod = new Date().toISOString();
  const urls = buildPaths()
    .map(
      (path) => `
  <url>
    <loc>${SITE_URL}/listings/${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
