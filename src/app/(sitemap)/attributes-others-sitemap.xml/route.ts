import { NextResponse } from "next/server";
import {
  PRICE_BANDS_ORDERED,
  GVM_BANDS_ORDERED,
  LENGTH_BANDS_ORDERED,
  SLEEP_BANDS_ORDERED,
} from "@/utils/seo/band-utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.motorhomesforsale.com.au";

/**
 * The "By Price / By Weight (GVM) / By Size (Length) / By Sleeping Capacity"
 * band pages, unscoped only. Sourced directly from band-utils.ts's curated
 * *_BANDS_ORDERED lists — the same lists middleware.ts's isAllowedSingleBand
 * uses to decide index/noindex — so this sitemap can never list a page the
 * site itself marks noindex (it previously hardcoded its own separate,
 * stale band lists that didn't match, and also included a per-state variant
 * of every band — middleware always treats a state-scoped band page as
 * having "other filters", so those are unconditionally noindex and were
 * never valid to list here at all).
 *
 * Price/GVM/Length are also covered individually by prices-sitemap.xml/
 * weights-sitemap.xml/length-sitemap.xml (live backend data, filtered to
 * combinations that actually have products) — kept here too since Sleeping
 * Capacity has no dedicated sitemap type on the backend and needs this file
 * as its only coverage; listing a URL in more than one sitemap is harmless.
 */
function buildPaths(): string[] {
  return [
    ...PRICE_BANDS_ORDERED,
    ...GVM_BANDS_ORDERED,
    ...LENGTH_BANDS_ORDERED,
    ...SLEEP_BANDS_ORDERED,
  ].map((band) => `${band}/`);
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
