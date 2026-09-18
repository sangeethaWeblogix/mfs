    import { NextResponse } from "next/server";


  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.motorhomesforsale.com.au/listings/";

  // The old cfs/v1/sitemap/price endpoint (legacy host) always 401s regardless
  // of key — same backend bug as makes/weights sitemaps. The new host's
  // equivalent only returns buckets with current live matches, not this full
  // canonical range, so this replicates the exact 42 URLs already published
  // at https://www.motorhomesforsale.com.au/prices-sitemap.xml.
  const PRICE_PATHS = [
    "under-20000/", "under-30000/", "under-40000/", "under-50000/", "under-60000/",
    "under-70000/", "under-80000/", "under-90000/", "under-100000/", "under-125000/",
    "under-150000/", "under-175000/", "under-200000/",
    "between-20000-30000/", "between-30000-40000/", "between-40000-50000/", "between-50000-60000/",
    "between-60000-70000/", "between-70000-80000/", "between-80000-90000/", "between-90000-100000/",
    "between-100000-125000/", "between-125000-150000/", "between-150000-175000/", "between-175000-200000/",
    "over-20000/", "over-30000/", "over-40000/", "over-50000/", "over-60000/",
    "over-70000/", "over-80000/", "over-90000/", "over-100000/", "over-125000/",
    "over-150000/", "over-175000/", "over-200000/",
    "between-100000-150000/", "between-150000-200000/", "between-200000-300000/",
    "over-300000/",
  ];

  export async function GET() {
    try {
      const urls = PRICE_PATHS
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
  