import { NextResponse } from "next/server";
import { INDEXABLE_URLS } from "@/utils/seo/indexable-urls";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.motorhomesforsale.com.au";

function isBandSegment(seg: string): boolean {
  if (seg.includes("-kg-gvm")) return true;
  if (seg.includes("-length-in-feet")) return true;
  if (seg.includes("-people-sleeping-capacity")) return true;
  if (/^(under|over)-\d+$/.test(seg)) return true;
  if (/^between-\d+-\d+$/.test(seg)) return true;
  return false;
}

/**
 * The "By Price / By Weight (GVM) / By Size (Length) / By Sleeping Capacity"
 * band pages, unscoped and per-state. Sourced directly from the curated
 * src/app/url.csv (INDEXABLE_URLS) instead of band-utils.ts's separate
 * *_BANDS_ORDERED lists — those used a different band granularity/format
 * entirely (e.g. sleep bands as "under-2-people-..." when this site's real
 * curated URLs use "2-people-..."), so a page built from them could pass
 * middleware's index check yet still not be in url.csv, which is what
 * actually decides the page's own <meta name="robots"> tag (metaFromSlug) —
 * exactly the "Noindex page in sitemap" contradiction Ahrefs flagged.
 * Reading url.csv directly guarantees every URL here matches a real
 * indexable page, and picks up its per-state band coverage too.
 *
 * Price/GVM/Length are also covered individually by prices-sitemap.xml/
 * weights-sitemap.xml/length-sitemap.xml (live backend data, also now
 * filtered against url.csv) — kept here too since Sleeping Capacity has no
 * dedicated sitemap type on the backend; listing a URL in more than one
 * sitemap is harmless.
 */
function buildPaths(): string[] {
  const paths: string[] = [];
  for (const url of INDEXABLE_URLS) {
    const rest = url.replace(/^\/listings\//, "").replace(/\/$/, "");
    if (!rest) continue;
    const segments = rest.split("/");
    if (segments.length === 1 && isBandSegment(segments[0])) {
      paths.push(`${segments[0]}/`);
    } else if (segments.length === 2 && segments[0].endsWith("-state") && isBandSegment(segments[1])) {
      paths.push(`${segments[0]}/${segments[1]}/`);
    }
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
