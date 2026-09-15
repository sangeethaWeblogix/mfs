import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.motorhomesforsale.com.au";

const CONSUMER_KEY = "ck_24892a914e4550390c782178b2720c9ff6423124";
const CONSUMER_SECRET = "cs_3efc7ccb27007dc988bf17096281a557567e6c1b";

async function fetchProducts(page: number) {
const auth = Buffer.from(
  `${CONSUMER_KEY}:${CONSUMER_SECRET}`,
  "utf-8"
).toString("base64");

  const res = await fetch(
    `https://admin.motorhomesforsale.com.au/wp-json/wc/v3/products?per_page=100&page=${page}&_fields=slug`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

if (!res.ok) {
  console.error("Woo API failed:", res.status);
  return { items: [], totalPages: 0 };
}
  const data = await res.json();
  const totalPages = Number(res.headers.get("x-wp-totalpages"));
  return { items: data, totalPages };
}

export async function GET() {
  try {
    const firstPage = await fetchProducts(1);
    let allProducts = [...firstPage.items];

    if (firstPage.totalPages > 1) {
      for (let page = 2; page <= firstPage.totalPages; page++) {
        const nextPage = await fetchProducts(page);
        allProducts = [...allProducts, ...nextPage.items];
      }
    }

    const today = new Date().toISOString().split("T")[0];

    const urls = allProducts
      .filter((product: { slug?: string }) => !!product.slug)
      .map(
        (product: { slug: string }) => `
          <url>
            <loc>${SITE_URL}/product/${product.slug}/</loc>
            <lastmod>${today}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.7</priority>
          </url>`,
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
    console.error("Sitemap error:", error);
    return new NextResponse("Failed to generate sitemap", { status: 500 });
  }
}
