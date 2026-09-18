    import { NextResponse } from "next/server";

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.motorhomesforsale.com.au/listings/";

  // The new /sitemap/gvm API only returns buckets with current live matches
  // (18 of them right now), but the site's indexed sitemap has always
  // published this full, evenly-stepped canonical range regardless of live
  // inventory (33 URLs) — matching https://www.motorhomesforsale.com.au/weights-sitemap.xml
  // exactly, so previously-indexed URLs don't drop out of the sitemap.
  const GVM_PATHS = [
    "under-1000-kg-gvm/", "under-1250-kg-gvm/", "under-1500-kg-gvm/", "under-1750-kg-gvm/",
    "under-2000-kg-gvm/", "under-2250-kg-gvm/", "under-2500-kg-gvm/", "under-2750-kg-gvm/",
    "under-3000-kg-gvm/", "under-3500-kg-gvm/",
    "between-1000-kg-1250-kg-gvm/", "between-1250-kg-1500-kg-gvm/", "between-1500-kg-1750-kg-gvm/",
    "between-1750-kg-2000-kg-gvm/", "between-2000-kg-2250-kg-gvm/", "between-2250-kg-2500-kg-gvm/",
    "between-2500-kg-2750-kg-gvm/", "between-2750-kg-3000-kg-gvm/", "between-3000-kg-3500-kg-gvm/",
    "over-1000-kg-gvm/", "over-1250-kg-gvm/", "over-1500-kg-gvm/", "over-1750-kg-gvm/",
    "over-2000-kg-gvm/", "over-2250-kg-gvm/", "over-2500-kg-gvm/", "over-2750-kg-gvm/",
    "over-3000-kg-gvm/", "over-3500-kg-gvm/",
    "between-3500-kg-4500-kg-gvm/", "between-4500-kg-6000-kg-gvm/", "between-6000-kg-8000-kg-gvm/",
    "over-8000-kg-gvm/",
  ];

  export async function GET() {
    try {
      const urls = GVM_PATHS
        .map(
          (path: string) => `
    <url>
      <loc>${SITE_URL}${path}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
             <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`
        )
        .join("");
  
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
  </urlset>`;
  
      return new NextResponse(sitemap, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      });
    } catch (error) {
      console.error("❌ Sitemap error:", error);
      return new NextResponse("Failed to generate sitemap", { status: 500 });
    }
  }
  