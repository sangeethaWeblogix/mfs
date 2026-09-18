    import { NextResponse } from "next/server";

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.motorhomesforsale.com.au/listings/";

  // The old cfs/v1/sitemap/length endpoint (legacy host) always 401s regardless
  // of key — same backend bug as makes/weights/prices sitemaps. Replicates the
  // exact 54 URLs already published at
  // https://www.motorhomesforsale.com.au/length-sitemap.xml.
  const LENGTH_PATHS = [
    "under-12-length-in-feet/", "under-13-length-in-feet/", "under-14-length-in-feet/", "under-15-length-in-feet/",
    "under-16-length-in-feet/", "under-17-length-in-feet/", "under-18-length-in-feet/", "under-19-length-in-feet/",
    "under-20-length-in-feet/", "under-21-length-in-feet/", "under-22-length-in-feet/", "under-23-length-in-feet/",
    "under-24-length-in-feet/", "under-25-length-in-feet/", "under-26-length-in-feet/", "under-27-length-in-feet/",
    "under-28-length-in-feet/",
    "between-12-13-length-in-feet/", "between-13-14-length-in-feet/", "between-14-15-length-in-feet/",
    "between-15-16-length-in-feet/", "between-16-17-length-in-feet/", "between-17-18-length-in-feet/",
    "between-18-19-length-in-feet/", "between-19-20-length-in-feet/", "between-20-21-length-in-feet/",
    "between-21-22-length-in-feet/", "between-22-23-length-in-feet/", "between-23-24-length-in-feet/",
    "between-24-25-length-in-feet/", "between-25-26-length-in-feet/", "between-26-27-length-in-feet/",
    "between-27-28-length-in-feet/",
    "over-12-length-in-feet/", "over-13-length-in-feet/", "over-14-length-in-feet/", "over-15-length-in-feet/",
    "over-16-length-in-feet/", "over-17-length-in-feet/", "over-18-length-in-feet/", "over-19-length-in-feet/",
    "over-20-length-in-feet/", "over-21-length-in-feet/", "over-22-length-in-feet/", "over-23-length-in-feet/",
    "over-24-length-in-feet/", "over-25-length-in-feet/", "over-26-length-in-feet/", "over-27-length-in-feet/",
    "over-28-length-in-feet/",
    "between-20-23-length-in-feet/", "between-23-26-length-in-feet/", "between-26-30-length-in-feet/",
    "over-30-length-in-feet/",
  ];

  export async function GET() {
    try {
      const urls = LENGTH_PATHS
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
  